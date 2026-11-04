'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { useHaptic } from '@/hooks/useHaptic';
import { useStore } from '@/store';

import { predictCategory } from '@/lib/ml/categorizer';

interface ReceiptScannerProps {
  onScanComplete: (data: { amount?: number; date?: string; note?: string; categoryId?: string }) => void;
}

export const ReceiptScanner = ({ onScanComplete }: ReceiptScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const haptic = useHaptic();
  const addToast = useStore((s) => s.addToast);

  const parseOCR = (text: string) => {
    const rawLines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const lowerText = text.toLowerCase();
    let amount: number | null = null;
    let date: string | null = null;
    let extractedYear: number | null = null;

    // 1. Robust Date Parsing (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, or DD Mon YYYY)
    const dateRegexes = [
      /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/,
      /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/,
      /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})\b/i,
    ];

    for (const rx of dateRegexes) {
      const match = text.match(rx);
      if (match) {
        if (rx === dateRegexes[0]) {
          let day = parseInt(match[1]);
          let month = parseInt(match[2]);
          let yr = parseInt(match[3]);
          if (yr < 100) yr += 2000;
          if (month > 12 && day <= 12) {
            const t = month;
            month = day;
            day = t;
          }
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            date = `${yr}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            extractedYear = yr;
            break;
          }
        } else if (rx === dateRegexes[1]) {
          const yr = parseInt(match[1]);
          const month = parseInt(match[2]);
          const day = parseInt(match[3]);
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            date = `${yr}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            extractedYear = yr;
            break;
          }
        } else if (rx === dateRegexes[2]) {
          const day = parseInt(match[1]);
          const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
          const month = monthNames.indexOf(match[2].toLowerCase().slice(0, 3)) + 1;
          let yr = parseInt(match[3]);
          if (yr < 100) yr += 2000;
          if (month >= 1 && month <= 12) {
            date = `${yr}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            extractedYear = yr;
            break;
          }
        }
      }
    }

    // 2. Context-Weighted Candidate Amount Extraction
    const noiseWords = [
      'phone', 'tel', 'mob', 'pin', 'pincode', 'gstin', 'tin', 'cin', 'pan', 'fssai',
      'table', 'token', 'counter', 'order', 'bill no', 'cashier', 'card', 'auth',
      'batch', 'time', 'date', 'discount', 'subtotal', 'cgst', 'sgst', 'igst'
    ];

    interface AmountCandidate {
      val: number;
      score: number;
      line: string;
    }

    const candidates: AmountCandidate[] = [];
    const numberPattern = /(?:₹|rs\.?|inr)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi;

    rawLines.forEach((rawLine, lineIndex) => {
      const line = rawLine.toLowerCase();
      const hasCurrency = /(?:₹|rs\.?|inr)/i.test(rawLine);
      const isGrandTotal = /grand\s*total|net\s*payable|amount\s*payable|total\s*amount|balance\s*due|to\s*pay|net\s*amt/i.test(line);
      const isTotal = /\btotal\b|\bpayable\b|\bamount\b/i.test(line);
      const hasNoise = noiseWords.some((nw) => line.includes(nw) && !isGrandTotal);

      let match;
      numberPattern.lastIndex = 0;
      while ((match = numberPattern.exec(line)) !== null) {
        const rawNumStr = match[1].replace(/,/g, '');
        const val = parseFloat(rawNumStr);

        // Strict filters to eliminate non-amount numbers:
        if (isNaN(val) || val <= 0) continue;
        if (extractedYear && val === extractedYear) continue; // Skip detected receipt year
        if (val >= 2020 && val <= 2030 && !rawNumStr.includes('.')) continue; // Likely a calendar year
        if (rawNumStr.length === 10 && val > 6000000000) continue; // Phone number
        if (rawNumStr.length === 6 && !rawNumStr.includes('.') && val >= 100000) continue; // PIN code
        if (val > 500000) continue; // Absurd amount for everyday student/personal expenses

        // Calculate confidence score
        let score = 10;
        if (isGrandTotal) score += 90;
        else if (isTotal) score += 50;
        if (hasCurrency) score += 35;
        if (rawNumStr.includes('.')) score += 15; // Realistic currency has paise (.00)
        if (lineIndex > rawLines.length * 0.5) score += 10; // Totals are usually at the bottom
        if (hasNoise) score -= 30;

        candidates.push({ val, score, line: rawLine });
      }
    });

    // Pick candidate with highest contextual score
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      amount = candidates[0].val;
    }

    // 3. Extract Merchant Name from Header Lines
    const ignoreHeaderPhrases = [
      'tax invoice', 'retail invoice', 'cash memo', 'welcome', 'customer copy',
      'original', 'duplicate', 'receipt', 'bill', 'order', 'token', 'gstin'
    ];

    let merchantName = '';
    for (let i = 0; i < Math.min(5, rawLines.length); i++) {
      const candidate = rawLines[i].replace(/[#*:=_-]/g, '').trim();
      const candidateLower = candidate.toLowerCase();
      const isIgnored = ignoreHeaderPhrases.some((phrase) => candidateLower.includes(phrase));
      const hasLetters = /[a-zA-Z]{3,}/.test(candidate);
      if (!isIgnored && hasLetters && candidate.length <= 40) {
        merchantName = candidate;
        break;
      }
    }

    // 4. Auto-detect Category using Deterministic NLP Lexicon
    let categoryId: string | undefined = undefined;
    const categoryPrediction = predictCategory(
      `${merchantName} ${lowerText.slice(0, 300)}`,
      amount || undefined
    );
    if (categoryPrediction) {
      categoryId = categoryPrediction.categoryId;
    }

    const note = merchantName ? `${merchantName} Receipt` : undefined;

    return { amount: amount || undefined, date: date || undefined, note, categoryId };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    haptic.light();
    
    try {
      addToast({ type: 'info', message: 'Scanning receipt... this may take a moment.' });
      
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;
      
      console.log('OCR Raw Text:', text);
      const { amount, date, note, categoryId } = parseOCR(text);
      
      if (!amount && !date) {
        addToast({ type: 'warning', message: 'Could not detect an amount or date. Please enter manually.' });
      } else {
        const message = note ? `Scanned ${note}: ₹${amount || 0}` : 'Receipt scanned successfully!';
        addToast({ type: 'success', message });
        haptic.success();
        onScanComplete({ amount: amount || undefined, date: date || undefined, note, categoryId });
      }
      
    } catch (error) {
      console.error('OCR Error:', error);
      addToast({ type: 'error', message: 'Failed to scan receipt.' });
      haptic.error();
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className="flex items-center justify-center w-14 h-14 rounded-2xl bg-theme-elevated border-2 border-theme-border/50 text-theme-primary hover:border-theme-accent hover:text-theme-accent transition-colors disabled:opacity-50 touch-target"
        aria-label="Scan receipt"
        title="Scan Receipt with Camera"
      >
        {isScanning ? <Loader2 className="w-6 h-6 animate-spin text-theme-accent" /> : <Camera className="w-6 h-6" />}
      </button>
    </>
  );
};
