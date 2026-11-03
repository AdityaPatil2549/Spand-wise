'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { CURRENCY_SYMBOL } from '@/config/constants';
import type { ExpenseDocument } from '@/types/firestore';

interface WaterfallMoneyFlowProps {
  income: number;
  budgetAmount: number;
  expenses: ExpenseDocument[];
  categoriesMap: Map<string, { name: string; color?: string; emoji?: string }>;
}

interface WaterfallStep {
  id: string;
  label: string;
  amount: number;
  type: 'inflow' | 'outflow' | 'balance';
  startValue: number;
  endValue: number;
  color?: string;
  percentage?: number;
}

export const WaterfallMoneyFlow: React.FC<WaterfallMoneyFlowProps> = ({
  income,
  budgetAmount,
  expenses,
  categoriesMap,
}) => {
  const effectiveInflow = income > 0 ? income : budgetAmount > 0 ? budgetAmount : 0;

  // Aggregate category outflows
  const { steps, totalOutflow, remainingBalance } = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    let totalSpend = 0;

    expenses.forEach((e) => {
      if (e.type !== 'income') {
        categoryTotals[e.categoryId] = (categoryTotals[e.categoryId] || 0) + e.amount;
        totalSpend += e.amount;
      }
    });

    // Sort categories descending by spend, top 6 + other
    const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCats = sortedCats.slice(0, 5);
    const otherCats = sortedCats.slice(5);
    const otherTotal = otherCats.reduce((sum, [, amt]) => sum + amt, 0);

    const calculatedSteps: WaterfallStep[] = [];
    let running = effectiveInflow;

    // Step 1: Starting Inflow / Budget
    calculatedSteps.push({
      id: 'inflow',
      label: income > 0 ? 'Monthly Inflow' : 'Allocated Budget',
      amount: effectiveInflow,
      type: 'inflow',
      startValue: 0,
      endValue: effectiveInflow,
      color: '#10b981',
      percentage: 100,
    });

    // Step 2..N: Category Deductions
    topCats.forEach(([catId, amt]) => {
      const cat = categoriesMap.get(catId);
      const name = cat?.name || 'General';
      const prev = running;
      running = running - amt;
      calculatedSteps.push({
        id: catId,
        label: name,
        amount: amt,
        type: 'outflow',
        startValue: prev,
        endValue: running,
        color: cat?.color || '#f43f5e',
        percentage: effectiveInflow > 0 ? (amt / effectiveInflow) * 100 : 0,
      });
    });

    if (otherTotal > 0) {
      const prev = running;
      running = running - otherTotal;
      calculatedSteps.push({
        id: 'other',
        label: 'Other Outflows',
        amount: otherTotal,
        type: 'outflow',
        startValue: prev,
        endValue: running,
        color: '#8b5cf6',
        percentage: effectiveInflow > 0 ? (otherTotal / effectiveInflow) * 100 : 0,
      });
    }

    // Final Step: Net Balance
    calculatedSteps.push({
      id: 'balance',
      label: running >= 0 ? 'Remaining Surplus' : 'Budget Overage',
      amount: Math.abs(running),
      type: 'balance',
      startValue: 0,
      endValue: running,
      color: running >= 0 ? '#3b82f6' : '#ef4444',
      percentage: effectiveInflow > 0 ? (Math.abs(running) / effectiveInflow) * 100 : 0,
    });

    return {
      steps: calculatedSteps,
      totalOutflow: totalSpend,
      remainingBalance: running,
    };
  }, [income, budgetAmount, effectiveInflow, expenses, categoriesMap]);

  // Max value for scaling chart bars
  const maxValue = Math.max(effectiveInflow, totalOutflow, 1);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-theme-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-theme-surface border border-theme-border/40 text-theme-accent shadow-xs">
              <Layers className="w-4 h-4 stroke-[2]" />
            </span>
            <span className="text-xs font-bold text-theme-secondary uppercase tracking-widest">
              Tier 2.5 Financial Engine
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-theme-primary tracking-tight">
            Income vs. Expenses Waterfall Flow
          </h3>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            Visual money bridge tracing the step-down depletion of monthly allowance into remaining surplus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-theme-surface/70 border border-theme-border/30 text-right">
            <span className="text-[11px] font-semibold text-theme-secondary uppercase tracking-wider block">
              {remainingBalance >= 0 ? 'Net Surplus' : 'Net Deficit'}
            </span>
            <span
              className={`text-lg font-bold tabular-nums ${
                remainingBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {remainingBalance >= 0 ? '+' : '-'}
              {CURRENCY_SYMBOL}
              {Math.abs(remainingBalance).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Waterfall Visualizer */}
      <div className="space-y-3.5 relative z-10">
        {steps.map((step, idx) => {
          const isPositive = step.type === 'inflow';
          const isBalance = step.type === 'balance';
          const isOutflow = step.type === 'outflow';

          // Bar width percentage relative to max value
          const barWidth = Math.min(100, Math.max(6, (step.amount / maxValue) * 100));

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={`p-3.5 rounded-2xl border transition-all ${
                isBalance
                  ? 'bg-theme-surface/90 border-theme-border/50 shadow-sm'
                  : 'bg-theme-surface/40 border-theme-border/20 hover:bg-theme-surface/60'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className={`font-semibold truncate ${isBalance ? 'text-theme-primary' : 'text-theme-secondary'}`}>
                    {step.label}
                  </span>
                  {step.percentage !== undefined && (
                    <span className="text-[11px] font-mono text-theme-tertiary">
                      ({step.percentage.toFixed(0)}%)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 font-mono font-bold tabular-nums text-right">
                  {isPositive && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />}
                  {isOutflow && <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />}
                  {isBalance && (
                    remainingBalance >= 0 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    )
                  )}
                  <span
                    className={
                      isPositive
                        ? 'text-emerald-500'
                        : isOutflow
                        ? 'text-theme-primary'
                        : remainingBalance >= 0
                        ? 'text-blue-500 font-extrabold'
                        : 'text-rose-500 font-extrabold'
                    }
                  >
                    {isPositive ? '+' : isOutflow ? '-' : remainingBalance >= 0 ? '+' : '-'}
                    {CURRENCY_SYMBOL}
                    {step.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Step Bar Track */}
              <div className="w-full h-2.5 rounded-full bg-theme-elevated/40 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.6, delay: 0.1 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: step.color,
                    boxShadow: isBalance ? `0 0 12px ${step.color}40` : undefined,
                  }}
                />
              </div>

              {/* Running Balance Subtext */}
              {!isBalance && (
                <div className="flex justify-between items-center text-[10px] text-theme-tertiary mt-1 px-1">
                  <span>Running Balance</span>
                  <span className="font-mono tabular-nums">
                    {CURRENCY_SYMBOL}
                    {step.endValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
