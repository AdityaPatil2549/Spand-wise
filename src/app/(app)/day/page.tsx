'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, subDays, isToday, isSameDay } from 'date-fns';
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays, TrendingDown, TrendingUp } from 'lucide-react';

import { useStore } from '@/store';
import { useHydrated } from '@/hooks/useHydrated';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { ExpenseList } from '@/components/features/expenses/ExpenseList';

export default function DayViewPage() {
  const router = useRouter();
  const isHydrated = useHydrated();
  const expenses = useStore(s => s.expenses);
  const categories = useStore(s => s.categories);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dayExpenses = useMemo(() => {
    return expenses
      .filter(e => !e.isDeleted)
      .filter(e => {
        try {
          const expenseDate = typeof e.date === 'string' ? new Date(e.date) : e.date.toDate();
          return isSameDay(expenseDate, selectedDate);
        } catch (err) {
          return false;
        }
      })
      .sort((a, b) => {
        const da = typeof a.date === 'string' ? new Date(a.date) : a.date.toDate();
        const db = typeof b.date === 'string' ? new Date(b.date) : b.date.toDate();
        return db.getTime() - da.getTime();
      });
  }, [expenses, selectedDate]);

  const { income, expense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    dayExpenses.forEach(e => {
      if (e.type === 'income') {
        inc += e.amount;
      } else {
        exp += e.amount;
      }
    });
    return { income: inc, expense: exp };
  }, [dayExpenses]);

  if (!isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-theme-border border-t-theme-accent animate-spin" />
      </div>
    );
  }

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleToday = () => setSelectedDate(new Date());

  return (
    <div className="min-h-screen pb-32 animate-fade-in flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 md:px-8 border-b border-theme-border bg-theme-base sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl hover:bg-theme-surface transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-theme-primary" />
            </button>
            <h1 className="text-xl font-bold text-theme-primary tracking-tight">Day View</h1>
          </div>
          {!isToday(selectedDate) && (
            <button 
              onClick={handleToday}
              className="text-xs font-semibold px-3 py-1.5 bg-theme-surface text-theme-primary rounded-full hover:bg-theme-elevated transition-colors"
            >
              Today
            </button>
          )}
        </div>

        {/* Date Navigator */}
        <div className="flex items-center justify-between bg-theme-surface border border-theme-border rounded-2xl p-2 mb-4">
          <button 
            onClick={handlePrevDay}
            className="p-3 hover:bg-theme-elevated rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-theme-secondary" />
          </button>
          <div className="flex flex-col items-center">
            <span className="font-bold text-theme-primary text-lg">
              {format(selectedDate, 'dd MMM, yyyy')}
            </span>
            <span className="text-xs font-medium text-theme-secondary">
              {format(selectedDate, 'EEEE')}
            </span>
          </div>
          <button 
            onClick={handleNextDay}
            className="p-3 hover:bg-theme-elevated rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-theme-secondary" />
          </button>
        </div>

        {/* Day Summary */}
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
        {dayExpenses.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <CalendarDays className="w-12 h-12 text-theme-tertiary mb-4" />
            <h3 className="text-lg font-semibold text-theme-primary mb-1">No transactions</h3>
            <p className="text-theme-secondary text-sm">
              You have no records for this day.
            </p>
          </div>
        ) : (
          <ExpenseList expenses={dayExpenses} />
        )}
      </div>
    </div>
  );
}
