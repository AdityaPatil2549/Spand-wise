import { Timestamp } from 'firebase/firestore';
import type { ScheduledTransactionDocument, ExpenseDocument } from '@/types/firestore';
import { addExpense } from '../expenses/index';
import { updateScheduledTransaction } from './index';
import { getLocalMonthString } from '../date-sharding';
import { addMonths, addWeeks, addYears, addDays, isBefore, isEqual } from 'date-fns';

/**
 * Checks all scheduled transactions and processes any that are due.
 * Creates the expenses and updates the nextDueDate of the scheduled transaction.
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
    
    // Process all missed occurrences if they are in the past
    while (isBefore(dueDate, now) || isEqual(dueDate, now)) {
      // 1. Create the expense for this occurrence
      const expenseDate = Timestamp.fromDate(dueDate);
      const tempId = `scheduled-${st.id}-${Date.now()}`;
      
      const newExpenseData = {
        amount: st.amount,
        categoryId: st.categoryId,
        note: st.note ? `${st.note} (Auto-Scheduled)` : '(Auto-Scheduled)',
        date: expenseDate,
        accountId: st.accountId || 'bank',
      };
      
      // Optimistic Expense
      addExpenseOptimistic({
        id: tempId,
        ...newExpenseData,
        month: getLocalMonthString(dueDate),
        isDeleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      });
      
      // Persist Expense (we omit await here to run in background or we can await)
      await addExpense(householdId, userId, {
        ...newExpenseData,
        date: expenseDate.toDate().toISOString(),
      });

      // 2. Advance the due date
      if (st.frequency === 'daily') dueDate = addDays(dueDate, 1);
      else if (st.frequency === 'weekly') dueDate = addWeeks(dueDate, 1);
      else if (st.frequency === 'monthly') dueDate = addMonths(dueDate, 1);
      else if (st.frequency === 'yearly') dueDate = addYears(dueDate, 1);
      
      updated = true;
    }

    if (updated) {
      // 3. Save the new due date
      const newDueDateTimestamp = Timestamp.fromDate(dueDate);
      const updatedSt = { ...st, nextDueDate: newDueDateTimestamp };
      
      updateScheduledOptimistic(updatedSt);
      await updateScheduledTransaction(householdId, st.id, { nextDueDate: newDueDateTimestamp });
    }
  }
}
