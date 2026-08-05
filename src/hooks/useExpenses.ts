'use client';

import { useEffect, useRef } from 'react';
import { query, where, orderBy, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
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
export const useExpensesListener = (householdId: string | null, months: string[]): void => {
  const { setExpenses, setExpensesLoading } = useStore();
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!householdId || months.length === 0) {
      setExpenses([]);
      setExpensesLoading(false);
      return;
    }

    setExpensesLoading(true);

    // 1. Kill orphaned listeners before spawning a new connection
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Firestore 'in' queries support up to 10 elements
    const queryMonths = months.slice(0, 10);
    const uniqueMonths = Array.from(new Set(queryMonths)).sort();

    const q = query(
      expensesColRef(householdId),
      where('month', 'in', uniqueMonths)
    );

    unsubscribeRef.current = onSnapshot(
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
          .slice(0, EXPENSES_PAGE_SIZE * uniqueMonths.length); // Increase limit based on months loaded
        
        setExpenses(expenses);
        setExpensesLoading(false);
      },
      (error) => {
        console.error('[useExpensesListener]', error);
        setExpensesLoading(false);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [householdId, months.join(','), setExpenses, setExpensesLoading]);
};
