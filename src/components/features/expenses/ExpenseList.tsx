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
 * Formatted as an Inset Grouped list with hairlines and clean tracking.
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

  if (isLoading && displayedExpenses.length === 0) {
    return (
      <div className="divide-y divide-theme-border/30">
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
    <div className="flex flex-col gap-6">
      {dayGroups.map((group) => (
        <div key={group.dateKey} className="space-y-2">
          {/* Sticky day header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sticky top-0 z-10 bg-theme-base/90 backdrop-blur-md">
            <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
              {group.label}
            </span>
            <span className="text-xs font-mono font-medium text-theme-tertiary tabular-nums">
              {formatCurrency(group.totalAmount)}
            </span>
          </div>

          {/* Unified Inset Group */}
          <div className="rounded-2xl border border-theme-border/40 bg-theme-surface/70 backdrop-blur-xs overflow-hidden mx-1 sm:mx-4 divide-y divide-theme-border/25 shadow-xs">
            <AnimatePresence initial={false}>
              {group.expenses.map((expense) => (
                <ExpenseListItem
                  key={expense.id}
                  expense={expense}
                  onEdit={onEditExpense}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
};
