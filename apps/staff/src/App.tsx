import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { applyTheme, GlobalPlatformBanner } from '@coachos/ui';
import { useAuthStore } from './stores/auth.store';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import MyProfilePage from './features/profile/MyProfilePage';
import MyAttendancePage from './features/profile/MyAttendancePage';
import MySalaryPage from './features/profile/MySalaryPage';
import FeeDashboardPage from './features/fees/FeeDashboardPage';
import FeePlansPage from './features/fees/FeePlansPage';
import StudentLedgerPage from './features/fees/StudentLedgerPage';
import ReceiptView from './features/fees/ReceiptView';
import ReportsPage from './features/reports/ReportsPage';
import StaffLayout from './components/StaffLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-lg bg-surface flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-lg font-bold text-ink mb-2">{title}</h2>
      <p className="text-sm text-steel">This module is coming soon.</p>
    </div>
  );
}

import * as Sentry from '@sentry/react';
import api from './lib/api';

export default function App() {
  const { isAuthenticated, fetchUser, refreshUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
      refreshUser();
    }

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
        <GlobalPlatformBanner api={api} />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />

          {/* Protected — Staff Layout */}
          <Route element={
            <ProtectedRoute>
              <StaffLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/fees" element={<FeeDashboardPage />} />
            <Route path="/fees/plans" element={<FeePlansPage />} />
            <Route path="/fees/student/:studentId" element={<StudentLedgerPage />} />
            <Route path="/fees/receipt/:receiptNumber" element={<ReceiptView />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
            <Route path="/my-profile" element={<MyProfilePage />} />
            <Route path="/my-attendance" element={<MyAttendancePage />} />
            <Route path="/my-salary" element={<MySalaryPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}
