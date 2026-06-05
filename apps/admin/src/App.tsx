import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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
    const storedTheme = localStorage.getItem('theme');
    const isDark = storedTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  return (
    <Sentry.ErrorBoundary fallback={<div className="p-8 text-center"><p className="text-red-500 font-bold mb-2">Oops! Something went wrong.</p><p className="text-sm text-gray-500">Our team has been notified. Please refresh the page.</p></div>}>
      <BrowserRouter>
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
