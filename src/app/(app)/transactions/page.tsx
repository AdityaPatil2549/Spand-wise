'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store';
import { ExpenseList } from '@/components/features/expenses/ExpenseList';
import { AnimatedSelect } from '@/components/ui/AnimatedSelect';
import { Search, Filter, Loader2, Download } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';
import { format, subMonths, parse } from 'date-fns';
import { TransactionSkeletonGroup } from '@/components/ui/Skeleton';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { formatCurrency } from '@/lib/utils';

function TransactionsContent() {
  const isHydrated = useHydrated();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const expenses = useStore((s) => s.expenses);
  const categories = useStore((s) => s.categories);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const loadedMonths = useStore((s) => s.loadedMonths);
  const addLoadedMonth = useStore((s) => s.addLoadedMonth);
  const isExpensesLoading = useStore((s) => s.isExpensesLoading);

  // Read initial states from URL search params
  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('cat') || 'all';
  const initialMode = searchParams.get('mode') || 'all';
  const initialQuick = (searchParams.get('quick') as 'all' | 'upi' | 'cash' | 'high') || 'all';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [quickFilter, setQuickFilter] = useState<'all' | 'upi' | 'cash' | 'high'>(initialQuick);
  const [showFilters, setShowFilters] = useState(
    initialCategory !== 'all' || initialMode !== 'all'
  );

  const loaderRef = useRef<HTMLDivElement>(null);

  // Synchronize state changes to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (selectedCategory !== 'all') params.set('cat', selectedCategory);
    if (selectedMode !== 'all') params.set('mode', selectedMode);
    if (quickFilter !== 'all') params.set('quick', quickFilter);

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(targetUrl, { scroll: false });
  }, [search, selectedCategory, selectedMode, quickFilter, pathname, router]);

  // Find the oldest loaded month to know what to load next
  const oldestLoadedMonth = useMemo(() => {
    if (loadedMonths.length === 0) return format(new Date(), 'yyyy-MM');
    return loadedMonths.reduce(
      (oldest, current) => (current < oldest ? current : oldest),
      loadedMonths[0]
    );
  }, [loadedMonths]);

  const hasMoreMonths = loadedMonths.length < 10;

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !hasMoreMonths || isExpensesLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (e.isDeleted) return false;

      // 1. Text Search (note or amount)
      if (
        search &&
        !e.note?.toLowerCase().includes(search.toLowerCase()) &&
        !e.amount.toString().includes(search)
      ) {
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
      // 4. Quick Filter Rail
      if (quickFilter === 'upi' && e.accountId !== 'bank') return false;
      if (quickFilter === 'cash' && e.accountId !== 'cash') return false;
      if (quickFilter === 'high' && e.amount < 500) return false;

      return true;
    });
  }, [expenses, search, selectedCategory, selectedMode, quickFilter]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleExportFilteredCSV = () => {
    if (filteredExpenses.length === 0) return;
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const headers = ['Date', 'Category', 'Amount', 'Payment Mode', 'Note'];
    const rows = filteredExpenses.map((e) => [
      format(e.date.toDate(), 'yyyy-MM-dd HH:mm'),
      catMap.get(e.categoryId) || 'Uncategorized',
      e.amount.toFixed(2),
      e.accountId || 'bank',
      `"${(e.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `spendwise_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isHydrated) {
    return (
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-theme-primary tracking-tight mb-4">
            Transactions
          </h1>
          <div className="h-12 w-full rounded-xl bg-theme-surface/50 border border-theme-border/30 animate-pulse" />
        </div>
        <TransactionSkeletonGroup count={6} />
      </div>
    );
  }

  return (
    <div className="w-full pb-36 animate-in fade-in duration-300">
      {/* Controls & Search */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-theme-primary tracking-tight font-display">
              Transactions Ledger
            </h1>
            <p className="text-sm text-theme-secondary mt-0.5">
              Live ledger of all recorded expenses, categories and payment modes.
            </p>
          </div>

          {filteredExpenses.length > 0 && (
            <button
              type="button"
              onClick={handleExportFilteredCSV}
              className="text-xs font-semibold text-theme-secondary hover:text-theme-primary bg-theme-surface border border-theme-border/60 hover:bg-theme-elevated px-3 py-2 rounded-xl transition-all inline-flex items-center gap-1.5 self-start sm:self-auto active:scale-95 shadow-sm"
              title="Download CSV for current filtered view"
            >
              <Download className="w-3.5 h-3.5 text-theme-accent" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {/* Search Bar & Filter Toggle */}
        <div className="flex gap-2.5 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary" />
            <input
              type="text"
              placeholder="Search by amount, note, or merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-theme-surface border border-theme-border/60 rounded-2xl pl-10 pr-9 py-3 text-sm text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:border-theme-accent transition-colors shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-theme-border/40 hover:bg-theme-border text-theme-secondary flex items-center justify-center text-xs"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`min-h-[44px] min-w-[44px] px-3.5 border rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
              showFilters
                ? 'bg-theme-accent text-theme-inverse border-theme-accent shadow-sm'
                : 'bg-theme-surface border-theme-border/60 text-theme-secondary hover:text-theme-primary shadow-xs'
            }`}
            aria-label="Toggle transaction filters"
          >
            <Filter className="w-4 h-4 stroke-[2]" />
            <span className="text-xs font-semibold hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Quick Filter Rail */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
          <button
            type="button"
            onClick={() => setQuickFilter('all')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-[0.98] ${
              quickFilter === 'all'
                ? 'bg-theme-primary text-theme-inverse shadow-xs'
                : 'bg-theme-surface/80 border border-theme-border/50 text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <span>All Activity</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter('upi')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-[0.98] ${
              quickFilter === 'upi'
                ? 'bg-theme-primary text-theme-inverse shadow-xs'
                : 'bg-theme-surface/80 border border-theme-border/50 text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
            <span>UPI Only</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter('cash')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-[0.98] ${
              quickFilter === 'cash'
                ? 'bg-theme-primary text-theme-inverse shadow-xs'
                : 'bg-theme-surface/80 border border-theme-border/50 text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>Cash Only</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter('high')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-[0.98] ${
              quickFilter === 'high'
                ? 'bg-theme-primary text-theme-inverse shadow-xs'
                : 'bg-theme-surface/80 border border-theme-border/50 text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden="true" />
            <span>Large (&gt; ₹500)</span>
          </button>
        </div>

        {/* Live Filter Count & Subtotal Indicator */}
        <div className="mt-3 px-3.5 py-2 rounded-xl bg-theme-surface/50 border border-theme-border/40 flex items-center justify-between text-xs">
          <span className="text-theme-secondary">
            Showing{' '}
            <strong className="text-theme-primary font-semibold">
              {filteredExpenses.length}
            </strong>{' '}
            transaction{filteredExpenses.length !== 1 ? 's' : ''}
          </span>
          <span className="text-theme-secondary font-mono tabular-nums">
            Total:{' '}
            <strong className="text-theme-primary font-bold">
              {formatCurrency(filteredTotal)}
            </strong>
          </span>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 pt-3 animate-fade-in">
            <AnimatedSelect
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { label: 'All Categories', value: 'all' },
                ...categories.map((c) => ({ label: c.name, value: c.id })),
              ]}
              className="flex-1"
            />

            <AnimatedSelect
              value={selectedMode}
              onChange={setSelectedMode}
              options={[
                { label: 'All Payment Modes', value: 'all' },
                { label: 'Cash', value: 'cash' },
                { label: 'UPI', value: 'bank' },
              ]}
              className="flex-1"
            />
          </div>
        )}
      </div>

      <div className="pt-4 md:px-4">
        <ExpenseList
          onEditExpense={(expense) =>
            openBottomSheet({
              editingExpenseId: expense.id,
              initialCategoryId: expense.categoryId,
            })
          }
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

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-theme-primary tracking-tight mb-4">
              Transactions Ledger
            </h1>
            <div className="h-12 w-full rounded-xl bg-theme-surface/50 border border-theme-border/30 animate-pulse" />
          </div>
          <TransactionSkeletonGroup count={6} />
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}
