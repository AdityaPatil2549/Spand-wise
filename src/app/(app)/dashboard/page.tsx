'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useStore } from '@/store';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';
import { AnimatedGroup } from '@/components/ui/motion/animated-group';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { BorderTrail } from '@/components/ui/motion/border-trail';
import { ExpensesSidebar } from '@/components/layout/ExpensesSidebar';
import { DashboardExpenseCard } from '@/components/features/dashboard/DashboardExpenseCard';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import { format, isToday, isYesterday } from 'date-fns';
import { AddExpenseMorph } from '@/components/features/expenses/AddExpenseMorph';
import { EditExpenseMorph } from '@/components/features/expenses/EditExpenseMorph';

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

const getGradientClass = (index: number) => {
 const gradients = [
 'bg-theme-accent/10',
 'bg-theme-elevated/20',
 'bg-theme-danger/10',
 'bg-theme-surface-hover/50',
 ];
 return gradients[index % gradients.length];
};

export default function DashboardPage() {
 const { openBottomSheet, expenses, budget, getBudgetState, isExpensesLoading, categoriesMap } = useStore();
 
 const totalSpent = budget?.totalSpent || 0;
 const budgetAmount = budget?.budgetAmount || 0;
 const balance = budgetAmount - totalSpent;
 const isOverBudget = balance < 0;
 
 const recentExpenses = useMemo(() => {
 return expenses.slice(0, 4).map((exp, index) => {
 const cat = categoriesMap.get(exp.categoryId) || categoriesMap.get(DEFAULT_CATEGORY_ID);
 const date = exp.date.toDate();
 const timeLabel = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d');
 
 return {
 id: exp.id,
 title: cat?.name || 'Unknown',
 amount: exp.amount,
 timeLabel,
 icon: getMaterialIcon(cat?.icon),
 iconColor: cat?.color || '#605850',
 bgGradientClass: getGradientClass(index),
 originalExpense: exp,
 };
 });
 }, [expenses]);
 
 return (
 <div className="relative flex min-h-screen w-full bg-theme-base text-theme-primary font-body">
 <style dangerouslySetInnerHTML={{__html: `
 .glass-panel {
 background: rgba(255, 255, 255, 0.7);
 backdrop-filter: blur(16px);
 -webkit-backdrop-filter: blur(16px);
 border: 1px solid rgba(255, 255, 255, 0.5);
 }
 .hover-elevate {
 transition: transform 0.3s ease, box-shadow 0.3s ease;
 }
 .hover-elevate:hover {
 transform: translateY(-4px);
 box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
 }
 `}} />
 <ExpensesSidebar />
 <main className="flex-1 md:ml-64 flex flex-col px-[20px] md:px-[64px] py-[48px] overflow-x-hidden">
 <section className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] mb-16 lg:items-center">
 <div className="lg:col-span-7 flex flex-col gap-8 pr-0 lg:pr-12">
 <div className="space-y-4">
 <p className="text-[12px] tracking-[0.1em] font-bold text-theme-accent uppercase mb-2">Overview • {format(new Date(), 'MMMM yyyy')}</p>
 
 {isOverBudget ? (
 <>
 <h1 className="font-display text-[64px] md:text-[88px] leading-[0.9] font-medium text-theme-primary tracking-[-0.03em]">Your budget is <span className="text-theme-danger italic">strained.</span></h1>
 <TextEffect as="p" per="line" preset="blur" delay={0.2} className="text-[18px] text-theme-secondary max-w-lg mt-8">
 You have significantly exceeded your planned expenditure for this period. A detailed review of recent transactions is recommended to recalibrate your financial trajectory.
 </TextEffect>
 </>
 ) : (
 <>
 <h1 className="font-display text-[64px] md:text-[88px] leading-[0.9] font-medium text-theme-primary tracking-[-0.03em]">You are on <span className="text-[#10b981] italic">track.</span></h1>
 <TextEffect as="p" per="line" preset="blur" delay={0.2} className="text-[18px] text-theme-secondary max-w-lg mt-8">
 Your spending is well within the allocated budget limits for this period. Keep up the good work and continue managing your finances wisely.
 </TextEffect>
 </>
 )}
 
 <AddExpenseMorph>
 <div className="mt-12 bg-theme-accent text-theme-white px-8 py-4 rounded-full flex items-center gap-3 hover-elevate transition-all font-medium text-[20px] shadow-lg shadow-theme-accent/20 cursor-pointer">
 <span className="material-symbols-outlined text-[24px]">add</span>
 Add Transaction
 </div>
 </AddExpenseMorph>
 </div>
 <AnimatedGroup preset="fade" className="grid grid-cols-2 gap-4 mt-8">
 <Link href="/analytics" className="hover-elevate glass-panel p-6 rounded-2xl flex flex-col items-start gap-4 border border-theme-border/30 text-left group">
 <div className="w-12 h-12 rounded-full bg-theme-surface flex items-center justify-center text-theme-accent group-hover:bg-theme-accent group-hover:text-theme-white transition-colors">
 <span className="material-symbols-outlined">analytics</span>
 </div>
 <div>
 <h3 className="text-[16px] font-medium text-theme-primary">View Analysis</h3>
 <p className="text-sm text-theme-secondary">Deep dive into spending</p>
 </div>
 </Link>
 <Link href="/settings" className="hover-elevate glass-panel p-6 rounded-2xl flex flex-col items-start gap-4 border border-theme-border/30 text-left group">
 <div className="w-12 h-12 rounded-full bg-theme-surface flex items-center justify-center text-theme-accent group-hover:bg-theme-accent group-hover:text-theme-white transition-colors">
 <span className="material-symbols-outlined">edit_note</span>
 </div>
 <div>
 <h3 className="text-[16px] font-medium text-theme-primary">Adjust Limits</h3>
 <p className="text-sm text-theme-secondary">Rebalance categories</p>
 </div>
 </Link>
 </AnimatedGroup>
 </div>
 <div className="lg:col-span-5 w-full mt-12 lg:mt-0">
 <div className={`relative w-full rounded-[32px] overflow-hidden hover-elevate group ${isOverBudget ? 'ring-1 ring-theme-danger/30 shadow-[0_0_40px_rgba(192,57,43,0.15)]' : ''}`}>
 {isOverBudget && <BorderTrail size={120} transition={{ ease: 'linear', duration: 4, repeat: Infinity }} />}
 <div className="absolute inset-0 bg-gradient-to-br from-[#fce4e0] via-theme-surface-hover to-theme-base opacity-90 z-0"></div>
 {isOverBudget ? (
 <div className="absolute -top-24 -right-24 w-64 h-64 bg-theme-danger opacity-10 rounded-full blur-3xl"></div>
 ) : (
 <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#10b981] opacity-10 rounded-full blur-3xl"></div>
 )}
 <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-between min-h-[400px]">
 <div className="flex justify-between items-center">
 {isOverBudget ? (
 <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-danger/10 text-[#7a1a10] text-sm font-medium">
 <span className="material-symbols-outlined text-[16px]">warning</span>
 Over budget
 </span>
 ) : (
 <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 text-[#065f46] text-sm font-medium">
 <span className="material-symbols-outlined text-[16px]">check_circle</span>
 On Track
 </span>
 )}
 <span className="material-symbols-outlined text-theme-secondary">more_horiz</span>
 </div>
 <div className="space-y-2 mt-12">
 <p className="text-[16px] text-theme-secondary font-medium">{isOverBudget ? 'Overage' : 'Current Balance'}</p>
 <h2 className="font-display text-[56px] leading-none text-theme-primary tracking-tight flex items-center">
 {isOverBudget ? '-' : ''}<AnimatedNumber value={Math.abs(balance)} />
 </h2>
 </div>
 <div className="mt-12 space-y-4">
 <div className="flex justify-between text-sm">
 <span className="text-theme-secondary flex items-center gap-1">Spent: <strong className="text-theme-primary"><AnimatedNumber value={totalSpent} /></strong></span>
 <span className="text-theme-secondary flex items-center gap-1">Budget: <strong className="text-theme-primary"><AnimatedNumber value={budgetAmount} /></strong></span>
 </div>
 <div className="w-full h-2 bg-theme-elevated rounded-full overflow-hidden">
 <div className="h-full bg-transparent w-full rounded-full relative">
 <div className={`absolute top-0 left-0 h-full ${isOverBudget ? 'bg-theme-danger' : 'bg-theme-accent'}`} style={{ width: `${Math.min(100, (totalSpent / (budgetAmount || 1)) * 100)}%` }}></div>
 {isOverBudget && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50"></div>}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 <section className="mt-8">
 <div className="flex justify-between items-end mb-8 border-b border-theme-border/30 pb-4">
 <h3 className="font-display text-[32px] font-medium text-theme-primary">Recent Expenses</h3>
 <Link href="/expenses" className="text-theme-accent text-[16px] font-medium hover:underline flex items-center gap-1">
 See all <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
 </Link>
 </div>
 {recentExpenses.length === 0 && !isExpensesLoading ? (
 <p className="text-theme-secondary">No recent expenses.</p>
 ) : (
 <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {recentExpenses.map((expense) => {
 const { originalExpense, ...cardProps } = expense;
 return (
 <EditExpenseMorph key={expense.id} expense={originalExpense} className="w-full text-left focus:outline-none">
 <DashboardExpenseCard {...cardProps} />
 </EditExpenseMorph>
 );
 })}
 </AnimatedGroup>
 )}
 </section>
 </main>
 </div>
 );
}
