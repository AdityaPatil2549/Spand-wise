import {
  addExpense,
  editExpense,
  softDeleteExpense,
  restoreExpense,
  getExpensesByDateRange,
} from '@/lib/expenses';
import { fetchExpenses } from '@/hooks/queries/useExpensesQuery';
import type {
  IExpenseRepository,
  OutboxSyncResult,
} from './IExpenseRepository';
import type { ExpenseDocument } from '@/types/firestore';
import type { AddExpenseInput, EditExpenseInput } from '@/types/forms';

/**
 * Pure Firestore implementation of IExpenseRepository.
 * Provides direct cloud document synchronization and transactions.
 */
export class FirestoreExpenseRepository implements IExpenseRepository {
  async addExpense(
    householdId: string,
    userId: string,
    input: AddExpenseInput
  ): Promise<ExpenseDocument> {
    return addExpense(householdId, userId, input);
  }

  async editExpense(
    householdId: string,
    input: EditExpenseInput,
    previousAmount: number,
    previousMonth: string,
    previousType: 'expense' | 'income' = 'expense',
    previousAccountId: string = 'cash'
  ): Promise<void> {
    return editExpense(
      householdId,
      input,
      previousAmount,
      previousMonth,
      previousType,
      previousAccountId
    );
  }

  async softDeleteExpense(
    householdId: string,
    expenseId: string,
    amount: number,
    month: string,
    type: 'expense' | 'income' = 'expense',
    accountId: string = 'cash'
  ): Promise<void> {
    return softDeleteExpense(householdId, expenseId, amount, month, type, accountId);
  }

  async restoreExpense(
    householdId: string,
    expenseId: string,
    amount: number,
    month: string,
    type: 'expense' | 'income' = 'expense',
    accountId: string = 'cash'
  ): Promise<void> {
    return restoreExpense(householdId, expenseId, amount, month, type, accountId);
  }

  async getExpenses(
    householdId: string,
    months: string[]
  ): Promise<ExpenseDocument[]> {
    return fetchExpenses(householdId, months);
  }

  async getExpensesByDateRange(
    householdId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ExpenseDocument[]> {
    return getExpensesByDateRange(householdId, startDate, endDate);
  }

  async syncOutbox(): Promise<OutboxSyncResult> {
    // Firestore writes directly, so no outbox queue is maintained
    return {
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };
  }
}

export const firestoreExpenseRepository = new FirestoreExpenseRepository();
