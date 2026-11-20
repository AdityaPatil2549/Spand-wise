'use client';

import React from 'react';
import { getDaysInMonth, getDate } from 'date-fns';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';
import { BorderTrail } from '@/components/ui/motion/border-trail';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { AlertTriangle, CheckCircle2, MoreHorizontal, AlertCircle, Gauge } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CURRENCY_SYMBOL } from '@/config/constants';

interface BentoHeroBalanceProps {
  balance: number;
  totalSpent: number;
  budgetAmount: number;
  totalIncome: number;
  isOverBudget: boolean;
}

export const BentoHeroBalance: React.FC<BentoHeroBalanceProps> = ({
  balance,
  totalSpent,
  budgetAmount,
  totalIncome,
  isOverBudget,
}) => {
  // Deterministic client-side runway and pace needle calculations
  const now = new Date();
  const daysInMonth = getDaysInMonth(now);
  const currentDay = getDate(now);
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);
  const safeDailySpend = Math.max(0, Math.floor(balance / daysRemaining));

  const spendPercentage = Math.min(100, Math.round((totalSpent / (budgetAmount || 1)) * 100));
  const monthProgressPct = Math.min(98, Math.max(2, Math.round((currentDay / daysInMonth) * 100)));
  const expectedSpendToDate = budgetAmount > 0 ? Math.round((budgetAmount * currentDay) / daysInMonth) : 0;
  const paceVariance = expectedSpendToDate - totalSpent; // >= 0 means under pace (good)

  const isTight = !isOverBudget && safeDailySpend < 200 && budgetAmount > 0;
  const isAheadOfPace = !isOverBudget && paceVariance < -200 && budgetAmount > 0;

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border transition-all flex flex-col justify-between p-5 sm:p-7 min-h-[265px] sm:min-h-[340px] shadow-sm hover:shadow-lg hover:shadow-black/20 group duration-300 ${
        isOverBudget
          ? 'border-rose-500/35 bg-theme-surface/90 hover:border-rose-500/60'
          : isTight || isAheadOfPace
          ? 'border-amber-500/35 bg-theme-surface/90 hover:border-amber-500/60'
          : 'border-theme-border/60 bg-theme-surface/80 hover:border-theme-accent/40'
      }`}
    >
      {/* Top subtle specular highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {isOverBudget && (
        <BorderTrail size={120} transition={{ ease: 'linear', duration: 4, repeat: Infinity }} />
      )}

      {/* Header Row: Status Badge & Context Menu */}
      <div className="relative z-10 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isOverBudget ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-theme-danger text-xs font-semibold border border-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" />
              Budget Exceeded
            </span>
          ) : isTight ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-theme-warning text-xs font-semibold border border-amber-500/20">
              <AlertCircle className="w-3.5 h-3.5 stroke-[2.2]" />
              Tight Runway
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-theme-positive-light text-theme-positive text-xs font-semibold border border-theme-positive/25">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
              Pacing On Track
            </span>
          )}

          {budgetAmount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-theme-secondary px-2 py-0.5 rounded-md bg-theme-base/80 border border-theme-border/40">
              <Gauge className="w-3 h-3 text-theme-accent" />
              {paceVariance >= 0
                ? `${formatCurrency(paceVariance)} under pace`
                : `${formatCurrency(Math.abs(paceVariance))} ahead of pace`}
            </span>
          )}
        </div>

        <DropdownMenu
          align="right"
          trigger={
            <button
              type="button"
              aria-label="Dashboard actions"
              className="text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer p-2 -mr-2 rounded-full hover:bg-theme-surface-hover/80 active:scale-95 flex items-center justify-center"
            >
              <MoreHorizontal className="w-5 h-5 stroke-[2]" />
            </button>
          }
          items={[
            { label: 'Adjust Budget Limits', icon: 'edit_note', href: '/settings/limits' },
            { label: 'Deep Spend Analytics', icon: 'analytics', href: '/analytics' },
            { label: 'Export Tax & Statement', icon: 'download', href: '/settings/export' },
          ]}
        />
      </div>

      {/* Available Balance Hero */}
      <div className="relative z-10 my-3 sm:my-4 space-y-1.5">
        <p className="text-xs uppercase tracking-widest text-theme-secondary font-semibold">
          {isOverBudget ? 'Budget Deficit' : 'Remaining This Month'}
        </p>
        <div className="flex items-baseline gap-1.5">
          <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-semibold leading-none text-theme-primary tracking-tight tabular-nums flex items-baseline">
            {isOverBudget && <span className="mr-1 text-theme-danger font-bold">-</span>}
            <span className="font-sans text-3xl sm:text-4xl lg:text-5xl font-semibold text-theme-secondary mr-1 select-none">
              {CURRENCY_SYMBOL}
            </span>
            <AnimatedNumber value={Math.abs(balance)} />
          </h2>
        </div>

        {/* Prominent Safe Daily Spend Runway Pill */}
        <div className="pt-1.5 flex items-center gap-2 text-xs flex-wrap">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-theme-base/90 border border-theme-border/50 text-theme-secondary hover:border-theme-accent/40 transition-colors cursor-help"
            title={`Runway Formula: Remaining ${CURRENCY_SYMBOL}${Math.max(0, balance).toLocaleString('en-IN')} ÷ ${daysRemaining} days left = ${CURRENCY_SYMBOL}${safeDailySpend}/day max target`}
          >
            <span className="w-2 h-2 rounded-full bg-theme-accent shrink-0 animate-pulse" />
            <span>
              Safe Daily Spend:{' '}
              <strong className="text-theme-primary font-bold tabular-nums font-mono">
                {formatCurrency(safeDailySpend)}
              </strong>{' '}
              <span className="text-theme-secondary">({daysRemaining}d runway)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Split & Cashew-style Progress Bar with Vertical "Today" Pace Needle */}
      <div className="relative z-10 space-y-3 pt-4 border-t border-theme-border/30">
        <div className="flex justify-between text-xs tabular-nums gap-2 flex-wrap">
          <span className="text-theme-secondary flex items-center gap-1">
            Spent:{' '}
            <strong className="text-theme-primary font-semibold">
              {CURRENCY_SYMBOL}&nbsp;<AnimatedNumber value={totalSpent} />
            </strong>
          </span>
          <span className="text-theme-secondary flex items-center gap-1">
            Income:{' '}
            <strong className="text-theme-positive font-semibold">
              {CURRENCY_SYMBOL}&nbsp;<AnimatedNumber value={totalIncome} />
            </strong>
          </span>
          <span className="text-theme-secondary flex items-center gap-1">
            Limit:{' '}
            <strong className="text-theme-primary font-semibold">
              {CURRENCY_SYMBOL}&nbsp;<AnimatedNumber value={budgetAmount} />
            </strong>
          </span>
        </div>

        {/* Pace Needle Bar Container */}
        <div className="relative pt-4">
          {/* Today Pace Marker Tag */}
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20"
            style={{ left: `${monthProgressPct}%` }}
            title={`Day ${currentDay} of ${daysInMonth} (${monthProgressPct}% through month)`}
          >
            <span className="px-1.5 py-0.5 rounded bg-theme-primary text-theme-on-primary text-[9px] font-mono font-bold leading-none shadow-sm whitespace-nowrap">
              Today · D{currentDay}
            </span>
          </div>

          <div className="relative w-full h-3 bg-theme-elevated/80 rounded-full overflow-visible p-0.5 border border-theme-border/30">
            <div className="w-full h-full rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isOverBudget
                    ? 'bg-theme-danger'
                    : isTight || isAheadOfPace
                    ? 'bg-theme-warning'
                    : 'bg-theme-positive'
                }`}
                style={{ width: `${spendPercentage}%` }}
              />
            </div>

            {/* Vertical Pace Needle Line */}
            <div
              className="absolute -top-1 -bottom-1 w-0.5 bg-theme-primary rounded-full z-10 ring-2 ring-theme-surface pointer-events-none"
              style={{ left: `${monthProgressPct}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
