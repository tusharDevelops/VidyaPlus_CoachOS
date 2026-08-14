import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { applyTheme, GlobalPlatformBanner } from '@coachos/ui';
import { useAuthStore } from './stores/auth.store';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import OwnerLayout from './components/OwnerLayout';
import HomePage from './features/marketing/HomePage';
import MobileWelcomePage from './features/marketing/MobileWelcomePage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import StudentsPage from './features/students/StudentsPage';
import StudentProfilePage from './features/students/StudentProfilePage';
import BatchesPage from './features/batches/BatchesPage';
import FeePlansPage from './features/fees/FeePlansPage';
import FeeDashboardPage from './features/fees/FeeDashboardPage';
import StudentLedgerPage from './features/fees/StudentLedgerPage';
import ReceiptView from './features/fees/ReceiptView';
import AttendancePage from './features/attendance/AttendancePage';
import StaffPage from './features/staff/StaffPage';
import NotificationPage from './features/notifications/NotificationPage';
import ReportsPage from './features/reports/ReportsPage';
import SettingsPage from './features/settings/SettingsPage';
import PaymentRequiredModal from './features/subscription/PaymentRequiredModal';

import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import * as Sentry from '@sentry/react';

// Custom hook/component to manage the Android hardware back button
function HardwareBackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      // If we are at the root or dashboard, don't go "back" to a previous cached page, just exit the app.
      if (location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/login') {
        CapacitorApp.exitApp();
      } else if (canGoBack) {
        navigate(-1);
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [location.pathname, navigate]);

  return null;
}

export default function App() {
  const { isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchUser();
    
    // Initialize theme from saved preference or system default
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyTheme(shouldBeDark);

    // Listen for native system theme changes (Android dark mode toggle)
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
    <Sentry.ErrorBoundary fallback={<div className="p-3 sm:p-8 text-center"><p className="text-red-500 font-bold mb-2">Oops! Something went wrong.</p><p className="text-sm text-gray-500">Our team has been notified. Please refresh the page.</p></div>}>
      <PaymentRequiredModal />
      <BrowserRouter>
        <GlobalPlatformBanner />
        <HardwareBackButtonHandler />
        <Routes>
          <Route path="/" element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : Capacitor.isNativePlatform() ? (
              <MobileWelcomePage />
            ) : (
              <HomePage />
            )
          } />

          {/* Public routes — Now redirecting to landing modal */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={Capacitor.isNativePlatform() ? <LoginPage /> : <Navigate to="/?auth=login" replace />} />
            <Route path="/register" element={Capacitor.isNativePlatform() ? <RegisterPage /> : <Navigate to="/?auth=register" replace />} />
          </Route>

          {/* Protected routes with Owner layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<OwnerLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Phase 2 — Live modules */}
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/:studentId" element={<StudentProfilePage />} />
              <Route path="/batches" element={<BatchesPage />} />
              <Route path="/fees" element={<FeeDashboardPage />} />
              <Route path="/fees/plans" element={<FeePlansPage />} />
              <Route path="/fees/student/:studentId" element={<StudentLedgerPage />} />
              <Route path="/fees/receipt/:receiptNumber" element={<ReceiptView />} />
              {/* Phase 3+ — Placeholders */}
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/settings" element={<SettingsPage />} />

            </Route>
          </Route>

          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">{title}</h2>
      <p className="text-sm text-surface-500 max-w-md">{description}</p>
      <p className="text-xs text-surface-400 mt-3">This module will be built in an upcoming phase</p>
    </div>
  );
}
