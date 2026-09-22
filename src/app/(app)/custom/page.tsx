'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { ArrowLeft, LayoutGrid, CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';

import { useStore } from '@/store';
import { useHydrated } from '@/hooks/useHydrated';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { ExpenseList } from '@/components/features/expenses/ExpenseList';
import { Input } from '@/components/ui/Input';
import { AnimatedDatePicker } from '@/components/ui/AnimatedDatePicker';

export default function CustomViewPage() {
  const router = useRouter();
  const isHydrated = useHydrated();
  const expenses = useStore(s => s.expenses);
  const categories = useStore(s => s.categories);
  
  const [startDate, setStartDate] = useState<string>(
    format(new Date(), 'yyyy-MM-01')
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );

  const filteredExpenses = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

    return expenses
      .filter(e => !e.isDeleted)
      .filter(e => {
        try {
          const expenseDate = typeof e.date === 'string' ? new Date(e.date) : e.date.toDate();
          return isWithinInterval(expenseDate, { start, end });
        } catch (err) {
          return false;
        }
      })
      .sort((a, b) => {
        const da = typeof a.date === 'string' ? new Date(a.date) : a.date.toDate();
        const db = typeof b.date === 'string' ? new Date(b.date) : b.date.toDate();
        return db.getTime() - da.getTime();
      });
  }, [expenses, startDate, endDate]);

  const { income, expense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredExpenses.forEach(e => {
      // For now, treat all transactions as expenses
      exp += e.amount;
    });
    return { income: inc, expense: exp };
  }, [filteredExpenses]);

  if (!isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-theme-border border-t-theme-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 animate-fade-in flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 md:px-8 border-b border-theme-border bg-theme-base sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-theme-surface transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-theme-primary" />
          </button>
          <h1 className="text-xl font-bold text-theme-primary flex items-center gap-2 tracking-tight">
            <CalendarIcon className="w-5 h-5 text-indigo-500" />
            Date Range Report
          </h1>
        </div>

        {/* Date Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <AnimatedDatePicker
              label="From Date"
              value={startDate}
              onChange={(newDate) => setStartDate(newDate)}
            />
          </div>
          <div className="flex-1">
            <AnimatedDatePicker
              label="To Date"
              value={endDate}
              onChange={(newDate) => setEndDate(newDate)}
            />
          </div>
        </div>

        {/* Range Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-theme-surface border border-theme-border rounded-2xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-emerald-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Income</span>
            </div>
            <span className="font-bold text-theme-primary">
              {CURRENCY_SYMBOL} {income.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-theme-surface border border-theme-border rounded-2xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-rose-500 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Expense</span>
            </div>
            <span className="font-bold text-theme-primary">
              {CURRENCY_SYMBOL} {expense.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="flex-1 px-4 py-6 md:px-8 max-w-4xl mx-auto w-full">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <CalendarIcon className="w-12 h-12 text-theme-tertiary mb-4" />
            <h3 className="text-lg font-semibold text-theme-primary mb-1">No transactions</h3>
            <p className="text-theme-secondary text-sm">
              Try adjusting your date range.
            </p>
          </div>
        ) : (
          <ExpenseList expenses={filteredExpenses} />
        )}
      </div>
    </div>
  );
}
