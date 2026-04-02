import { useEffect, useRef } from 'react';
import { usePermitStore } from '@/stores/permitStore';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { subscribePermits } from '@/services/firestore/permits';

const APP_ID = import.meta.env.VITE_FIREBASE_APP_ID ?? 'local';

/**
 * Subscribes to the current user's Firestore permits collection.
 *
 * On success the snapshot callback populates the permit store so every
 * component that reads from `usePermitStore` sees live data.
 *
 * On error (offline, auth revoked, permission denied) we surface the
 * problem via the store's `error` field AND a visible toast so the user
 * knows why their data may be stale.
 */
export function useFirestorePermits() {
  const { setPermits, setLoading, setError } = usePermitStore();
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    unsubRef.current = subscribePermits(
      APP_ID,
      user.id,
      (permits) => {
        setPermits(permits);
        setLoading(false);
        setError(null);
      },
      (err) => {
        const message = err instanceof Error ? err.message : 'Lost connection to Firestore';
        setError(message);
        setLoading(false);
        addToast({
          type: 'error',
          title: 'Sync Error',
          message: `Could not load permits: ${message}`,
        });
      },
    );

    return () => { unsubRef.current?.(); };
  }, [user, setPermits, setLoading, setError, addToast]);
}
