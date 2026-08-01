'use client';

import { useMemo } from 'react';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils/format';
import { CATEGORIES_MAP } from '@/config/categories';
import { Skeleton } from '@/components/ui/Skeleton';
import clsx from 'clsx';

export const DashboardExpenseGrid = () => {
  const expenses = useStore((s) => s.expenses);
  const isExpensesLoading = useStore((s) => s.isExpensesLoading);
  const categories = useStore((s) => s.categories);

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => b.date.toMillis() - a.date.toMillis())
      .slice(0, 4);
  }, [expenses]);

  if (isExpensesLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (recentExpenses.length === 0) {
    return <p className="text-[var(--text-tertiary)] py-8">No recent expenses.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {recentExpenses.map((expense, i) => {
        const category = categories.find((c) => c.id === expense.categoryId) ?? CATEGORIES_MAP.get(expense.categoryId);
        const iconName = category?.emoji ?? 'category';
        
        // Cycle through some colors for the decorative background blur
        const colorClasses = [
          'bg-violet-600/10 text-violet-600',
          'bg-blue-500/20 text-blue-500',
          'bg-emerald-500/10 text-emerald-500',
          'bg-amber-500/10 text-amber-500'
        ];
        const activeColor = colorClasses[i % colorClasses.length];

        return (
          <div key={expense.id} className="bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-md rounded-2xl p-6 border border-[var(--surface-secondary)]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-48 relative overflow-hidden group cursor-pointer" onClick={() => useStore.getState().openBottomSheet({ editingExpenseId: expense.id })}>
            <div className={clsx("absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 transition-transform group-hover:scale-110", activeColor.split(' ')[0])}></div>
            <div className="flex justify-between items-start">
              <div className={clsx("p-3 bg-[var(--surface-base)] rounded-xl text-xl", activeColor.split(' ')[1])}>
                {iconName}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)]">
                {expense.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div>
              <p className="text-sm font-body text-[var(--text-secondary)] mb-1">{expense.note || category?.name || 'Expense'}</p>
              <p className="font-display text-2xl font-medium text-[var(--text-primary)]">
                {formatCurrency(expense.amount)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
