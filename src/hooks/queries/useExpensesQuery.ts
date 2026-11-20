'use client';

import { useQuery } from '@tanstack/react-query';
import { query, where, getDocs } from 'firebase/firestore';
import { expensesColRef } from '@/lib/firebase/firestore';
import { EXPENSES_PAGE_SIZE } from '@/config/constants';
import type { ExpenseDocument } from '@/types/firestore';
import { useStore } from '@/store';
import { EXPENSES_QUERY_KEY, getExpensesQueryKey } from './keys';

export { EXPENSES_QUERY_KEY, getExpensesQueryKey } from './keys';

/**
 * Direct async fetcher for non-deleted expenses partitioned by month shard.
 */
export async function fetchExpenses(
  householdId: string,
  months: string[]
): Promise<ExpenseDocument[]> {
  if (householdId === 'guest_demo_household') {
    // In guest demo mode, return memory-seeded expenses
    return useStore.getState().expenses;
  }

  const uniqueMonths = Array.from(new Set(months.slice(0, 10))).sort();
  if (uniqueMonths.length === 0) return [];

  const q = query(
    expensesColRef(householdId),
    where('month', 'in', uniqueMonths)
  );

  const snap = await getDocs(q);
  const expenses: ExpenseDocument[] = snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
  } as ExpenseDocument));

  return expenses
    .filter((e) => !e.isDeleted)
    .sort((a, b) => b.date.toMillis() - a.date.toMillis())
    .slice(0, EXPENSES_PAGE_SIZE * uniqueMonths.length);
}

/**
 * Strongly typed TanStack Query hook for expense documents.
 * Seamlessly federates cache hits with zero-latency initial store hydration.
 */
export function useExpensesQuery(householdId: string | null, months: string[]) {
  const queryKey = getExpensesQueryKey(householdId, months);

  return useQuery({
    queryKey,
    queryFn: () => {
      if (!householdId) return Promise.resolve([]);
      return fetchExpenses(householdId, months);
    },
    enabled: Boolean(householdId),
    initialData: () => {
      const currentExpenses = useStore.getState().expenses;
      return currentExpenses.length > 0 ? currentExpenses : undefined;
    },
  });
}
