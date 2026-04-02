import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useCountyStore } from '@/stores/countyStore';
import { WindZoneBadge } from '@/components/shared/WindZoneBadge';

interface CountySelectorProps {
  value: string;
  onChange: (countyId: string) => void;
  error?: string;
}

export function CountySelector({ value, onChange, error }: CountySelectorProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { counties } = useCountyStore();

  const filtered = useMemo(() => {
    if (!query) return counties;
    return counties.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  }, [counties, query]);

  const selected = counties.find(c => c.id === value);

  return (
    <div className="relative space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">County</label>
      <div
        className={`flex cursor-pointer items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm shadow-sm dark:bg-gray-800 ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        onClick={() => setOpen(!open)}
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-900 dark:text-gray-100">{selected.name} County</span>
            <WindZoneBadge zone={selected.windZone} />
          </div>
        ) : (
          <span className="text-gray-400">Select a county...</span>
        )}
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
            <Search size={14} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search counties..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400 dark:text-gray-100"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.map(county => (
              <li
                key={county.id}
                className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${county.id === value ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}
                onClick={() => { onChange(county.id); setOpen(false); setQuery(''); }}
              >
                <span>{county.name} County</span>
                <WindZoneBadge zone={county.windZone} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
