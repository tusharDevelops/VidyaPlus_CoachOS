import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/auth.store';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import StudentLayout from './components/StudentLayout';

// Feature Pages
import MyAttendancePage from './features/attendance/MyAttendancePage';
import MyFeesPage from './features/fees/MyFeesPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import MyProfilePage from './features/profile/MyProfilePage';
import MyExamsPage from './features/exams/MyExamsPage';

// Simple route guards (student-specific, no extra deps)
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

import * as Sentry from '@sentry/react';

export default function App() {
  const { isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchUser();

    // Initialize Dark Mode
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

          {/* Protected — Student Layout */}
          <Route element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/attendance" element={<MyAttendancePage />} />
            <Route path="/exams" element={<MyExamsPage />} />
            <Route path="/fees" element={<MyFeesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<MyProfilePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}
