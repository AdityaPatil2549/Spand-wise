'use client';

import { useEffect } from 'react';
import { useStore } from '@/store';

/**
 * useAccountsLoader
 * Fetches accounts once when householdId is available.
 * In a real app this might be a listener, but for now we'll just fetch once.
 */
export const useAccountsLoader = (householdId: string | null) => {
  const loadAccounts = useStore((s) => s.loadAccounts);

  useEffect(() => {
    if (householdId) {
      loadAccounts(householdId);
    }
  }, [householdId, loadAccounts]);
};
