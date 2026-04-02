import { Search, Bell, Menu, Moon, Sun, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePermitStore } from '@/stores/permitStore';
import { useUiStore } from '@/stores/uiStore';

const pageTitles: Record<string, string> = {
  '/': 'Flight Deck',
  '/permits/new': 'New Permit',
  '/counties': 'County Lookup',
  '/settings': 'Settings',
};

function pageTitleForPath(pathname: string): string {
  if (pathname.startsWith('/permits/') && pathname !== '/permits/new') {
    return 'Permit Details';
  }
  return pageTitles[pathname] ?? 'PermitPro FL';
}

function displayNameInitial(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) return '';
  return trimmed[0]!.toUpperCase();
}

export function TopBar() {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const { filters, setFilters } = usePermitStore();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const darkMode = useUiStore((s) => s.darkMode);
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode);
  const addToast = useUiStore((s) => s.addToast);

  const title = pageTitleForPath(pathname);
  const showSearch = pathname === '/';

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6 dark:border-gray-700 dark:bg-gray-900">
      {/* Hamburger: visible on mobile only, toggles the sidebar / mobile nav */}
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label="Toggle navigation"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>

      {showSearch && (
        <div className="ml-4 hidden flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 sm:flex dark:border-gray-700 dark:bg-gray-800">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search permits by address, owner, parcel ID..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100"
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          onClick={() =>
            addToast({ type: 'info', title: 'Notifications', message: 'Notifications coming soon' })
          }
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        {user?.displayName?.trim() ? (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white"
            aria-label={`Signed in as ${user.displayName}`}
            role="img"
          >
            {displayNameInitial(user.displayName)}
          </div>
        ) : (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            aria-label="Account"
          >
            <User size={18} />
          </div>
        )}
      </div>
    </header>
  );
}
