'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { format, isToday, isYesterday } from 'date-fns';
import { useHydrated } from '@/hooks/useHydrated';
import { useStore } from '@/store';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import { formatCurrency } from '@/lib/utils';
import { EditExpenseMorph } from '@/components/features/expenses/EditExpenseMorph';
import { TransactionRow } from '@/components/features/ledger/TransactionRow';
import { TransactionSkeletonGroup } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArrowRight, Banknote, Smartphone, Wallet } from 'lucide-react';

// Bento Components
import { DashboardSkeleton } from '@/components/features/dashboard/DashboardSkeleton';
import { BentoFastLogBar } from '@/components/features/dashboard/BentoFastLogBar';
import { BentoHeroBalance } from '@/components/features/dashboard/BentoHeroBalance';
import { BentoVelocitySparkline } from '@/components/features/dashboard/BentoVelocitySparkline';
import { BentoUpcomingSplits } from '@/components/features/dashboard/BentoUpcomingSplits';

export default function DashboardPage() {
  const isHydrated = useHydrated();
  const { openBottomSheet, expenses, budget, isExpensesLoading, categoriesMap, accounts } = useStore();

  const totalSpent = budget?.totalSpent || 0;
  const budgetAmount = budget?.budgetAmount || 0;
  const totalIncome = budget?.totalIncome || 0;
  const balance = budgetAmount - totalSpent;
  const isOverBudget = balance < 0;

  const { cashBalance, bankBalance, totalWalletBalance, cashLabel, bankLabel } = useMemo(() => {
    const cashAcc = accounts.find((a) => a.id === 'cash' || a.type === 'cash');
    const bankAcc = accounts.find((a) => a.id === 'bank' || a.type === 'bank');
    const total = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
    return {
      cashBalance: cashAcc?.balance ?? 0,
      bankBalance: bankAcc?.balance ?? 0,
      totalWalletBalance: total,
      cashLabel: cashAcc?.name || 'Cash',
      bankLabel: bankAcc?.name || 'UPI / Bank',
    };
  }, [accounts]);

  const recentExpenses = useMemo(() => {
    return expenses.slice(0, 5).map((exp) => {
      const cat = categoriesMap.get(exp.categoryId) || categoriesMap.get(DEFAULT_CATEGORY_ID);
      let timeLabel = 'Recent';
      try {
        const date = exp.date.toDate();
        timeLabel = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d');
      } catch {
        // Fallback
      }

      return {
        id: exp.id,
        title: exp.note || cat?.name || 'Unknown',
        categoryName: cat?.name || 'Unknown',
        amount: exp.amount,
        timeLabel,
        icon: cat?.icon,
        iconColor: cat?.color || '#605850',
        type: exp.type || 'expense',
        originalExpense: exp,
      };
    });
  }, [expenses, categoriesMap]);

  // Zero-CLS Deterministic SSR Layout Shell
  if (!isHydrated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col w-full pb-32 md:pb-16 animate-in fade-in duration-300">
      {/* Top Section: Overview Header */}
      <section className="mb-3.5 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-sans font-semibold tracking-wider text-theme-accent uppercase px-2.5 py-0.5 rounded-md bg-theme-accent/10 border border-theme-accent/20">
            {format(new Date(), 'MMMM yyyy')}
          </span>
          <span className="text-xs text-theme-secondary font-medium hidden sm:inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
            Live Balance & Pace
          </span>
        </div>

        <div className="pt-0.5">
          {isOverBudget ? (
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-theme-primary tracking-tight flex flex-wrap gap-x-2 text-balance leading-tight">
                <TextEffect per="word" preset="blur" as="span">
                  You&apos;re
                </TextEffect>
                <TextEffect per="word" preset="blur" as="span" className="text-theme-danger" delay={0.1}>
                  over budget.
                </TextEffect>
              </h1>
              <p className="text-xs sm:text-sm text-theme-secondary max-w-xl mt-0.5 text-pretty">
                You&apos;ve passed your monthly spending target. Pause non-essential purchases or update your budget limit.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-theme-primary tracking-tight flex flex-wrap gap-x-2 text-balance leading-tight">
                <TextEffect per="word" preset="blur" as="span">
                  You&apos;re on
                </TextEffect>
                <TextEffect per="word" preset="blur" as="span" className="text-theme-positive" delay={0.1}>
                  Track.
                </TextEffect>
              </h1>
              <p className="text-xs sm:text-sm text-theme-secondary max-w-xl mt-0.5 text-pretty">
                You have healthy breathing room this month. Stay close to your safe daily limit to finish in the green.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Cashew-Inspired Wallets Strip (Compact Above-the-Fold Account Pulse) */}
      <section aria-label="Wallets overview" className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
        <Link
          href="/accounts"
          className="group glass-panel bg-theme-surface border border-theme-border hover:border-theme-accent/40 rounded-2xl px-3.5 py-2.5 flex items-center gap-3 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-theme-positive/15 text-theme-positive flex items-center justify-center shrink-0">
            <Banknote className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-theme-secondary truncate">
              {cashLabel}
            </span>
            <span className="block text-sm font-mono font-bold text-theme-primary tabular-nums truncate">
              {formatCurrency(cashBalance)}
            </span>
          </div>
        </Link>

        <Link
          href="/accounts"
          className="group glass-panel bg-theme-surface border border-theme-border hover:border-theme-accent/40 rounded-2xl px-3.5 py-2.5 flex items-center gap-3 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-theme-accent/15 text-theme-accent flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-theme-secondary truncate">
              {bankLabel}
            </span>
            <span className="block text-sm font-mono font-bold text-theme-primary tabular-nums truncate">
              {formatCurrency(bankBalance)}
            </span>
          </div>
        </Link>

        <Link
          href="/accounts"
          className="col-span-2 sm:col-span-1 group glass-panel bg-theme-elevated/50 border border-theme-border hover:border-theme-accent/40 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-theme-secondary truncate">
                Net Reserve
              </span>
              <span className="block text-sm font-mono font-bold text-theme-primary tabular-nums truncate">
                {formatCurrency(totalWalletBalance)}
              </span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-theme-tertiary group-hover:text-theme-accent transition-colors shrink-0" />
        </Link>
      </section>

      {/* Primary Hero Command Row: 1-Tap Fast-Log Bar (Prime Focus) */}
      <section className="mb-4">
        <BentoFastLogBar />
      </section>

      {/* Bento Grid: Financial Intelligence & Ledger Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 items-stretch">
        {/* Tile A: Hero Balance & Safe Daily Spend (Col-Span 7) */}
        <div className="lg:col-span-7 flex">
          <BentoHeroBalance
            balance={balance}
            totalSpent={totalSpent}
            budgetAmount={budgetAmount}
            totalIncome={totalIncome}
            isOverBudget={isOverBudget}
          />
        </div>

        {/* Tile B: 30-Day Velocity Pacing Sparkline (Col-Span 5) */}
        <div className="lg:col-span-5 flex">
          <BentoVelocitySparkline
            expenses={expenses}
            budgetAmount={budgetAmount}
            totalSpent={totalSpent}
          />
        </div>

        {/* Tile D: Recent Activity Ledger (Col-Span 8) */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl p-6 sm:p-7 bg-theme-surface/70 border border-theme-border/60 shadow-sm min-h-[350px]">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-theme-border/30">
              <div>
                <h3 className="font-sans text-base font-bold text-theme-primary tracking-tight">
                  Recent Activity
                </h3>
                <p className="text-xs text-theme-secondary mt-0.5">
                  Latest debits and credits
                </p>
              </div>

              <Link
                href="/transactions"
                className="text-theme-accent text-xs font-semibold hover:underline flex items-center gap-1 active:scale-95 transition-transform"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </Link>
            </div>

            {isExpensesLoading && recentExpenses.length === 0 ? (
              <TransactionSkeletonGroup count={4} />
            ) : recentExpenses.length === 0 ? (
              <EmptyState
                title="No Recent Expenses"
                description="Keep track of chai, canteen, or campus supplies to monitor your runway."
                actionLabel="+ Add First Expense"
                onAction={() => openBottomSheet()}
              />
            ) : (
              <div className="rounded-2xl border border-theme-border/40 bg-theme-base/50 backdrop-blur-sm overflow-hidden divide-y divide-theme-border/25 shadow-sm">
                {recentExpenses.map((expense) => {
                  const { originalExpense, ...cardProps } = expense;
                  return (
                    <EditExpenseMorph
                      key={expense.id}
                      expense={originalExpense}
                      className="w-full text-left focus:outline-none"
                    >
                      <TransactionRow
                        title={cardProps.title}
                        categoryName={cardProps.categoryName}
                        amount={cardProps.amount}
                        formattedTime={cardProps.timeLabel}
                        categoryColor={cardProps.iconColor}
                        iconName={cardProps.icon}
                        type={cardProps.type === 'income' ? 'income' : 'expense'}
                      />
                    </EditExpenseMorph>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-3 border-t border-theme-border/25 flex justify-between items-center text-xs text-theme-secondary">
            <span>Showing top 5 transactions</span>
            <Link href="/transactions" className="font-semibold text-theme-primary hover:underline">
              View all transactions →
            </Link>
          </div>
        </div>

        {/* Tile E: Upcoming Subscriptions & Splits Hub (Col-Span 4) */}
        <div className="lg:col-span-4 flex">
          <BentoUpcomingSplits />
        </div>
      </div>
    </div>
  );
}
