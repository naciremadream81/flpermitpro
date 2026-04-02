import { Home, Building2 } from 'lucide-react';
import type { HomeType } from '@/types';

interface HomeTypeSelectorProps {
  value: HomeType | null;
  onChange: (type: HomeType) => void;
}

const options = [
  {
    type: 'mobile' as HomeType,
    icon: Home,
    title: 'Mobile Home (HUD Code)',
    description: 'DHSMV-governed. Requires Installer License (IH), HUD Label, and anchor/blocking charts.',
    badge: 'HUD / DHSMV',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  {
    type: 'modular' as HomeType,
    icon: Building2,
    title: 'Modular Home (FBC)',
    description: 'DBPR/FBC-governed. Requires Data Plate, permanent foundation plans, and licensed contractor.',
    badge: 'DBPR / FBC',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
];

export function HomeTypeSelector({ value, onChange }: HomeTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">Select the type of manufactured home for this permit application.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map(({ type, icon: Icon, title, description, badge, badgeColor }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all ${value === type ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20' : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${value === type ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Icon size={20} className={value === type ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'} />
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>{badge}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{title}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
