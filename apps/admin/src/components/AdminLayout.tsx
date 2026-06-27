import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/auth.store';
import { PWAInstallBanner } from '@coachos/ui';
import {
  LayoutDashboard, Building2, CreditCard, Settings, LogOut,
  Menu, Shield, ChevronLeft, Sun, Moon
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'institutes', label: 'Institutes', icon: Building2, path: '/institutes' },
  { id: 'plans', label: 'Plans & Billing', icon: CreditCard, path: '/plans' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAdminAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

  const currentNav = NAV_ITEMS.find(item =>
    location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
  );
  const pageTitle = currentNav?.label || 'Platform Overview';

  return (
    <div className="flex min-h-screen bg-surface font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-canvas border-r border-hairline transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-60' : 'w-20'
        } lg:relative lg:translate-x-0 ${!sidebarOpen && 'lg:w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-hairline-soft flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-brand-green" />
            </div>
            {sidebarOpen && (
              <div className="ml-3 overflow-hidden whitespace-nowrap">
                <h1 className="font-semibold text-ink tracking-tight">VidyaPlus</h1>
                <p className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] leading-none">Admin Console</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
              return (
                <button
                  key={label}
                  onClick={() => {
                    navigate(path);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center h-10 px-3 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-surface text-ink'
                      : 'text-steel hover:bg-surface hover:text-ink'
                  }`}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-brand-green' : 'text-steel group-hover:text-ink'
                  }`} />
                  {sidebarOpen && <span className="ml-3 truncate">{label}</span>}
                  {isActive && sidebarOpen && (
                    <div className="ml-auto w-1 h-4 bg-brand-green rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-hairline-soft space-y-1 flex-shrink-0">
            <PWAInstallBanner appName="VP Admin" collapsed={!sidebarOpen} />
             <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center h-10 px-3 rounded-md text-sm font-medium text-steel hover:bg-surface hover:text-ink transition-colors group hidden lg:flex"
            >
              <ChevronLeft className={`w-4 h-4 flex-shrink-0 text-steel group-hover:text-ink transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
              {sidebarOpen && <span className="ml-3">Collapse</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center h-10 px-3 rounded-md text-sm font-medium text-steel hover:bg-surface hover:text-brand-error transition-colors group"
            >
              <LogOut className="w-4 h-4 flex-shrink-0 text-steel group-hover:text-brand-error" />
              {sidebarOpen && <span className="ml-3">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 sm:px-4 sm:px-8 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-surface text-steel lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-ink">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full border border-hairline bg-canvas text-steel hover:text-ink hover:bg-surface flex items-center justify-center transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-green-soft text-ink rounded-full border border-brand-green/20">
               <span className="w-2 h-2 bg-brand-green rounded-full" />
               <span className="text-[11px] font-semibold uppercase tracking-[0.5px]">All Systems Operational</span>
             </div>
            
            <div className="h-8 w-px bg-hairline mx-1 hidden sm:block" />

            <div className="flex items-center gap-3 pl-1">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-ink leading-tight">{user?.name}</p>
                <p className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mt-0.5">Super Admin</p>
              </div>
              <div className="w-9 h-9 rounded-md bg-surface border border-hairline flex items-center justify-center overflow-hidden flex-shrink-0">
                <span className="text-sm font-semibold text-ink">{user?.name?.charAt(0) || 'A'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-10 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
