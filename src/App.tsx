import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProtectedRoute } from '@/components/auth';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewPermitPage } from '@/pages/NewPermitPage';
import { PermitDetailPage } from '@/pages/PermitDetailPage';
import { EditPermitPage } from '@/pages/EditPermitPage';
import { CountyLookupPage } from '@/pages/CountyLookupPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthWrapper>
          <Routes>
            {/* Public routes — accessible without authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes — require an authenticated user */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="permits/new" element={<NewPermitPage />} />
                <Route path="permits/:permitId" element={<PermitDetailPage />} />
                <Route path="permits/:permitId/edit" element={<EditPermitPage />} />
                <Route path="counties" element={<CountyLookupPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthWrapper>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
