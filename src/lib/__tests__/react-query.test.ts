import { describe, it, expect } from 'vitest';
import { makeQueryClient } from '../react-query';
import { getExpensesQueryKey, EXPENSES_QUERY_KEY } from '@/hooks/queries/keys';
import type { ExpenseDocument } from '@/types/firestore';
import { Timestamp } from 'firebase/firestore';

describe('TanStack Query v5 Architecture', () => {
  it('initializes QueryClient with resilient offline-first defaults', () => {
    const client = makeQueryClient();
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 2); // 2 minutes
    expect(defaultOptions.queries?.gcTime).toBe(1000 * 60 * 10); // 10 minutes
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaultOptions.queries?.refetchOnReconnect).toBe(true);
    expect(defaultOptions.queries?.retry).toBe(1);
    expect(defaultOptions.mutations?.retry).toBe(0); // Fail-fast for instant optimistic rollback
  });

  it('generates deterministic query keys regardless of month ordering or duplicate shards', () => {
    const key1 = getExpensesQueryKey('household_123', ['2026-11', '2026-10']);
    const key2 = getExpensesQueryKey('household_123', ['2026-10', '2026-11', '2026-10']);

    expect(key1).toEqual([EXPENSES_QUERY_KEY, 'household_123', '2026-10,2026-11']);
    expect(key2).toEqual([EXPENSES_QUERY_KEY, 'household_123', '2026-10,2026-11']);
    expect(key1).toEqual(key2);
  });

  it('manages optimistic cache mutations and rollbacks cleanly', () => {
    const client = makeQueryClient();
    const queryKey = getExpensesQueryKey('household_abc', ['2026-11']);

    const initialExpense: ExpenseDocument = {
      id: 'exp_1',
      amount: 500,
      categoryId: 'food',
      note: 'Lunch',
      date: Timestamp.now(),
      month: '2026-11',
      isDeleted: false,
      type: 'expense',
      createdAt: Timestamp.now(),
      createdBy: 'user_1',
    };

    client.setQueryData<ExpenseDocument[]>(queryKey, [initialExpense]);
    expect(client.getQueryData<ExpenseDocument[]>(queryKey)).toHaveLength(1);

    // Optimistic addition
    const optimisticExpense: ExpenseDocument = {
      id: 'temp_999',
      amount: 150,
      categoryId: 'travel',
      note: 'Bus',
      date: Timestamp.now(),
      month: '2026-11',
      isDeleted: false,
      type: 'expense',
      createdAt: Timestamp.now(),
      createdBy: 'user_1',
    };

    const snapshot = client.getQueryData<ExpenseDocument[]>(queryKey);
    client.setQueryData<ExpenseDocument[]>(queryKey, (old = []) => [optimisticExpense, ...old]);

    expect(client.getQueryData<ExpenseDocument[]>(queryKey)).toHaveLength(2);
    expect(client.getQueryData<ExpenseDocument[]>(queryKey)?.[0].id).toBe('temp_999');

    // Rollback to snapshot
    client.setQueryData(queryKey, snapshot);
    expect(client.getQueryData<ExpenseDocument[]>(queryKey)).toHaveLength(1);
    expect(client.getQueryData<ExpenseDocument[]>(queryKey)?.[0].id).toBe('exp_1');
  });
});
