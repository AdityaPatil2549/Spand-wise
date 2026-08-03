import {
 getDoc,
 setDoc,
 serverTimestamp,
 Timestamp,
 increment,
} from 'firebase/firestore';
import { budgetDocRef } from '@/lib/firebase/firestore';
import { getCurrentMonth } from '@/lib/utils/date';
import type { BudgetDocument } from '@/types/firestore';

/**
 * Get the budget document for a specific month.
 * Returns null if no budget has been set for that month.
 */
export const getBudget = async (
 householdId: string,
 month: string
): Promise<BudgetDocument | null> => {
 const snap = await getDoc(budgetDocRef(householdId, month));
 if (!snap.exists()) return null;
 return { ...snap.data(), id: snap.id } as BudgetDocument;
};

/**
 * Get or create the budget document for the current month.
 * If no budget exists, creates one with 0 budgetAmount (triggers onboarding prompt).
 */
export const getOrCreateCurrentBudget = async (
 householdId: string
): Promise<BudgetDocument> => {
 const month = getCurrentMonth();
 const ref = budgetDocRef(householdId, month);
 const snap = await getDoc(ref);

 if (snap.exists()) {
 return { ...snap.data(), id: snap.id } as BudgetDocument;
 }

 // Create a new budget doc for the current month with 0 amount
 const newBudget: Omit<BudgetDocument, 'id'> = {
 budgetAmount: 0,
 totalSpent: 0,
 createdAt: serverTimestamp() as Timestamp,
 updatedAt: serverTimestamp() as Timestamp,
 };
 await setDoc(ref, newBudget);
 return { ...newBudget, id: month };
};

export const setBudgetAmount = async (
 householdId: string,
 budgetAmount: number,
 month?: string
): Promise<void> => {
 const targetMonth = month ?? getCurrentMonth();
 const ref = budgetDocRef(householdId, targetMonth);
 await setDoc(
 ref,
 {
 id: targetMonth,
 budgetAmount,
 totalSpent: increment(0) as unknown as number, // Cast to number to satisfy types
 updatedAt: serverTimestamp(),
 },
 { merge: true }
 );
};

/**
 * Set a specific budget allowance for a category in a given month.
 */
export const setCategoryBudget = async (
 householdId: string,
 categoryId: string,
 amount: number,
 month?: string
): Promise<void> => {
 const targetMonth = month ?? getCurrentMonth();
 const ref = budgetDocRef(householdId, targetMonth);
 await setDoc(
 ref,
 {
 id: targetMonth,
 categoryBudgets: {
 [categoryId]: amount
 },
 updatedAt: serverTimestamp(),
 },
 { merge: true }
 );
};

/**
 * Fetch budget documents for multiple months in parallel.
 * Useful for analytics charts. Returns an array of budgets.
 * If a budget doesn't exist for a month, it will not be included in the returned array.
 */
export const getMultipleBudgets = async (
 householdId: string,
 months: string[]
): Promise<BudgetDocument[]> => {
 if (months.length === 0) return [];
 
 // Use parallel getDoc calls instead of 'in' query since we know exact doc IDs
 // and we don't need an index.
 const promises = months.map(month => getDoc(budgetDocRef(householdId, month)));
 const snaps = await Promise.all(promises);
 
 return snaps
 .filter(snap => snap.exists())
 .map(snap => ({ ...snap.data(), id: snap.id } as BudgetDocument));
};

