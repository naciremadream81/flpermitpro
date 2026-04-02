import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FilePlus, MapPin, Settings,
  Plane, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { usePermitStore } from '@/stores/permitStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Flight Deck' },
  { to: '/permits/new', icon: FilePlus, label: 'New Permit' },
  { to: '/counties', icon: MapPin, label: 'County Lookup' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const permitCount = usePermitStore((s) => s.permits.length);

  return (
    <aside
      className={`flex flex-col bg-gray-900 text-white transition-all duration-300 ${
        sidebarOpen ? 'w-56' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-700 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <Plane size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <span className="text-sm font-bold tracking-wide">PermitPro FL</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 p-2 pt-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {sidebarOpen && (
              <>
                <span className="flex-1 truncate">{label}</span>
                {to === '/' && (
                  <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                    {permitCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center border-t border-gray-700 p-4 text-gray-400 hover:text-white"
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </aside>
  );
}
