import { Skeleton } from '@/components/shared/Skeleton';

/**
 * Loading placeholder that mirrors the exact layout of PermitCard so the UI
 * doesn't shift when real data arrives.  Structure mirrors:
 *   - Header row: address (wide) + status badge (pill)
 *   - Sub-header: owner name
 *   - Three detail rows (county, home type, date)
 *   - Footer row: wind-zone badge + checklist count
 */
export function PermitCardSkeleton() {
  return (
    <div className="block rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton width="70%" height="1.15rem" />
          <Skeleton width="40%" height="0.85rem" />
        </div>
        <Skeleton width="5rem" height="1.5rem" rounded />
      </div>

      {/* Detail rows */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton width="14px" height="14px" rounded className="shrink-0" />
          <Skeleton width="60%" height="0.85rem" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width="14px" height="14px" rounded className="shrink-0" />
          <Skeleton width="50%" height="0.85rem" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width="14px" height="14px" rounded className="shrink-0" />
          <Skeleton width="45%" height="0.85rem" />
        </div>
      </div>

      {/* Footer row */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
        <Skeleton width="4.5rem" height="1.25rem" rounded />
        <Skeleton width="3.5rem" height="0.75rem" />
      </div>
    </div>
  );
}
