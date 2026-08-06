'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';
import { AnimatedGroup } from '@/components/ui/motion/animated-group';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { TransactionCard } from '@/components/features/expenses/TransactionCard';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import { format, isToday, isYesterday, isThisWeek, subMonths, isSameMonth } from 'date-fns';
import { ExpensesSidebar } from '@/components/layout/ExpensesSidebar';
import { ScrollProgress } from '@/components/ui/motion/scroll-progress';
import { InView } from '@/components/ui/motion/in-view';
import { AnimatedBackground } from '@/components/ui/motion/animated-background';
import { EditExpenseMorph } from '@/components/features/expenses/EditExpenseMorph';
import { EmptyMonthState } from '@/components/ui/EmptyMonthState';
import { calculateFinancialSummary } from '@/lib/finance-math';
import { FormattedCurrency } from '@/components/ui/FormattedCurrency';
import type { ExpenseDocument } from '@/types/firestore';
import { CURRENCY_SYMBOL } from '@/config/constants';

// Helper to map Lucide icon names to Material Symbols
const getMaterialIcon = (lucideName: string = 'Package') => {
 const map: Record<string, string> = {
 Utensils: 'restaurant',
 BusFront: 'directions_bus',
 Home: 'home',
 ShoppingCart: 'shopping_cart',
 PenTool: 'edit',
 BookOpen: 'menu_book',
 GraduationCap: 'school',
 Coffee: 'local_cafe',
 ShoppingBag: 'local_mall',
 Gamepad2: 'sports_esports',
 Pill: 'medication',
 Smartphone: 'smartphone',
 BellRing: 'notifications_active',
 Plane: 'flight',
 Siren: 'emergency',
 Gift: 'redeem',
 Package: 'category',
 Users: 'group',
 };
 return map[lucideName] || 'category';
};

// Group expenses by date (e.g. "Today, July 14", "Yesterday, July 13", "July 12")
const groupExpensesByDate = (expenses: ExpenseDocument[]) => {
 const groups: Record<string, typeof expenses> = {};
 
 expenses.forEach((exp) => {
 const date = exp.date.toDate();
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
 
 const totalSpent = budget?.totalSpent || 0;
 const budgetAmount = budget?.budgetAmount || 0;
 
 const financialSummary = useMemo(() => {
   return calculateFinancialSummary(
     expenses.map(e => ({ amount: e.amount, date: e.date.toDate() })),
     budgetAmount
   );
 }, [expenses, budgetAmount]);
 
  // Filter expenses locally if needed
  const displayExpenses = useMemo(() => {
    let filtered = expenses;
    if (timeFilter === 'This Week') {
      filtered = filtered.filter(e => isThisWeek(e.date.toDate(), { weekStartsOn: 1 }));
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
  }, [expenses, timeFilter, searchQuery, categoriesMap]);

 // Group the filtered expenses
 const groupedExpenses = useMemo(() => groupExpensesByDate(displayExpenses), [displayExpenses]);

 // Calculate top category from displayExpenses
 const topCategory = useMemo(() => {
 if (!displayExpenses.length) return { name: 'None', amount: 0, percent: 0 };
 
 const catTotals: Record<string, number> = {};
 displayExpenses.forEach(e => {
 catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + e.amount;
 });
 
 let topCatId = displayExpenses[0].categoryId;
 let maxAmt = 0;
 
 for (const [id, amt] of Object.entries(catTotals)) {
 if (amt > maxAmt) {
 maxAmt = amt;
 topCatId = id;
 }
 }
 
 const catInfo = categoriesMap.get(topCatId) || categoriesMap.get(DEFAULT_CATEGORY_ID);
 const percent = totalSpent > 0 ? (maxAmt / totalSpent) * 100 : 0;
 
 return {
 name: catInfo?.name || 'Unknown',
 amount: maxAmt,
 percent,
 };
 }, [expenses, totalSpent]);
 
 return (
 <div className="bg-theme-base text-theme-primary flex min-h-screen font-body w-full">
 <ScrollProgress className="top-0 z-50 bg-theme-accent" />
 
 {/* SideNavBar */}
 <ExpensesSidebar />

 {/* Main Content Canvas */}
 <main className="flex-1 w-full md:ml-64 pt-12 md:pt-16 px-6 md:px-16 pb-32 md:pb-20 overflow-y-auto">
 {/* Page Header & Filters */}
 <div className="max-w-6xl mx-auto mb-12">
 <TextEffect as="h1" per="char" preset="fade" className="font-headline text-5xl md:text-6xl text-theme-primary mb-8 uppercase tracking-widest text-center md:text-left">Expenses</TextEffect>
 <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-theme-border/40 pb-6">
 {/* Timeline Filter */}
 <nav className="flex gap-6 overflow-x-auto w-full md:w-auto hide-scrollbar snap-x">
 <button className="snap-start whitespace-nowrap text-theme-accent border-b-2 border-theme-accent pb-2 font-body text-sm uppercase tracking-wide font-semibold">{format(new Date(), 'MMMM yyyy')}</button>
 </nav>
  {/* Search/Category Filter */}
  <div className="relative w-full md:w-72 group">
  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-theme-tertiary text-sm group-focus-within:text-theme-accent transition-colors">search</span>
  <input 
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full bg-theme-surface/50 backdrop-blur-md border border-theme-border/60 rounded-full py-2.5 pl-10 pr-4 font-body text-sm text-theme-primary focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent transition-all shadow-sm placeholder:text-theme-tertiary" 
    placeholder="Search or filter..." 
    type="text" 
  />
  </div>
 </div>
 </div>

 {/* Bento Grid Context / Summary (High-End Layout) */}
 <AnimatedGroup preset="scale" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
 <div className="glass-panel hover-elevate rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group">
 <div className="absolute -right-10 -top-10 w-32 h-32 bg-theme-accent-light/40 rounded-full blur-3xl group-hover:bg-theme-accent-light/60 transition-all duration-700"></div>
 <span className="font-body text-xs text-theme-secondary uppercase tracking-widest mb-4">Total Spent</span>
 <span className="font-headline text-5xl text-theme-primary flex items-baseline">
 {CURRENCY_SYMBOL}<AnimatedNumber value={Math.floor(totalSpent)} /><span className="text-2xl text-theme-tertiary">{(totalSpent % 1 !== 0) ? (totalSpent % 1).toFixed(2).substring(1) : '.00'}</span>
 </span>
 <div className="mt-6 flex items-center gap-2 text-sm text-[#8c3c3c]">
 <span className="material-symbols-outlined text-sm">trending_up</span>
 <span className="font-body flex items-center gap-1">+<AnimatedNumber value={0} />% from last month</span>
 </div>
 </div>
 
 <div className="glass-panel hover-elevate rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group">
 <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-theme-elevated/40 rounded-full blur-3xl group-hover:bg-theme-elevated/60 transition-all duration-700"></div>
 <span className="font-body text-xs text-theme-secondary uppercase tracking-widest mb-4">Top Category</span>
 <span className="font-headline text-3xl text-theme-primary mb-1">{topCategory.name}</span>
 <span className="font-body text-lg text-theme-accent flex items-center gap-1">
 {CURRENCY_SYMBOL}<AnimatedNumber value={Math.floor(topCategory.amount)} />
 {(topCategory.amount % 1 !== 0) ? (topCategory.amount % 1).toFixed(2).substring(1) : '.00'}
 </span>
 <div className="mt-auto pt-6 flex items-center justify-between">
 <div className="w-full bg-theme-elevated rounded-full h-1.5 overflow-hidden">
 <div className="bg-theme-accent h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, topCategory.percent)}%` }}></div>
 </div>
 </div>
 </div>
 
 {/* Safe-Spend Odometer */}
 <div className="glass-panel hover-elevate rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group">
 <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#10b981]/20 rounded-full blur-3xl group-hover:bg-[#10b981]/40 transition-all duration-700"></div>
 <span className="font-body text-xs text-theme-secondary uppercase tracking-widest mb-4">Safe Daily Spend</span>
 <span className="font-headline text-5xl text-theme-primary flex items-baseline">
 <FormattedCurrency amount={financialSummary.safeDailySpend} />
 </span>
 <div className="mt-auto pt-6 flex items-center justify-between">
 <p className="font-body text-xs text-theme-secondary">
 Recommended daily limit to stay under budget by end of month.
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
 
 <AnimatedGroup preset="slide" className="space-y-4">
 {Object.entries(groupedExpenses).map(([dateLabel, dayExpenses]) => (
 <div key={dateLabel} className="space-y-4">
 <p className="font-body text-xs text-theme-tertiary uppercase tracking-widest pl-4 pt-4 pb-2">{dateLabel}</p>
 
 {dayExpenses.map((expense) => {
 const cat = categoriesMap.get(expense.categoryId) || categoriesMap.get(DEFAULT_CATEGORY_ID);
 return (
 <InView
 key={expense.id}
 variants={{
 hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
 visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
 }}
 transition={{ duration: 0.3, ease: 'easeOut' }}
 >
 <EditExpenseMorph expense={expense} className="w-full text-left focus:outline-none">
 <TransactionCard 
 id={expense.id}
 title={expense.note || cat?.name || 'Unknown'}
 category={cat?.name || 'Unknown'}
 amount={expense.amount}
 time={format(expense.date.toDate(), 'h:mm a')}
 icon={getMaterialIcon(cat?.icon)}
 iconColor={cat?.color || '#605850'}
 iconBgClass="bg-theme-base"
 />
 </EditExpenseMorph>
 </InView>
 );
 })}
 </div>
 ))}
 
 {expenses.length === 0 && (
 <div className="mt-8">
 <EmptyMonthState 
 monthName={format(new Date(), 'MMMM')} 
 onAddClick={() => openBottomSheet()} 
 />
 </div>
 )}
  {/* Load More */}
  {expenses.length > 0 && (
    <div className="mt-12 flex justify-center">
      <button 
        onClick={() => {
          const store = useStore.getState();
          const oldestMonth = store.loadedMonths.sort()[0];
          const [year, month] = oldestMonth.split('-').map(Number);
          const date = new Date(year, month - 2); // month is 0-indexed in JS Date, so -2 gives previous month
          const prevMonthStr = format(date, 'yyyy-MM');
          
          if (timeFilter !== 'All') {
            setTimeFilter('All');
          }
          store.addLoadedMonth(prevMonthStr);
        }}
        className="px-8 py-3 rounded-full border border-theme-border/60 font-body text-sm text-theme-primary hover:bg-theme-surface-hover active:scale-[0.98] transition-all duration-200"
      >
        View Older Transactions
      </button>
    </div>
  )}
 </AnimatedGroup>
 
 </div>
 </main>
 </div>
 );
}
