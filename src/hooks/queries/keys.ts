export const EXPENSES_QUERY_KEY = 'expenses';
export const BUDGET_QUERY_KEY = 'budget';
export const CATEGORIES_QUERY_KEY = 'categories';
export const ACCOUNTS_QUERY_KEY = 'accounts';

/**
 * Returns a deterministic query cache key for expense queries partitioned by household and month shards.
 */
export function getExpensesQueryKey(householdId: string | null, months: string[]) {
  const monthsKey = Array.from(new Set(months.slice(0, 10))).sort().join(',');
  return [EXPENSES_QUERY_KEY, householdId, monthsKey] as const;
}
