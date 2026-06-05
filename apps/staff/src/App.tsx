import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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

export default function App() {
  const { isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchUser();

    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Sentry.ErrorBoundary fallback={<div className="p-4 sm:p-8 text-center"><p className="text-red-500 font-bold mb-2">Oops! Something went wrong.</p><p className="text-sm text-gray-500">Our team has been notified. Please refresh the page.</p></div>}>
      <BrowserRouter>
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
            <Route path="/wallet" element={<PlaceholderPage title="Wallet" />} />
            <Route path="/marketing" element={<PlaceholderPage title="Marketing Campaigns" />} />
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
