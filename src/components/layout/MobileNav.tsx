import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus, MapPin, Settings } from 'lucide-react';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Flight Deck' },
  { to: '/permits/new', icon: FilePlus, label: 'New Permit' },
  { to: '/counties', icon: MapPin, label: 'Counties' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
