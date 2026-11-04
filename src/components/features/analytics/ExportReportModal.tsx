'use client';

import React, { useState } from 'react';
import { generateMonthlyPDFReport } from '@/lib/export/pdfReport';
import { format } from 'date-fns';
import { triggerHaptic } from '@/lib/haptics';
import { FileDown, FileText, Table, X } from 'lucide-react';
import type { ExpenseDocument, BudgetDocument, CategoryDocument } from '@/types/firestore';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: ExpenseDocument[];
  budget: BudgetDocument | null;
  categoriesMap: Map<string, CategoryDocument>;
  householdId: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  expenses,
  budget,
  categoriesMap,
  householdId,
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  if (!isOpen) return null;

  const currentMonthName = format(new Date(), 'MMMM yyyy');
  const currentMonthId = format(new Date(), 'yyyy-MM');
  const monthlyIncome = budget?.totalIncome || 0;
  const totalSpent = budget?.totalSpent || 0;
  const budgetAmount = budget?.budgetAmount || 0;
  const balance = budgetAmount - totalSpent;

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    triggerHaptic('medium');
    try {
      generateMonthlyPDFReport({
        monthName: currentMonthName,
        userDisplayName: 'Student User',
        householdName: 'Personal Household',
        monthlyIncome,
        totalSpent,
        budgetAmount,
        balance,
        expenses,
        categoriesMap,
      });
      triggerHaptic('heavy');
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPDF(false);
      onClose();
    }
  };

  const handleExportCSV = () => {
    setIsExportingCSV(true);
    triggerHaptic('medium');
    try {
      const headers = ['Date', 'Category', 'Note', 'Amount', 'Type', 'Payment Mode'];
      const rows = expenses.map((exp) => {
        const cat = categoriesMap.get(exp.categoryId)?.name || 'General';
        let dateStr = '';
        try {
          dateStr = format(exp.date.toDate(), 'yyyy-MM-dd HH:mm');
        } catch {
          dateStr = 'N/A';
        }
        return [
          dateStr,
          `"${cat}"`,
          `"${exp.note || ''}"`,
          exp.amount,
          exp.type || 'expense',
          exp.accountId || 'upi',
        ];
      });

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `SpendWise-Ledger-${currentMonthId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerHaptic('heavy');
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setIsExportingCSV(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-theme-border/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-theme-accent/10 text-theme-accent flex items-center justify-center">
              <FileDown className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-bold text-base text-theme-primary">Export Statement</h4>
              <p className="text-xs text-theme-secondary">
                For parents, hostel accounting & personal tax
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-theme-base text-theme-secondary hover:text-theme-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* PDF Report Option */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="w-full p-4 rounded-2xl bg-theme-base/70 hover:bg-theme-base border border-theme-border/40 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-theme-primary block">
                  Executive PDF Report
                </strong>
                <span className="text-[11px] text-theme-secondary block">
                  Includes category charts, health rating & transaction ledger
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-theme-accent">
              {isExportingPDF ? 'Generating...' : 'Download'}
            </span>
          </button>

          {/* CSV Spreadsheet Option */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExportingCSV}
            className="w-full p-4 rounded-2xl bg-theme-base/70 hover:bg-theme-base border border-theme-border/40 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-theme-primary block">
                  Raw CSV Spreadsheet
                </strong>
                <span className="text-[11px] text-theme-secondary block">
                  Compatible with Microsoft Excel, Google Sheets & Apple Numbers
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-theme-accent">
              {isExportingCSV ? 'Exporting...' : 'Download'}
            </span>
          </button>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-theme-secondary">
            Exports are compiled 100% on device for maximum student privacy.
          </p>
        </div>
      </div>
    </div>
  );
};
