import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus, Inbox } from 'lucide-react';
import { StatsRow, PermitCard, PermitCardSkeleton } from '@/components/dashboard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { Button } from '@/components/shared/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePermitStore } from '@/stores/permitStore';
import { useCountyStore } from '@/stores/countyStore';
import { useFirestorePermits } from '@/hooks/useFirestorePermits';
import countiesData from '@/data/counties.json';
import type { County } from '@/types';

export function DashboardPage() {
  const { permits, loading, filteredPermits } = usePermitStore();
  const { setCounties } = useCountyStore();

  useFirestorePermits();

  // Seed county store from bundled JSON on mount
  useEffect(() => {
    setCounties(countiesData as County[]);
  }, [setCounties]);

  const visible = filteredPermits();

  if (loading) {
    return (
      <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <PermitCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatsRow permits={permits} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterBar />
        <Link to="/permits/new">
          <Button>
            <FilePlus size={16} className="mr-2" />
            New Permit
          </Button>
        </Link>
      </div>

      {/* Permit grid */}
      {visible.length === 0 ? (
        <EmptyState
          icon={<Inbox size={48} />}
          title="No permits found"
          description="Create your first permit packet or adjust your filters."
          action={
            <Link to="/permits/new">
              <Button>
                <FilePlus size={16} className="mr-2" />
                New Permit
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((permit) => (
            <PermitCard key={permit.id} permit={permit} />
          ))}
        </div>
      )}
    </div>
  );
}
