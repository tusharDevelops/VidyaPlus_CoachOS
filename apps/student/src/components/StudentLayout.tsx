import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { PWAInstallBanner } from '@coachos/ui';
import {
  GraduationCap, CalendarCheck, CreditCard, Bell,
  LayoutDashboard, User, LogOut, MoreHorizontal, Sun, Moon, Menu, FileText
} from 'lucide-react';

const BOTTOM_NAV = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
  { icon: FileText, label: 'Exams', path: '/exams' },
  { icon: CreditCard, label: 'Fees', path: '/fees' },
  { icon: MoreHorizontal, label: 'More', path: '/more' },
];

export default function StudentLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas font-sans pb-20">
      {/* Top Header — Compact */}
      <header className="h-14 sticky top-0 z-40 bg-canvas/80 backdrop-blur-md border-b border-hairline px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowMore(true)} className="p-2 -ml-2 rounded-lg hover:bg-surface text-ink-muted">
             <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-brand-green" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-ink tracking-tight leading-none">VidyaPlus</h1>
            <p className="text-[9px] font-bold text-ink-muted uppercase tracking-widest">{user?.instituteName || 'Student'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleDarkMode}
            className="w-9 h-9 flex items-center justify-center rounded-full text-steel hover:bg-surface transition-colors"
            title="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="w-9 h-9 flex items-center justify-center rounded-full text-steel hover:bg-surface"
          >
            <Bell className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-md bg-surface border border-hairline flex items-center justify-center overflow-hidden">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-ink">{user?.name?.charAt(0)}</span>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full animate-fade-in">
        <Outlet />
      </main>

      {/* More Menu Overlay */}
      {showMore && (
        <>
          <div className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-50" onClick={() => setShowMore(false)} />
          <div className="fixed bottom-20 left-4 right-4 z-50 bg-canvas border border-hairline rounded-lg p-2 space-y-1 animate-slide-up">
            <button
              onClick={() => { navigate('/profile'); setShowMore(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-ink hover:bg-surface transition-colors"
            >
              <User className="w-4 h-4 text-steel" /> My Profile
            </button>
            <button
              onClick={() => { navigate('/notifications'); setShowMore(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-ink hover:bg-surface transition-colors"
            >
              <Bell className="w-4 h-4 text-steel" /> Notifications
            </button>
            <div className="h-px bg-hairline mx-2" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-brand-error hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </>
      )}

      {/* Bottom Navigation — Mobile-first */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-canvas border-t border-hairline px-2 pb-safe">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {BOTTOM_NAV.map(({ icon: Icon, label, path }) => {
            const isMore = path === '/more';
            const isActive = isMore ? showMore : (location.pathname === path || location.pathname.startsWith(path));

            return (
              <button
                key={label}
                onClick={() => {
                  if (isMore) {
                    setShowMore(!showMore);
                  } else {
                    setShowMore(false);
                    navigate(path);
                  }
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                  isActive ? 'text-ink' : 'text-steel'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {label}
                </span>
                {isActive && !isMore && (
                  <div className="absolute top-0 w-8 h-1 bg-brand-green rounded-b-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <PWAInstallBanner appName="VP Student" />
    </div>
  );
}

