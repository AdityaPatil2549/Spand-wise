'use client';

import React from 'react';
import { getDaysInMonth, getDate } from 'date-fns';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';
import { BorderTrail } from '@/components/ui/motion/border-trail';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { AlertTriangle, CheckCircle2, MoreHorizontal, Sparkles, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
  // Pure client-side deterministic runway calculations
  const now = new Date();
  const daysInMonth = getDaysInMonth(now);
  const currentDay = getDate(now);
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);
  const safeDailySpend = Math.max(0, Math.floor(balance / daysRemaining));
  const spendPercentage = Math.min(100, Math.round((totalSpent / (budgetAmount || 1)) * 100));

  const isTight = !isOverBudget && safeDailySpend < 200 && budgetAmount > 0;

  return (
    <div
      className={`relative w-full rounded-[28px] overflow-hidden border transition-all flex flex-col justify-between p-6 sm:p-8 min-h-[350px] shadow-sm ${
        isOverBudget
          ? 'border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-theme-surface to-theme-base'
          : isTight
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-theme-surface to-theme-base'
          : 'border-theme-border/60 bg-gradient-to-br from-theme-surface via-theme-surface/90 to-theme-base/60'
      }`}
    >
      {isOverBudget && (
        <BorderTrail size={120} transition={{ ease: 'linear', duration: 4, repeat: Infinity }} />
      )}

      {/* Header Row: Status Badge & Context Menu */}
      <div className="relative z-10 flex justify-between items-center">
        {isOverBudget ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" />
            Budget Exceeded
          </span>
        ) : isTight ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5 stroke-[2.2]" />
            Tight Runway
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
            Pacing On Track
          </span>
        )}

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
      <div className="relative z-10 my-4 space-y-1.5">
        <p className="text-xs uppercase tracking-widest text-theme-secondary font-semibold">
          {isOverBudget ? 'Budget Deficit' : 'Available Balance'}
        </p>
        <div className="flex items-baseline gap-2">
          <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-semibold leading-none text-theme-primary tracking-tight tabular-nums flex items-center">
            {isOverBudget ? '-' : ''}
            <AnimatedNumber value={Math.abs(balance)} />
          </h2>
        </div>

        {/* Student Safe Daily Spend Runway */}
        <div className="pt-2 flex items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-theme-base/80 border border-theme-border/40 text-theme-secondary">
            <Sparkles className="w-3.5 h-3.5 text-theme-accent stroke-[2]" />
            <span>
              Safe Runway:{' '}
              <strong className="text-theme-primary font-semibold tabular-nums">
                {formatCurrency(safeDailySpend)} / day
              </strong>{' '}
              ({daysRemaining}d left)
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Split & Progress Bar */}
      <div className="relative z-10 space-y-2.5 pt-4 border-t border-theme-border/30">
        <div className="flex justify-between text-xs tabular-nums">
          <span className="text-theme-secondary flex items-center gap-1.5">
            Spent:{' '}
            <strong className="text-theme-primary font-semibold">
              <AnimatedNumber value={totalSpent} />
            </strong>
          </span>
          <span className="text-theme-secondary flex items-center gap-1.5">
            Income:{' '}
            <strong className="text-emerald-500 font-semibold">
              <AnimatedNumber value={totalIncome} />
            </strong>
          </span>
          <span className="text-theme-secondary flex items-center gap-1.5">
            Limit:{' '}
            <strong className="text-theme-primary font-semibold">
              <AnimatedNumber value={budgetAmount} />
            </strong>
          </span>
        </div>

        <div className="w-full h-2.5 bg-theme-elevated/70 rounded-full overflow-hidden p-0.5 border border-theme-border/20">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isOverBudget
                ? 'bg-rose-500'
                : isTight
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${spendPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
