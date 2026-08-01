'use client';

import { useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { budgetDocRef } from '@/lib/firebase/firestore';
import { useStore } from '@/store';
import type { BudgetDocument } from '@/types/firestore';

/**
 * useBudgetListener — Real-time Firestore listener for the budget document.
 * Subscribes to the budget document for the given month.
 * Single-document read — extremely efficient (1 read per session).
 */
export const useBudgetListener = (householdId: string | null, month: string): void => {
  const { setBudget, setBudgetLoading } = useStore();

  useEffect(() => {
    if (!householdId) {
      setBudget(null);
      setBudgetLoading(false);
      return;
    }

    setBudgetLoading(true);

    const ref = budgetDocRef(householdId, month);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setBudget({ ...snap.data(), id: snap.id } as BudgetDocument);
        } else {
          setBudget(null);
        }
        setBudgetLoading(false);
      },
      (error) => {
        console.error('[useBudgetListener]', error);
        setBudgetLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId, month, setBudget, setBudgetLoading]);
};
