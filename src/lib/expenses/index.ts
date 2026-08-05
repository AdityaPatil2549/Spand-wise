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
 * Add a new expense and atomically update the budget total.
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

 const expenseData: Omit<ExpenseDocument, 'id'> = {
 amount: input.amount,
 categoryId: input.categoryId,
 note: input.note?.trim() || null,
 date: Timestamp.fromDate(new Date(input.date)),
 month,
 isDeleted: false,
 createdAt: serverTimestamp() as Timestamp,
 createdBy: userId,
 };

 const batch = writeBatch(db);
 batch.set(expenseRef, expenseData);
 batch.set(
 budgetRef,
 {
 id: month,
 totalSpent: increment(input.amount),
 updatedAt: serverTimestamp(),
 },
 { merge: true }
 );
 await batch.commit();

 return { ...expenseData, id: expenseRef.id } as ExpenseDocument;
};

/**
 * Edit an existing expense.
 * Calculates the delta between old and new amounts to correctly update totalSpent.
 */
export const editExpense = async (
  householdId: string,
  input: EditExpenseInput,
  previousAmount: number,
  previousMonth: string
): Promise<void> => {
  const newMonth = input.date.slice(0, 7);
  const expenseRef = expenseDocRef(householdId, input.id);
  const batch = writeBatch(db);

  batch.update(expenseRef, {
    amount: input.amount,
    categoryId: input.categoryId,
    note: input.note?.trim() || null,
    date: Timestamp.fromDate(new Date(input.date)),
    month: newMonth,
    updatedAt: serverTimestamp(),
  });

  if (newMonth !== previousMonth) {
    // If the month changed, remove the old amount from the old month, and add the new amount to the new month
    const oldBudgetRef = budgetDocRef(householdId, previousMonth);
    const newBudgetRef = budgetDocRef(householdId, newMonth);
    
    batch.set(
      oldBudgetRef,
      { totalSpent: increment(-previousAmount), updatedAt: serverTimestamp() },
      { merge: true }
    );
    
    batch.set(
      newBudgetRef,
      { totalSpent: increment(input.amount), updatedAt: serverTimestamp() },
      { merge: true }
    );
  } else {
    // If the month is the same, just apply the delta to the current month
    const amountDelta = input.amount - previousAmount;
    if (amountDelta !== 0) {
      const budgetRef = budgetDocRef(householdId, newMonth);
      batch.set(
        budgetRef,
        { totalSpent: increment(amountDelta), updatedAt: serverTimestamp() },
        { merge: true }
      );
    }
  }

  await batch.commit();
};

/**
 * Soft-delete an expense (sets isDeleted: true) and reduces the budget total.
 * Never hard-deletes documents per the codebase soft-delete policy.
 */
export const softDeleteExpense = async (
 householdId: string,
 expenseId: string,
 amount: number,
 month: string
): Promise<void> => {
 const expenseRef = expenseDocRef(householdId, expenseId);
 const budgetRef = budgetDocRef(householdId, month);

 const batch = writeBatch(db);
 batch.update(expenseRef, {
 isDeleted: true,
 updatedAt: serverTimestamp(),
 });
 batch.set(
 budgetRef,
 {
 totalSpent: increment(-amount),
 updatedAt: serverTimestamp(),
 },
 { merge: true }
 );
 await batch.commit();
};

/**
 * Restore a soft-deleted expense (undo delete).
 * Re-adds the amount to the budget total.
 */
export const restoreExpense = async (
 householdId: string,
 expenseId: string,
 amount: number,
 month: string
): Promise<void> => {
 const expenseRef = expenseDocRef(householdId, expenseId);
 const budgetRef = budgetDocRef(householdId, month);

 const batch = writeBatch(db);
 batch.update(expenseRef, {
 isDeleted: false,
 updatedAt: serverTimestamp(),
 });
 batch.set(
 budgetRef,
 {
 totalSpent: increment(amount),
 updatedAt: serverTimestamp(),
 },
 { merge: true }
 );
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
