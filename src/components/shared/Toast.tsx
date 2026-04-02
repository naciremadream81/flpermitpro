import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { Toast as ToastType } from '@/stores/uiStore';

interface ToastProps { toast: ToastType; onDismiss: (id: string) => void; }

const icons = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
const colorStyles = {
  success: 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  error: 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  warning: 'border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  info: 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = icons[toast.type];
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);
  return (
    <div className={`flex items-start gap-3 rounded-lg border-l-4 p-4 shadow-lg ${colorStyles[toast.type]}`}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{toast.title}</p>
        {toast.message && <p className="mt-1 text-sm opacity-80">{toast.message}</p>}
      </div>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 rounded p-1 hover:bg-black/10">
        <X size={16} />
      </button>
    </div>
  );
}
