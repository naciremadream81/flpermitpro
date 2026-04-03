import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FilePlus, MapPin, Settings,
  ChevronLeft, ChevronRight, Zap, Shield,
} from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { usePermitStore } from '@/stores/permitStore';

const navSections = [
  {
    label: 'WORKSPACE',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Flight Deck', end: true },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { to: '/permits/new', icon: FilePlus, label: 'New Permit', end: false },
      { to: '/counties', icon: MapPin, label: 'County Lookup', end: false },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings', end: false },
    ],
  },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const permitCount = usePermitStore((s) => s.permits.length);

  return (
    <aside
      style={{
        background: 'linear-gradient(180deg, #0A0F1C 0%, #080D18 100%)',
        borderRight: '1px solid rgb(255 255 255 / 0.06)',
        width: sidebarOpen ? '220px' : '60px',
        minWidth: sidebarOpen ? '220px' : '60px',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
      className="flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div
        className="flex h-14 shrink-0 items-center gap-3 px-4"
        style={{ borderBottom: '1px solid rgb(255 255 255 / 0.06)' }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #F4A623 0%, #E08B10 100%)',
            boxShadow: '0 0 16px rgb(244 166 35 / 0.35)',
          }}
        >
          <Zap size={15} className="text-white" style={{ strokeWidth: 2.5 }} />
        </div>
        {sidebarOpen && (
          <div className="flex flex-col leading-none animate-pp-fade-in overflow-hidden">
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#EBF0FA',
              }}
            >
              PERMIT<span style={{ color: '#F4A623' }}>PRO</span>
            </span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '9px',
                fontWeight: 500,
                letterSpacing: '0.14em',
                color: '#4A5568',
                marginTop: '2px',
              }}
            >
              FLORIDA SUITE
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            {sidebarOpen && (
              <p
                className="px-2 mb-1.5"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '9px',
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  color: '#3A4558',
                }}
              >
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150"
                  style={({ isActive }) => ({
                    background: isActive ? 'rgb(244 166 35 / 0.08)' : 'transparent',
                    borderLeft: isActive ? '2px solid #F4A623' : '2px solid transparent',
                    paddingLeft: sidebarOpen ? '10px' : '10px',
                    color: isActive ? '#F4A623' : '#6B7E98',
                  })}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    if (!el.classList.contains('active')) {
                      el.style.background = 'rgb(255 255 255 / 0.04)';
                      el.style.color = '#A0AABB';
                    }
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    if (!el.classList.contains('active')) {
                      el.style.background = 'transparent';
                      el.style.color = '#6B7E98';
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={17} className="shrink-0" style={{ color: isActive ? '#F4A623' : 'currentColor' }} />
                      {sidebarOpen && (
                        <span
                          className="flex-1 truncate font-medium animate-pp-fade-in"
                          style={{ fontFamily: "'Figtree', sans-serif", fontSize: '13.5px' }}
                        >
                          {label}
                        </span>
                      )}
                      {sidebarOpen && to === '/' && permitCount > 0 && (
                        <span
                          className="shrink-0 rounded-full px-1.5 py-0.5 animate-pp-fade-in"
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '10px',
                            fontWeight: 500,
                            background: isActive ? 'rgb(244 166 35 / 0.18)' : 'rgb(255 255 255 / 0.06)',
                            color: isActive ? '#F4A623' : '#6B7E98',
                          }}
                        >
                          {permitCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* System status */}
      {sidebarOpen && (
        <div
          className="px-4 py-3 animate-pp-fade-in"
          style={{ borderTop: '1px solid rgb(255 255 255 / 0.04)' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full animate-pp-pulse-brand"
              style={{ background: '#0ECC89', flexShrink: 0 }}
            />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: '#3A4558', letterSpacing: '0.1em' }}>
              CLOUD SYNC ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={9} style={{ color: '#3A4558', flexShrink: 0 }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: '#3A4558', letterSpacing: '0.1em' }}>
              FL HUD/FBC COMPLIANT
            </span>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center py-3 transition-colors"
        style={{ borderTop: '1px solid rgb(255 255 255 / 0.06)', color: '#3A4558' }}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F4A623'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#3A4558'; }}
      >
        {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
      </button>
    </aside>
  );
}
