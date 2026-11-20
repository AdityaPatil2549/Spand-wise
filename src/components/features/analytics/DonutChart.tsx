'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils/format';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import type { CategoryBreakdown } from '@/types/ui';

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: CategoryBreakdown & { budgetAmount?: number } }[] }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-theme-surface/95 backdrop-blur-md rounded-2xl px-3.5 py-2.5 shadow-xl border border-theme-border flex flex-col gap-1 z-30">
      <div className="flex items-center gap-2">
        <CategoryIcon iconName={data.icon} size={14} className="text-theme-secondary" />
        <p className="text-sm font-semibold text-theme-primary">
          {data.categoryName}
        </p>
      </div>
      <p className="text-xs text-theme-secondary font-medium font-mono">
        Spent: <strong className="text-theme-primary">{formatCurrency(data.amount)}</strong> ({data.percentage.toFixed(1)}%)
      </p>
      {data.budgetAmount && data.budgetAmount > 0 && (
        <p className="text-xs text-theme-tertiary font-medium font-mono">
          Budget: {formatCurrency(data.budgetAmount)}
        </p>
      )}
    </div>
  );
};

/**
 * DonutChart — Interactive Recharts pie chart showing spending by category.
 */
export const DonutChart = () => {
  const expenses = useStore((s) => s.expenses);
  const storeCategories = useStore((s) => s.categories);
  const categoriesMap = useStore((s) => s.categoriesMap);
  const budget = useStore((s) => s.budget);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
          categoriesMap.get(categoryId);
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
  }, [expenses, storeCategories, categoriesMap, budget]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const activeItem = activeIndex !== null ? breakdown[activeIndex] : null;

  if (breakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-theme-tertiary">
        <span className="text-4xl mb-2 opacity-50">📊</span>
        <p className="text-sm font-medium">No expenses to analyze</p>
      </div>
    );
  }

  return (
    <div>
      {/* Donut chart */}
      <div className="relative h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdown}
              dataKey="amount"
              nameKey="categoryName"
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={92}
              paddingAngle={3}
              strokeWidth={0}
              isAnimationActive={true}
              animationBegin={100}
              animationDuration={600}
              animationEasing="ease-out"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {breakdown.map((entry, index) => (
                <Cell
                  key={entry.categoryId}
                  fill={entry.color}
                  stroke={activeIndex === index ? 'rgb(var(--theme-primary))' : 'transparent'}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  className="cursor-pointer transition-all duration-150 outline-none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-150">
          <p className="text-xs text-theme-tertiary uppercase tracking-wider font-semibold mb-0.5 truncate max-w-[130px] text-center">
            {activeItem ? activeItem.categoryName : 'Total spent'}
          </p>
          <p className="text-2xl font-extrabold text-theme-primary font-mono tabular-nums">
            {formatCurrency(activeItem ? activeItem.amount : totalSpent)}
          </p>
          {activeItem && (
            <span className="text-[11px] font-mono text-theme-accent font-semibold mt-0.5 animate-in fade-in">
              {activeItem.percentage.toFixed(1)}% of total
            </span>
          )}
        </div>
      </div>

      {/* Category breakdown list */}
      <div className="mt-6 space-y-2.5">
        {breakdown.map((item, index) => {
          const hasBudget = !!item.budgetAmount;
          const budgetPercent = hasBudget ? Math.min(100, (item.amount / item.budgetAmount!) * 100) : 0;
          const isOverBudget = hasBudget && item.amount > item.budgetAmount!;
          const isSelected = activeIndex === index;

          return (
            <div
              key={item.categoryId}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex flex-col gap-2 p-3.5 rounded-2xl transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-theme-elevated border-theme-border/80 shadow-md shadow-black/10'
                  : 'hover:bg-theme-surface/70 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform"
                  style={{
                    backgroundColor: `${item.color}22`,
                    color: item.color,
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  }}
                  aria-hidden="true"
                >
                  <CategoryIcon iconName={item.icon} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-theme-primary truncate">
                    {item.categoryName}
                  </p>
                  {hasBudget && (
                    <p className={`text-xs font-mono ${isOverBudget ? 'text-theme-danger font-semibold' : 'text-theme-secondary'}`}>
                      {formatCurrency(Math.abs(item.budgetAmount! - item.amount))} {isOverBudget ? 'over budget' : 'remaining'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-sm font-bold text-theme-primary font-mono tabular-nums">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-xs font-semibold text-theme-secondary font-mono mt-0.5">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              {hasBudget && (
                <div className="w-full h-1.5 bg-theme-base rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isOverBudget ? 'bg-theme-danger' : ''}`}
                    style={{
                      width: `${budgetPercent}%`,
                      backgroundColor: !isOverBudget ? item.color : undefined,
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
