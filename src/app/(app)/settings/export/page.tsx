'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { ArrowLeft, Download, Calendar as CalendarIcon, FileSpreadsheet } from 'lucide-react';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { AnimatedGroup } from '@/components/ui/motion/animated-group';
import { getExpensesByDateRange } from '@/lib/expenses/index';
import { exportExpensesToExcel } from '@/lib/utils/export';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

type ExportRange = 'current_month' | 'last_1_month' | 'last_3_months' | 'last_6_months' | 'custom';

export default function ExportPage() {
  const { user, isLoading } = useAuthGuard();
  const router = useRouter();
  const { householdId, categories, addToast } = useStore();
  
  const [selectedRange, setSelectedRange] = useState<ExportRange>('current_month');
  const [customStartDate, setCustomStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!householdId) return;
    
    setIsExporting(true);
    try {
      let startDate = new Date();
      let endDate = new Date();
      let filename = 'SpendWise_Export.xlsx';

      switch (selectedRange) {
        case 'current_month':
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          filename = `SpendWise_Export_${format(startDate, 'MMM_yyyy')}.xlsx`;
          break;
        case 'last_1_month':
          startDate = startOfMonth(subMonths(new Date(), 1));
          endDate = endOfMonth(subMonths(new Date(), 1));
          filename = `SpendWise_Export_${format(startDate, 'MMM_yyyy')}.xlsx`;
          break;
        case 'last_3_months':
          startDate = startOfMonth(subMonths(new Date(), 3));
          endDate = endOfMonth(new Date());
          filename = `SpendWise_Export_Last_3_Months.xlsx`;
          break;
        case 'last_6_months':
          startDate = startOfMonth(subMonths(new Date(), 6));
          endDate = endOfMonth(new Date());
          filename = `SpendWise_Export_Last_6_Months.xlsx`;
          break;
        case 'custom':
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
          // Set to end of day for the end date to include all expenses on that day
          endDate.setHours(23, 59, 59, 999);
          filename = `SpendWise_Export_${format(startDate, 'yyyyMMdd')}_to_${format(endDate, 'yyyyMMdd')}.xlsx`;
          break;
      }

      const fetchedExpenses = await getExpensesByDateRange(householdId, startDate, endDate);
      
      if (fetchedExpenses.length === 0) {
        addToast({ type: 'warning', message: 'No transactions found in this date range.' });
      } else {
        exportExpensesToExcel(fetchedExpenses, categories, filename);
        addToast({ type: 'success', message: 'Export successful!' });
      }
    } catch (error) {
      console.error('Export failed:', error);
      addToast({ type: 'error', message: 'Failed to export report. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return null;

  const rangeOptions: { value: ExportRange; label: string; desc: string }[] = [
    { value: 'current_month', label: 'Current Month', desc: 'Export all transactions for the current month.' },
    { value: 'last_1_month', label: 'Last Month', desc: 'Export all transactions from the previous month.' },
    { value: 'last_3_months', label: 'Last 3 Months', desc: 'Export transactions from the last 3 months.' },
    { value: 'last_6_months', label: 'Last 6 Months', desc: 'Export transactions from the last 6 months.' },
    { value: 'custom', label: 'Custom Range', desc: 'Select a specific start and end date.' },
  ];

  return (
    <div className="bg-theme-base min-h-screen text-theme-primary font-body pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-theme-base/80 backdrop-blur-xl border-b border-theme-border/30">
        <div className="px-4 h-16 flex items-center justify-between max-w-2xl mx-auto w-full">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-theme-surface-hover active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-theme-primary" />
          </button>
          <h1 className="text-lg font-medium tracking-tight">Export Reports</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-6 pt-8 max-w-2xl mx-auto w-full">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
            <FileSpreadsheet className="w-10 h-10 text-indigo-500" />
          </div>
          <TextEffect as="h2" preset="fade" className="font-display text-3xl font-medium text-theme-primary mb-3">
            Download your data
          </TextEffect>
          <TextEffect as="p" preset="fade" delay={0.1} className="text-theme-secondary">
            Export your transaction history as an Excel file to analyze in Excel, Google Sheets, or Numbers.
          </TextEffect>
        </div>

        <div className="space-y-6">
          <div className="bg-theme-surface border border-theme-border/50 rounded-3xl p-6">
            <h3 className="font-medium text-theme-primary mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-theme-secondary" />
              Select Date Range
            </h3>
            
            <AnimatedGroup preset="fade" className="flex flex-col gap-3">
              {rangeOptions.map((option) => (
                <label 
                  key={option.value}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedRange === option.value 
                      ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20' 
                      : 'border-theme-border/40 bg-theme-elevated hover:bg-theme-surface-hover'
                  }`}
                >
                  <div className="mt-0.5 flex items-center justify-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedRange === option.value ? 'border-indigo-500 bg-indigo-500' : 'border-theme-secondary/50'
                    }`}>
                      {selectedRange === option.value && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-theme-primary">{option.label}</div>
                    <div className="text-sm text-theme-secondary mt-1">{option.desc}</div>
                  </div>
                  <input 
                    type="radio" 
                    name="exportRange" 
                    value={option.value} 
                    checked={selectedRange === option.value}
                    onChange={() => setSelectedRange(option.value)}
                    className="sr-only" 
                  />
                </label>
              ))}
            </AnimatedGroup>

            {/* Custom Range Inputs */}
            {selectedRange === 'custom' && (
              <div className="mt-6 p-4 rounded-2xl bg-theme-base border border-theme-border/40 flex flex-col sm:flex-row gap-4 animate-fade-in">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-theme-secondary mb-1.5 uppercase tracking-wider">Start Date</label>
                  <input 
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full bg-theme-surface border border-theme-border/50 rounded-xl px-4 py-3 text-theme-primary focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-theme-secondary mb-1.5 uppercase tracking-wider">End Date</label>
                  <input 
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full bg-theme-surface border border-theme-border/50 rounded-xl px-4 py-3 text-theme-primary focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`w-full py-4 rounded-2xl font-medium text-white flex items-center justify-center gap-2 transition-all ${
              isExporting 
                ? 'bg-indigo-500/70 cursor-not-allowed' 
                : 'bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export Excel Report
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
