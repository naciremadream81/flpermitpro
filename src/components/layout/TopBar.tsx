import { Search, Bell, Menu, Moon, Sun, ChevronRight } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePermitStore } from '@/stores/permitStore';
import { useUiStore } from '@/stores/uiStore';
import { useState, type CSSProperties } from 'react';

const pageTitles: Record<string, string> = {
  '/': 'Flight Deck',
  '/permits/new': 'New Permit',
  '/counties': 'County Lookup',
  '/settings': 'Settings',
};

function pageTitleForPath(pathname: string): string {
  if (pathname.startsWith('/permits/') && !pathname.endsWith('/new') && !pathname.endsWith('/edit')) {
    return 'Permit Details';
  }
  if (pathname.endsWith('/edit')) return 'Edit Permit';
  return pageTitles[pathname] ?? 'PermitPro FL';
}

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0]![0]!.toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function TopBar() {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const { filters, setFilters } = usePermitStore();
  const { toggleSidebar, darkMode, toggleDarkMode, addToast } = useUiStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifHover, setNotifHover] = useState(false);

  const title = pageTitleForPath(pathname);
  const showSearch = pathname === '/';

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-3 px-4 md:px-5"
      style={{
        background: 'rgb(8 12 20 / 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgb(255 255 255 / 0.06)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 transition-colors md:hidden"
        style={{ color: '#6B7E98' }}
        aria-label="Toggle navigation"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb / page title */}
      <div className="flex items-center gap-2 min-w-0">
        <Link
          to="/"
          className="hidden md:block text-xs font-medium transition-colors"
          style={{
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.06em',
            color: '#4A5568',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#F4A623'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#4A5568'; }}
        >
          PERMITPRO
        </Link>
        {(title !== 'Flight Deck') && (
          <>
            <ChevronRight size={12} style={{ color: '#3A4558' }} className="hidden md:block" />
            <h1
              className="text-sm font-semibold truncate"
              style={{ fontFamily: "'Syne', sans-serif", color: '#EBF0FA', fontSize: '14px' }}
            >
              {title}
            </h1>
          </>
        )}
        {title === 'Flight Deck' && (
          <h1
            className="text-sm font-semibold"
            style={{ fontFamily: "'Syne', sans-serif", color: '#EBF0FA', fontSize: '14px' }}
          >
            Flight Deck
          </h1>
        )}
      </div>

      {/* Search */}
      {showSearch && (
        <div
          className="ml-4 hidden flex-1 items-center gap-2 rounded-lg px-3 py-2 sm:flex transition-all"
          style={{
            background: searchFocused ? 'rgb(255 255 255 / 0.05)' : 'rgb(255 255 255 / 0.03)',
            border: searchFocused
              ? '1px solid rgb(244 166 35 / 0.30)'
              : '1px solid rgb(255 255 255 / 0.06)',
            boxShadow: searchFocused ? '0 0 0 3px rgb(244 166 35 / 0.08)' : 'none',
            maxWidth: '420px',
          }}
        >
          <Search size={14} style={{ color: searchFocused ? '#F4A623' : '#4A5568', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search permits, addresses, owners…"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 bg-transparent text-sm outline-none placeholder-current"
            style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: '13px',
              color: '#EBF0FA',
              '--placeholder-color': '#4A5568',
            } as CSSProperties}
          />
          <kbd
            className="hidden lg:flex items-center gap-0.5 rounded px-1"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              color: '#4A5568',
              background: 'rgb(255 255 255 / 0.04)',
              border: '1px solid rgb(255 255 255 / 0.06)',
              padding: '1px 4px',
            }}
          >
            ⌘K
          </kbd>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1">
        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="rounded-lg p-2 transition-all"
          style={{ color: '#6B7E98' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#F4A623';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgb(244 166 35 / 0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#6B7E98';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => addToast({ type: 'info', title: 'Notifications', message: 'No new notifications' })}
          className="relative rounded-lg p-2 transition-all"
          style={{ color: notifHover ? '#F4A623' : '#6B7E98', background: notifHover ? 'rgb(244 166 35 / 0.08)' : 'transparent' }}
          onMouseEnter={() => setNotifHover(true)}
          onMouseLeave={() => setNotifHover(false)}
          aria-label="Notifications"
        >
          <Bell size={16} />
          {/* Unread dot */}
          <span
            className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
            style={{ background: '#F4A623' }}
          />
        </button>

        {/* User avatar */}
        {user?.displayName?.trim() ? (
          <Link
            to="/settings"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ml-1 transition-all"
            style={{
              background: 'linear-gradient(135deg, #F4A623 0%, #E08B10 100%)',
              boxShadow: '0 0 12px rgb(244 166 35 / 0.25)',
              fontFamily: "'Syne', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: '#fff',
            }}
            aria-label={`Settings — ${user.displayName}`}
          >
            {getInitials(user.displayName)}
          </Link>
        ) : (
          <Link
            to="/settings"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ml-1 transition-all"
            style={{
              background: 'rgb(255 255 255 / 0.06)',
              border: '1px solid rgb(255 255 255 / 0.10)',
              color: '#6B7E98',
            }}
            aria-label="Settings"
          >
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '11px', fontWeight: 600 }}>PP</span>
          </Link>
        )}
      </div>
    </header>
  );
}
