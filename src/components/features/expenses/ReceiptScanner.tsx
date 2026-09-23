'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { useHaptic } from '@/hooks/useHaptic';
import { useStore } from '@/store';

interface ReceiptScannerProps {
  onScanComplete: (data: { amount?: number; date?: string }) => void;
}

export const ReceiptScanner = ({ onScanComplete }: ReceiptScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const haptic = useHaptic();
  const addToast = useStore(s => s.addToast);

  const parseOCR = (text: string) => {
    const lines = text.toLowerCase().split('\n');
    let amount: number | null = null;
    let date: string | null = null;
    
    // Parse Date
    const dateRegex = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      let day = parseInt(dateMatch[1]);
      let month = parseInt(dateMatch[2]);
      let year = parseInt(dateMatch[3]);
      if (year < 100) year += 2000;
      if (month > 12 && day <= 12) {
        const temp = month;
        month = day;
        day = temp;
      }
      if (month <= 12) {
        date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }

    // Parse Amount
    let maxNumber = 0;
    const allNumbers: number[] = [];
    const numRegex = /(?:rs\.?|₹|inr)?\s*([\d,]+(\.\d{1,2})?)/gi;
    
    lines.forEach(line => {
      let match;
      while ((match = numRegex.exec(line)) !== null) {
        const val = parseFloat(match[1].replace(/,/g, ''));
        // Ignore likely dates (e.g. 2026), times, and huge random OCR artifacts
        if (!isNaN(val) && val > 0 && val < 100000) {
          allNumbers.push(val);
          if (line.includes('total') || line.includes('amount') || line.includes('net') || line.includes('sum')) {
            if (val > maxNumber) maxNumber = val;
          }
        }
      }
    });

    if (maxNumber > 0) amount = maxNumber;
    else if (allNumbers.length > 0) amount = Math.max(...allNumbers);

    return { amount, date };
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
      const { amount, date } = parseOCR(text);
      
      if (!amount && !date) {
        addToast({ type: 'warning', message: 'Could not detect an amount or date. Please enter manually.' });
      } else {
        addToast({ type: 'success', message: 'Receipt scanned successfully!' });
        haptic.success();
        onScanComplete({ amount: amount || undefined, date: date || undefined });
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
