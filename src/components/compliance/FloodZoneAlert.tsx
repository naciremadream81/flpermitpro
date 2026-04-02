import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { ComplianceCheck } from '@/types';

interface FloodZoneAlertProps { check: ComplianceCheck; }

export function FloodZoneAlert({ check }: FloodZoneAlertProps) {
  const Icon = check.status === 'pass' ? CheckCircle : check.status === 'warning' ? AlertTriangle : XCircle;
  const colorClass = check.status === 'pass' ? 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
    : check.status === 'warning' ? 'bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300'
    : 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300';
  const iconColor = check.status === 'pass' ? 'text-green-500' : check.status === 'warning' ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className={`rounded-lg border p-4 ${colorClass}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={`mt-0.5 shrink-0 ${iconColor}`} />
        <div>
          <p className="font-medium">{check.message}</p>
          {check.detail && <p className="mt-1 text-sm opacity-80">{check.detail}</p>}
        </div>
      </div>
    </div>
  );
}
