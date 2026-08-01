'use client';

import { useAuthGuard } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { DonutChart } from '@/components/analytics/DonutChart';
import { MonthComparisonChart } from '@/components/analytics/MonthComparisonChart';
import { DayHeatmap } from '@/components/analytics/DayHeatmap';
import { AIPredictionCard } from '@/components/analytics/AIPredictionCard';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { getRecentMonths } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/format';
import { useMemo } from 'react';

export default function AnalyticsPage() {
  const { isLoading } = useAuthGuard();
  const expenses = useStore((s) => s.expenses);
  const isExpensesLoading = useStore((s) => s.isExpensesLoading);
  const budget = useStore((s) => s.budget);
  const selectedMonth = useStore((s) => s.selectedMonth);
  const setSelectedMonth = useStore((s) => s.setSelectedMonth);
  const months = getRecentMonths(6);

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const dailyAverage = useMemo(() => {
    if (expenses.length === 0) return 0;
    const days = new Set(expenses.map((e) => e.date.toDate().toDateString())).size;
    return totalSpent / (days || 1);
  }, [expenses, totalSpent]);

  if (isLoading) {
    return (
      <div className="pt-6 space-y-4 px-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pt-6 pb-6 w-full max-w-5xl mx-auto md:px-8">
      <div className="px-4 md:px-0 mb-4">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Analytics</h1>

        {/* Month selector */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
          {months.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMonth(m.value)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-[transform,background-color,color,box-shadow] duration-150
                ${selectedMonth === m.value
                  ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-600 ring-offset-2 ring-offset-[var(--surface-base)] scale-105'
                  : 'bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] active:scale-95'
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-0">
        {/* Summary Stats (Full Width) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card padding="md">
            <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Total Spent</p>
            <p className="text-xl font-black text-[var(--text-primary)]">{formatCurrency(totalSpent)}</p>
          </Card>
          <Card padding="md">
            <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Daily Avg</p>
            <p className="text-xl font-black text-[var(--text-primary)]">{formatCurrency(dailyAverage)}</p>
          </Card>
          <Card padding="md">
            <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Transactions</p>
            <p className="text-xl font-black text-[var(--text-primary)]">{expenses.length}</p>
          </Card>
          <Card padding="md">
            <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Budget Left</p>
            <p className="text-xl font-black text-[var(--text-primary)]">
              {budget ? formatCurrency(budget.budgetAmount - (budget.totalSpent || 0)) : '—'}
            </p>
          </Card>
        </div>

        {/* Paid to friends (Full Width) */}
        <div className="mb-6">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Paid to Friends</p>
                <p className="text-xl font-black text-[var(--text-primary)]">
                  {formatCurrency(expenses.filter(e => e.categoryId === 'friend').reduce((sum, e) => sum + e.amount, 0))}
                </p>
              </div>
              <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
                <span className="text-lg">🤝</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card padding="md">
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">
                Spending by Category
              </h2>
              {isExpensesLoading ? (
                <Skeleton className="h-48 rounded-xl" />
              ) : (
                <DonutChart />
              )}
            </Card>

            <Card padding="md">
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">
                Spending Heatmap
              </h2>
              {isExpensesLoading ? (
                <Skeleton className="h-40 rounded-xl" />
              ) : (
                <DayHeatmap />
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card padding="md">
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">
                6-Month Trend
              </h2>
              <MonthComparisonChart />
            </Card>

            <AIPredictionCard />
          </div>
        </div>
      </div>
    </div>
  );
}
