'use client';

import { useEffect, useState } from 'react';
import { startOutboxSyncListener, getPendingOutboxCount } from '@/lib/sync/outboxWorker';
import { useStore } from '@/store';

/**
 * React hook that binds the Dexie Outbox background replication worker
 * to the active user's household, keeping pending sync telemetry reactive.
 */
export function useOutboxSync(): { pendingCount: number } {
  const householdId = useStore((s) => s.householdId);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (!householdId || householdId === 'guest_demo_household') return;

    // Check initial pending count
    getPendingOutboxCount(householdId).then(setPendingCount).catch(() => {});

    // Mount background sync listeners (online events + heartbeat)
    const unsubscribe = startOutboxSyncListener(householdId);

    const interval = setInterval(() => {
      getPendingOutboxCount(householdId).then(setPendingCount).catch(() => {});
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [householdId]);

  return { pendingCount };
}
