'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday, 
  startOfWeek, 
  endOfWeek,
  getDaysInMonth,
  isAfter
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ExpenseList } from '@/components/features/expenses/ExpenseList';
import { useHydrated } from '@/hooks/useHydrated';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ExpenseDocument } from '@/types/firestore';

export default function CalendarPage() {
  const isHydrated = useHydrated();
  const expenses = useStore((s) => s.expenses);
  const budget = useStore((s) => s.budget);
  const openBottomSheetGlobal = useStore((s) => s.openBottomSheet);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Month boundary intervals
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = 'yyyy-MM-dd';
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const totalDaysInMonth = getDaysInMonth(currentDate);

  // Map expenses to days
  const expensesByDay = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      if (expense.type !== 'income' && expense.date) {
        const dayStr = format(expense.date.toDate(), dateFormat);
        if (!acc[dayStr]) acc[dayStr] = { total: 0, count: 0, items: [] };
        acc[dayStr].total += expense.amount;
        acc[dayStr].count += 1;
        acc[dayStr].items.push(expense);
      }
      return acc;
    }, {} as Record<string, { total: number; count: number; items: ExpenseDocument[] }>);
  }, [expenses]);

  // Aggregate monthly stats & intensity thresholds
  const { monthTotal, avgDaily, zeroSpendDays, peakDay, dailyTarget } = useMemo(() => {
    let total = 0;
    let zeroDays = 0;
    let maxSpend = 0;
    let maxDateStr = '';

    const today = new Date();

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const dStr = format(date, dateFormat);
      const dayData = expensesByDay[dStr];

      if (dayData && dayData.total > 0) {
        total += dayData.total;
        if (dayData.total > maxSpend) {
          maxSpend = dayData.total;
          maxDateStr = dStr;
        }
      } else if (!isAfter(date, today)) {
        // Only count elapsed past days or today as valid zero-spend days
        zeroDays += 1;
      }
    }

    const budgetCap = budget?.budgetAmount || 0;
    const target = budgetCap > 0 ? budgetCap / totalDaysInMonth : total > 0 ? total / totalDaysInMonth : 500;
    const average = total / Math.max(1, totalDaysInMonth);

    return {
      monthTotal: total,
      avgDaily: average,
      zeroSpendDays: zeroDays,
      peakDay: { date: maxDateStr, amount: maxSpend },
      dailyTarget: target,
    };
  }, [currentDate, totalDaysInMonth, expensesByDay, budget]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const selectedDateExpenses = selectedDateStr ? expensesByDay[selectedDateStr]?.items || [] : [];

  if (!isHydrated) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[480px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36 flex flex-col items-center w-full">
      <div className="w-full max-w-5xl px-4 md:px-8 py-6">
        
        {/* Top Header & Month Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-theme-surface border border-theme-border/40 text-theme-accent shadow-xs">
                <CalendarIcon className="w-4 h-4 stroke-[2]" />
              </span>
              <span className="text-xs font-bold text-theme-secondary uppercase tracking-widest">
                Tier 2.6 Daily Intensity Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-theme-primary tracking-tight">
              Spending Intensity Heatmap
            </h1>
            <p className="text-xs sm:text-sm text-theme-secondary mt-0.5">
              Interactive density calendar tracking high-outflow days against zero-spend streaks.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-theme-surface border border-theme-border/50 rounded-2xl p-1 shadow-xs self-start sm:self-auto">
            <button 
              type="button"
              onClick={prevMonth} 
              className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-theme-elevated rounded-xl transition-all text-theme-secondary hover:text-theme-primary active:scale-95"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>
            <span className="font-semibold text-sm text-theme-primary min-w-[130px] text-center font-display">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button 
              type="button"
              onClick={nextMonth} 
              className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-theme-elevated rounded-xl transition-all text-theme-secondary hover:text-theme-primary active:scale-95"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Banners */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme-border/30">
            <span className="text-[11px] font-semibold text-theme-secondary uppercase tracking-wider block mb-1">
              Total Spent
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-theme-primary tabular-nums">
              {CURRENCY_SYMBOL}{monthTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <p className="text-[11px] text-theme-tertiary mt-1">This calendar month</p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme-border/30">
            <span className="text-[11px] font-semibold text-theme-secondary uppercase tracking-wider block mb-1">
              Daily Average
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-400 tabular-nums">
              {CURRENCY_SYMBOL}{avgDaily.toFixed(0)}
            </span>
            <p className="text-[11px] text-theme-tertiary mt-1">Target: ~{CURRENCY_SYMBOL}{dailyTarget.toFixed(0)}/d</p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme-border/30">
            <span className="text-[11px] font-semibold text-theme-secondary uppercase tracking-wider block mb-1">
              Zero-Spend Days
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-500 tabular-nums flex items-center gap-1.5">
              <Flame className="w-5 h-5 fill-emerald-500/30 text-emerald-500" />
              {zeroSpendDays}
            </span>
            <p className="text-[11px] text-theme-tertiary mt-1">Streak resilience points</p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme-border/30">
            <span className="text-[11px] font-semibold text-theme-secondary uppercase tracking-wider block mb-1">
              Peak Outflow
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-rose-500 tabular-nums">
              {peakDay.amount > 0 ? `${CURRENCY_SYMBOL}${peakDay.amount.toFixed(0)}` : 'None'}
            </span>
            <p className="text-[11px] text-theme-tertiary mt-1 truncate">
              {peakDay.date ? format(new Date(peakDay.date), 'dd MMM') : 'No expenses logged'}
            </p>
          </div>
        </div>

        {/* Intensity Legend Bar */}
        <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-theme-border/30 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-theme-secondary">Spending Intensity Index:</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-theme-secondary">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 inline-block" />
              Zero Spend (₹0)
            </span>
            <span className="inline-flex items-center gap-1.5 text-theme-secondary">
              <span className="w-3.5 h-3.5 rounded-md bg-theme-surface border border-theme-border/60 inline-block" />
              Light (&lt;50% Cap)
            </span>
            <span className="inline-flex items-center gap-1.5 text-theme-secondary">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-500/20 border border-amber-500/50 inline-block" />
              Moderate (50-100%)
            </span>
            <span className="inline-flex items-center gap-1.5 text-theme-secondary">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-500/20 border border-rose-500/50 inline-block" />
              High Outflow (&gt;100%)
            </span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-[11px] sm:text-xs font-bold text-theme-secondary uppercase tracking-wider py-1.5">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid with 4 Intensity Levels */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
          {days.map((day) => {
            const dayStr = format(day, dateFormat);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);
            const dayData = expensesByDay[dayStr];
            const amount = dayData?.total || 0;
            const count = dayData?.count || 0;
            const hasExpenses = amount > 0;
            const isFuture = isAfter(day, new Date());

            // Intensity Level: 0 = Zero, 1 = Light, 2 = Moderate, 3 = High
            let intensityClass = 'bg-theme-surface/40 border-theme-border/30';
            let badgeColor = 'text-theme-secondary';

            if (isCurrentMonth && !isFuture) {
              if (!hasExpenses) {
                // Level 0: Zero Spend
                intensityClass = 'bg-emerald-500/10 border-emerald-500/35 hover:bg-emerald-500/15';
                badgeColor = 'text-emerald-500';
              } else if (amount <= dailyTarget * 0.5) {
                // Level 1: Light
                intensityClass = 'bg-theme-surface border-theme-border/60 hover:border-theme-accent';
                badgeColor = 'text-theme-primary';
              } else if (amount <= dailyTarget) {
                // Level 2: Moderate
                intensityClass = 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/15';
                badgeColor = 'text-amber-500';
              } else {
                // Level 3: High Outflow
                intensityClass = 'bg-rose-500/15 border-rose-500/45 hover:bg-rose-500/20';
                badgeColor = 'text-rose-500';
              }
            }

            return (
              <div 
                key={dayStr}
                onClick={() => hasExpenses && setSelectedDateStr(dayStr)}
                className={`
                  relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-2xl border min-h-[68px] sm:min-h-[92px] transition-all
                  ${isCurrentMonth ? intensityClass : 'bg-transparent border-transparent opacity-25 pointer-events-none'}
                  ${isTodayDate ? 'ring-2 ring-theme-accent border-transparent shadow-sm' : ''}
                  ${hasExpenses ? 'cursor-pointer hover:shadow-md active:scale-95' : 'cursor-default'}
                `}
              >
                <div className="w-full flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-semibold tabular-nums ${isTodayDate ? 'text-theme-accent font-bold' : 'text-theme-primary'}`}>
                    {format(day, 'd')}
                  </span>
                  {isTodayDate && (
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-full bg-theme-accent text-theme-inverse">
                      Today
                    </span>
                  )}
                  {!hasExpenses && isCurrentMonth && !isFuture && (
                    <span className="hidden sm:inline-block text-[10px] text-emerald-500 font-bold">
                      🎉
                    </span>
                  )}
                </div>
                
                {hasExpenses ? (
                  <div className="w-full flex flex-col items-center mt-auto">
                    <span className={`text-xs sm:text-sm font-bold font-mono tabular-nums text-center break-all ${badgeColor}`}>
                      {CURRENCY_SYMBOL}{amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-theme-secondary mt-0.5 font-medium">
                      {count} txn{count > 1 ? 's' : ''}
                    </span>
                  </div>
                ) : isCurrentMonth && !isFuture ? (
                  <span className="text-[10px] text-emerald-500/80 font-medium mt-auto">
                    ₹0 spend
                  </span>
                ) : (
                  <div className="h-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Expenses Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedDateStr}
        onClose={() => setSelectedDateStr(null)}
        title={selectedDateStr ? format(new Date(selectedDateStr), 'MMMM do, yyyy') : 'Expenses'}
      >
        <div className="pb-8">
          <ExpenseList 
            onEditExpense={(expense) => {
              setSelectedDateStr(null);
              openBottomSheetGlobal({ editingExpenseId: expense.id, initialCategoryId: expense.categoryId });
            }} 
            expenses={selectedDateExpenses}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
