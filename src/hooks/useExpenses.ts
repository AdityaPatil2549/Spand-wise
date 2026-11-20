'use client';

import { useEffect, useRef } from 'react';
import { query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { expensesColRef } from '@/lib/firebase/firestore';
import { useStore } from '@/store';
import { EXPENSES_PAGE_SIZE } from '@/config/constants';
import type { ExpenseDocument } from '@/types/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { getExpensesQueryKey } from '@/hooks/queries/useExpensesQuery';

/**
 * useExpensesListener — Real-time Firestore listener for expenses.
 * Subscribes to non-deleted expenses for the selected month.
 * Automatically synchronizes with TanStack Query cache AND Zustand store.
 * Automatically re-subscribes when userId or month changes.
 * Must call unsubscribe on cleanup to prevent memory leaks.
 */
export const useExpensesListener = (householdId: string | null, months: string[]): void => {
  const { setExpenses, setExpensesLoading } = useStore();
  const queryClient = useQueryClient();
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const monthsKey = Array.from(new Set(months.slice(0, 10))).sort().join(',');

  useEffect(() => {
    if (!householdId || !monthsKey) {
      setExpenses([]);
      setExpensesLoading(false);
      return;
    }

    if (householdId === 'guest_demo_household') {
      // In guest demo mode, keep seeded demo expenses without hitting Firestore
      setExpensesLoading(false);
      return;
    }

    setExpensesLoading(true);

    // 1. Kill orphaned listeners before spawning a new connection
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const uniqueMonths = monthsKey.split(',');

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
        
        // Synchronize TanStack Query Cache and Zustand Store
        const queryKey = getExpensesQueryKey(householdId, uniqueMonths);
        queryClient.setQueryData(queryKey, expenses);
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
  }, [householdId, monthsKey, setExpenses, setExpensesLoading, queryClient]);
};
