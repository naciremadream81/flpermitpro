import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuthStore } from '@/stores/authStore';

/**
 * True when the URL is a real app area (dashboard, permits, counties, settings).
 * Anything else (typos, stale links) is treated as an unknown path for guests.
 */
function isKnownAppPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '/counties' || pathname === '/settings' || pathname === '/permits/new') {
    return true;
  }
  return /^\/permits\/[^/]+\/?$/.test(pathname);
}

/**
 * Route guard: authenticated users see nested routes (including in-shell 404).
 * Guests hitting a known app path are sent to login; unknown paths show the
 * public 404 page so typo URLs are not mistaken for a sign-in wall.
 */
export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();

  if (!user) {
    if (isKnownAppPath(pathname)) {
      return <Navigate to="/login" replace />;
    }
    return <NotFoundPage />;
  }

  return <Outlet />;
}
