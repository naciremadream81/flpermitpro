import { Search } from 'lucide-react';
import { Select } from '@/components/shared/Select';
import { usePermitStore } from '@/stores/permitStore';
import { useCountyStore } from '@/stores/countyStore';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Under Review' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const homeTypeOptions = [
  { value: 'all', label: 'All Home Types' },
  { value: 'mobile', label: 'Mobile Home (HUD)' },
  { value: 'modular', label: 'Modular Home (FBC)' },
];

export function FilterBar() {
  const { filters, setFilters } = usePermitStore();
  const { counties } = useCountyStore();

  const countyOptions = [
    { value: 'all', label: 'All Counties' },
    ...counties.map(c => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
        <Search size={16} className="shrink-0 text-gray-400" />
        <input
          type="search"
          placeholder="Search address, owner, parcel…"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100"
          aria-label="Search permits"
        />
      </div>
      <div className="w-40">
        <Select
          options={statusOptions}
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
        />
      </div>
      <div className="w-48">
        <Select
          options={homeTypeOptions}
          value={filters.homeType}
          onChange={(e) => setFilters({ homeType: e.target.value as typeof filters.homeType })}
        />
      </div>
      <div className="w-48">
        <Select
          options={countyOptions}
          value={filters.county}
          onChange={(e) => setFilters({ county: e.target.value })}
        />
      </div>
    </div>
  );
}
