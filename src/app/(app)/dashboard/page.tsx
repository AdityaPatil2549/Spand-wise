'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { format, isToday, isYesterday } from 'date-fns';
import { useHydrated } from '@/hooks/useHydrated';
import { useStore } from '@/store';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import { EditExpenseMorph } from '@/components/features/expenses/EditExpenseMorph';
import { TransactionRow } from '@/components/features/ledger/TransactionRow';
import { TransactionSkeletonGroup } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArrowRight, Sparkles } from 'lucide-react';

// Bento Components
import { DashboardSkeleton } from '@/components/features/dashboard/DashboardSkeleton';
import { BentoFastLogBar } from '@/components/features/dashboard/BentoFastLogBar';
import { BentoHeroBalance } from '@/components/features/dashboard/BentoHeroBalance';
import { BentoVelocitySparkline } from '@/components/features/dashboard/BentoVelocitySparkline';
import { BentoUpcomingSplits } from '@/components/features/dashboard/BentoUpcomingSplits';

export default function DashboardPage() {
  const isHydrated = useHydrated();
  const { openBottomSheet, expenses, budget, isExpensesLoading, categoriesMap } = useStore();

  const totalSpent = budget?.totalSpent || 0;
  const budgetAmount = budget?.budgetAmount || 0;
  const totalIncome = budget?.totalIncome || 0;
  const balance = budgetAmount - totalSpent;
  const isOverBudget = balance < 0;

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
      <section className="mb-5 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] tracking-widest font-mono font-bold text-theme-accent uppercase px-2.5 py-0.5 rounded-full bg-theme-accent/10 border border-theme-accent/20">
            Overview • {format(new Date(), 'MMMM yyyy')}
          </span>
          <span className="text-xs text-theme-secondary hidden sm:inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Financial Cockpit
          </span>
        </div>

        <div className="pt-1.5">
          {isOverBudget ? (
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-theme-primary tracking-tight flex flex-wrap gap-x-2 text-balance leading-tight">
                <TextEffect per="word" preset="blur" as="span">
                  You're
                </TextEffect>
                <TextEffect per="word" preset="blur" as="span" className="text-rose-500" delay={0.1}>
                  over budget.
                </TextEffect>
              </h1>
              <p className="text-xs sm:text-sm text-theme-secondary max-w-xl mt-0.5 text-pretty">
                Monthly expenditures have passed your allocated threshold. Adjust discretionary spending or recalibrate limits.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-theme-primary tracking-tight flex flex-wrap gap-x-2 text-balance leading-tight">
                <TextEffect per="word" preset="blur" as="span">
                  You're on
                </TextEffect>
                <TextEffect per="word" preset="blur" as="span" className="text-emerald-500" delay={0.1}>
                  Track.
                </TextEffect>
              </h1>
              <p className="text-xs sm:text-sm text-theme-secondary max-w-xl mt-0.5 text-pretty">
                Spending velocity is healthy. Keep adhering to your daily safe runway to meet this month's savings goal.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Primary Hero Command Row: 1-Tap Fast-Log Bar (Prime Focus) */}
      <section className="mb-5">
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
        <div className="lg:col-span-8 flex flex-col justify-between rounded-[28px] p-6 sm:p-7 bg-theme-surface/70 border border-theme-border/60 shadow-sm min-h-[350px]">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-theme-border/30">
              <div>
                <h3 className="font-sans text-base font-bold text-theme-primary tracking-tight">
                  Recent Ledger Activity
                </h3>
                <p className="text-xs text-theme-secondary mt-0.5">
                  Latest campus & personal debits
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
              <div className="rounded-2xl border border-theme-border/40 bg-theme-base/50 backdrop-blur-xs overflow-hidden divide-y divide-theme-border/25 shadow-2xs">
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
                        type={cardProps.type as any}
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
