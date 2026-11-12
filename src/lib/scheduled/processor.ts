import { Timestamp } from 'firebase/firestore';
import type { ScheduledTransactionDocument, ExpenseDocument } from '@/types/firestore';
import { addExpense } from '../expenses/index';
import { computeNextDueDate, updateScheduledTransaction } from './index';
import { getLocalMonthString } from '../date-sharding';
import { isBefore, isEqual } from 'date-fns';

/**
 * Checks all scheduled transactions and processes any that are due.
 * Creates the expenses and advances nextDueDate (or deactivates one-time bills).
 */
export async function processScheduledTransactions(
  householdId: string,
  userId: string,
  scheduledTransactions: ScheduledTransactionDocument[],
  addExpenseOptimistic: (e: ExpenseDocument) => void,
  updateScheduledOptimistic: (t: ScheduledTransactionDocument) => void
) {
  const now = new Date();

  for (const st of scheduledTransactions) {
    if (!st.isActive) continue;

    let dueDate = st.nextDueDate.toDate();
    let updated = false;
    let shouldDeactivate = false;
    let iterations = 0;

    // Guard against runaway catch-up loops
    while ((isBefore(dueDate, now) || isEqual(dueDate, now)) && iterations < 24) {
      iterations += 1;
      const expenseDate = Timestamp.fromDate(dueDate);
      const tempId = `scheduled-${st.id}-${Date.now()}-${iterations}`;

      const newExpenseData = {
        amount: st.amount,
        categoryId: st.categoryId,
        note: st.note ? `${st.note} (Auto-Scheduled)` : '(Auto-Scheduled)',
        date: expenseDate,
        accountId: st.accountId || 'bank',
      };

      addExpenseOptimistic({
        id: tempId,
        ...newExpenseData,
        month: getLocalMonthString(dueDate),
        isDeleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      });

      await addExpense(householdId, userId, {
        ...newExpenseData,
        date: expenseDate.toDate().toISOString(),
      });

      updated = true;

      if (st.frequency === 'one-time') {
        shouldDeactivate = true;
        break;
      }

      const nextDate = computeNextDueDate(dueDate, st.frequency);
      if (nextDate.getTime() <= dueDate.getTime()) break;
      dueDate = nextDate;
    }

    if (updated) {
      const newDueDateTimestamp = Timestamp.fromDate(dueDate);
      const updatedSt: ScheduledTransactionDocument = {
        ...st,
        nextDueDate: newDueDateTimestamp,
        isActive: shouldDeactivate ? false : st.isActive,
      };

      updateScheduledOptimistic(updatedSt);
      await updateScheduledTransaction(householdId, st.id, {
        nextDueDate: newDueDateTimestamp,
        ...(shouldDeactivate ? { isActive: false } : {}),
      });
    }
  }
}
