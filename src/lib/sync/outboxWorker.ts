import { localDb, type OutboxMutationRecord } from '@/lib/db/dexie';
import {
  addExpense,
  editExpense,
  softDeleteExpense,
  restoreExpense,
} from '@/lib/expenses';
import type { OutboxSyncResult } from '@/lib/repositories/IExpenseRepository';
import { logger } from '@/lib/telemetry/logger';
import type { AddExpenseInput, EditExpenseInput } from '@/types/forms';

export const MAX_RETRY_ATTEMPTS = 5;

/**
 * Checks if the current runtime environment is connected to the network.
 */
export function isNetworkOnline(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
}

/**
 * Processes the queued mutations in the outbox in strict chronological order.
 * Ensures Change Data Capture (CDC) replication integrity between Dexie and Firestore.
 */
export async function syncOutbox(householdId: string): Promise<OutboxSyncResult> {
  if (!isNetworkOnline()) {
    return {
      syncedCount: 0,
      failedCount: 0,
      errors: ['Device is currently offline; synchronization deferred.'],
    };
  }

  const result: OutboxSyncResult = {
    syncedCount: 0,
    failedCount: 0,
    errors: [],
  };

  try {
    // Fetch pending or retryable mutations ordered chronologically
    const pendingMutations = await localDb.outbox
      .where('householdId')
      .equals(householdId)
      .filter((item) => item.status === 'pending' && item.attempts < MAX_RETRY_ATTEMPTS)
      .sortBy('createdAt');

    if (pendingMutations.length === 0) {
      return result;
    }

    for (const mutation of pendingMutations) {
      if (!mutation.id) continue;

      // Mark as processing
      await localDb.outbox.update(mutation.id, {
        status: 'processing',
        lastAttemptAt: Date.now(),
      });

      try {
        await executeMutation(mutation);

        // Mark as completed and delete from outbox queue to keep storage lightweight
        await localDb.outbox.delete(mutation.id);
        result.syncedCount += 1;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const newAttempts = mutation.attempts + 1;
        const finalStatus = newAttempts >= MAX_RETRY_ATTEMPTS ? 'failed' : 'pending';

        await localDb.outbox.update(mutation.id, {
          status: finalStatus,
          attempts: newAttempts,
          error: errorMsg,
        });

        result.failedCount += 1;
        result.errors.push(`Mutation ${mutation.mutationId} (${mutation.type}): ${errorMsg}`);

        logger.error('Outbox sync mutation failed', {
          mutationId: mutation.mutationId,
          type: mutation.type,
          attempts: newAttempts,
          error: errorMsg,
        });
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    result.errors.push(`Outbox processing failed: ${errorMsg}`);
    logger.error('Fatal outbox processing exception', { error: errorMsg });
  }

  return result;
}

/**
 * Executes a single outbox mutation against Firestore and updates local record status.
 */
async function executeMutation(mutation: OutboxMutationRecord): Promise<void> {
  const { householdId, type, payload } = mutation;

  switch (type) {
    case 'add': {
      const { userId, input, localId } = payload as {
        userId: string;
        input: AddExpenseInput;
        localId?: string;
      };

      const remoteExpense = await addExpense(householdId, userId, input);

      // If local item existed under a temporary ID, migrate or mark synced
      if (localId) {
        const existingLocal = await localDb.expenses.get(localId);
        if (existingLocal) {
          await localDb.expenses.delete(localId);
        }
        await localDb.expenses.put({
          id: remoteExpense.id,
          householdId,
          amount: remoteExpense.amount,
          categoryId: remoteExpense.categoryId,
          note: remoteExpense.note,
          date: remoteExpense.date.toMillis(),
          month: remoteExpense.month,
          isDeleted: 0,
          type: remoteExpense.type || 'expense',
          accountId: remoteExpense.accountId || 'cash',
          createdBy: remoteExpense.createdBy || userId,
          createdAt: remoteExpense.createdAt.toMillis(),
          updatedAt: null,
          syncStatus: 'synced',
        });
      }
      break;
    }

    case 'edit': {
      const {
        input,
        previousAmount,
        previousMonth,
        previousType,
        previousAccountId,
      } = payload as {
        input: EditExpenseInput;
        previousAmount: number;
        previousMonth: string;
        previousType?: 'expense' | 'income';
        previousAccountId?: string;
      };

      await editExpense(
        householdId,
        input,
        previousAmount,
        previousMonth,
        previousType,
        previousAccountId
      );

      const local = await localDb.expenses.get(input.id);
      if (local) {
        await localDb.expenses.update(input.id, { syncStatus: 'synced' });
      }
      break;
    }

    case 'delete': {
      const { expenseId, amount, month, expType, accountId } = payload as {
        expenseId: string;
        amount: number;
        month: string;
        expType?: 'expense' | 'income';
        accountId?: string;
      };

      await softDeleteExpense(
        householdId,
        expenseId,
        amount,
        month,
        expType,
        accountId
      );

      const local = await localDb.expenses.get(expenseId);
      if (local) {
        await localDb.expenses.update(expenseId, {
          isDeleted: 1,
          syncStatus: 'synced',
        });
      }
      break;
    }

    case 'restore': {
      const { expenseId, amount, month, expType, accountId } = payload as {
        expenseId: string;
        amount: number;
        month: string;
        expType?: 'expense' | 'income';
        accountId?: string;
      };

      await restoreExpense(
        householdId,
        expenseId,
        amount,
        month,
        expType,
        accountId
      );

      const local = await localDb.expenses.get(expenseId);
      if (local) {
        await localDb.expenses.update(expenseId, {
          isDeleted: 0,
          syncStatus: 'synced',
        });
      }
      break;
    }

    default:
      throw new Error(`Unknown outbox mutation type: ${type}`);
  }
}

/**
 * Returns the count of pending outbox items awaiting sync for a household.
 */
export async function getPendingOutboxCount(householdId: string): Promise<number> {
  try {
    return await localDb.outbox
      .where('householdId')
      .equals(householdId)
      .filter((m) => m.status === 'pending' || m.status === 'processing')
      .count();
  } catch {
    return 0;
  }
}

/**
 * Subscribes to browser online events and visibility changes to flush outbox mutations.
 * Returns an unsubscription callback to prevent memory leaks.
 */
export function startOutboxSyncListener(householdId: string): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const triggerSync = () => {
    if (isNetworkOnline()) {
      syncOutbox(householdId).catch((err) => {
        logger.error('Background outbox trigger failed', { error: String(err) });
      });
    }
  };

  window.addEventListener('online', triggerSync);
  document.addEventListener('visibilitychange', triggerSync);

  // Periodic heartbeat sync every 45 seconds
  const intervalId = window.setInterval(triggerSync, 45_000);

  // Initial trigger if online
  triggerSync();

  return () => {
    window.removeEventListener('online', triggerSync);
    document.removeEventListener('visibilitychange', triggerSync);
    window.clearInterval(intervalId);
  };
}
