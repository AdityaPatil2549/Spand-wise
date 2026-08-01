'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils/format';
import { CATEGORIES_MAP } from '@/config/categories';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import type { CategoryBreakdown } from '@/types/ui';

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: CategoryBreakdown & { budgetAmount?: number } }[] }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[var(--surface-primary)] rounded-xl px-3 py-2 shadow-lg border border-[var(--surface-secondary)] flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <CategoryIcon iconName={data.icon} size={14} className="text-[var(--text-secondary)]" />
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {data.categoryName}
        </p>
      </div>
      <p className="text-sm text-[var(--text-secondary)] font-medium">
        Spent: {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
      </p>
      {data.budgetAmount && data.budgetAmount > 0 && (
        <p className="text-sm text-[var(--text-secondary)] font-medium">
          Budget: {formatCurrency(data.budgetAmount)}
        </p>
      )}
    </div>
  );
};

/**
 * DonutChart — Recharts pie chart showing spending by category.
 */
export const DonutChart = () => {
  const expenses = useStore((s) => s.expenses);
  const storeCategories = useStore((s) => s.categories);
  const budget = useStore((s) => s.budget);

  const breakdown = useMemo(() => {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    if (totalSpent === 0) return [];

    const map = new Map<string, number>();
    for (const expense of expenses) {
      map.set(expense.categoryId, (map.get(expense.categoryId) ?? 0) + expense.amount);
    }

    return Array.from(map.entries())
      .map(([categoryId, amount]) => {
        const cat =
          storeCategories.find((c) => c.id === categoryId) ??
          CATEGORIES_MAP.get(categoryId);
        const budgetAmount = budget?.categoryBudgets?.[categoryId];
        return {
          categoryId,
          categoryName: cat?.name ?? 'Misc',
          emoji: cat?.emoji ?? '📦',
          icon: cat?.icon ?? 'Package',
          color: cat?.color ?? '#6b7280',
          amount,
          percentage: (amount / totalSpent) * 100,
          count: expenses.filter((e) => e.categoryId === categoryId).length,
          budgetAmount,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, storeCategories, budget]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (breakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--text-tertiary)]">
        <span className="text-4xl mb-2 opacity-50">📊</span>
        <p className="text-sm">No expenses to analyze</p>
      </div>
    );
  }

  return (
    <div>
      {/* Donut chart */}
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdown}
              dataKey="amount"
              nameKey="categoryName"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              strokeWidth={0}
              isAnimationActive={true}
              animationBegin={100}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {breakdown.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mb-1">Total spent</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {formatCurrency(totalSpent)}
          </p>
        </div>
      </div>

      {/* Category breakdown list */}
      <div className="mt-6 space-y-3">
        {breakdown.map((item) => {
          const hasBudget = !!item.budgetAmount;
          const budgetPercent = hasBudget ? Math.min(100, (item.amount / item.budgetAmount!) * 100) : 0;
          const isOverBudget = hasBudget && item.amount > item.budgetAmount!;
          
          return (
            <div key={item.categoryId} className="flex flex-col gap-2 p-3 rounded-xl hover:bg-[var(--surface-secondary)] transition-colors border border-transparent hover:border-[var(--surface-secondary)]">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}22`, color: item.color }}
                  aria-hidden="true"
                >
                  <CategoryIcon iconName={item.icon} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {item.categoryName}
                  </p>
                  {hasBudget && (
                    <p className={`text-xs ${isOverBudget ? 'text-red-500 font-semibold' : 'text-[var(--text-secondary)]'}`}>
                      {formatCurrency(item.budgetAmount! - item.amount)} {isOverBudget ? 'over' : 'left'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              {hasBudget && (
                <div className="w-full h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : ''}`}
                    style={{ 
                      width: `${budgetPercent}%`,
                      backgroundColor: !isOverBudget ? item.color : undefined
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
