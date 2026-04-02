import type { WindZone } from '@/types';

const zoneConfig: Record<WindZone, { bg: string; text: string }> = {
  'I': { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300' },
  'II': { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300' },
  'III': { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
};

export function WindZoneBadge({ zone }: { zone: WindZone }) {
  const config = zoneConfig[zone];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}>
      Wind Zone {zone}
    </span>
  );
}
