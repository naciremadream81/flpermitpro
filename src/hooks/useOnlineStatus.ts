import { useSyncExternalStore } from 'react';

/**
 * Returns the current network connectivity status by listening to the
 * browser's `online` / `offline` events via useSyncExternalStore (the
 * recommended React 18+ pattern for subscribing to external stores).
 *
 * Usage:
 *   const { isOnline } = useOnlineStatus();
 */

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true;
}

export function useOnlineStatus(): { isOnline: boolean } {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { isOnline };
}
