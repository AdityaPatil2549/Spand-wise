'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ShoppingBag, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { CURRENCY_SYMBOL } from '@/config/constants';
import type { ExpenseDocument } from '@/types/firestore';

interface RecurringVsVariableSplitProps {
  expenses: ExpenseDocument[];
  categoriesMap: Map<string, { name: string; color?: string }>;
}

const RECURRING_KEYWORDS = [
  'rent', 'hostel', 'tuition', 'wifi', 'recharge', 'bill', 'subscription', 
  'academic', 'course', 'insurance', 'fees', 'maintenance', 'broadband'
];

export const RecurringVsVariableSplit: React.FC<RecurringVsVariableSplitProps> = ({
  expenses,
  categoriesMap,
}) => {
  const { recurringTotal, variableTotal, totalSpent, recurringPct, variablePct, recurringCats, variableCats } =
    useMemo(() => {
      let rTotal = 0;
      let vTotal = 0;
      const rMap: Record<string, number> = {};
      const vMap: Record<string, number> = {};

      expenses.forEach((e) => {
        if (e.type !== 'income') {
          const cat = categoriesMap.get(e.categoryId);
          const name = (cat?.name || '').toLowerCase();
          const isRecurring = RECURRING_KEYWORDS.some((kw) => name.includes(kw));

          if (isRecurring) {
            rTotal += e.amount;
            rMap[e.categoryId] = (rMap[e.categoryId] || 0) + e.amount;
          } else {
            vTotal += e.amount;
            vMap[e.categoryId] = (vMap[e.categoryId] || 0) + e.amount;
          }
        }
      });

      const total = rTotal + vTotal;
      const rPct = total > 0 ? (rTotal / total) * 100 : 0;
      const vPct = total > 0 ? (vTotal / total) * 100 : 0;

      return {
        recurringTotal: rTotal,
        variableTotal: vTotal,
        totalSpent: total,
        recurringPct: rPct,
        variablePct: vPct,
        recurringCats: Object.entries(rMap).sort((a, b) => b[1] - a[1]),
        variableCats: Object.entries(vMap).sort((a, b) => b[1] - a[1]),
      };
    }, [expenses, categoriesMap]);

  const isHighRecurringRisk = recurringPct > 65;
  const isHealthyBalance = recurringPct >= 30 && recurringPct <= 60;

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-theme-surface border border-theme-border/40 text-theme-accent shadow-xs">
              <RefreshCw className="w-4 h-4 stroke-[2]" />
            </span>
            <span className="text-xs font-bold text-theme-secondary uppercase tracking-widest">
              Tier 2.7 Analytical Split
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-theme-primary tracking-tight">
            Recurring vs. Discretionary Split
          </h3>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            Separates locked monthly student commitments from flexible day-to-day lifestyle spending.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {isHighRecurringRisk ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-500 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" /> High Fixed Burden ({recurringPct.toFixed(0)}%)
            </span>
          ) : isHealthyBalance ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-semibold">
              <Check className="w-3.5 h-3.5" /> Balanced Ratio ({recurringPct.toFixed(0)}% fixed)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-500 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> High Discretionary Buffer
            </span>
          )}
        </div>
      </div>

      {/* Visual Dual-Bar Track */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-indigo-400">
            <RefreshCw className="w-3.5 h-3.5" />
            Fixed Commitments ({recurringPct.toFixed(1)}%)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <ShoppingBag className="w-3.5 h-3.5" />
            Variable / Discretionary ({variablePct.toFixed(1)}%)
          </span>
        </div>

        <div className="w-full h-4 rounded-full bg-theme-elevated overflow-hidden flex p-0.5 border border-theme-border/40">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${recurringPct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-l-full bg-indigo-500"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${variablePct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-r-full bg-amber-500"
          />
        </div>
      </div>

      {/* Two Column Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left: Fixed Commitments */}
        <div className="p-4 rounded-2xl bg-theme-surface/50 border border-theme-border/30 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
              Fixed Obligations
            </span>
            <span className="text-sm font-bold text-indigo-400 font-mono tabular-nums">
              {CURRENCY_SYMBOL}{recurringTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-1.5">
            {recurringCats.length === 0 ? (
              <p className="text-xs text-theme-tertiary">No fixed recurring commitments logged this month.</p>
            ) : (
              recurringCats.map(([catId, amt]) => {
                const cat = categoriesMap.get(catId);
                return (
                  <div key={catId} className="flex justify-between items-center text-xs">
                    <span className="text-theme-primary">{cat?.name || 'Fixed'}</span>
                    <span className="font-mono text-theme-secondary tabular-nums">
                      {CURRENCY_SYMBOL}{amt.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Variable Discretionary Spends */}
        <div className="p-4 rounded-2xl bg-theme-surface/50 border border-theme-border/30 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
              Variable Daily Outflows
            </span>
            <span className="text-sm font-bold text-amber-400 font-mono tabular-nums">
              {CURRENCY_SYMBOL}{variableTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-1.5">
            {variableCats.length === 0 ? (
              <p className="text-xs text-theme-tertiary">No variable expenses logged yet.</p>
            ) : (
              variableCats.slice(0, 5).map(([catId, amt]) => {
                const cat = categoriesMap.get(catId);
                return (
                  <div key={catId} className="flex justify-between items-center text-xs">
                    <span className="text-theme-primary truncate max-w-[140px]">{cat?.name || 'Variable'}</span>
                    <span className="font-mono text-theme-secondary tabular-nums">
                      {CURRENCY_SYMBOL}{amt.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
