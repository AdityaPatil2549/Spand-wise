'use client';

import { usePathname } from 'next/navigation';

import { useStore } from '@/store';
import { useExpensesListener } from '@/hooks/useExpenses';
import { useBudgetListener } from '@/hooks/useBudget';
import { useCategoriesLoader } from '@/hooks/useCategories';
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

 // Find the expense being edited (if any)
 const editingExpense: ExpenseDocument | null = bottomSheet.editingExpenseId
 ? (expenses.find((e) => e.id === bottomSheet.editingExpenseId) ?? null)
 : null;

 if (!isHydrated) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-theme-base">
      <div className="w-8 h-8 rounded-full border-4 border-theme-border border-t-theme-accent animate-spin" />
    </div>
  );
 }

 return (
 <div className="min-h-screen bg-[var(--surface-base)] flex w-full overflow-hidden relative">
 {/* Main Content Area */}
 <div className="flex-1 w-full flex flex-col h-screen overflow-y-auto relative">
 <main className="flex-1 w-full max-w-7xl mx-auto" id="main-content">
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
