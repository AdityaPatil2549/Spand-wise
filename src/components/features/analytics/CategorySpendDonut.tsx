'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { PieChart as PieIcon, Layers } from 'lucide-react';
import type { CategoryDocument } from '@/types/firestore';

export interface CategoryPieItem {
  name: string;
  value: number;
  color: string;
}

interface CategorySpendDonutProps {
  pieData: CategoryPieItem[];
  totalSpent: number;
  categoriesMap: Map<string, CategoryDocument>;
}

export const CategorySpendDonut: React.FC<CategorySpendDonutProps> = ({
  pieData,
  totalSpent,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex !== null && pieData[activeIndex] ? pieData[activeIndex] : null;

  return (
    <div className="relative overflow-hidden w-full rounded-[28px] p-6 sm:p-7 bg-theme-surface/70 border border-theme-border/60 shadow-sm hover:border-theme-border hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
      {/* Top subtle specular highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-theme-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-theme-accent/10 text-theme-accent flex items-center justify-center">
            <PieIcon className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-theme-primary tracking-tight">
              Category Allocation
            </h3>
            <p className="text-xs text-theme-secondary">
              Proportional debit distribution
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-theme-primary tabular-nums">
          {formatCurrency(totalSpent)} Total
        </span>
      </div>

      {pieData.length === 0 ? (
        <div className="py-12 text-center text-xs text-theme-secondary space-y-1">
          <Layers className="w-8 h-8 mx-auto text-theme-border" />
          <p>No expense data recorded for this period.</p>
        </div>
      ) : (
        <div className="my-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart Container */}
          <div className="md:col-span-5 relative h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={activeIndex !== null ? 82 : 80}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={activeIndex === index ? 'rgb(var(--theme-primary))' : 'var(--theme-surface)'}
                      strokeWidth={activeIndex === index ? 3 : 2}
                      className="cursor-pointer transition-all duration-150 outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'Spent']}
                  contentStyle={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Donut Center Dynamic Total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-150">
              <span className="text-[10px] uppercase tracking-widest text-theme-secondary font-semibold max-w-[100px] truncate text-center">
                {activeItem ? activeItem.name : 'Total'}
              </span>
              <span className="text-sm font-bold text-theme-primary tabular-nums font-mono">
                {formatCurrency(activeItem ? activeItem.value : totalSpent)}
              </span>
              {activeItem && totalSpent > 0 && (
                <span className="text-[10px] text-theme-accent font-semibold font-mono animate-in fade-in">
                  {Math.round((activeItem.value / totalSpent) * 100)}%
                </span>
              )}
            </div>
          </div>

          {/* Category Items Breakdown List */}
          <div className="md:col-span-7 space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {pieData.slice(0, 5).map((item, index) => {
              const pct = totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0;
              const isSelected = activeIndex === index;

              return (
                <div
                  key={`${item.name}-${index}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-theme-elevated border-theme-border shadow-sm'
                      : 'bg-theme-base/60 border-theme-border/30 hover:border-theme-border/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 transition-transform"
                      style={{
                        backgroundColor: item.color,
                        transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                    <span className="font-semibold text-theme-primary truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-theme-secondary font-mono font-medium text-[11px]">
                      {pct}%
                    </span>
                    <strong className="text-theme-primary font-bold tabular-nums font-mono">
                      {formatCurrency(item.value)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
