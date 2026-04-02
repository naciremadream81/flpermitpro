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
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <OfflineBanner />

      {!isMobile && <Sidebar />}

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className={`flex-1 overflow-auto p-6 ${isMobile ? 'pb-20' : ''}`}>
          <Outlet />
        </main>
      </div>

      {isMobile && <MobileNav />}

      <ToastContainer />
    </div>
  );
}
