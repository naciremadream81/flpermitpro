import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Fixed-position banner that slides down from the top of the viewport when the
 * user's device goes offline and slides away when connectivity returns.
 */
export function OfflineBanner() {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950 shadow-md animate-[slideDown_300ms_ease-out]"
    >
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <WifiOff size={16} className="shrink-0" />
      <span>You're offline — changes will sync when reconnected</span>
    </div>
  );
}
