import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import type { PermitPacket } from '@/types';

interface StatsRowProps { permits: PermitPacket[]; }

export function StatsRow({ permits }: StatsRowProps) {
  const total = permits.length;
  const inProgress = permits.filter(p => p.status === 'in-progress' || p.status === 'review').length;
  const approved = permits.filter(p => p.status === 'approved').length;
  const needsAttention = permits.filter(p =>
    p.lastPreFlightScan?.overallStatus === 'fail' ||
    p.lastPreFlightScan?.overallStatus === 'warnings'
  ).length;

  const stats = [
    { label: 'Total Permits', value: total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Approved', value: approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Needs Attention', value: needsAttention, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
            <div className={`rounded-xl p-3 ${bg}`}>
              <Icon size={22} className={color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
