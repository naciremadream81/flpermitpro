import { useCallback } from 'react';
import { useUiStore } from '@/stores/uiStore';

/**
 * Convenience hook that wraps the uiStore toast actions with typed helpers.
 *
 * Each method auto-dismisses after 4 seconds (the Toast component itself
 * handles the timer via its own useEffect, but we set the duration here for
 * consistency — the Toast component's 5 s timeout acts as a safety net).
 *
 * Usage:
 *   const { showSuccess, showError, showWarning } = useToast();
 *   showSuccess('Permit saved successfully');
 */
export function useToast() {
  const addToast = useUiStore((s) => s.addToast);
  const removeToast = useUiStore((s) => s.removeToast);

  const showSuccess = useCallback(
    (message: string, title = 'Success') => {
      addToast({ type: 'success', title, message });
    },
    [addToast],
  );

  const showError = useCallback(
    (message: string, title = 'Error') => {
      addToast({ type: 'error', title, message });
    },
    [addToast],
  );

  const showWarning = useCallback(
    (message: string, title = 'Warning') => {
      addToast({ type: 'warning', title, message });
    },
    [addToast],
  );

  const showInfo = useCallback(
    (message: string, title = 'Info') => {
      addToast({ type: 'info', title, message });
    },
    [addToast],
  );

  return { showSuccess, showError, showWarning, showInfo, removeToast } as const;
}
