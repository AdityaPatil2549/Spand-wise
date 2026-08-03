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
    type: input.type,
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
  
  // Aggregate budget differently based on transaction type
  const budgetUpdate: Record<string, any> = {
    id: month,
    updatedAt: serverTimestamp(),
  };
  
  if (input.type === 'income') {
    budgetUpdate.totalIncome = increment(input.amount);
  } else {
    budgetUpdate.totalSpent = increment(input.amount);
  }

  batch.set(budgetRef, budgetUpdate, { merge: true });
  await batch.commit();

 return { ...expenseData, id: expenseRef.id } as ExpenseDocument;
};

/**
 * Edit an existing expense.
 * Calculates the delta between old and new amounts to correctly update totalSpent or totalIncome.
 */
export const editExpense = async (
  householdId: string,
  input: EditExpenseInput,
  previousAmount: number,
  previousType?: 'expense' | 'income' // Need to know if they changed it from expense to income
): Promise<void> => {
  const month = input.date.slice(0, 7);
  const expenseRef = expenseDocRef(householdId, input.id);
  const budgetRef = budgetDocRef(householdId, month);
  
  // Default to expense if old records don't have type
  const oldType = previousType || 'expense';
  const newType = input.type;

  const batch = writeBatch(db);
  batch.update(expenseRef, {
    type: input.type,
    amount: input.amount,
    categoryId: input.categoryId,
    note: input.note?.trim() || null,
    date: Timestamp.fromDate(new Date(input.date)),
    month,
    updatedAt: serverTimestamp(),
  });

  const budgetUpdate: Record<string, any> = { updatedAt: serverTimestamp() };
  
  if (oldType === newType) {
    const amountDelta = input.amount - previousAmount;
    if (amountDelta !== 0) {
      if (newType === 'income') budgetUpdate.totalIncome = increment(amountDelta);
      else budgetUpdate.totalSpent = increment(amountDelta);
      batch.set(budgetRef, budgetUpdate, { merge: true });
    }
  } else {
    // Type changed! Remove from old bucket, add to new bucket
    if (oldType === 'income') budgetUpdate.totalIncome = increment(-previousAmount);
    else budgetUpdate.totalSpent = increment(-previousAmount);
    
    if (newType === 'income') budgetUpdate.totalIncome = budgetUpdate.totalIncome ? increment(-previousAmount + input.amount) : increment(input.amount); // Firebase JS SDK doesn't allow double increments on the same field in a single set, but they are different fields here
    else budgetUpdate.totalSpent = budgetUpdate.totalSpent ? increment(-previousAmount + input.amount) : increment(input.amount);
    
    batch.set(budgetRef, {
        ...budgetUpdate,
        ...(oldType === 'income' ? { totalIncome: increment(-previousAmount) } : { totalSpent: increment(-previousAmount) }),
        ...(newType === 'income' ? { totalIncome: increment(input.amount) } : { totalSpent: increment(input.amount) })
    }, { merge: true });
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
  month: string,
  type: 'expense' | 'income' = 'expense'
): Promise<void> => {
  const expenseRef = expenseDocRef(householdId, expenseId);
  const budgetRef = budgetDocRef(householdId, month);

  const batch = writeBatch(db);
  batch.update(expenseRef, {
    isDeleted: true,
    updatedAt: serverTimestamp(),
  });
  
  const budgetUpdate: Record<string, any> = { updatedAt: serverTimestamp() };
  if (type === 'income') {
    budgetUpdate.totalIncome = increment(-amount);
  } else {
    budgetUpdate.totalSpent = increment(-amount);
  }
  
  batch.set(budgetRef, budgetUpdate, { merge: true });
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
  month: string,
  type: 'expense' | 'income' = 'expense'
): Promise<void> => {
  const expenseRef = expenseDocRef(householdId, expenseId);
  const budgetRef = budgetDocRef(householdId, month);

  const batch = writeBatch(db);
  batch.update(expenseRef, {
    isDeleted: false,
    updatedAt: serverTimestamp(),
  });
  
  const budgetUpdate: Record<string, any> = { updatedAt: serverTimestamp() };
  if (type === 'income') {
    budgetUpdate.totalIncome = increment(amount);
  } else {
    budgetUpdate.totalSpent = increment(amount);
  }
  
  batch.set(budgetRef, budgetUpdate, { merge: true });
  await batch.commit();
};

/**
 * Fetch all non-deleted expenses for a given month.
 * Ordered by date descending (most recent first).
 */
export const getMonthlyExpenses = async (
 householdId: string,
 month: string
): Promise<ExpenseDocument[]> => {
 const q = query(
 expensesColRef(householdId),
 where('month', '==', month),
 where('isDeleted', '==', false),
 orderBy('date', 'desc'),
 limit(EXPENSES_PAGE_SIZE)
 );
 const snap = await getDocs(q);
 return snap.docs.map((d) => ({ ...d.data(), id: d.id } as ExpenseDocument));
};
