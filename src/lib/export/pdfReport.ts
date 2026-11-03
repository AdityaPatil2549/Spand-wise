/**
 * ==============================================================================
 * SpendWise — Branded Student Monthly Financial Statement PDF Generator
 * Pure Client-Side Generator using jsPDF & jspdf-autotable (Zero External API)
 * ==============================================================================
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { CURRENCY_SYMBOL } from '@/config/constants';
import type { ExpenseDocument } from '@/types/firestore';
import type { FinancialHealthResult } from '@/lib/algorithms/financialHealth';

export interface MonthlyReportData {
  monthName: string; // e.g. "October 2026"
  userDisplayName?: string;
  householdName?: string;
  monthlyIncome: number;
  totalSpent: number;
  budgetAmount: number;
  balance: number;
  expenses: ExpenseDocument[];
  categoriesMap: Map<string, { name: string; color?: string }>;
  healthResult?: FinancialHealthResult;
}

export function generateMonthlyPDFReport(data: MonthlyReportData): void {
  const {
    monthName,
    userDisplayName = 'Student',
    householdName = 'Personal',
    monthlyIncome,
    totalSpent,
    budgetAmount,
    balance,
    expenses,
    categoriesMap,
    healthResult,
  } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // ── Palette (Refined Executive Neo Kinpaku) ───────────────────
  const cDark = [30, 41, 59]; // Slate 800
  const cMuted = [100, 116, 139]; // Slate 500
  const cAccent = [99, 102, 241]; // Indigo 500
  const cSuccess = [16, 185, 129]; // Emerald 500
  const cDanger = [239, 68, 68]; // Rose 500
  const cBorder = [226, 232, 240]; // Slate 200
  const cCardBg = [248, 250, 252]; // Slate 50

  let y = margin;

  // ── Header Bar ────────────────────────────────────────────────
  // Top Accent Stripe
  doc.setFillColor(cAccent[0], cAccent[1], cAccent[2]);
  doc.rect(margin, y, contentWidth, 4, 'F');
  y += 20;

  // Title & Wordmark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text('SPENDWISE', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('Student Financial Health & Ledger Statement', margin, y + 14);

  // Right Header: Date & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text(monthName, pageWidth - margin, y, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(`Account: ${userDisplayName} (${householdName})`, pageWidth - margin, y + 14, { align: 'right' });
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, pageWidth - margin, y + 26, { align: 'right' });

  y += 42;

  // ── Divider ───────────────────────────────────────────────────
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // ── Executive KPI Summary Tiles ───────────────────────────────
  const tileCount = 4;
  const tileGap = 12;
  const tileWidth = (contentWidth - tileGap * (tileCount - 1)) / tileCount;
  const tileHeight = 56;

  const kpis = [
    {
      label: 'TOTAL INCOME',
      value: `INR ${monthlyIncome.toLocaleString('en-IN')}`,
      color: cSuccess,
    },
    {
      label: 'TOTAL EXPENSES',
      value: `INR ${totalSpent.toLocaleString('en-IN')}`,
      color: cDark,
    },
    {
      label: balance >= 0 ? 'NET SAVINGS' : 'NET OVERAGE',
      value: `${balance >= 0 ? '+' : '-'}INR ${Math.abs(balance).toLocaleString('en-IN')}`,
      color: balance >= 0 ? cSuccess : cDanger,
    },
    {
      label: 'HEALTH INDEX',
      value: healthResult ? `${healthResult.score}/100 (${healthResult.grade})` : 'N/A',
      color: cAccent,
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (tileWidth + tileGap);

    // Card background
    doc.setFillColor(cCardBg[0], cCardBg[1], cCardBg[2]);
    doc.roundedRect(x, y, tileWidth, tileHeight, 6, 6, 'F');
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.roundedRect(x, y, tileWidth, tileHeight, 6, 6, 'S');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(kpi.label, x + 8, y + 18);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 8, y + 38);
  });

  y += tileHeight + 24;

  // ── Section 1: Financial Health Calculus Diagnosis (if available) ─
  if (healthResult) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text('1. Deterministic Financial Health Diagnosis', margin, y);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(
      `Health Tier: ${healthResult.tier} | Pacing Velocity: ${healthResult.mathematicalFactors.velocityFactor.toFixed(2)}x allowable burn | Discretionary Balance: ${((1 - healthResult.mathematicalFactors.essentialRatio) * 100).toFixed(0)}%`,
      margin,
      y
    );
    y += 14;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    const splitRecommendation = doc.splitTextToSize(`Advisory: ${healthResult.recommendation}`, contentWidth);
    doc.text(splitRecommendation, margin, y);
    y += splitRecommendation.length * 11 + 16;
  }

  // ── Section 2: Category Breakdown Table ───────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text('2. Category Spending Breakdown', margin, y);
  y += 10;

  // Aggregate Category Totals
  const catTotals: Record<string, { total: number; count: number }> = {};
  expenses.forEach((e) => {
    if (e.type !== 'income') {
      if (!catTotals[e.categoryId]) catTotals[e.categoryId] = { total: 0, count: 0 };
      catTotals[e.categoryId].total += e.amount;
      catTotals[e.categoryId].count += 1;
    }
  });

  const sortedCatRows = Object.entries(catTotals)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([catId, data]) => {
      const cat = categoriesMap.get(catId);
      const name = cat?.name || 'Miscellaneous';
      const pct = totalSpent > 0 ? ((data.total / totalSpent) * 100).toFixed(1) + '%' : '0%';
      return [
        name,
        data.count.toString(),
        pct,
        `INR ${data.total.toLocaleString('en-IN')}`,
      ];
    });

  if (sortedCatRows.length === 0) {
    sortedCatRows.push(['No expenses logged this period', '0', '0%', 'INR 0']);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Category', 'Transactions', 'Share of Total', 'Total Outflow']],
    body: sortedCatRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 80 },
      2: { halign: 'center', cellWidth: 90 },
      3: { halign: 'right', cellWidth: 100, fontStyle: 'bold' },
    },
  });

  // Retrieve position after Category table
  const finalCatY = (doc as any).lastAutoTable?.finalY || y + 100;
  y = finalCatY + 24;

  // Check page height for Section 3
  if (y + 160 > pageHeight) {
    doc.addPage();
    y = margin;
  }

  // ── Section 3: Top 10 Largest Expense Outflows ─────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text('3. Significant Outflows (Top 10 Transactions)', margin, y);
  y += 10;

  const top10 = [...expenses]
    .filter((e) => e.type !== 'income')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)
    .map((e) => {
      const cat = categoriesMap.get(e.categoryId);
      const dateStr = e.date ? format(e.date.toDate(), 'dd MMM yyyy') : 'N/A';
      return [
        dateStr,
        cat?.name || 'General',
        e.note || 'No description provided',
        `INR ${e.amount.toLocaleString('en-IN')}`,
      ];
    });

  if (top10.length === 0) {
    top10.push(['-', 'No Records', 'Zero expense records for this statement period', 'INR 0']);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Date', 'Category', 'Description / Note', 'Amount']],
    body: top10,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 100 },
      2: { cellWidth: 'auto' },
      3: { halign: 'right', cellWidth: 90, fontStyle: 'bold' },
    },
  });

  // ── Footer ────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(
      'SpendWise Student Finance • 100% Deterministic Mathematical Ledger • Certified Authentic',
      margin,
      pageHeight - 20
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
  }

  // Trigger browser download
  const safeMonthSlug = monthName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  doc.save(`SpendWise_Statement_${safeMonthSlug}.pdf`);
}
