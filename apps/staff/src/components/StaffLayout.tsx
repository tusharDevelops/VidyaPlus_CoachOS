import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { PWAInstallBanner } from '@coachos/ui';
import api from '../lib/api';
import {
  GraduationCap, Bell, TrendingUp, Wallet, Megaphone, 
  IndianRupee, Banknote, UserCircle, LogOut, LayoutDashboard,
  Menu, X, Search, ChevronLeft, MoreHorizontal, Sun, Moon
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Bell, label: 'Notifications', path: '/notifications', permission: 'notifications.view' },
  { icon: TrendingUp, label: 'Reports', path: '/reports', permission: 'reports.view' },
  { icon: Wallet, label: 'Wallet', path: '/wallet', permission: 'wallet.view' },
  { icon: Megaphone, label: 'Marketing', path: '/marketing', permission: 'marketing.campaigns' },
  { icon: IndianRupee, label: 'Fees & Payments', path: '/fees', permission: 'fees.view' },
  { icon: Banknote, label: 'My Salary', path: '/my-salary' },
  { icon: UserCircle, label: 'My Profile', path: '/my-profile' },
];

const BOTTOM_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: IndianRupee, label: 'Fees', path: '/fees', permission: 'fees.view' },
  { icon: Banknote, label: 'Salary', path: '/my-salary' },
  { icon: MoreHorizontal, label: 'More', path: 'more' },
];

export default function StaffLayout() {
  const { user, logout, hasPermission } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();
  const location = useLocation();

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

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications');
      setUnreadCount(data.data.unreadCount || 0);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans pb-20 lg:pb-0 lg:flex-row">
      {/* Sidebar - Hidden on mobile, fixed/sticky on desktop */}
      <aside 
        className={`fixed inset-y-0 left-0 z-60 bg-canvas border-r border-hairline transition-all duration-300 ease-in-out 
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'} 
          lg:relative lg:translate-x-0 lg:z-30 ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-hairline flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-brand-green" />
            </div>
            {(sidebarOpen || window.innerWidth < 1024) && (
              <div className="ml-3 overflow-hidden whitespace-nowrap">
                <h1 className="font-bold text-ink tracking-tight">VidyaPlus</h1>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest leading-none">Staff Portal</p>
              </div>
            )}
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 rounded-lg hover:bg-surface-hover text-ink-muted">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.filter(item => !item.permission || hasPermission(item.permission)).map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
              return (
                <button
                  key={label}
                  onClick={() => {
                    navigate(path);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center h-9 px-3 rounded-md text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-surface text-brand-green'
                      : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
                  }`}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-brand-green' : 'text-ink-muted group-hover:text-ink'
                  }`} />
                  {(sidebarOpen || window.innerWidth < 1024) && <span className="ml-3 truncate">{label}</span>}
                  {isActive && (sidebarOpen || window.innerWidth < 1024) && (
                    <div className="ml-auto w-1 h-1 bg-brand-green rounded-full shadow-[0_0_8px_rgba(0,212,164,0.6)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-hairline-soft space-y-1 flex-shrink-0">
             <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full hidden lg:flex items-center h-10 px-3 rounded-md text-sm font-medium text-steel hover:bg-surface transition-colors group"
            >
              <ChevronLeft className={`w-4 h-4 flex-shrink-0 text-steel group-hover:text-ink transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
              {sidebarOpen && <span className="ml-3">Collapse</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center h-10 px-3 rounded-md text-sm font-medium text-steel hover:bg-surface hover:text-brand-error transition-colors group"
            >
              <LogOut className="w-4 h-4 flex-shrink-0 text-steel group-hover:text-brand-error" />
              {(sidebarOpen || window.innerWidth < 1024) && <span className="ml-3">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - Always visible, compact on mobile */}
        <header className="h-16 sticky top-0 z-40 bg-canvas/80 backdrop-blur-md border-b border-hairline px-4 sm:px-8 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
             {/* Mobile Logo Only */}
             <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-surface text-ink-muted">
                <Menu className="w-5 h-5" />
             </button>
             <div className="lg:hidden w-8 h-8 rounded-lg bg-ink flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-brand-green" />
             </div>
             <h1 className="lg:hidden text-base font-bold text-ink tracking-tight">VidyaPlus</h1>
             
             {/* Desktop Search Placeholder */}
             <div className="relative max-w-md hidden lg:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  className="w-64 pl-10 pr-4 py-2 bg-surface border border-hairline rounded-md text-sm focus:bg-canvas focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green transition-all outline-none"
                />
             </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={toggleDarkMode}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-steel hover:bg-surface transition-colors"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button onClick={() => navigate('/notifications')} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-steel hover:bg-surface relative group">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-error rounded-full border-2 border-canvas" />
              )}
            </button>
            
            <div className="h-8 w-px bg-hairline mx-1 hidden sm:block" />

            <div className="flex items-center gap-3 pl-1">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-ink leading-tight truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mt-0.5">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-md bg-surface border border-hairline flex items-center justify-center overflow-hidden flex-shrink-0">
                {(user?.photoUrl || user?.avatar) ? (
                  <img src={user.photoUrl || user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-ink">{user?.name?.charAt(0)}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-canvas border-t border-hairline lg:hidden px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {BOTTOM_NAV_ITEMS.filter(item => !item.permission || hasPermission(item.permission)).map(({ icon: Icon, label, path }) => {
            const isActive = path === 'more' ? sidebarOpen : (location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path)));
            return (
              <button
                key={label}
                onClick={() => {
                  if (path === 'more') setSidebarOpen(true);
                  else navigate(path);
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                  isActive ? 'text-ink' : 'text-steel'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {label}
                </span>
                {isActive && path !== 'more' && (
                   <div className="absolute top-0 w-8 h-1 bg-brand-green rounded-b-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <PWAInstallBanner appName="VP Staff" />
    </div>
  );
}
