import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { CountySelector } from '@/components/county/CountySelector';
import { CountyDetail } from '@/components/county/CountyDetail';
import { EmptyState } from '@/components/shared/EmptyState';
import { useCountyStore } from '@/stores/countyStore';
import countiesData from '@/data/counties.json';
import type { County } from '@/types';

export function CountyLookupPage() {
  const { counties, setCounties, getCountyById } = useCountyStore();
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (counties.length === 0) setCounties(countiesData as County[]);
  }, [counties.length, setCounties]);

  const county = selectedId ? getCountyById(selectedId) : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">County Lookup</h2>
        <p className="mt-1 text-sm text-gray-500">Find jurisdiction requirements, fee schedules, and contact information for all 67 Florida counties.</p>
      </div>

      <CountySelector value={selectedId} onChange={setSelectedId} />

      {county ? (
        <CountyDetail county={county} />
      ) : (
        <EmptyState
          icon={<MapPin size={40} />}
          title="Select a county"
          description="Choose a Florida county above to view building department contacts, wind zone, fee schedule, and permit requirements."
        />
      )}
    </div>
  );
}
