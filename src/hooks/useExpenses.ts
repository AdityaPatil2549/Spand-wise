'use client';

import { useEffect } from 'react';
import { query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { expensesColRef } from '@/lib/firebase/firestore';
import { useStore } from '@/store';
import { EXPENSES_PAGE_SIZE } from '@/config/constants';
import type { ExpenseDocument } from '@/types/firestore';

/**
 * useExpensesListener — Real-time Firestore listener for expenses.
 * Subscribes to non-deleted expenses for the selected month.
 * Automatically re-subscribes when userId or month changes.
 * Must call unsubscribe on cleanup to prevent memory leaks.
 */
export const useExpensesListener = (householdId: string | null, month: string): void => {
 const { setExpenses, setExpensesLoading } = useStore();

 useEffect(() => {
 if (!householdId) {
 setExpenses([]);
 setExpensesLoading(false);
 return;
 }

 setExpensesLoading(true);

 const q = query(
 expensesColRef(householdId),
 where('month', '==', month)
 // Removed isDeleted and orderBy from query to avoid requiring a composite index.
 // We handle filtering and sorting locally instead.
 );

 const unsubscribe = onSnapshot(
 q,
 (snap) => {
 let expenses: ExpenseDocument[] = snap.docs.map((d) => ({
 ...d.data(),
 id: d.id,
 } as ExpenseDocument));
 
 // Local filtering and sorting
 expenses = expenses
 .filter(e => !e.isDeleted)
 .sort((a, b) => b.date.toMillis() - a.date.toMillis())
 .slice(0, EXPENSES_PAGE_SIZE);
 
 setExpenses(expenses);
 setExpensesLoading(false);
 },
 (error) => {
 console.error('[useExpensesListener]', error);
 setExpensesLoading(false);
 }
 );

 return () => unsubscribe();
 }, [householdId, month, setExpenses, setExpensesLoading]);
};
