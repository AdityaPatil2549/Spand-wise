import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a configured QueryClient with resilient defaults tailored
 * for SpendWise's hybrid local-first + Firestore synchronization architecture.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 2-minute stale time prevents UI flicker during active navigation
        staleTime: 1000 * 60 * 2,
        // 10-minute garbage collection retains visited months in memory
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 1,
      },
      mutations: {
        retry: 0, // Fail-fast on mutations so optimistic rollback triggers immediately
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns a singleton QueryClient in the browser, or creates a new one per-request in SSR.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export const queryClient = getQueryClient();
