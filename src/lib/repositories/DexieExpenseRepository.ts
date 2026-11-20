import { Timestamp } from 'firebase/firestore';
import {
  localDb,
  toLocalExpense,
  toExpenseDocument,
} from '@/lib/db/dexie';
import { syncOutbox, isNetworkOnline } from '@/lib/sync/outboxWorker';
import { fetchExpenses } from '@/hooks/queries/useExpensesQuery';
import { parseExpenseDate, getExpensesByDateRange } from '@/lib/expenses';
import { getLocalMonthString } from '@/lib/date-sharding';
import type {
  IExpenseRepository,
  OutboxSyncResult,
} from './IExpenseRepository';
import type { ExpenseDocument } from '@/types/firestore';
import type { AddExpenseInput, EditExpenseInput } from '@/types/forms';

/**
 * Local-First Dexie.js (IndexedDB) implementation of IExpenseRepository.
 * Provides 0ms local reads, offline mutation outbox queuing, and CDC sync to Firestore.
 */
export class DexieExpenseRepository implements IExpenseRepository {
  async addExpense(
    householdId: string,
    userId: string,
    input: AddExpenseInput
  ): Promise<ExpenseDocument> {
    const parsedDate = parseExpenseDate(input.date);
    const month = getLocalMonthString(parsedDate);
    const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const clientTimestamp = Timestamp.fromDate(parsedDate);
    const nowTimestamp = Timestamp.now();

    const expenseDoc: ExpenseDocument = {
      id: localId,
      amount: input.amount,
      categoryId: input.categoryId,
      note: input.note?.trim() || null,
      date: clientTimestamp,
      month,
      isDeleted: false,
      type: input.type || 'expense',
      createdAt: nowTimestamp,
      createdBy: userId,
      accountId: input.accountId || 'cash',
      householdId,
    };

    // 1. Immediately store in local Dexie database (0ms latency)
    await localDb.expenses.put(toLocalExpense(expenseDoc, 'pending'));

    // 2. Queue mutation in Outbox
    await localDb.outbox.add({
      mutationId: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      householdId,
      type: 'add',
      payload: {
        userId,
        input,
        localId,
      },
      createdAt: Date.now(),
      attempts: 0,
      lastAttemptAt: null,
      error: null,
      status: 'pending',
    });

    // 3. Eager background dispatch if network is available
    if (isNetworkOnline()) {
      syncOutbox(householdId).catch(() => {});
    }

    return expenseDoc;
  }

  async editExpense(
    householdId: string,
    input: EditExpenseInput,
    previousAmount: number,
    previousMonth: string,
    previousType: 'expense' | 'income' = 'expense',
    previousAccountId: string = 'cash'
  ): Promise<void> {
    const parsedDate = parseExpenseDate(input.date);
    const month = getLocalMonthString(parsedDate);

    // 1. Update local IndexedDB record
    const existing = await localDb.expenses.get(input.id);
    if (existing) {
      await localDb.expenses.update(input.id, {
        amount: input.amount,
        categoryId: input.categoryId,
        note: input.note?.trim() || null,
        date: parsedDate.getTime(),
        month,
        type: input.type || 'expense',
        accountId: input.accountId || 'cash',
        updatedAt: Date.now(),
        syncStatus: 'pending',
      });
    }

    // 2. Queue in Outbox
    await localDb.outbox.add({
      mutationId: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      householdId,
      type: 'edit',
      payload: {
        input,
        previousAmount,
        previousMonth,
        previousType,
        previousAccountId,
      },
      createdAt: Date.now(),
      attempts: 0,
      lastAttemptAt: null,
      error: null,
      status: 'pending',
    });

    // 3. Eager background dispatch if online
    if (isNetworkOnline()) {
      syncOutbox(householdId).catch(() => {});
    }
  }

  async softDeleteExpense(
    householdId: string,
    expenseId: string,
    amount: number,
    month: string,
    type: 'expense' | 'income' = 'expense',
    accountId: string = 'cash'
  ): Promise<void> {
    // 1. Mark as deleted in local IndexedDB
    const existing = await localDb.expenses.get(expenseId);
    if (existing) {
      await localDb.expenses.update(expenseId, {
        isDeleted: 1,
        updatedAt: Date.now(),
        syncStatus: 'pending',
      });
    }

    // 2. Queue in Outbox
    await localDb.outbox.add({
      mutationId: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      householdId,
      type: 'delete',
      payload: {
        expenseId,
        amount,
        month,
        expType: type,
        accountId,
      },
      createdAt: Date.now(),
      attempts: 0,
      lastAttemptAt: null,
      error: null,
      status: 'pending',
    });

    // 3. Eager background dispatch if online
    if (isNetworkOnline()) {
      syncOutbox(householdId).catch(() => {});
    }
  }

  async restoreExpense(
    householdId: string,
    expenseId: string,
    amount: number,
    month: string,
    type: 'expense' | 'income' = 'expense',
    accountId: string = 'cash'
  ): Promise<void> {
    // 1. Mark as active in local IndexedDB
    const existing = await localDb.expenses.get(expenseId);
    if (existing) {
      await localDb.expenses.update(expenseId, {
        isDeleted: 0,
        updatedAt: Date.now(),
        syncStatus: 'pending',
      });
    }

    // 2. Queue in Outbox
    await localDb.outbox.add({
      mutationId: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      householdId,
      type: 'restore',
      payload: {
        expenseId,
        amount,
        month,
        expType: type,
        accountId,
      },
      createdAt: Date.now(),
      attempts: 0,
      lastAttemptAt: null,
      error: null,
      status: 'pending',
    });

    // 3. Eager background dispatch if online
    if (isNetworkOnline()) {
      syncOutbox(householdId).catch(() => {});
    }
  }

  async getExpenses(
    householdId: string,
    months: string[]
  ): Promise<ExpenseDocument[]> {
    // 1. Query Dexie for instantaneous local results
    try {
      const localRecords = await localDb.expenses
        .where('householdId')
        .equals(householdId)
        .filter((e) => e.isDeleted === 0 && months.includes(e.month))
        .toArray();

      if (localRecords.length > 0) {
        localRecords.sort((a, b) => b.date - a.date);
        const cachedDocs = localRecords.map(toExpenseDocument);

        // Concurrently refresh from remote cloud in background if online
        if (isNetworkOnline() && householdId !== 'guest_demo_household') {
          fetchExpenses(householdId, months)
            .then(async (remoteDocs) => {
              if (remoteDocs.length > 0) {
                const records = remoteDocs.map((doc) => toLocalExpense(doc, 'synced'));
                await localDb.expenses.bulkPut(records);
              }
            })
            .catch(() => {});
        }

        return cachedDocs;
      }
    } catch {
      // Fall through to remote fetch if IndexedDB read encounters an issue
    }

    // 2. If no local records exist, fetch from remote and cache to Dexie
    if (isNetworkOnline()) {
      const remoteDocs = await fetchExpenses(householdId, months);
      if (remoteDocs.length > 0) {
        try {
          const records = remoteDocs.map((doc) => toLocalExpense(doc, 'synced'));
          await localDb.expenses.bulkPut(records);
        } catch {
          // Non-critical cache write failure
        }
      }
      return remoteDocs;
    }

    return [];
  }

  async getExpensesByDateRange(
    householdId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ExpenseDocument[]> {
    // For date range reports, if local records exist for the range, use them
    try {
      const startMs = startDate.getTime();
      const endMs = endDate.getTime();

      const localRecords = await localDb.expenses
        .where('householdId')
        .equals(householdId)
        .filter((e) => e.isDeleted === 0 && e.date >= startMs && e.date <= endMs)
        .toArray();

      if (localRecords.length > 0) {
        localRecords.sort((a, b) => b.date - a.date);
        return localRecords.map(toExpenseDocument);
      }
    } catch {
      // Fall through
    }

    return getExpensesByDateRange(householdId, startDate, endDate);
  }

  async syncOutbox(householdId: string): Promise<OutboxSyncResult> {
    return syncOutbox(householdId);
  }
}

export const dexieExpenseRepository = new DexieExpenseRepository();
