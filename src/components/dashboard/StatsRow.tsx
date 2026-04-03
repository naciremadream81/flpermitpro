import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import type { PermitPacket } from '@/types';

interface StatsRowProps { permits: PermitPacket[]; }

const STATS_CONFIG = [
  {
    key: 'total',
    label: 'Total Permits',
    icon: FileText,
    color: '#5B9BFF',
    glow: 'rgb(91 155 255 / 0.15)',
    bg: 'rgb(91 155 255 / 0.08)',
    border: 'rgb(91 155 255 / 0.18)',
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    icon: Clock,
    color: '#F4D03F',
    glow: 'rgb(244 208 63 / 0.12)',
    bg: 'rgb(244 208 63 / 0.08)',
    border: 'rgb(244 208 63 / 0.18)',
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: CheckCircle,
    color: '#0ECC89',
    glow: 'rgb(14 204 137 / 0.12)',
    bg: 'rgb(14 204 137 / 0.08)',
    border: 'rgb(14 204 137 / 0.18)',
  },
  {
    key: 'attention',
    label: 'Needs Attention',
    icon: AlertTriangle,
    color: '#FF4B5B',
    glow: 'rgb(255 75 91 / 0.12)',
    bg: 'rgb(255 75 91 / 0.08)',
    border: 'rgb(255 75 91 / 0.18)',
  },
];

export function StatsRow({ permits }: StatsRowProps) {
  const values = {
    total: permits.length,
    inProgress: permits.filter(p => p.status === 'in-progress' || p.status === 'review').length,
    approved: permits.filter(p => p.status === 'approved').length,
    attention: permits.filter(p =>
      p.lastPreFlightScan?.overallStatus === 'fail' ||
      p.lastPreFlightScan?.overallStatus === 'warnings'
    ).length,
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {STATS_CONFIG.map(({ key, label, icon: Icon, color, glow, bg, border }) => {
        const value = values[key as keyof typeof values];
        return (
          <div
            key={key}
            className="rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: '#111928',
              border: `1px solid rgb(255 255 255 / 0.06)`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = border;
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${glow}`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgb(255 255 255 / 0.06)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className="text-xs font-medium mb-1.5"
                  style={{ color: '#6B7E98', fontFamily: "'Figtree', sans-serif" }}
                >
                  {label}
                </p>
                <p
                  className="text-3xl font-bold leading-none"
                  style={{ fontFamily: "'Syne', sans-serif", color: '#EBF0FA' }}
                >
                  {value}
                </p>
              </div>
              <div
                className="rounded-xl p-2.5 shrink-0"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
            </div>

            {/* Mini progress bar — relative to total */}
            {key !== 'total' && values.total > 0 && (
              <div className="mt-3 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgb(255 255 255 / 0.05)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round((value / values.total) * 100)}%`,
                    background: color,
                    opacity: 0.6,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
