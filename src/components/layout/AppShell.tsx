'use client';

import { usePathname } from 'next/navigation';

import { useStore } from '@/store';
import { useExpensesListener } from '@/hooks/useExpenses';
import { useBudgetListener } from '@/hooks/useBudget';
import { useCategoriesLoader } from '@/hooks/useCategories';
import { BottomNav } from './BottomNav';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { ExpenseForm } from '@/components/expense/ExpenseForm';
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

export const AppShell = ({ children }: AppShellProps) => {
 // Initialize global auth listener (now in GlobalProviders)

 const householdId = useStore((s) => s.householdId);
 const selectedMonth = useStore((s) => s.selectedMonth);
 const bottomSheet = useStore((s) => s.bottomSheet);
 const closeBottomSheet = useStore((s) => s.closeBottomSheet);

 const expenses = useStore((s) => s.expenses);
 const pathname = usePathname();
 const isDashboard = pathname === '/dashboard' || pathname === '/expenses';

 // Initialize real-time listeners
 useExpensesListener(householdId, selectedMonth);
 useBudgetListener(householdId, selectedMonth);
 useCategoriesLoader(householdId);

 // Find the expense being edited (if any)
 const editingExpense: ExpenseDocument | null = bottomSheet.editingExpenseId
 ? (expenses.find((e) => e.id === bottomSheet.editingExpenseId) ?? null)
 : null;

 return (
 <div className="min-h-screen bg-[var(--surface-base)] flex w-full overflow-hidden relative">
 {/* Main Content Area */}
 <div className="flex-1 w-full flex flex-col h-screen overflow-y-auto relative">
 <main className="flex-1 w-full max-w-7xl mx-auto" id="main-content">
 {children}
 </main>

 {/* Global UI elements */}
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
