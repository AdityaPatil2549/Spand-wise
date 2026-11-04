'use client';

import { useHydrated } from '@/hooks/useHydrated';
import Link from 'next/link';
import { useMemo } from 'react';
import { useStore } from '@/store';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';
import { AnimatedGroup } from '@/components/ui/motion/animated-group';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { Magnetic } from '@/components/ui/motion/magnetic';
import { BorderTrail } from '@/components/ui/motion/border-trail';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import { format, isToday, isYesterday } from 'date-fns';
import { AddExpenseMorph } from '@/components/features/expenses/AddExpenseMorph';
import { EditExpenseMorph } from '@/components/features/expenses/EditExpenseMorph';
import { QuickAddWidgets } from '@/components/features/dashboard/QuickAddWidgets';
import { TransactionRow } from '@/components/features/ledger/TransactionRow';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { TransactionSkeletonGroup } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, BarChart3, Users, Target, SlidersHorizontal, AlertTriangle, CheckCircle2, ArrowRight, MoreHorizontal } from 'lucide-react';

export default function DashboardPage() {
  const isHydrated = useHydrated();
  const { openBottomSheet, expenses, budget, isExpensesLoading, categoriesMap } = useStore();
  
  const totalSpent = budget?.totalSpent || 0;
  const budgetAmount = budget?.budgetAmount || 0;
  const balance = budgetAmount - totalSpent;
  const isOverBudget = balance < 0;
  
  const recentExpenses = useMemo(() => {
    return expenses.slice(0, 5).map((exp) => {
      const cat = categoriesMap.get(exp.categoryId) || categoriesMap.get(DEFAULT_CATEGORY_ID);
      const date = exp.date.toDate();
      const timeLabel = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d');
      
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
  
  if (!isHydrated) {
    return null;
  }
  
  return (
    <div className="flex flex-col w-full pb-32 md:pb-16">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-10 lg:items-center">
        {/* Left Column: Greeting, Quick Add & Action Rail */}
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.1em] font-semibold text-theme-accent uppercase">
              Overview • {format(new Date(), 'MMMM yyyy')}
            </p>
            
            {isOverBudget ? (
              <>
                <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-semibold text-theme-primary tracking-tight flex flex-wrap gap-x-2 text-balance leading-tight">
                  <TextEffect per="word" preset="blur" as="span">You're</TextEffect>
                  <TextEffect per="word" preset="blur" as="span" className="text-rose-500 font-bold" delay={0.1}>over budget.</TextEffect>
                </h1>
                <p className="text-sm sm:text-base text-theme-secondary max-w-lg mt-2 text-pretty">
                  You've exceeded your planned spending limit this month. Let's review recent transactions and recalibrate.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-semibold text-theme-primary tracking-tight flex flex-wrap gap-x-2 text-balance leading-tight">
                  <TextEffect per="word" preset="blur" as="span">You're on</TextEffect>
                  <TextEffect per="word" preset="blur" as="span" className="text-emerald-500 font-bold" delay={0.1}>Track.</TextEffect>
                </h1>
                <p className="text-sm sm:text-base text-theme-secondary max-w-lg mt-2 text-pretty">
                  Your spending is comfortably within your allocated budget limits for this period. Keep it up.
                </p>
              </>
            )}
            
            <QuickAddWidgets />
            
            <AddExpenseMorph>
              <span className="mt-5 inline-block">
                <Magnetic intensity={0.2} springOptions={{ bounce: 0.1 }} actionArea="global">
                  <span className="bg-theme-accent hover:bg-theme-accent-hover text-theme-inverse px-6 py-3 rounded-full flex items-center justify-center gap-2 hover-elevate active:scale-[0.98] transition-all font-medium text-base shadow-md shadow-theme-accent/20 cursor-pointer">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    Add Transaction
                  </span>
                </Magnetic>
              </span>
            </AddExpenseMorph>
          </div>

          {/* Quick-Access Feature Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Link
              href="/analytics"
              className="p-3.5 rounded-2xl bg-theme-surface/70 border border-theme-border/40 hover:bg-theme-surface-hover/80 hover:border-theme-border/60 transition-all active:scale-[0.98] flex items-center gap-3 shadow-xs group"
            >
              <div className="w-9 h-9 rounded-xl bg-theme-base flex items-center justify-center text-theme-secondary group-hover:text-theme-primary transition-colors flex-shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-theme-primary truncate">Analysis</h3>
                <p className="text-[11px] text-theme-secondary truncate">Burn rate & trends</p>
              </div>
            </Link>

            <Link
              href="/split"
              className="p-3.5 rounded-2xl bg-theme-surface/70 border border-theme-border/40 hover:bg-theme-surface-hover/80 hover:border-theme-border/60 transition-all active:scale-[0.98] flex items-center gap-3 shadow-xs group"
            >
              <div className="w-9 h-9 rounded-xl bg-theme-base flex items-center justify-center text-theme-secondary group-hover:text-theme-primary transition-colors flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-theme-primary truncate">Split Bills</h3>
                <p className="text-[11px] text-theme-secondary truncate">Roommates & hostel</p>
              </div>
            </Link>

            <Link
              href="/goals"
              className="p-3.5 rounded-2xl bg-theme-surface/70 border border-theme-border/40 hover:bg-theme-surface-hover/80 hover:border-theme-border/60 transition-all active:scale-[0.98] flex items-center gap-3 shadow-xs group"
            >
              <div className="w-9 h-9 rounded-xl bg-theme-base flex items-center justify-center text-theme-secondary group-hover:text-theme-primary transition-colors flex-shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-theme-primary truncate">Savings Goals</h3>
                <p className="text-[11px] text-theme-secondary truncate">Target milestones</p>
              </div>
            </Link>

            <Link
              href="/settings/limits"
              className="p-3.5 rounded-2xl bg-theme-surface/70 border border-theme-border/40 hover:bg-theme-surface-hover/80 hover:border-theme-border/60 transition-all active:scale-[0.98] flex items-center gap-3 shadow-xs group"
            >
              <div className="w-9 h-9 rounded-xl bg-theme-base flex items-center justify-center text-theme-secondary group-hover:text-theme-primary transition-colors flex-shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-theme-primary truncate">Adjust Limits</h3>
                <p className="text-[11px] text-theme-secondary truncate">Category budgets</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Balance Command Card */}
        <div className="w-full mt-4 lg:mt-0">
          <div
            className={`relative w-full rounded-[28px] overflow-hidden border transition-all ${
              isOverBudget
                ? 'border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-theme-surface/80 to-theme-base shadow-xs'
                : 'border-theme-border/50 bg-gradient-to-br from-theme-surface/90 via-theme-surface/70 to-theme-base/60 shadow-xs'
            }`}
          >
            {isOverBudget && <BorderTrail size={120} transition={{ ease: 'linear', duration: 4, repeat: Infinity }} />}
            
            <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-between min-h-[360px]">
              {/* Header Status & Action */}
              <div className="flex justify-between items-center">
                {isOverBudget ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold border border-rose-500/20">
                    <AlertTriangle className="w-3.5 h-3.5 stroke-[2]" />
                    Over Budget
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
                    On Track
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
                    { label: 'Edit Budget Limits', icon: 'edit_note', href: '/settings/limits' },
                    { label: 'View Deep Analysis', icon: 'analytics', href: '/analytics' },
                    { label: 'Export Report', icon: 'download', href: '/settings/export' }
                  ]}
                />
              </div>

              {/* Balance Amount */}
              <div className="space-y-1.5 my-8">
                <p className="text-xs uppercase tracking-wider text-theme-secondary font-medium">
                  {isOverBudget ? 'Budget Overage' : 'Available Balance'}
                </p>
                <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-semibold leading-none text-theme-primary tracking-tight tabular-nums flex items-center">
                  {isOverBudget ? '-' : ''}<AnimatedNumber value={Math.abs(balance)} />
                </h2>
              </div>

              {/* Metrics & Progress Bar */}
              <div className="space-y-3 pt-2 border-t border-theme-border/20">
                <div className="flex justify-between text-xs tabular-nums font-mono">
                  <span className="text-theme-secondary flex items-center gap-1">
                    Spent: <strong className="text-theme-primary font-semibold"><AnimatedNumber value={totalSpent} /></strong>
                  </span>
                  <span className="text-theme-secondary flex items-center gap-1">
                    Income: <strong className="text-emerald-500 font-semibold"><AnimatedNumber value={budget?.totalIncome || 0} /></strong>
                  </span>
                  <span className="text-theme-secondary flex items-center gap-1">
                    Limit: <strong className="text-theme-primary font-semibold"><AnimatedNumber value={budgetAmount} /></strong>
                  </span>
                </div>
                
                <div className="w-full h-2 bg-theme-elevated/70 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget ? 'bg-rose-500' : 'bg-theme-accent'
                    }`}
                    style={{ width: `${Math.min(100, (totalSpent / (budgetAmount || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section: Recent Expenses Inset Group */}
      <section className="mt-4">
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="font-sans text-lg font-semibold text-theme-primary tracking-tight">
            Recent Activity
          </h3>
          <Link
            href="/transactions"
            className="text-theme-accent text-xs font-semibold hover:underline flex items-center gap-1 active:scale-[0.98]"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </Link>
        </div>

        {isExpensesLoading ? (
          <TransactionSkeletonGroup count={4} />
        ) : recentExpenses.length === 0 ? (
          <EmptyState
            title="No Recent Expenses"
            description="Keep track of snacks, canteen, or campus supplies to monitor your velocity."
            actionLabel="+ Add First Expense"
            onAction={() => openBottomSheet()}
          />
        ) : (
          <div className="rounded-2xl border border-theme-border/40 bg-theme-surface/70 backdrop-blur-xs overflow-hidden divide-y divide-theme-border/25 shadow-xs">
            {recentExpenses.map((expense) => {
              const { originalExpense, ...cardProps } = expense;
              return (
                <EditExpenseMorph key={expense.id} expense={originalExpense} className="w-full text-left focus:outline-none">
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
      </section>
    </div>
  );
}
