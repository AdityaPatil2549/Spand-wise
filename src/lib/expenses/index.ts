import {
 writeBatch,
 doc,
 serverTimestamp,
 increment,
 Timestamp,
 query,
 where,
 orderBy,
 limit,
 getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/index';
import { expensesColRef, expenseDocRef, budgetDocRef } from '@/lib/firebase/firestore';
import type { ExpenseDocument } from '@/types/firestore';
import type { AddExpenseInput, EditExpenseInput } from '@/types/forms';
import { EXPENSES_PAGE_SIZE } from '@/config/constants';

/**
 * Add a new expense and atomically update the budget total and account balance.
 * Uses writeBatch to guarantee consistency — either both writes succeed, or neither does.
 */
export const addExpense = async (
  householdId: string,
  userId: string,
  input: AddExpenseInput
): Promise<ExpenseDocument> => {
  const month = input.date.slice(0, 7); // "YYYY-MM"
  const expenseRef = doc(expensesColRef(householdId));
  const budgetRef = budgetDocRef(householdId, month);
  const accountId = input.accountId || 'cash';
  const accountRef = doc(db, 'households', householdId, 'accounts', accountId);

  const isIncome = input.type === 'income';

  const expenseData: Omit<ExpenseDocument, 'id'> = {
    amount: input.amount,
    categoryId: input.categoryId,
    note: input.note?.trim() || null,
    date: Timestamp.fromDate(new Date(input.date)),
    month,
    isDeleted: false,
    type: input.type || 'expense',
    createdAt: serverTimestamp() as Timestamp,
    createdBy: userId,
    accountId,
  };

  const batch = writeBatch(db);
  batch.set(expenseRef, expenseData);
  
  const budgetUpdate = isIncome 
    ? { totalIncome: increment(input.amount), updatedAt: serverTimestamp() }
    : { totalSpent: increment(input.amount), updatedAt: serverTimestamp() };

  batch.set(
    budgetRef,
    { id: month, ...budgetUpdate },
    { merge: true }
  );

  const balanceChange = isIncome ? input.amount : -input.amount;
  batch.set(accountRef, { balance: increment(balanceChange) }, { merge: true });

  await batch.commit();

  return { ...expenseData, id: expenseRef.id } as ExpenseDocument;
};

/**
 * Edit an existing expense.
 * Calculates the delta between old and new amounts to correctly update totalSpent and account balance.
 */
export const editExpense = async (
  householdId: string,
  input: EditExpenseInput,
  previousAmount: number,
  previousMonth: string,
  previousType: 'expense' | 'income' = 'expense',
  previousAccountId: string = 'cash'
): Promise<void> => {
  const newMonth = input.date.slice(0, 7);
  const newType = input.type || 'expense';
  const newAccountId = input.accountId || 'cash';
  const expenseRef = expenseDocRef(householdId, input.id);
  const batch = writeBatch(db);

  batch.update(expenseRef, {
    amount: input.amount,
    categoryId: input.categoryId,
    note: input.note?.trim() || null,
    date: Timestamp.fromDate(new Date(input.date)),
    month: newMonth,
    type: newType,
    updatedAt: serverTimestamp(),
    accountId: newAccountId,
  });

  const isOldIncome = previousType === 'income';
  const isNewIncome = newType === 'income';

  if (newMonth !== previousMonth) {
    // If the month changed, remove the old amount from the old month, and add the new amount to the new month
    const oldBudgetRef = budgetDocRef(householdId, previousMonth);
    const newBudgetRef = budgetDocRef(householdId, newMonth);
    
    batch.set(
      oldBudgetRef,
      isOldIncome ? { totalIncome: increment(-previousAmount), updatedAt: serverTimestamp() } : { totalSpent: increment(-previousAmount), updatedAt: serverTimestamp() },
      { merge: true }
    );
    
    batch.set(
      newBudgetRef,
      isNewIncome ? { totalIncome: increment(input.amount), updatedAt: serverTimestamp() } : { totalSpent: increment(input.amount), updatedAt: serverTimestamp() },
      { merge: true }
    );
  } else {
    // If the month is the same, check if the type changed
    if (previousType !== newType) {
      // Type switched! Remove from old type, add to new type
      const budgetRef = budgetDocRef(householdId, newMonth);
      batch.set(
        budgetRef,
        isOldIncome 
          ? { totalIncome: increment(-previousAmount), totalSpent: increment(input.amount), updatedAt: serverTimestamp() }
          : { totalSpent: increment(-previousAmount), totalIncome: increment(input.amount), updatedAt: serverTimestamp() },
        { merge: true }
      );
    } else {
      // Same month, same type. Just apply the delta
      const amountDelta = input.amount - previousAmount;
      if (amountDelta !== 0) {
        const budgetRef = budgetDocRef(householdId, newMonth);
        batch.set(
          budgetRef,
          isNewIncome
            ? { totalIncome: increment(amountDelta), updatedAt: serverTimestamp() }
            : { totalSpent: increment(amountDelta), updatedAt: serverTimestamp() },
          { merge: true }
        );
      }
    }
  }

  const oldAccountRef = doc(db, 'households', householdId, 'accounts', previousAccountId);
  const newAccountRef = doc(db, 'households', householdId, 'accounts', newAccountId);

  const oldBalanceChange = isOldIncome ? -previousAmount : previousAmount;

  if (previousAccountId !== newAccountId) {
    batch.set(oldAccountRef, { balance: increment(oldBalanceChange) }, { merge: true });
    const newBalanceChange = isNewIncome ? input.amount : -input.amount;
    batch.set(newAccountRef, { balance: increment(newBalanceChange) }, { merge: true });
  } else {
    const newBalanceChange = isNewIncome ? input.amount : -input.amount;
    const netChange = oldBalanceChange + newBalanceChange;
    if (netChange !== 0) {
      batch.set(oldAccountRef, { balance: increment(netChange) }, { merge: true });
    }
  }

  await batch.commit();
};

/**
 * Soft-delete an expense (sets isDeleted: true) and reverses budget and account totals.
 * Never hard-deletes documents per the codebase soft-delete policy.
 */
export const softDeleteExpense = async (
  householdId: string,
  expenseId: string,
  amount: number,
  month: string,
  type: 'expense' | 'income' = 'expense',
  accountId: string = 'cash'
): Promise<void> => {
  const expenseRef = expenseDocRef(householdId, expenseId);
  const budgetRef = budgetDocRef(householdId, month);
  const accountRef = doc(db, 'households', householdId, 'accounts', accountId);

  const batch = writeBatch(db);
  batch.update(expenseRef, {
    isDeleted: true,
    updatedAt: serverTimestamp(),
  });
  
  const budgetUpdate = type === 'income' 
    ? { totalIncome: increment(-amount), updatedAt: serverTimestamp() }
    : { totalSpent: increment(-amount), updatedAt: serverTimestamp() };

  batch.set(
    budgetRef,
    budgetUpdate,
    { merge: true }
  );

  // Reverse account balance
  const balanceChange = type === 'income' ? -amount : amount;
  batch.set(accountRef, { balance: increment(balanceChange) }, { merge: true });

  await batch.commit();
};

/**
 * Restore a soft-deleted expense (undo delete).
 * Re-adds the amount to the budget total and account balance.
 */
export const restoreExpense = async (
  householdId: string,
  expenseId: string,
  amount: number,
  month: string,
  type: 'expense' | 'income' = 'expense',
  accountId: string = 'cash'
): Promise<void> => {
  const expenseRef = expenseDocRef(householdId, expenseId);
  const budgetRef = budgetDocRef(householdId, month);
  const accountRef = doc(db, 'households', householdId, 'accounts', accountId);

  const batch = writeBatch(db);
  batch.update(expenseRef, {
    isDeleted: false,
    updatedAt: serverTimestamp(),
  });

  const budgetUpdate = type === 'income'
    ? { totalIncome: increment(amount), updatedAt: serverTimestamp() }
    : { totalSpent: increment(amount), updatedAt: serverTimestamp() };

  batch.set(
    budgetRef,
    budgetUpdate,
    { merge: true }
  );

  // Restore account balance
  const balanceChange = type === 'income' ? amount : -amount;
  batch.set(accountRef, { balance: increment(balanceChange) }, { merge: true });

  await batch.commit();
};

/**
 * Fetch all non-deleted expenses for a given month.
 * Ordered by date descending (most recent first).
 */
export const getMonthlyExpenses = async (
  householdId: string,
  month: string,
  signal?: AbortSignal
): Promise<ExpenseDocument[]> => {
  const q = query(
    expensesColRef(householdId),
    where('month', '==', month),
    where('isDeleted', '==', false),
    orderBy('date', 'desc'),
    limit(EXPENSES_PAGE_SIZE)
  );
  
  const snap = await getDocs(q);
  
  // Throw abort error if the request was cancelled during fetch
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
  
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as ExpenseDocument));
};

/**
 * Fetch all non-deleted expenses for a specific date range.
 * Does not limit by EXPENSES_PAGE_SIZE as it's used for exporting reports.
 */
export const getExpensesByDateRange = async (
  householdId: string,
  startDate: Date,
  endDate: Date
): Promise<ExpenseDocument[]> => {
  // Generate an array of "YYYY-MM" strings for the date range
  const months: string[] = [];
  const currentDate = new Date(startDate);
  // Reset to first of month to avoid skipping months
  currentDate.setDate(1);
  
  while (currentDate <= endDate || 
        (currentDate.getFullYear() === endDate.getFullYear() && currentDate.getMonth() === endDate.getMonth())) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Fetch each month using the simplest possible query to avoid composite index requirements
  const promises = months.map(async (monthStr) => {
    const q = query(
      expensesColRef(householdId),
      where('month', '==', monthStr)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as ExpenseDocument));
  });

  const results = await Promise.all(promises);
  let allExpenses = results.flat();
  
  // Filter out deleted items and strictly match the start/end dates
  allExpenses = allExpenses.filter(e => {
    if (e.isDeleted) return false;
    const expDate = e.date.toDate();
    return expDate >= startDate && expDate <= endDate;
  });

  // Sort by date descending
  return allExpenses.sort((a, b) => b.date.toMillis() - a.date.toMillis());
};
