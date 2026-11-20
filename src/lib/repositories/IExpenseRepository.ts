import type { ExpenseDocument } from '@/types/firestore';
import type { AddExpenseInput, EditExpenseInput } from '@/types/forms';

export interface OutboxSyncResult {
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * Universal contract for Expense Data Access.
 * Decouples React components, TanStack Query, and Zustand stores
 * from direct cloud persistence (Firestore) and local persistence (Dexie/IndexedDB).
 */
export interface IExpenseRepository {
  /**
   * Persists a new expense and updates aggregate budgets/accounts.
   */
  addExpense(
    householdId: string,
    userId: string,
    input: AddExpenseInput
  ): Promise<ExpenseDocument>;

  /**
   * Updates an existing expense and adjusts aggregate delta changes.
   */
  editExpense(
    householdId: string,
    input: EditExpenseInput,
    previousAmount: number,
    previousMonth: string,
    previousType?: 'expense' | 'income',
    previousAccountId?: string
  ): Promise<void>;

  /**
   * Soft-deletes an expense by ID and reverses aggregate totals.
   */
  softDeleteExpense(
    householdId: string,
    expenseId: string,
    amount: number,
    month: string,
    type?: 'expense' | 'income',
    accountId?: string
  ): Promise<void>;

  /**
   * Restores a soft-deleted expense and reapplies aggregate totals.
   */
  restoreExpense(
    householdId: string,
    expenseId: string,
    amount: number,
    month: string,
    type?: 'expense' | 'income',
    accountId?: string
  ): Promise<void>;

  /**
   * Fetches active (non-deleted) expenses partitioned across months.
   */
  getExpenses(
    householdId: string,
    months: string[],
    signal?: AbortSignal
  ): Promise<ExpenseDocument[]>;

  /**
   * Fetches active expenses spanning an arbitrary date range for reporting.
   */
  getExpensesByDateRange(
    householdId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ExpenseDocument[]>;

  /**
   * Synchronizes queued local outbox operations to remote cloud storage.
   */
  syncOutbox?(householdId: string): Promise<OutboxSyncResult>;
}
