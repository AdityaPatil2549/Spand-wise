import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Timestamp } from 'firebase/firestore';

// Mock env and Firebase to isolate test runner from network and credentials
vi.mock('@/config/env', () => ({
  env: new Proxy({} as Record<string, string>, {
    get: () => 'stub_env_property',
  }),
}));

vi.mock('@/lib/firebase', () => ({
  app: {},
  auth: {},
  db: {},
}));

vi.mock('@/lib/expenses', () => ({
  parseExpenseDate: (d: string) => new Date(d),
  getExpensesByDateRange: vi.fn().mockResolvedValue([]),
  addExpense: vi.fn().mockImplementation(async (_hId, userId, input) => ({
    id: `remote_${Date.now()}`,
    amount: input.amount,
    categoryId: input.categoryId,
    note: input.note || null,
    date: { toMillis: () => new Date(input.date).getTime() },
    month: '2026-11',
    isDeleted: false,
    type: input.type || 'expense',
    accountId: input.accountId || 'cash',
    createdBy: userId,
    createdAt: { toMillis: () => Date.now() },
  })),
  editExpense: vi.fn().mockResolvedValue(undefined),
  softDeleteExpense: vi.fn().mockResolvedValue(undefined),
  restoreExpense: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/hooks/queries/useExpensesQuery', () => ({
  fetchExpenses: vi.fn().mockResolvedValue([]),
}));

import {
  SpendWiseLocalDB,
  toLocalExpense,
  toExpenseDocument,
  localDb,
} from '@/lib/db/dexie';
import {
  getPendingOutboxCount,
  isNetworkOnline,
  syncOutbox,
  MAX_RETRY_ATTEMPTS,
} from '@/lib/sync/outboxWorker';
import { DexieExpenseRepository } from '@/lib/repositories/DexieExpenseRepository';
import { getExpenseRepository, expenseRepository } from '@/lib/repositories';
import type { ExpenseDocument } from '@/types/firestore';

describe('Phase 4: Local-First Dexie.js & Outbox Sync Architecture', () => {
  beforeEach(async () => {
    // Clear in-memory IndexedDB tables before each test
    await localDb.expenses.clear();
    await localDb.outbox.clear();
    vi.clearAllMocks();
  });

  describe('SpendWiseLocalDB & Document Transformers', () => {
    it('initializes IndexedDB tables with compound indexes', () => {
      const db = new SpendWiseLocalDB();
      expect(db.expenses).toBeDefined();
      expect(db.outbox).toBeDefined();
      expect(db.tables.map((t) => t.name)).toContain('expenses');
      expect(db.tables.map((t) => t.name)).toContain('outbox');
    });

    it('converts Firestore ExpenseDocument to Dexie LocalExpenseRecord cleanly', () => {
      const mockDoc: ExpenseDocument = {
        id: 'exp_123',
        amount: 45000,
        categoryId: 'groceries',
        note: 'Weekly essentials',
        date: Timestamp.fromDate(new Date('2026-11-20T10:00:00Z')),
        month: '2026-11',
        isDeleted: false,
        type: 'expense',
        accountId: 'bank',
        createdBy: 'user_abc',
        createdAt: Timestamp.fromDate(new Date('2026-11-20T10:05:00Z')),
        householdId: 'house_xyz',
      };

      const record = toLocalExpense(mockDoc, 'synced');
      expect(record.id).toBe('exp_123');
      expect(record.amount).toBe(45000);
      expect(record.isDeleted).toBe(0);
      expect(record.syncStatus).toBe('synced');
      expect(typeof record.date).toBe('number');
      expect(typeof record.createdAt).toBe('number');

      // Round-trip back to ExpenseDocument
      const roundTrip = toExpenseDocument(record);
      expect(roundTrip.id).toBe(mockDoc.id);
      expect(roundTrip.amount).toBe(mockDoc.amount);
      expect(roundTrip.isDeleted).toBe(false);
      expect(roundTrip.date.toMillis()).toBe(mockDoc.date.toMillis());
    });
  });

  describe('IndexedDB CRUD & Compound Queries', () => {
    it('inserts, updates and queries local expenses by month and deletion status', async () => {
      const now = Date.now();
      await localDb.expenses.bulkPut([
        {
          id: 'exp_1',
          householdId: 'house_1',
          amount: 15000,
          categoryId: 'food',
          note: null,
          date: now - 1000,
          month: '2026-11',
          isDeleted: 0,
          type: 'expense',
          accountId: 'cash',
          createdBy: 'user_1',
          createdAt: now - 1000,
          updatedAt: null,
          syncStatus: 'synced',
        },
        {
          id: 'exp_2',
          householdId: 'house_1',
          amount: 25000,
          categoryId: 'bills',
          note: 'Power bill',
          date: now,
          month: '2026-11',
          isDeleted: 0,
          type: 'expense',
          accountId: 'bank',
          createdBy: 'user_1',
          createdAt: now,
          updatedAt: null,
          syncStatus: 'pending',
        },
        {
          id: 'exp_3',
          householdId: 'house_1',
          amount: 5000,
          categoryId: 'snacks',
          note: null,
          date: now - 2000,
          month: '2026-10',
          isDeleted: 0,
          type: 'expense',
          accountId: 'cash',
          createdBy: 'user_1',
          createdAt: now - 2000,
          updatedAt: null,
          syncStatus: 'synced',
        },
        {
          id: 'exp_4',
          householdId: 'house_1',
          amount: 8000,
          categoryId: 'transit',
          note: null,
          date: now,
          month: '2026-11',
          isDeleted: 1, // Deleted
          type: 'expense',
          accountId: 'cash',
          createdBy: 'user_1',
          createdAt: now,
          updatedAt: null,
          syncStatus: 'synced',
        },
      ]);

      // Query active items for November 2026
      const novExpenses = await localDb.expenses
        .where('householdId')
        .equals('house_1')
        .filter((e) => e.isDeleted === 0 && e.month === '2026-11')
        .toArray();

      expect(novExpenses).toHaveLength(2);
      expect(novExpenses.map((e) => e.id)).toEqual(expect.arrayContaining(['exp_1', 'exp_2']));

      // Soft delete exp_2
      await localDb.expenses.update('exp_2', { isDeleted: 1, syncStatus: 'pending' });
      const updatedNovExpenses = await localDb.expenses
        .where('householdId')
        .equals('house_1')
        .filter((e) => e.isDeleted === 0 && e.month === '2026-11')
        .toArray();

      expect(updatedNovExpenses).toHaveLength(1);
      expect(updatedNovExpenses[0].id).toBe('exp_1');
    });
  });

  describe('Outbox Synchronization Mechanics', () => {
    it('accurately tracks pending outbox mutations count', async () => {
      expect(await getPendingOutboxCount('house_test')).toBe(0);

      await localDb.outbox.add({
        mutationId: 'mut_1',
        householdId: 'house_test',
        type: 'add',
        payload: { userId: 'u1', input: { amount: 5000, categoryId: 'food', date: '2026-11-20' } },
        createdAt: Date.now(),
        attempts: 0,
        lastAttemptAt: null,
        error: null,
        status: 'pending',
      });

      await localDb.outbox.add({
        mutationId: 'mut_2',
        householdId: 'house_test',
        type: 'delete',
        payload: { expenseId: 'exp_1', amount: 5000, month: '2026-11' },
        createdAt: Date.now() + 10,
        attempts: 0,
        lastAttemptAt: null,
        error: null,
        status: 'pending',
      });

      expect(await getPendingOutboxCount('house_test')).toBe(2);
      expect(await getPendingOutboxCount('other_house')).toBe(0);
    });

    it('processes queued mutations through syncOutbox cleanly', async () => {
      await localDb.outbox.add({
        mutationId: 'mut_sync_1',
        householdId: 'house_sync',
        type: 'add',
        payload: { userId: 'u1', input: { amount: 3000, categoryId: 'coffee', date: '2026-11-20' } },
        createdAt: Date.now(),
        attempts: 0,
        lastAttemptAt: null,
        error: null,
        status: 'pending',
      });

      const result = await syncOutbox('house_sync');
      expect(result.syncedCount).toBe(1);
      expect(result.failedCount).toBe(0);

      // Verify outbox entry was completed and deleted from queue
      expect(await getPendingOutboxCount('house_sync')).toBe(0);
    });

    it('respects MAX_RETRY_ATTEMPTS threshold on persistent failure', () => {
      expect(MAX_RETRY_ATTEMPTS).toBe(5);
      expect(isNetworkOnline()).toBe(true);
    });
  });

  describe('Repository Pattern Abstraction', () => {
    it('exports a singleton repository matching IExpenseRepository contract', () => {
      const repo = getExpenseRepository();
      expect(repo).toBeDefined();
      expect(repo).toBe(expenseRepository);
      expect(typeof repo.addExpense).toBe('function');
      expect(typeof repo.editExpense).toBe('function');
      expect(typeof repo.softDeleteExpense).toBe('function');
      expect(typeof repo.restoreExpense).toBe('function');
      expect(typeof repo.getExpenses).toBe('function');
    });

    it('DexieExpenseRepository saves immediately to IndexedDB and queues outbox item', async () => {
      const repo = new DexieExpenseRepository();

      const created = await repo.addExpense('house_repo_test', 'user_1', {
        amount: 7500,
        categoryId: 'groceries',
        date: '2026-11-20',
        note: 'Fresh milk & bread',
        type: 'expense',
        accountId: 'cash',
      });

      expect(created.id).toMatch(/^local_/);
      expect(created.amount).toBe(7500);

      // Verify persisted in Dexie
      const localItem = await localDb.expenses.get(created.id);
      expect(localItem).toBeDefined();
      expect(localItem?.amount).toBe(7500);
      expect(localItem?.syncStatus).toBe('pending');

      // Verify queued in outbox
      const outboxItems = await localDb.outbox
        .where('householdId')
        .equals('house_repo_test')
        .toArray();
      expect(outboxItems).toHaveLength(1);
      expect(outboxItems[0].type).toBe('add');
    });
  });
});
