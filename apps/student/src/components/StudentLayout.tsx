import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { PWAInstallBanner, BrandLogo, useTheme } from '@coachos/ui';
import {
  GraduationCap, CalendarCheck, CreditCard, Bell,
  LayoutDashboard, User, LogOut, MoreHorizontal, Sun, Moon, Menu, FileText,
  ArrowLeftRight, Building, ChevronRight, Loader2
} from 'lucide-react';

const BOTTOM_NAV = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
  { icon: FileText, label: 'Exams', path: '/exams' },
  { icon: CreditCard, label: 'Fees', path: '/fees' },
  { icon: MoreHorizontal, label: 'More', path: '/more' },
];

export default function StudentLayout() {
  const { user, logout, switchProfile, fetchSwitchableProfiles, switchableProfiles, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    fetchSwitchableProfiles();
  }, []);

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
          <BrandLogo />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
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
            {switchableProfiles.length > 0 && (
              <button
                onClick={() => { setShowMore(false); setShowSwitchModal(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-brand-green hover:bg-brand-green/5 transition-colors"
              >
                <ArrowLeftRight className="w-4 h-4" /> Switch Institute
              </button>
            )}
            <div className="px-1 py-1">
              <PWAInstallBanner appName="MANEZA Student" collapsed={false} />
            </div>
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
      {/* Switch Institute Modal */}
      {showSwitchModal && (
        <>
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-[70]" onClick={() => setShowSwitchModal(false)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-canvas border border-hairline w-full max-w-md rounded-2xl p-8 shadow-premium animate-slide-up space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                  <ArrowLeftRight className="w-7 h-7 text-brand-green" />
                </div>
                <h2 className="text-xl font-black text-ink tracking-tight">Switch Institute</h2>
                <p className="text-sm text-steel">Select the institute you want to switch to.</p>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                {/* Current institute */}
                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-brand-green bg-brand-green/5">
                  <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
                    <Building className="w-5 h-5 text-brand-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-ink">{user?.instituteName || 'Current Institute'}</h3>
                    <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest">Currently Active</p>
                  </div>
                </div>

                {/* Other profiles */}
                {switchableProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => switchProfile(profile.id)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-hairline bg-surface hover:border-ink/20 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      {profile.photoUrl ? (
                        <img src={profile.photoUrl} alt={profile.name} className="w-12 h-12 rounded-full object-cover border border-hairline" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center border border-hairline">
                          <Building className="w-5 h-5 text-stone" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-ink group-hover:text-brand-green transition-colors">{profile.instituteName}</h3>
                        <p className="text-xs text-steel">
                          <span className="uppercase tracking-wider text-[10px] font-bold">{profile.role}</span>
                        </p>
                      </div>
                    </div>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-stone animate-spin" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-stone group-hover:text-brand-green transition-colors" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowSwitchModal(false)}
                className="w-full h-11 text-sm font-medium text-steel hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
