'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useStore } from '@/store';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';
import { AnimatedGroup } from '@/components/ui/motion/animated-group';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { TransactionCard } from '@/components/features/expenses/TransactionCard';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import { format, isToday, isYesterday } from 'date-fns';
import { ExpensesSidebar } from '@/components/layout/ExpensesSidebar';
import { ScrollProgress } from '@/components/ui/motion/scroll-progress';
import { InView } from '@/components/ui/motion/in-view';
import { AnimatedBackground } from '@/components/ui/motion/animated-background';
import { EditExpenseMorph } from '@/components/features/expenses/EditExpenseMorph';
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
  const { openBottomSheet, expenses, budget, isExpensesLoading, categoriesMap } = useStore();
  
  const totalSpent = budget?.totalSpent || 0;
  
  // Calculate top category
  const topCategory = useMemo(() => {
    if (!expenses.length) return { name: 'None', amount: 0, percent: 0 };
    
    const catTotals: Record<string, number> = {};
    expenses.forEach(e => {
      catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + e.amount;
    });
    
    let topCatId = expenses[0].categoryId;
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

  const groupedExpenses = useMemo(() => groupExpensesByDate(expenses), [expenses]);
  
  return (
    <div className="bg-[#faf5ee] text-[#3a302a] flex min-h-screen font-body w-full">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card { background: rgba(246, 240, 232, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(216, 208, 200, 0.4); }
        .shadow-ultra-soft { box-shadow: 0 2px 16px rgba(58, 48, 42, 0.04); }
      `}} />
      <ScrollProgress className="top-0 z-50 bg-[#c2652a]" />
      
      {/* SideNavBar */}
      <ExpensesSidebar />

      {/* TopAppBar */}
      <header className="hidden md:flex fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-[#faf5ee]/80 backdrop-blur-md justify-between items-center px-12 h-20">
        <nav className="flex gap-8">
          <a className="text-[#78706a] hover:text-[#c2652a] transition-colors cursor-pointer font-body text-sm" href="#">Overview</a>
          <a className="text-[#78706a] hover:text-[#c2652a] transition-colors cursor-pointer font-body text-sm" href="#">Reports</a>
          <a className="text-[#78706a] hover:text-[#c2652a] transition-colors cursor-pointer font-body text-sm" href="#">Planning</a>
        </nav>
        <div className="flex items-center gap-6">
          <button className="font-body text-sm font-medium text-[#c2652a] hover:opacity-80 transition-opacity">Upgrade</button>
          <div className="h-6 w-px bg-[#d8d0c8]/50"></div>
          <button className="text-[#78706a] hover:text-[#c2652a] transition-colors cursor-pointer flex items-center">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <button className="text-[#78706a] hover:text-[#c2652a] transition-colors cursor-pointer flex items-center">
            <span className="material-symbols-outlined text-3xl text-[#c2652a]">account_circle</span>
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full md:ml-64 pt-24 md:pt-28 px-6 md:px-16 pb-20 overflow-y-auto">
        {/* Page Header & Filters */}
        <div className="max-w-6xl mx-auto mb-12">
          <TextEffect as="h1" per="char" preset="fade" className="font-headline text-5xl md:text-6xl text-[#3a302a] mb-8 uppercase tracking-widest text-center md:text-left">Expenses</TextEffect>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[#d8d0c8]/40 pb-6">
            {/* Timeline Filter */}
            <nav className="flex gap-6 overflow-x-auto w-full md:w-auto hide-scrollbar snap-x">
              <button className="snap-start whitespace-nowrap text-[#c2652a] border-b-2 border-[#c2652a] pb-2 font-body text-sm uppercase tracking-wide font-semibold">{format(new Date(), 'MMMM yyyy')}</button>
            </nav>
            {/* Search/Category Filter */}
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#78706a] text-sm">search</span>
              <input className="w-full bg-[#ffffff] border border-[#d8d0c8]/60 rounded-full py-2.5 pl-10 pr-4 font-body text-sm text-[#3a302a] focus:outline-none focus:border-[#c2652a] focus:ring-1 focus:ring-[#c2652a] transition-all shadow-ultra-soft placeholder:text-[#9a9088]" placeholder="Search or filter..." type="text" />
            </div>
          </div>
        </div>

        {/* Bento Grid Context / Summary (High-End Layout) */}
        <AnimatedGroup preset="scale" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between shadow-ultra-soft relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#fbe8d8]/40 rounded-full blur-3xl group-hover:bg-[#fbe8d8]/60 transition-all duration-700"></div>
            <span className="font-body text-xs text-[#605850] uppercase tracking-widest mb-4">Total Spent</span>
            <span className="font-headline text-5xl text-[#3a302a] flex items-baseline">
              {CURRENCY_SYMBOL}<AnimatedNumber value={Math.floor(totalSpent)} /><span className="text-2xl text-[#78706a]">{(totalSpent % 1 !== 0) ? (totalSpent % 1).toFixed(2).substring(1) : '.00'}</span>
            </span>
            <div className="mt-6 flex items-center gap-2 text-sm text-[#8c3c3c]">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="font-body flex items-center gap-1">+<AnimatedNumber value={0} />% from last month</span>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between shadow-ultra-soft relative overflow-hidden group">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#eae2da]/40 rounded-full blur-3xl group-hover:bg-[#eae2da]/60 transition-all duration-700"></div>
            <span className="font-body text-xs text-[#605850] uppercase tracking-widest mb-4">Top Category</span>
            <span className="font-headline text-3xl text-[#3a302a] mb-1">{topCategory.name}</span>
            <span className="font-body text-lg text-[#c2652a] flex items-center gap-1">
              {CURRENCY_SYMBOL}<AnimatedNumber value={Math.floor(topCategory.amount)} />
              {(topCategory.amount % 1 !== 0) ? (topCategory.amount % 1).toFixed(2).substring(1) : '.00'}
            </span>
            <div className="mt-auto pt-6 flex items-center justify-between">
              <div className="w-full bg-[#e6e0d6] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#c2652a] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, topCategory.percent)}%` }}></div>
              </div>
            </div>
          </div>
          
          {/* Aesthetic Image Block */}
          <div className="rounded-2xl p-8 bg-cover bg-center shadow-ultra-soft relative overflow-hidden min-h-[200px] flex items-end" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACrBq3mzB3KNbIhNfjJxMjvPG1Um8git0W7hb2Flj45gHRWfuQb1cHJysssenPSQUQRy0XaYiZ4y0Pc3FxrIyvLR_plgQcjvCsveiQrpRo6l0_Ej6tLu71vNYS4XksDCEvgFp7JHxqqDtijfqBEZ_X8uDtdzRL2_-Lw-8ubtxj5KpY1sYpkDtcfLKGFYgZibWy-dDQoEXVrwgRPdbtu-k-ljEbnxNIAfhPQX_EPVVDdL9lJE4G9g')"}}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a302a]/80 to-transparent"></div>
            <p className="relative font-headline text-xl text-[#ffffff] italic z-10">"Discipline is the bridge between goals and accomplishment."</p>
          </div>
        </AnimatedGroup>

        {/* Transactions List (Curated Editorial Style) */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline text-2xl text-[#3a302a]">Activity</h3>
            <div className="flex space-x-1 p-1 bg-[#eae2da]/50 rounded-lg">
              <AnimatedBackground
                defaultValue="All"
                className="rounded-md bg-[#ffffff] shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              >
                {['All', 'This Week', 'Last Month'].map((label) => (
                  <button
                    key={label}
                    data-id={label}
                    className="px-4 py-1.5 text-sm font-medium text-[#605850] transition-colors focus-visible:outline-none"
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
                <p className="font-body text-xs text-[#78706a] uppercase tracking-widest pl-4 pt-4 pb-2">{dateLabel}</p>
                
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
                          iconBgClass="bg-[#faf5ee]"
                        />
                      </EditExpenseMorph>
                    </InView>
                  );
                })}
              </div>
            ))}
            
            {expenses.length === 0 && (
              <p className="text-center text-[#605850] py-8">No expenses yet for this month.</p>
            )}
          </AnimatedGroup>
          
          {/* Load More */}
          {expenses.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button className="px-8 py-3 rounded-full border border-[#d8d0c8]/60 font-body text-sm text-[#3a302a] hover:bg-[#ece6dc] transition-colors duration-200">View Older Transactions</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
