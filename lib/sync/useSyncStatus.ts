import { useEffect, useState } from 'react';
import { subscribeToConnectivity } from '@/lib/sync/netinfo';

export interface SyncStatus {
  isOnline: boolean;
  /** True while a sync pass is running. */
  isSyncing: boolean;
  /** Timestamp (epoch ms) of the last successful sync, or null. */
  lastSyncedAt: number | null;
}

/**
 * Feeds OfflineBanner/SyncIndicator. `setSyncing` is handed out so the sync
 * engine (or UI) can mark when a pass starts/stops.
 */
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    lastSyncedAt: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeToConnectivity((isOnline) => {
      setStatus((prev) => ({ ...prev, isOnline }));
    });
    return unsubscribe;
  }, []);

  const setSyncing = (isSyncing: boolean) => {
    setStatus((prev) => ({
      ...prev,
      isSyncing,
      lastSyncedAt: isSyncing ? prev.lastSyncedAt : Date.now(),
    }));
  };

  return { status, setSyncing };
}
