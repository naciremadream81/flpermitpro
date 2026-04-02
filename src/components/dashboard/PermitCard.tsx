import { Link } from 'react-router-dom';
import { MapPin, Calendar, Home, AlertTriangle, CheckCircle } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WindZoneBadge } from '@/components/shared/WindZoneBadge';
import type { PermitPacket } from '@/types';
import { formatDate } from '@/utils/formatters';

interface PermitCardProps { permit: PermitPacket; }

export function PermitCard({ permit }: PermitCardProps) {
  const scan = permit.lastPreFlightScan;
  const scanIcon = !scan ? null
    : scan.overallStatus === 'pass' ? <CheckCircle size={14} className="text-green-500" />
    : scan.overallStatus === 'warnings' ? <AlertTriangle size={14} className="text-yellow-500" />
    : <AlertTriangle size={14} className="text-red-500" />;

  return (
    <Link to={`/permits/${permit.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600">

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="truncate font-semibold text-gray-900 dark:text-gray-100">{permit.siteAddress}</p>
          <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">{permit.owner.name}</p>
        </div>
        <StatusBadge status={permit.status} />
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin size={14} className="shrink-0 text-gray-400" />
          <span className="truncate">{permit.countyName} County · Parcel {permit.parcelId}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Home size={14} className="shrink-0 text-gray-400" />
          <span className="capitalize">{permit.homeType} Home</span>
          {permit.home.make && <span>· {permit.home.year} {permit.home.make}</span>}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar size={14} className="shrink-0 text-gray-400" />
          <span>Updated {formatDate(permit.updatedAt)}</span>
        </div>
      </div>

      {/* Footer row */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
        <WindZoneBadge zone={permit.windZoneRequired} />
        {scanIcon && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {scanIcon}
            <span>Pre-flight {scan!.overallStatus}</span>
          </div>
        )}
        <span className="text-xs text-gray-400">
          {permit.checklistItems.filter(i => i.completed).length}/{permit.checklistItems.length} items
        </span>
      </div>
    </Link>
  );
}
