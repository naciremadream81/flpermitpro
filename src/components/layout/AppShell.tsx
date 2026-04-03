import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { OfflineBanner } from './OfflineBanner';
import { usePlatform } from '@/hooks/usePlatform';
import { ToastContainer } from '@/components/shared/ToastContainer';

export function AppShell() {
  const { isMobile } = usePlatform();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#060A11' }}>
      <OfflineBanner />

      {!isMobile && <Sidebar />}

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className={`flex-1 overflow-auto p-5 ${isMobile ? 'pb-20' : ''}`} style={{ background: '#080C16' }}>
          <Outlet />
        </main>
      </div>

      {isMobile && <MobileNav />}

      <ToastContainer />
    </div>
  );
}
