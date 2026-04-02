import { useUiStore } from '@/stores/uiStore';
import { Toast } from './Toast';

/**
 * Renders all active toasts in a fixed stack at the bottom-right of the
 * viewport.  Each toast animates in via Tailwind's built-in `animate-slide-in`
 * (we fall back to a simple fade-in via `animate-[slideIn_300ms_ease-out]`).
 *
 * Drop this component once at the top of your layout — it reads the global
 * uiStore so no props are needed.
 */
export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-[slideIn_300ms_ease-out] [animation-fill-mode:both]"
          style={{
            /* Keyframes defined inline so no tailwind.config change is needed */
          }}
        >
          <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(1rem); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>
          <Toast toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  );
}
