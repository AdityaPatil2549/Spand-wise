'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '@/store';
import { ExpenseList } from '@/components/features/expenses/ExpenseList';
import { AnimatedSelect } from '@/components/ui/AnimatedSelect';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';
import { format, subMonths, parse } from 'date-fns';

export default function TransactionsPage() {
  const isHydrated = useHydrated();
  const expenses = useStore((s) => s.expenses);
  const categories = useStore((s) => s.categories);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const loadedMonths = useStore((s) => s.loadedMonths);
  const addLoadedMonth = useStore((s) => s.addLoadedMonth);
  const isExpensesLoading = useStore((s) => s.isExpensesLoading);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);

  // Find the oldest loaded month to know what to load next
  const oldestLoadedMonth = useMemo(() => {
    if (loadedMonths.length === 0) return format(new Date(), 'yyyy-MM');
    return loadedMonths.reduce((oldest, current) => (current < oldest ? current : oldest), loadedMonths[0]);
  }, [loadedMonths]);

  const hasMoreMonths = loadedMonths.length < 10;

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !hasMoreMonths || isExpensesLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Calculate previous month
          const oldestDate = parse(oldestLoadedMonth, 'yyyy-MM', new Date());
          const prevMonth = format(subMonths(oldestDate, 1), 'yyyy-MM');
          addLoadedMonth(prevMonth);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loaderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [oldestLoadedMonth, hasMoreMonths, isExpensesLoading, addLoadedMonth]);

  if (!isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-theme-border border-t-theme-accent animate-spin" />
      </div>
    );
  }

  const filteredExpenses = expenses.filter((e) => {
    // 1. Text Search
    if (search && !e.note?.toLowerCase().includes(search.toLowerCase()) && !e.amount.toString().includes(search)) {
      return false;
    }
    // 2. Category Filter
    if (selectedCategory !== 'all' && e.categoryId !== selectedCategory) {
      return false;
    }
    // 3. Payment Mode (Account) Filter
    if (selectedMode !== 'all' && e.accountId !== selectedMode) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-theme-base/80 backdrop-blur-md border-b border-theme-border px-4 py-4 md:px-8">
        <h1 className="text-2xl font-bold text-theme-primary tracking-tight mb-4">Transactions</h1>
        
        {/* Search Bar */}
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
            <input
              type="text"
              placeholder="Search expenses by amount or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-theme-surface border border-theme-border rounded-xl pl-10 pr-4 py-3 text-sm text-theme-primary focus:outline-none focus:border-theme-accent transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 border rounded-xl transition-colors ${showFilters ? 'bg-theme-accent text-white border-theme-accent' : 'bg-theme-surface border-theme-border text-theme-secondary hover:text-theme-primary'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-in">
            <AnimatedSelect
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { label: 'All Categories', value: 'all' },
                ...categories.map(c => ({ label: c.name, value: c.id }))
              ]}
              className="flex-1"
            />
            
            <AnimatedSelect
              value={selectedMode}
              onChange={setSelectedMode}
              options={[
                { label: 'All Payment Modes', value: 'all' },
                { label: 'Cash', value: 'cash' },
                { label: 'UPI', value: 'bank' }
              ]}
              className="flex-1"
            />
          </div>
        )}
      </div>

      <div className="pt-4 md:px-4">
        <ExpenseList 
          onEditExpense={(expense) => openBottomSheet({ editingExpenseId: expense.id, initialCategoryId: expense.categoryId })} 
          expenses={filteredExpenses}
        />
        
        {/* Infinite Scroll Loader */}
        {hasMoreMonths && (
          <div ref={loaderRef} className="w-full py-8 flex justify-center items-center">
            {isExpensesLoading ? (
              <Loader2 className="w-6 h-6 text-theme-accent animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-theme-tertiary animate-pulse" />
            )}
          </div>
        )}
        
        {!hasMoreMonths && (
          <div className="w-full py-8 text-center text-sm text-theme-tertiary">
            Maximum history loaded (10 months)
          </div>
        )}
      </div>
    </div>
  );
}
