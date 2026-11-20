'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';
import { AnimatedGroup } from '@/components/ui/motion/animated-group';
import { TransactionCard } from '@/components/features/expenses/TransactionCard';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import { format, isToday, isYesterday, isThisWeek, subMonths } from 'date-fns';
import { ScrollProgress } from '@/components/ui/motion/scroll-progress';
import { AnimatedBackground } from '@/components/ui/motion/animated-background';
import { EditExpenseMorph } from '@/components/features/expenses/EditExpenseMorph';
import { EmptyMonthState } from '@/components/ui/EmptyMonthState';
import { TransactionSkeletonGroup } from '@/components/ui/Skeleton';
import { calculateFinancialSummary } from '@/lib/finance-math';
import { FormattedCurrency } from '@/components/ui/FormattedCurrency';
import type { ExpenseDocument } from '@/types/firestore';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { Search, TrendingUp } from 'lucide-react';

const safeToDate = (rawDate: unknown): Date => {
  if (!rawDate) return new Date();
  if (typeof (rawDate as { toDate?: () => Date }).toDate === 'function') {
    return (rawDate as { toDate: () => Date }).toDate();
  }
  if (rawDate instanceof Date) return rawDate;
  const parsed = new Date(rawDate as string | number);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

// Group expenses by date with bulletproof fallback
const groupExpensesByDate = (expenses: ExpenseDocument[]) => {
  const groups: Record<string, typeof expenses> = {};
  
  expenses.forEach((exp) => {
    const date = safeToDate(exp.date);
    let label = '';
    
    if (isToday(date)) {
      label = `Today, ${format(date, 'MMMM d')}`;
    } else if (isYesterday(date)) {
      label = `Yesterday, ${format(date, 'MMMM d')}`;
    } else {
      label = format(date, 'MMMM d, yyyy');
    }
    
    if (!groups[label]) groups[label] = [];
    groups[label].push(exp);
  });
  
  return groups;
};

export default function ExpensesPage() {
  const [timeFilter, setTimeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { openBottomSheet, expenses, budget, isExpensesLoading, categoriesMap, setSelectedMonth, selectedMonth } = useStore();
 
  // Filter out deleted + income entries for expenditure analytics
  const monthExpenseOnly = useMemo(
    () =>
      expenses.filter(
        (e) =>
          !e.isDeleted &&
          e.type !== 'income' &&
          (!selectedMonth || e.month === selectedMonth)
      ),
    [expenses, selectedMonth]
  );

 const totalSpent = budget?.totalSpent ?? monthExpenseOnly.reduce((sum, e) => sum + e.amount, 0);
 const budgetAmount = budget?.budgetAmount || 0;
 
 const financialSummary = useMemo(() => {
   return calculateFinancialSummary(
     monthExpenseOnly.map(e => ({ amount: e.amount, date: safeToDate(e.date) })),
     budgetAmount
   );
 }, [monthExpenseOnly, budgetAmount]);
 
  // Filter expenses locally if needed
  const displayExpenses = useMemo(() => {
    let filtered = expenses.filter(
      (e) => !e.isDeleted && (!selectedMonth || e.month === selectedMonth)
    );
    if (timeFilter === 'This Week') {
      filtered = filtered.filter(e => isThisWeek(safeToDate(e.date), { weekStartsOn: 1 }));
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => {
        const catName = (categoriesMap.get(e.categoryId)?.name || '').toLowerCase();
        const desc = (e.note || '').toLowerCase();
        return desc.includes(q) || catName.includes(q) || e.amount.toString().includes(q);
      });
    }
    return filtered;
  }, [expenses, selectedMonth, timeFilter, searchQuery, categoriesMap]);

 // Group the filtered expenses
 const groupedExpenses = useMemo(() => groupExpensesByDate(displayExpenses), [displayExpenses]);

 // Calculate top category from displayExpenses (expenditure only)
 const topCategory = useMemo(() => {
 const spendItems = displayExpenses.filter((e) => e.type !== 'income');
 if (!spendItems.length) return { name: 'None', amount: 0, percent: 0 };
 
 const catTotals: Record<string, number> = {};
 spendItems.forEach(e => {
 catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + e.amount;
 });
 
 let topCatId = spendItems[0].categoryId;
 let maxAmt = 0;
 
 for (const [id, amt] of Object.entries(catTotals)) {
 if (amt > maxAmt) {
 maxAmt = amt;
 topCatId = id;
 }
 }
 
 const catInfo = categoriesMap.get(topCatId) || categoriesMap.get(DEFAULT_CATEGORY_ID);
 const denominator = spendItems.reduce((s, e) => s + e.amount, 0) || totalSpent;
 const percent = denominator > 0 ? (maxAmt / denominator) * 100 : 0;
 
 return {
 name: catInfo?.name || 'Unknown',
 amount: maxAmt,
 percent,
 };
 }, [displayExpenses, categoriesMap, totalSpent]);

  // Generate last 6 months for the timeline filter
  const recentMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = subMonths(now, i);
      months.push({
        label: format(d, 'MMMM'),
        value: format(d, 'yyyy-MM')
      });
    }
    return months;
  }, []);

  return (
    <div className="bg-theme-base text-theme-primary flex min-h-screen font-body w-full">
      <ScrollProgress className="top-0 z-50 bg-theme-accent" />

      {/* Main Content Canvas */}
      <div className="flex-1 w-full py-2 px-4 sm:px-6 md:px-8 pb-32 overflow-y-auto">
        {/* Page Header & Filters */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="mb-6">
            <span className="text-[11px] font-sans font-semibold tracking-wider text-theme-accent uppercase px-2.5 py-0.5 rounded-md bg-theme-accent/10 border border-theme-accent/20">
              Monthly Ledger
            </span>
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-theme-primary tracking-tight mt-1">
              Budget & Overview
            </h1>
            <p className="text-xs text-theme-secondary mt-0.5">
              Category breakdowns and daily spending pace
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-theme-border/30">
            {/* Timeline Filter */}
            <div className="relative w-full md:w-auto">
              <nav className="flex gap-4 overflow-x-auto w-full md:w-auto hide-scrollbar snap-x">
              {recentMonths.map((m) => {
                const isActive = selectedMonth === m.value;
                return (
                  <button 
                    key={m.value}
                    onClick={() => {
                      setSelectedMonth(m.value);
                      setTimeFilter('All');
                    }}
                    className={`snap-start whitespace-nowrap pb-2 font-sans text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                      isActive 
                        ? 'text-theme-accent border-b-2 border-theme-accent' 
                        : 'text-theme-secondary hover:text-theme-primary'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </nav>
            </div>
  {/* Search/Category Filter */}
  <div className="relative w-full md:w-72 group">
  <label htmlFor="expenses-search-input" className="sr-only">
    Search expenses
  </label>
  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary group-focus-within:text-theme-accent transition-colors" />
  <input 
    id="expenses-search-input"
    name="searchQuery"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full bg-theme-surface/70 border border-theme-border/60 rounded-xl py-2 pl-10 pr-4 font-sans text-xs text-theme-primary focus:outline-none focus:border-theme-accent/60 transition-all shadow-sm placeholder:text-theme-tertiary" 
    placeholder="Search expenses..." 
    aria-label="Search expenses by note or description"
    type="text" 
  />
  </div>
 </div>
 </div>

 {/* Bento Grid Context / Summary */}
 <AnimatedGroup preset="scale" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
 <div className="rounded-3xl p-6 sm:p-7 bg-theme-surface/70 border border-theme-border/60 shadow-sm flex flex-col justify-between relative overflow-hidden group">
 <span className="font-sans text-xs font-semibold text-theme-secondary uppercase tracking-wider mb-2">Total Spent</span>
 <span className="font-sans text-3xl sm:text-4xl font-extrabold text-theme-primary flex items-baseline tracking-tight tabular-nums">
 {CURRENCY_SYMBOL}<AnimatedNumber value={Math.floor(totalSpent)} /><span className="text-xl text-theme-tertiary">{(totalSpent % 1 !== 0) ? (totalSpent % 1).toFixed(2).substring(1) : '.00'}</span>
 </span>
 <div className="mt-4 flex items-center gap-1.5 text-xs text-theme-secondary">
 <TrendingUp className="w-3.5 h-3.5 stroke-[2] text-theme-accent" />
 <span>Current billing cycle</span>
 </div>
 </div>
 
 <div className="rounded-3xl p-6 sm:p-7 bg-theme-surface/70 border border-theme-border/60 shadow-sm flex flex-col justify-between relative overflow-hidden group">
 <span className="font-sans text-xs font-semibold text-theme-secondary uppercase tracking-wider mb-2">Top Category</span>
 <span className="font-sans text-2xl font-bold text-theme-primary mb-1 truncate">{topCategory.name}</span>
 <span className="font-sans text-base font-semibold text-theme-accent flex items-center gap-1 tabular-nums font-mono">
 {CURRENCY_SYMBOL}<AnimatedNumber value={Math.floor(topCategory.amount)} />
 {(topCategory.amount % 1 !== 0) ? (topCategory.amount % 1).toFixed(2).substring(1) : '.00'}
 </span>
 <div className="mt-auto pt-4 flex items-center justify-between">
 <div className="w-full bg-theme-elevated rounded-full h-1.5 overflow-hidden">
 <div className="bg-theme-accent h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, topCategory.percent)}%` }}></div>
 </div>
 </div>
 </div>
 
 {/* Safe-Spend Odometer */}
 <div className="rounded-3xl p-6 sm:p-7 bg-theme-surface/70 border border-theme-border/60 shadow-sm flex flex-col justify-between relative overflow-hidden group">
 <span className="font-sans text-xs font-semibold text-theme-secondary uppercase tracking-wider mb-2">Safe Daily Spend</span>
 <span className="font-sans text-3xl sm:text-4xl font-extrabold text-theme-primary flex items-baseline tracking-tight tabular-nums">
 <FormattedCurrency amount={financialSummary.safeDailySpend} />
 </span>
 <div className="mt-auto pt-4 flex items-center justify-between">
 <p className="font-sans text-xs text-theme-secondary">
 Safe daily pacing to remain within limits.
 </p>
 </div>
 </div>
 </AnimatedGroup>

 {/* Transactions List (Curated Editorial Style) */}
 <div className="max-w-6xl mx-auto">
 <div className="flex items-center justify-between mb-8">
 <h3 className="font-headline text-2xl text-theme-primary">Activity</h3>
 <div className="flex space-x-1 p-1 bg-theme-elevated/50 rounded-lg">
    <AnimatedBackground
      defaultValue={timeFilter}
      className="rounded-md bg-theme-white shadow-sm"
      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      onValueChange={(val) => {
        if (!val) return;
        setTimeFilter(val);
        if (val === 'Last Month') {
          const lastMonthDate = subMonths(new Date(), 1);
          setSelectedMonth(format(lastMonthDate, 'yyyy-MM'));
        } else {
          setSelectedMonth(format(new Date(), 'yyyy-MM'));
        }
      }}
    >
      {['All', 'This Week', 'Last Month'].map((label) => (
        <button
          key={label}
          data-id={label}
          className={`px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none ${timeFilter === label ? 'text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}`}
        >
          {label}
        </button>
      ))}
    </AnimatedBackground>
 </div>
 </div>
 
 {isExpensesLoading ? (
            <div className="pt-4">
              <TransactionSkeletonGroup count={6} />
            </div>
          ) : Object.keys(groupedExpenses).length === 0 ? (
            <div className="mt-8">
              <EmptyMonthState 
                monthName={format(new Date(), 'MMMM')} 
                onAddClick={() => openBottomSheet()} 
              />
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedExpenses).map(([dateLabel, dayExpenses]) => {
                const dayTotal = dayExpenses.reduce(
                  (sum, e) => (e.type === 'income' ? sum : sum + e.amount),
                  0
                );
                return (
                  <div key={dateLabel} className="space-y-2">
                    <div className="flex items-center justify-between px-1.5">
                      <p className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">{dateLabel}</p>
                      <span className="text-xs font-mono font-medium text-theme-tertiary tabular-nums">
                        {CURRENCY_SYMBOL}{dayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-theme-border/40 bg-theme-surface/70 backdrop-blur-sm overflow-hidden divide-y divide-theme-border/25 shadow-sm">
                      {dayExpenses.map((expense) => {
                        const cat = categoriesMap.get(expense.categoryId) || categoriesMap.get(DEFAULT_CATEGORY_ID);
                        return (
                          <EditExpenseMorph key={expense.id} expense={expense} className="w-full text-left focus:outline-none">
                            <TransactionCard
                              id={expense.id}
                              title={expense.note || cat?.name || 'Unknown'}
                              category={cat?.name || 'Unknown'}
                              amount={expense.amount}
                              time={format(expense.date.toDate(), 'h:mm a')}
                              icon={cat?.icon || 'Package'}
                              iconColor={cat?.color || '#605850'}
                              type={expense.type || 'expense'}
                            />
                          </EditExpenseMorph>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
