'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useStore } from '@/store';
import { useExpensesListener } from '@/hooks/useExpenses';
import { useBudgetListener } from '@/hooks/useBudget';
import { useCategoriesLoader } from '@/hooks/useCategories';
import { useAccountsLoader } from '@/hooks/useAccounts';
import { useScheduledTransactionsLoader } from '@/hooks/useScheduledTransactions';
import { useHydrated } from '@/hooks/useHydrated';
import { BottomNav } from './BottomNav';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { ExpenseForm } from '@/components/features/expenses/ExpenseForm';
import type { ExpenseDocument } from '@/types/firestore';

interface AppShellProps {
  children: React.ReactNode;
}

import { PWAInstallPrompt } from '@/components/shared/PWAInstallPrompt';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { DynamicBackground } from '@/components/ui/motion/DynamicBackground';
import { ExpenseItemSkeleton, BudgetHeroSkeleton } from '@/components/ui/Skeleton';
import { Sidebar } from './Sidebar';
import { TopAppBar } from './TopAppBar';

export const AppShell = ({ children }: AppShellProps) => {
  const householdId = useStore((s) => s.householdId);
  const selectedMonth = useStore((s) => s.selectedMonth);
  const loadedMonths = useStore((s) => s.loadedMonths);
  const bottomSheet = useStore((s) => s.bottomSheet);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const closeBottomSheet = useStore((s) => s.closeBottomSheet);

  const expenses = useStore((s) => s.expenses);
  const pathname = usePathname();
  const isHydrated = useHydrated();

  // Desktop keyboard shortcuts: 'N' for new transaction, 'Escape' to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      ) {
        return;
      }

      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openBottomSheet();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openBottomSheet]);

  // Initialize real-time listeners
  useExpensesListener(householdId, loadedMonths);
  useBudgetListener(householdId, selectedMonth);
  useCategoriesLoader(householdId);
  useAccountsLoader(householdId);
  useScheduledTransactionsLoader(householdId);

  // Find the expense being edited (if any)
  const editingExpense: ExpenseDocument | null = bottomSheet.editingExpenseId
    ? (expenses.find((e) => e.id === bottomSheet.editingExpenseId) ?? null)
    : null;

  if (!isHydrated) {
    return (
      <div className="min-h-[100dvh] flex flex-col w-full overflow-hidden relative">
        <DynamicBackground />
        <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 pt-12 md:pt-16 flex flex-col gap-8 opacity-60">
          <BudgetHeroSkeleton />
          <div className="space-y-4">
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] min-h-[100dvh] flex w-full overflow-hidden relative bg-theme-base text-theme-primary">
      <DynamicBackground />
      
      {/* Desktop Sidebar (Persistent on md+ screens) */}
      <div className="hidden md:flex w-64 flex-shrink-0 h-full">
        <Sidebar className="w-full h-full" />
      </div>

      {/* Main Scrollable Viewport */}
      <div className="flex-1 w-full flex flex-col h-[100dvh] overflow-y-auto relative overscroll-contain">
        {/* Sticky Top Header */}
        <TopAppBar />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-28 md:pb-12 pt-4 md:pt-6" id="main-content">
          {children}
        </main>

        {/* Global Floating Elements */}
        <BottomNav />
        <PWAInstallPrompt />
        <OfflineIndicator />
      </div>

      {/* Responsive Add/Edit Modal (Bottom Sheet on Android, Dialog on Desktop) */}
      <BottomSheet
        isOpen={bottomSheet.isOpen}
        onClose={closeBottomSheet}
        title={editingExpense ? 'Edit Expense' : 'New Expense'}
      >
        <ExpenseForm
          editingExpense={editingExpense}
          initialCategoryId={bottomSheet.initialCategoryId}
          onSuccess={closeBottomSheet}
        />
      </BottomSheet>
    </div>
  );
};
