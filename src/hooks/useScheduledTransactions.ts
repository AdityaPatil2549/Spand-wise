'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { processScheduledTransactions } from '@/lib/scheduled/processor';

export const useScheduledTransactionsLoader = (householdId: string | null) => {
  const fetchScheduledTransactions = useStore((s) => s.fetchScheduledTransactions);
  const scheduledTransactions = useStore((s) => s.scheduledTransactions);
  const addExpenseOptimistic = useStore((s) => s.addExpenseOptimistic);
  const updateScheduledOptimistic = useStore((s) => s.updateScheduledOptimistic);
  const user = useStore(s => s.user);
  
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (householdId) {
      fetchScheduledTransactions(householdId);
    }
  }, [householdId, fetchScheduledTransactions]);

  // Run the processor once when transactions are loaded
  useEffect(() => {
    if (householdId && user && scheduledTransactions.length > 0 && !hasProcessed.current) {
      hasProcessed.current = true;
      processScheduledTransactions(
        householdId,
        user.uid,
        scheduledTransactions,
        addExpenseOptimistic,
        updateScheduledOptimistic
      );
    }
  }, [householdId, user, scheduledTransactions, addExpenseOptimistic, updateScheduledOptimistic]);
};
