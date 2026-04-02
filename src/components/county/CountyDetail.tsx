import { ExternalLink, Phone } from 'lucide-react';
import { WindZoneBadge } from '@/components/shared/WindZoneBadge';
import { FeeSchedule } from './FeeSchedule';
import type { County } from '@/types';

interface CountyDetailProps { county: County; }

export function CountyDetail({ county }: CountyDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{county.name} County</h2>
          <p className="text-sm text-gray-500">FIPS: {county.fipsCode}</p>
        </div>
        <WindZoneBadge zone={county.windZone} />
      </div>

      {/* Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <a href={county.propertyAppraiserUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800">
          <ExternalLink size={18} className="text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Property Appraiser</p>
            <p className="text-xs text-blue-600 truncate dark:text-blue-400">{county.propertyAppraiserUrl}</p>
          </div>
        </a>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <a href={county.buildingDeptUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3">
            <ExternalLink size={18} className="text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Building Department</p>
              <p className="text-xs text-blue-600 truncate dark:text-blue-400">{county.buildingDeptUrl}</p>
            </div>
          </a>
          {county.buildingDeptPhone && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone size={14} />
              <span>{county.buildingDeptPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Special requirements */}
      {county.specialRequirements.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Special Requirements</h3>
          <ul className="space-y-1">
            {county.specialRequirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fee schedule */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Fee Schedule</h3>
        <FeeSchedule county={county} />
      </div>
    </div>
  );
}
