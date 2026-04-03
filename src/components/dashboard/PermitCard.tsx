import { Link } from 'react-router-dom';
import { MapPin, Calendar, Home, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { PermitPacket } from '@/types';
import { formatDate } from '@/utils/formatters';

interface PermitCardProps { permit: PermitPacket; }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; stripe: string }> = {
  draft:       { label: 'Draft',       color: '#6B7E98', bg: 'rgb(107 126 152 / 0.10)', stripe: '#6B7E98' },
  'in-progress':{ label: 'In Progress', color: '#F4D03F', bg: 'rgb(244 208 63 / 0.10)',  stripe: '#F4D03F' },
  review:      { label: 'Review',      color: '#5B9BFF', bg: 'rgb(91 155 255 / 0.10)',  stripe: '#5B9BFF' },
  submitted:   { label: 'Submitted',   color: '#A78BFA', bg: 'rgb(167 139 250 / 0.10)', stripe: '#A78BFA' },
  approved:    { label: 'Approved',    color: '#0ECC89', bg: 'rgb(14 204 137 / 0.10)',  stripe: '#0ECC89' },
  rejected:    { label: 'Rejected',    color: '#FF4B5B', bg: 'rgb(255 75 91 / 0.10)',   stripe: '#FF4B5B' },
};

function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : completed / total;
  const r = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color = pct === 1 ? '#0ECC89' : pct > 0.5 ? '#F4A623' : '#6B7E98';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 36, height: 36 }}>
      <svg width={36} height={36} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={18} cy={18} r={r} fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth={2.5} />
        <circle
          cx={18} cy={18} r={r} fill="none"
          stroke={color} strokeWidth={2.5}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      <span
        className="absolute text-center leading-none"
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '8px',
          fontWeight: 500,
          color,
        }}
      >
        {completed}/{total}
      </span>
    </div>
  );
}

export function PermitCard({ permit }: PermitCardProps) {
  const scan = permit.lastPreFlightScan;
  const cfg = STATUS_CONFIG[permit.status] ?? STATUS_CONFIG['draft']!;
  const completed = permit.checklistItems.filter(i => i.completed || i.waived).length;
  const total = permit.checklistItems.length;

  return (
    <Link
      to={`/permits/${permit.id}`}
      className="block rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 group"
      style={{
        background: '#111928',
        border: '1px solid rgb(255 255 255 / 0.06)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgb(244 166 35 / 0.30)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 24px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(244 166 35 / 0.12)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgb(255 255 255 / 0.06)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
      }}
    >
      {/* Status stripe */}
      <div className="h-0.5 w-full" style={{ background: cfg.stripe, opacity: 0.8 }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p
              className="truncate font-semibold leading-tight"
              style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', color: '#EBF0FA' }}
            >
              {permit.siteAddress}
            </p>
            <p className="mt-0.5 truncate text-xs" style={{ color: '#6B7E98' }}>
              {permit.owner.name}
            </p>
          </div>
          {/* Status badge */}
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: '11px',
              color: cfg.color,
              background: cfg.bg,
              border: `1px solid ${cfg.color}30`,
            }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Info rows */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7E98' }}>
            <MapPin size={12} className="shrink-0" style={{ color: '#4A5568' }} />
            <span className="truncate">{permit.countyName} · {permit.parcelId}</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7E98' }}>
            <Home size={12} className="shrink-0" style={{ color: '#4A5568' }} />
            <span className="capitalize">{permit.homeType} home</span>
            {permit.home.make && (
              <span style={{ color: '#4A5568' }}>· {permit.home.year} {permit.home.make}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7E98' }}>
            <Calendar size={12} className="shrink-0" style={{ color: '#4A5568' }} />
            <span>Updated {formatDate(permit.updatedAt)}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid rgb(255 255 255 / 0.05)' }}
        >
          {/* Wind zone badge */}
          <span
            className="rounded px-1.5 py-0.5 text-xs font-medium"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              background: 'rgb(91 155 255 / 0.10)',
              color: '#5B9BFF',
              border: '1px solid rgb(91 155 255 / 0.20)',
            }}
          >
            Zone {permit.windZoneRequired}
          </span>

          {/* Scan status */}
          {scan ? (
            <div className="flex items-center gap-1.5 text-xs">
              {scan.overallStatus === 'pass' ? (
                <CheckCircle size={12} style={{ color: '#0ECC89' }} />
              ) : scan.overallStatus === 'warnings' ? (
                <AlertTriangle size={12} style={{ color: '#F4D03F' }} />
              ) : (
                <AlertTriangle size={12} style={{ color: '#FF4B5B' }} />
              )}
              <span style={{ color: '#6B7E98' }}>
                {scan.overallStatus === 'pass' ? 'Passed' : scan.overallStatus === 'warnings' ? 'Warnings' : 'Failed'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#3A4558' }}>
              <Clock size={11} />
              <span>Not scanned</span>
            </div>
          )}

          {/* Progress ring */}
          {total > 0 && <ProgressRing completed={completed} total={total} />}
        </div>
      </div>
    </Link>
  );
}
