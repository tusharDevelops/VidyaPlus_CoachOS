import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { BrandLogo, useTheme } from '@coachos/ui';
import AuthModal from '../auth/AuthModal';
import {
  ArrowRight, BarChart3, Bell, BookOpen, CalendarCheck, CheckCircle2,
  CreditCard, GraduationCap, IndianRupee, Layers3, ShieldCheck, Shield, Users, UserCog, ExternalLink, ChevronDown, Sun, Moon,
  Menu, X
} from 'lucide-react';

const LOGOS = ['Aakash Prep', 'BrightPath', 'Narayana Local', 'Focus Academy', 'MeritHub', 'LearnWell'];

const FEATURES = [
  {
    icon: Users,
    title: 'Student directory',
    body: 'Manage profiles, parent contacts, enrollment status, and class history in one simple workspace.',
  },
  {
    icon: IndianRupee,
    title: 'Fee operations',
    body: 'Generate monthly dues, collect payments, print receipts, and inspect every student ledger.',
  },
  {
    icon: CalendarCheck,
    title: 'Daily attendance',
    body: 'Mark daily attendance, review calendar heatmaps, and spot batch-level gaps before they spread.',
  },
  {
    icon: Bell,
    title: 'Smart reminders',
    body: 'Queue fee reminders, absence alerts, and operational notifications without leaving the app.',
  },
];

const MODULES = [
  'Dashboard Overview',
  'Student Directory',
  'Classes & Batches',
  'Fee Structures',
  'Receipts',
  'Attendance',
  'Staff Management',
  'Reports',
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({ 
    open: false, 
    mode: 'login' 
  });
  const [isPortalsOpen, setIsPortalsOpen] = useState(false);
  const [isMobilePortalsOpen, setIsMobilePortalsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check for auth triggers in URL
    const authTrigger = searchParams.get('auth');
    if (authTrigger === 'login') {
      setAuthModal({ open: true, mode: 'login' });
      // Clear param without refresh
      searchParams.delete('auth');
      setSearchParams(searchParams);
    } else if (authTrigger === 'register') {
      setAuthModal({ open: true, mode: 'register' });
      searchParams.delete('auth');
      setSearchParams(searchParams);
    }

    const fetchPlans = async () => {
      try {
        const { data } = await api.get('/public/plans');
        setPlans(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        console.error('Failed to fetch plans', err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-hairline-soft">
        <div className="max-w-[1280px] mx-auto h-16 px-3 sm:px-3 sm:px-8 flex items-center justify-between gap-5">
          <button onClick={() => navigate('/')} className="flex items-center">
            <BrandLogo />
          </button>

          <nav className="hidden lg:flex items-center gap-7 text-sm text-steel">
            <a href="#product" className="hover:text-ink transition-colors">Product</a>
            <a href="#modules" className="hover:text-ink transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
            
            <div className="relative">
              <button 
                onClick={() => setIsPortalsOpen(!isPortalsOpen)}
                className={`flex items-center gap-1 transition-colors ${isPortalsOpen ? 'text-ink' : 'hover:text-ink'}`}
              >
                Portals <ChevronDown className={`w-3 h-3 transition-transform ${isPortalsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isPortalsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsPortalsOpen(false)} />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-5 w-64 bg-canvas border border-hairline rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-hairline bg-surface/50">
                      <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Access Portals</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <a href="https://maneza.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-surface transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center group-hover:bg-canvas border border-transparent group-hover:border-hairline transition-all">
                          <GraduationCap className="w-4 h-4 text-brand-green" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink">Owner Portal</p>
                          <p className="text-[10px] text-steel leading-tight mt-0.5">Manage your institute</p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-steel opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <a href="https://maneza-staff.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-surface transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center group-hover:bg-canvas border border-transparent group-hover:border-hairline transition-all">
                          <UserCog className="w-4 h-4 text-brand-purple" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink">Staff Portal</p>
                          <p className="text-[10px] text-steel leading-tight mt-0.5">Faculty & operations</p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-steel opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <a href="https://maneza-student.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-surface transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center group-hover:bg-canvas border border-transparent group-hover:border-hairline transition-all">
                          <BookOpen className="w-4 h-4 text-brand-green" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink">Student App</p>
                          <p className="text-[10px] text-steel leading-tight mt-0.5">Learner experience</p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-steel opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-steel hover:bg-surface transition-colors"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setAuthModal({ open: true, mode: 'login' })} 
              className="hidden sm:inline-flex mint-btn-secondary"
            >
              Sign in
            </button>
            <button 
              onClick={() => isAuthenticated ? navigate('/dashboard') : setAuthModal({ open: true, mode: 'register' })} 
              className="mint-btn-primary"
            >
              {isAuthenticated ? 'Open dashboard' : 'Get started'}
            </button>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-steel hover:bg-surface transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-canvas lg:hidden animate-in fade-in slide-in-from-top-5 duration-200 border-b border-hairline overflow-y-auto">
          <div className="p-6 space-y-6">
            <nav className="flex flex-col gap-4 text-base font-medium text-steel">
              <a 
                href="#product" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-ink transition-colors py-2 border-b border-hairline-soft"
              >
                Product
              </a>
              <a 
                href="#modules" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-ink transition-colors py-2 border-b border-hairline-soft"
              >
                Modules
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-ink transition-colors py-2 border-b border-hairline-soft"
              >
                Pricing
              </a>
              
              <div className="space-y-2 py-2">
                <button 
                  onClick={() => setIsMobilePortalsOpen(!isMobilePortalsOpen)}
                  className="flex items-center justify-between w-full hover:text-ink transition-colors text-left font-medium text-steel"
                >
                  <span>Portals</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMobilePortalsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobilePortalsOpen && (
                  <div className="pl-4 mt-2 space-y-3 border-l border-hairline-soft">
                    <a 
                      href="https://maneza.vercel.app/" 
                      target="_blank" rel="noopener noreferrer" 
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-surface transition-colors text-ink"
                    >
                      <GraduationCap className="w-4 h-4 text-brand-green" />
                      <span className="text-sm font-medium">Owner Portal</span>
                    </a>
                    <a 
                      href="https://maneza-staff.vercel.app/" 
                      target="_blank" rel="noopener noreferrer" 
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-surface transition-colors text-ink"
                    >
                      <UserCog className="w-4 h-4 text-brand-purple" />
                      <span className="text-sm font-medium">Staff Portal</span>
                    </a>
                    <a 
                      href="https://maneza-student.vercel.app/" 
                      target="_blank" rel="noopener noreferrer" 
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-surface transition-colors text-ink"
                    >
                      <BookOpen className="w-4 h-4 text-brand-green" />
                      <span className="text-sm font-medium">Student App</span>
                    </a>
                  </div>
                )}
              </div>
            </nav>
            
            <div className="pt-6 border-t border-hairline-soft flex flex-col gap-3">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModal({ open: true, mode: 'login' });
                }} 
                className="w-full justify-center mint-btn-secondary py-3 text-base flex items-center"
              >
                Sign in
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isAuthenticated) {
                    navigate('/dashboard');
                  } else {
                    setAuthModal({ open: true, mode: 'register' });
                  }
                }} 
                className="w-full justify-center mint-btn-brand py-3 text-base flex items-center"
              >
                {isAuthenticated ? 'Open dashboard' : 'Get started'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        <section className="hero-backdrop border-b border-hairline-soft overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-3 sm:px-3 sm:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12 lg:pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-canvas border border-hairline px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                  The Calm Institute OS
                </div>

                <h1 className="text-[32px] min-[360px]:text-[42px] sm:text-[56px] lg:text-[72px] leading-[1.05] font-semibold tracking-[-2px] text-ink">
                  Coaching Operations, Simplified.
                </h1>
                <p className="mt-6 text-base sm:text-lg leading-[1.5] text-charcoal max-w-xl">
                  MANEZA brings student records, fees, attendance, staff, reminders, and reports into a polished operating system built for growing institutes.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => isAuthenticated ? navigate('/dashboard') : setAuthModal({ open: true, mode: 'register' })} 
                    className="mint-btn-brand"
                  >
                    {isAuthenticated ? 'Open dashboard' : 'Start with MANEZA'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a href="#product" className="mint-btn-secondary">
                    See product
                  </a>
                </div>
              </div>

              <ProductMockup />
            </div>
          </div>
        </section>

        <section className="bg-canvas py-10 border-b border-hairline-soft">
          <div className="max-w-[1280px] mx-auto px-3 sm:px-3 sm:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {LOGOS.map((logo) => (
                <div key={logo} className="h-16 flex items-center justify-center text-sm font-medium text-steel">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="product" className="py-20 lg:py-24 bg-canvas">
          <div className="max-w-[1280px] mx-auto px-3 sm:px-3 sm:px-8">
            <div className="max-w-3xl mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">Product</p>
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1]">
                Dense enough for daily operations. Polished enough for every stakeholder.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <article key={title} className="mint-card p-6">
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-ink mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-[1.5] text-steel">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="modules" className="py-20 lg:py-24 bg-surface border-y border-hairline-soft">
          <div className="max-w-[1280px] mx-auto px-3 sm:px-3 sm:px-8 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">Modules</p>
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1]">
                Every core workflow, arranged for fast scanning.
              </h2>
              <p className="mt-5 text-base leading-[1.5] text-charcoal">
                Built for owners and staff who open the system many times a day. No marketing dashboard fluff, just clean operational surfaces.
              </p>
            </div>

            <div className="mint-card bg-canvas overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {MODULES.map((module) => (
                  <div key={module} className="flex items-center gap-3 px-6 py-5 border-b border-hairline-soft sm:odd:border-r">
                    <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
                    <span className="text-sm font-medium text-charcoal">{module}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 lg:py-24 bg-canvas">
          <div className="max-w-[1280px] mx-auto px-3 sm:px-3 sm:px-8">

            {/* Section Header */}
            <div className="text-center mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">Pricing</p>
              <h2 className="text-4xl sm:text-[48px] font-semibold tracking-[-1px] text-ink leading-[1.1] mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-base text-steel max-w-xl mx-auto leading-[1.5]">
                Start at ₹99/month. Upgrade as you grow. No setup fees. No contracts. Cancel anytime.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="mint-card p-3 sm:p-8 animate-pulse">
                    <div className="h-7 bg-surface rounded w-2/5 mb-2" />
                    <div className="h-3 bg-surface rounded w-1/3 mb-5" />
                    <div className="h-4 bg-surface rounded w-3/4 mb-8" />
                    <div className="h-14 bg-surface rounded w-full mb-2" />
                    <div className="h-3 bg-surface rounded w-1/4 mb-8" />
                    <div className="h-10 bg-surface rounded-full w-full mb-8" />
                    <div className="space-y-3">
                      {[1,2,3,4,5,6].map(j => <div key={j} className="h-3.5 bg-surface rounded w-full" />)}
                    </div>
                  </div>
                ))
              ) : (
                plans.map((plan, index) => {
                  const isFeatured = index === 1;
                  const planShortName = plan.name.split(' ')[0];
                  const planTier = plan.name.match(/\(([^)]+)\)/)?.[1] ?? '';
                  const storageLabel = plan.maxStorageMb >= 1000
                    ? `${Math.round(plan.maxStorageMb / 1000)} GB storage`
                    : `${plan.maxStorageMb} MB storage`;
                  const studentsLabel = plan.maxStudents >= 10000 ? 'Unlimited students' : `Up to ${plan.maxStudents} students`;
                  const batchesLabel = plan.maxBatches >= 1000 ? 'Unlimited batches' : `${plan.maxBatches} batches`;

                  const staffLabel = plan.maxStaff >= 1000 ? 'Unlimited staff' : `Up to ${plan.maxStaff} staff`;

                  const featuresList: string[] = [
                    studentsLabel,
                    batchesLabel,
                    staffLabel,
                    storageLabel,
                    'All features unlocked (LMS, Payroll, Exams)',
                    plan.featuresJson?.support ?? 'Help center support',
                  ].filter(Boolean) as string[];

                  const taglines = [
                    'Perfect for solo tutors just getting started.',
                    'For growing coaching centers managing multiple batches.',
                    'For large coaching hubs managing multiple branches.',
                  ];

                  const ctaLabels = ['Get started for free', 'Get started', 'Talk to sales'];

                  return (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col rounded-lg p-3 sm:p-8 transition-all ${
                        isFeatured
                          ? 'border-2 border-brand-green bg-canvas shadow-[rgba(0,212,164,0.08)_0px_8px_24px]'
                          : 'border border-hairline bg-canvas'
                      }`}
                    >
                      {/* Most Popular Badge */}
                      {isFeatured && (
                        <div className="absolute top-6 right-6">
                          <span className="mint-badge">Most Popular</span>
                        </div>
                      )}

                      {/* Plan Name & Tier */}
                      <div className="mb-1">
                        <h3 className="text-[28px] leading-[1.25] font-semibold text-ink">{planShortName}</h3>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mt-0.5">({planTier})</p>
                      </div>

                      {/* Tagline */}
                      <p className="mt-3 text-sm text-steel leading-[1.5]">{taglines[index]}</p>

                      {/* Price */}
                      <div className="mt-8 mb-8">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[56px] font-semibold font-mono text-ink tracking-[-1.5px] leading-none">
                            ₹{Number(plan.priceMonthly).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2 text-[13px] text-steel">/month + GST</p>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => {
                          if (index === 2) {
                            setAuthModal({ open: true, mode: 'login' });
                          } else {
                            setSearchParams({ planId: plan.id });
                            setAuthModal({ open: true, mode: 'register' });
                          }
                        }}
                        className={`w-full min-h-[42px] px-5 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${
                          isFeatured
                            ? 'bg-brand-green text-primary hover:bg-brand-green-deep'
                            : 'bg-primary text-on-primary hover:bg-charcoal'
                        }`}
                      >
                        {ctaLabels[index]}
                      </button>

                      {/* Divider */}
                      <div className="mt-8 pt-8 border-t border-hairline-soft flex-1">
                        <ul className="space-y-[10px]">
                          {featuresList.map((feat) => (
                            <li key={feat} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-charcoal leading-[1.4]">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Note */}
            <p className="mt-8 text-center text-[13px] text-steel flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-green flex-shrink-0" />
              Aarambh is free forever. Paid plans require a subscription.
            </p>
          </div>
        </section>

        <section id="security" className="bg-canvas-dark text-on-dark py-16">
          <div className="max-w-[1280px] mx-auto px-3 sm:px-3 sm:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-brand-green mb-4">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.5px]">Secure by design</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.5px]">Role-based access for owners, staff, teachers, and students.</h2>
              <p className="mt-4 text-sm leading-[1.5] text-on-dark-muted">
                Permissions, authentication, and audit-friendly workflows keep every module clear without slowing daily operations.
              </p>
            </div>
            <button 
              onClick={() => isAuthenticated ? navigate('/dashboard') : setAuthModal({ open: true, mode: 'login' })} 
              className="bg-on-dark text-primary min-h-10 px-5 rounded-full text-sm font-medium inline-flex items-center justify-center gap-2"
            >
              {isAuthenticated ? 'Open dashboard' : 'Sign in'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <AuthModal 
        isOpen={authModal.open} 
        onClose={() => setAuthModal({ ...authModal, open: false })} 
        initialMode={authModal.mode} 
      />
    </div>
  );
}

function ProductMockup() {
  return (
    <div className="bg-canvas rounded-lg border border-hairline-soft shadow-[rgba(0,0,0,0.12)_0px_24px_48px_-8px] overflow-hidden">
      <div className="h-11 bg-surface border-b border-hairline-soft flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-error" />
          <span className="w-2.5 h-2.5 rounded-full bg-brand-warn" />
          <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-steel font-mono">
          coachos.Maneza.in/dashboard
        </div>
      </div>

      <div className="grid grid-cols-[160px_1fr] min-h-[520px]">
        <aside className="hidden sm:block border-r border-hairline-soft bg-canvas p-4">
          <div className="h-8 rounded-md bg-surface mb-5" />
          {[
            ['Dashboard', Layers3],
            ['Students', Users],
            ['Batches', BookOpen],
            ['Fees', CreditCard],
            ['Reports', BarChart3],
          ].map(([label, Icon], index) => {
            const LucideIcon = Icon as typeof Layers3;
            return (
              <div key={label as string} className={`flex items-center gap-2 h-9 px-3 rounded-md text-sm mb-1 ${index === 0 ? 'bg-surface text-ink font-medium' : 'text-steel'}`}>
                <LucideIcon className={`w-4 h-4 ${index === 0 ? 'text-brand-green' : 'text-steel'}`} />
                <span>{label as string}</span>
              </div>
            );
          })}
        </aside>

        <div className="col-span-2 sm:col-span-1 p-4 sm:p-6 bg-canvas">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel">Today</p>
              <h3 className="text-[24px] sm:text-[28px] leading-[1.25] font-semibold text-ink">Institute overview</h3>
            </div>
            <div className="h-9 rounded-full bg-primary text-on-primary px-4 inline-flex items-center justify-center text-sm font-medium self-start sm:self-auto">
              Collect fee
            </div>
          </div>

          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              ['Students', '1,248'],
              ['Collected', 'INR 4.8L'],
              ['Pending', 'INR 86K'],
              ['Attendance', '92%'],
            ].map(([label, value], index) => (
              <div key={label} className="rounded-lg border border-hairline p-4 bg-canvas">
                <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel">{label}</p>
                <p className="mt-2 text-xl font-semibold text-ink font-mono">{value}</p>
                <div className="mt-3 h-1.5 rounded-full bg-surface overflow-hidden">
                  <div className={`h-full rounded-full ${index === 2 ? 'bg-brand-error' : 'bg-brand-green'}`} style={{ width: `${index === 2 ? 38 : 78}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-hairline overflow-x-auto">
            <div className="min-w-[400px]">
              <div className="grid grid-cols-4 bg-surface text-[11px] font-semibold uppercase tracking-[0.5px] text-steel">
              <div className="px-4 py-3">Student</div>
              <div className="px-4 py-3">Batch</div>
              <div className="px-4 py-3">Status</div>
              <div className="px-4 py-3 text-right">Balance</div>
            </div>
            {[
              ['Aarav Sharma', 'Physics XI', 'Paid', '0'],
              ['Nisha Verma', 'Maths XII', 'Due', '4,500'],
              ['Kabir Khan', 'Foundation', 'Paid', '0'],
              ['Meera Joshi', 'Chemistry', 'Partial', '1,800'],
            ].map(([name, batch, status, balance]) => (
              <div key={name} className="grid grid-cols-4 border-t border-hairline-soft text-sm">
                <div className="px-4 py-4 font-medium text-ink truncate">{name}</div>
                <div className="px-4 py-4 text-steel truncate">{batch}</div>
                <div className="px-4 py-4">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status === 'Paid' ? 'bg-brand-green-soft text-ink' : 'bg-danger-50 text-brand-error'}`}>
                    {status}
                  </span>
                </div>
                <div className="px-4 py-4 text-right text-ink font-mono">{balance}</div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
