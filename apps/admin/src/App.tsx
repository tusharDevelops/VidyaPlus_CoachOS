import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { applyTheme, GlobalPlatformBanner } from '@coachos/ui';
import { useAdminAuthStore } from './stores/auth.store';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import AdminLayout from './components/AdminLayout';
import AdminLoginPage from './features/auth/AdminLoginPage';
import AdminDashboardPage from './features/dashboard/AdminDashboardPage';
import InstitutesListPage from './features/institutes/InstitutesListPage';
import InstituteDetailPage from './features/institutes/InstituteDetailPage';
import PlanManagementPage from './features/plans/PlanManagementPage';
import PlatformSettingsPage from './features/settings/PlatformSettingsPage';

import * as Sentry from '@sentry/react';

export default function App() {
  const { isAuthenticated } = useAdminAuthStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyTheme(shouldBeDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  return (
    <Sentry.ErrorBoundary fallback={<div className="p-4 sm:p-8 text-center"><p className="text-red-500 font-bold mb-2">Oops! Something went wrong.</p><p className="text-sm text-gray-500">Our team has been notified. Please refresh the page.</p></div>}>
      <BrowserRouter>
        <GlobalPlatformBanner />
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<AdminLoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<AdminDashboardPage />} />
              <Route path="/institutes" element={<InstitutesListPage />} />
              <Route path="/institutes/:id" element={<InstituteDetailPage />} />
              <Route path="/plans" element={<PlanManagementPage />} />
              <Route path="/settings" element={<PlatformSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}
