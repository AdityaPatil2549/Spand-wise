import Dexie, { type Table, type DexieOptions } from 'dexie';
import { Timestamp } from 'firebase/firestore';
import type { ExpenseDocument } from '@/types/firestore';

export type SyncStatus = 'synced' | 'pending' | 'failed';

export interface LocalExpenseRecord {
  id: string;
  householdId: string;
  amount: number;
  categoryId: string;
  note: string | null;
  date: number; // epoch ms
  month: string; // YYYY-MM
  isDeleted: number; // 0 for false, 1 for true
  type: 'expense' | 'income';
  accountId: string;
  createdBy: string;
  createdAt: number; // epoch ms
  updatedAt: number | null;
  syncStatus: SyncStatus;
}

export interface OutboxMutationRecord {
  id?: number;
  mutationId: string;
  householdId: string;
  type: 'add' | 'edit' | 'delete' | 'restore';
  payload: Record<string, unknown>;
  createdAt: number;
  attempts: number;
  lastAttemptAt: number | null;
  error: string | null;
  status: 'pending' | 'processing' | 'failed' | 'completed';
}

/**
 * SpendWise Local IndexedDB Schema (Dexie.js v4)
 * Provides 0ms local-first persistence, compound queries, and mutation outbox queuing.
 */
export class SpendWiseLocalDB extends Dexie {
  expenses!: Table<LocalExpenseRecord, string>;
  outbox!: Table<OutboxMutationRecord, number>;

  constructor(options?: DexieOptions) {
    super('SpendWiseLocalDB', options);

    this.version(1).stores({
      expenses: 'id, householdId, month, isDeleted, date, syncStatus, [householdId+month], [householdId+isDeleted]',
      outbox: '++id, mutationId, householdId, status, createdAt, [householdId+status]',
    });
  }
}

/**
 * Converts a Firestore ExpenseDocument into a Dexie LocalExpenseRecord.
 */
export function toLocalExpense(
  doc: ExpenseDocument,
  syncStatus: SyncStatus = 'synced'
): LocalExpenseRecord {
  const dateMs = doc.date?.toMillis ? doc.date.toMillis() : new Date(doc.date as unknown as string).getTime();
  const createdAtMs = doc.createdAt?.toMillis
    ? doc.createdAt.toMillis()
    : Date.now();
  const updatedAtMs = doc.updatedAt?.toMillis ? doc.updatedAt.toMillis() : null;

  return {
    id: doc.id,
    householdId: doc.householdId || '',
    amount: doc.amount,
    categoryId: doc.categoryId,
    note: doc.note || null,
    date: dateMs,
    month: doc.month,
    isDeleted: doc.isDeleted ? 1 : 0,
    type: doc.type || 'expense',
    accountId: doc.accountId || 'cash',
    createdBy: doc.createdBy || '',
    createdAt: createdAtMs,
    updatedAt: updatedAtMs,
    syncStatus,
  };
}

/**
 * Converts a Dexie LocalExpenseRecord back into an application-standard ExpenseDocument.
 */
export function toExpenseDocument(record: LocalExpenseRecord): ExpenseDocument {
  return {
    id: record.id,
    amount: record.amount,
    categoryId: record.categoryId,
    note: record.note,
    date: Timestamp.fromMillis(record.date),
    month: record.month,
    isDeleted: record.isDeleted === 1,
    type: record.type,
    accountId: record.accountId,
    createdBy: record.createdBy,
    createdAt: Timestamp.fromMillis(record.createdAt),
    updatedAt: record.updatedAt ? Timestamp.fromMillis(record.updatedAt) : undefined,
    householdId: record.householdId,
  };
}

let localDbInstance: SpendWiseLocalDB | null = null;

export function getLocalDb(): SpendWiseLocalDB {
  if (!localDbInstance) {
    if (typeof window === 'undefined' && typeof indexedDB === 'undefined') {
      try {
        // Fallback for Node.js / test execution environments
        const fakeIndexedDB = Function('return require("fake-indexeddb")')();
        const fakeIDBKeyRange = Function('return require("fake-indexeddb/lib/FDBKeyRange")')();
        localDbInstance = new SpendWiseLocalDB({
          indexedDB: fakeIndexedDB.indexedDB || fakeIndexedDB,
          IDBKeyRange: fakeIDBKeyRange.IDBKeyRange || fakeIDBKeyRange,
        });
      } catch {
        localDbInstance = new SpendWiseLocalDB();
      }
    } else {
      localDbInstance = new SpendWiseLocalDB();
    }
  }
  return localDbInstance;
}

/**
 * Lazy proxy singleton providing ergonomic `localDb.expenses...` access
 * without SSR or environment instantiation snags.
 */
export const localDb = new Proxy({} as SpendWiseLocalDB, {
  get(_target, prop: string | symbol) {
    const db = getLocalDb();
    const val = (db as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === 'function') {
      return (val as (...args: unknown[]) => unknown).bind(db);
    }
    return val;
  },
});
