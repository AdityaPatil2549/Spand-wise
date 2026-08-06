'use client';

import React, { useMemo, useState } from 'react';
import { useStore } from '@/store';
import { Carousel, CarouselContent, CarouselNavigation, CarouselItem, CarouselIndicator } from '@/components/ui/motion/carousel';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/motion/accordion';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';
import { ExpensesSidebar } from '@/components/layout/ExpensesSidebar';
import { getMaterialIcon } from '@/lib/utils';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { setDoc } from 'firebase/firestore';
import { budgetDocRef } from '@/lib/firebase/firestore';

export default function AnalyticsPage() {
 const { expenses, budget, categoriesMap, householdId, selectedMonth, setCategoryBudgetOptimistic, addToast } = useStore();
 const [editingLimit, setEditingLimit] = useState<string | null>(null);
 const [limitInput, setLimitInput] = useState('');

 const { categoryTotals, totalSpent, highestCategory, pieData, areaData } = useMemo(() => {
 let total = 0;
 const totals: Record<string, number> = {};
 
 // Calculate category totals
 expenses.forEach((expense) => {
 total += expense.amount;
 totals[expense.categoryId] = (totals[expense.categoryId] || 0) + expense.amount;
 });

 // Find highest category
 let maxAmount = 0;
 let maxCat = DEFAULT_CATEGORY_ID;
 for (const [catId, amount] of Object.entries(totals)) {
 if (amount > maxAmount) {
 maxAmount = amount;
 maxCat = catId;
 }
 }

 // Pie chart data
 const pie = Object.entries(totals).map(([id, value]) => ({
 name: categoriesMap.get(id)?.name || 'Other',
 value: value,
 color: categoriesMap.get(id)?.color || '#3a302a'
 })).sort((a, b) => b.value - a.value);

 // Area chart data (cumulative spend over the month)
 const now = new Date();
 const start = startOfMonth(now);
 const end = endOfMonth(now);
 const daysInMonth = eachDayOfInterval({ start, end });
 
 let cumulative = 0;
 const area = daysInMonth.map(day => {
 const dayStr = format(day, 'yyyy-MM-dd');
 const daySpend = expenses
 .filter(e => format(e.date.toDate(), 'yyyy-MM-dd') === dayStr)
 .reduce((sum, e) => sum + e.amount, 0);
 
 if (day <= now) {
 cumulative += daySpend;
 }
 return {
 date: format(day, 'MMM dd'),
 spent: day <= now ? cumulative : null
 };
 });

 return {
 categoryTotals: totals,
 totalSpent: total,
 highestCategory: categoriesMap.get(maxCat) || categoriesMap.get(DEFAULT_CATEGORY_ID),
 pieData: pie,
 areaData: area
 };
 }, [expenses, categoriesMap]);

 return (
 <div className="bg-theme-base text-theme-primary flex min-h-screen font-body w-full">
 <ExpensesSidebar />
 <main className="flex-1 md:ml-64 relative min-h-screen overflow-x-hidden w-full max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-32 md:pb-24">
 <TextEffect as="h1" preset="fade" className="font-display text-[48px] md:text-[64px] font-medium leading-none tracking-tight text-theme-primary mb-2">
 Analytics
 </TextEffect>
 <TextEffect as="p" preset="fade" className="text-[18px] text-theme-secondary max-w-2xl mb-12">
 Discover patterns in your spending through our visual insights.
 </TextEffect>

 {/* Highlight Carousel */}
 <div className="mb-16">
 <Carousel className="w-full">
 <CarouselContent className="px-4">
 
 {/* Slide 1: Total Spent */}
 <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3 pr-4">
 <div className="glass-panel p-8 rounded-3xl border border-theme-border/30 h-72 flex flex-col justify-between relative overflow-hidden group">
 <div className="absolute -right-8 -top-8 w-32 h-32 bg-theme-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
 <span className="font-medium text-theme-secondary uppercase tracking-widest text-sm relative z-10">Total Spent</span>
 <div className="relative z-10 h-full flex flex-col justify-end">
 <h2 className="font-display text-5xl text-theme-primary flex items-baseline">
 {CURRENCY_SYMBOL}<AnimatedNumber value={Math.floor(totalSpent)} />
 <span className="text-2xl text-theme-tertiary">{(totalSpent % 1 !== 0) ? (totalSpent % 1).toFixed(2).substring(1) : '.00'}</span>
 </h2>
 </div>
 </div>
 </CarouselItem>

 {/* Slide 2: Category Donut Chart */}
 <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3 pr-4">
 <div className="glass-panel p-6 rounded-3xl border border-theme-border/30 h-72 flex flex-col relative overflow-hidden group">
 <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-theme-danger/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
 <span className="font-medium text-theme-secondary uppercase tracking-widest text-sm relative z-10 mb-2">Category Split</span>
 <div className="relative z-10 flex-1 w-full h-full">
 <ResponsiveContainer width="100%" height="100%">
  <PieChart>
    <Pie
      data={pieData.length > 0 ? pieData : [{ name: 'No Expenses Yet', value: 100, color: '#e2dbce' }]}
      cx="50%"
      cy="50%"
      innerRadius={50}
      outerRadius={80}
      paddingAngle={pieData.length > 0 ? 5 : 0}
      dataKey="value"
      stroke="none"
    >
      {(pieData.length > 0 ? pieData : [{ name: 'No Expenses Yet', value: 100, color: '#e2dbce' }]).map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} opacity={pieData.length > 0 ? 1 : 0.4} />
      ))}
    </Pie>
    {pieData.length > 0 && (
      <Tooltip 
        formatter={(value: any) => `${CURRENCY_SYMBOL}${Number(value).toFixed(2)}`}
        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      />
    )}
  </PieChart>
</ResponsiveContainer>
 </div>
 </div>
 </CarouselItem>

 {/* Slide 3: Cumulative Spend Trend */}
 <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3 pr-4">
 <div className="glass-panel p-6 rounded-3xl border border-theme-border/30 h-72 flex flex-col relative overflow-hidden group">
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#10b981]/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
 <div className="flex justify-between items-center mb-2 z-10 relative">
 <span className="font-medium text-theme-secondary uppercase tracking-widest text-sm">Monthly Trend</span>
 <span className="text-xs text-[#10b981] font-medium bg-[#10b981]/10 px-2 py-1 rounded-md">{((totalSpent / (budget?.budgetAmount || 1)) * 100).toFixed(0)}% used</span>
 </div>
 <div className="relative z-10 flex-1 w-full h-full -ml-4">
 {areaData.some(d => d.spent !== null && d.spent > 0) ? (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={areaData}>
 <defs>
 <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <Tooltip 
 formatter={(value: any) => `${CURRENCY_SYMBOL}${Number(value).toFixed(2)}`}
 labelStyle={{ color: '#3a302a', fontWeight: 600 }}
 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
 />
 <Area 
 type="monotone" 
 dataKey="spent" 
 stroke="#10b981" 
 strokeWidth={3}
 fillOpacity={1} 
 fill="url(#colorSpent)" 
 />
 </AreaChart>
 </ResponsiveContainer>
 ) : (
 <div className="flex items-center justify-center h-full text-theme-tertiary ml-4">No data yet</div>
 )}
 </div>
 </div>
 </CarouselItem>
 </CarouselContent>
 <CarouselNavigation className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between -ml-4 -mr-4" />
 <CarouselIndicator className="mt-8 relative bottom-0" />
 </Carousel>
 </div>

 {/* Accordion Breakdown */}
 <div className="mb-16">
 <h3 className="font-headline text-2xl text-theme-primary mb-6 border-b border-theme-border/30 pb-4">Category Breakdown</h3>
 <Accordion
 className="flex w-full flex-col divide-y divide-theme-border/30"
 transition={{ type: 'spring', stiffness: 120, damping: 20 }}
 variants={{
 expanded: { opacity: 1, scale: 1 },
 collapsed: { opacity: 0, scale: 0.95 },
 }}
 >
 {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([categoryId, amount]) => {
 const cat = categoriesMap.get(categoryId) || categoriesMap.get(DEFAULT_CATEGORY_ID);
 const percentage = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : '0';
 const categoryLimit = budget?.categoryBudgets?.[categoryId];
 const categoryLimitPercent = categoryLimit ? ((amount / categoryLimit) * 100).toFixed(1) : null;
 const isOverLimit = categoryLimit && amount > categoryLimit;
 
 return (
 <AccordionItem key={categoryId} value={categoryId} className="py-4">
 <AccordionTrigger className="w-full text-left focus:outline-none">
 <div className="flex items-center justify-between w-full pr-4">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-full bg-theme-surface flex items-center justify-center" style={{ color: cat?.color }}>
 <span className="material-symbols-outlined">{getMaterialIcon(cat?.icon)}</span>
 </div>
 <span className="font-medium text-lg text-theme-primary">{cat?.name}</span>
 </div>
 <div className="text-right">
 <span className="block font-medium text-theme-primary">{CURRENCY_SYMBOL}{amount.toFixed(2)}</span>
 <span className="text-sm text-theme-secondary">{percentage}% Of Total Monthly Expenses</span>
 </div>
 </div>
 </AccordionTrigger>
 <AccordionContent className="pt-4 pb-2">
  <div className="flex flex-col md:flex-row justify-between gap-6">
    <div className="flex flex-col gap-4 flex-1">
      
      {/* Total Spend Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-theme-secondary mb-1">
          <span>% of Total Monthly Spend</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-theme-elevated rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: cat?.color }}></div>
        </div>
      </div>

      {/* Category Limit Progress Bar */}
      {categoryLimit && (
        <div>
          <div className="flex justify-between text-xs text-theme-secondary mb-1">
            <span>% of Category Limit ({CURRENCY_SYMBOL}{categoryLimit})</span>
            <span className={isOverLimit ? 'text-theme-danger font-medium' : ''}>{categoryLimitPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-theme-elevated rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${isOverLimit ? 'bg-theme-danger' : 'bg-theme-accent'}`} style={{ width: `${Math.min(Number(categoryLimitPercent), 100)}%` }}></div>
          </div>
        </div>
      )}
    </div>
    
    <div className="bg-theme-surface/50 rounded-xl p-3 border border-theme-border/30">
      {editingLimit === categoryId ? (
        <div className="flex items-center gap-2">
          <span className="text-theme-secondary">{CURRENCY_SYMBOL}</span>
          <input 
            type="number" 
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            className="bg-transparent w-24 text-theme-primary font-medium outline-none border-b border-theme-accent focus:border-b-2"
            placeholder="Limit"
            autoFocus
          />
          <button 
            className="text-theme-accent hover:opacity-80 active:scale-[0.98] transition-transform text-sm font-medium ml-2"
            onClick={async () => {
              if (!householdId || !selectedMonth) return;
              const newLimit = Number(limitInput);
              if (isNaN(newLimit) || newLimit < 0) return;
              
              // Optimistic update
              setCategoryBudgetOptimistic(categoryId, newLimit);
              setEditingLimit(null);
              
              // Firestore update
              try {
                await setDoc(budgetDocRef(householdId, selectedMonth), {
                  categoryBudgets: {
                    [categoryId]: newLimit
                  }
                }, { merge: true });
                addToast({ type: 'success', message: `${cat?.name} limit updated!` });
              } catch (error) {
                console.error("Failed to update limit:", error);
                addToast({ type: 'error', message: "Failed to save limit." });
              }
            }}
          >
            Save
          </button>
          <button 
            className="text-theme-secondary hover:opacity-80 active:scale-[0.98] transition-transform text-sm ml-2"
            onClick={() => setEditingLimit(null)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm">
            <span className="text-theme-secondary">Current Limit: </span>
            <span className="text-theme-primary font-medium">
              {budget?.categoryBudgets?.[categoryId] ? `${CURRENCY_SYMBOL}${budget.categoryBudgets[categoryId]}` : 'None'}
            </span>
          </div>
          <button 
            className="text-xs font-medium text-theme-accent bg-theme-accent/10 px-3 py-1.5 rounded-lg hover:bg-theme-accent/20 active:scale-[0.98] transition-all"
            onClick={() => {
              setLimitInput(budget?.categoryBudgets?.[categoryId]?.toString() || '');
              setEditingLimit(categoryId);
            }}
          >
            {budget?.categoryBudgets?.[categoryId] ? 'Edit Limit' : 'Set Limit'}
          </button>
        </div>
      )}
    </div>
  </div>
 </AccordionContent>
 </AccordionItem>
 );
 })}
 </Accordion>
 </div>

 </main>
 </div>
 );
}
