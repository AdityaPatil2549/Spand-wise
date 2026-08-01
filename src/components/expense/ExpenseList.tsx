'use client';

import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Receipt } from 'lucide-react';
import { ExpenseListItem } from './ExpenseListItem';
import { ExpenseItemSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/store';
import { groupExpensesByDay } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/format';
import type { ExpenseDocument } from '@/types/firestore';

interface ExpenseListProps {
  onEditExpense: (expense: ExpenseDocument) => void;
  /** If true, shows only the first 5 expenses (for dashboard preview) */
  preview?: boolean;
  /** Optional pre-filtered expenses to display instead of the full store list */
  expenses?: ExpenseDocument[];
}

/**
 * Expense timeline grouped by day.
 * Used on both the dashboard (preview=true) and the full expenses page.
 */
export const ExpenseList = ({ onEditExpense, preview = false, expenses: propExpenses }: ExpenseListProps) => {
  const storeExpenses = useStore((s) => s.expenses);
  const expenses = propExpenses ?? storeExpenses;
  const isLoading = useStore((s) => s.isExpensesLoading);

  const displayedExpenses = preview ? expenses.slice(0, 5) : expenses;

  const dayGroups = useMemo(
    () => groupExpensesByDay(displayedExpenses),
    [displayedExpenses]
  );

  if (isLoading) {
    return (
      <div className="divide-y divide-[var(--surface-secondary)]">
        {[...Array(4)].map((_, i) => (
          <ExpenseItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (dayGroups.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses yet"
        description="Click the Add Expense button to log your first expense"
      />
    );
  }

  return (
    <div className="flex flex-col">
      {dayGroups.map((group) => (
        <div key={group.dateKey}>
          {/* Sticky day header */}
          <div className="flex items-center justify-between px-4 py-2 sticky top-0 z-10 bg-[var(--surface-base)]/95 backdrop-blur-sm">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              {group.label}
            </span>
            <span className="text-xs font-medium text-[var(--text-tertiary)]">
              {formatCurrency(group.totalAmount)}
            </span>
          </div>

          {/* Expense items */}
          <div className="bg-[var(--surface-primary)] rounded-2xl overflow-hidden mx-4 mb-3 shadow-[var(--shadow-card)]">
            <AnimatePresence>
              {group.expenses.map((expense, idx) => (
                <div key={expense.id}>
                  <ExpenseListItem
                    expense={expense}
                    onEdit={onEditExpense}
                  />
                  {idx < group.expenses.length - 1 && (
                    <div className="h-px bg-[var(--surface-secondary)] mx-4" />
                  )}
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
};
