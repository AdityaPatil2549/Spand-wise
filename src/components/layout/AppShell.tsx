'use client';

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

/**
 * AppShell — the root layout for all authenticated pages.
 * Responsibilities:
 * 1. Initialize all real-time Firestore listeners
 * 2. Render BottomNav, FAB, Toaster
 * 3. Manage the global Add/Edit expense bottom sheet
 */
import { PWAInstallPrompt } from '@/components/shared/PWAInstallPrompt';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { DynamicBackground } from '@/components/ui/motion/DynamicBackground';
import { ExpenseItemSkeleton, BudgetHeroSkeleton } from '@/components/ui/Skeleton';
import { Sidebar } from './Sidebar';
import { TopAppBar } from './TopAppBar';

export const AppShell = ({ children }: AppShellProps) => {
 // Initialize global auth listener (now in GlobalProviders)

 const householdId = useStore((s) => s.householdId);
 const selectedMonth = useStore((s) => s.selectedMonth);
 const loadedMonths = useStore((s) => s.loadedMonths);
 const bottomSheet = useStore((s) => s.bottomSheet);
 const closeBottomSheet = useStore((s) => s.closeBottomSheet);

 const expenses = useStore((s) => s.expenses);
 const pathname = usePathname();
 const isDashboard = pathname === '/dashboard' || pathname === '/expenses';
 const isHydrated = useHydrated();

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
    <div className="min-h-screen flex flex-col w-full overflow-hidden relative">
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
 <div className="min-h-screen flex w-full overflow-hidden relative">
  <DynamicBackground />
  {/* Desktop Sidebar */}
  <div className="hidden md:flex w-64 flex-shrink-0">
    <Sidebar className="w-full h-screen" />
  </div>

  {/* Main Content Area */}
  <div className="flex-1 w-full flex flex-col h-screen overflow-y-auto relative">
 <main className="flex-1 w-full max-w-5xl mx-auto" id="main-content">
 {children}
 </main>

 {/* Global UI elements */}
 <TopAppBar />
 <BottomNav />
 <PWAInstallPrompt />
 <OfflineIndicator />
 </div>

 {/* Add/Edit Expense Bottom Sheet */}
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
