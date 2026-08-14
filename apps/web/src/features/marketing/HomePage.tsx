import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { BrandLogo, useTheme } from '@coachos/ui';
import AuthModal from '../auth/AuthModal';
import {
  ArrowRight, BookOpen, GraduationCap, UserCog, ExternalLink, ChevronDown, Sun, Moon,
  Menu, X
} from 'lucide-react';

import {
  HeroSection,
  ProblemSection,
  PositioningSection,
  ShowcaseSection,
  NotAnErpSection,
  RolesSection,
  WorkflowSection,
  ModulesSection,
  DifferentiationSection,
  HowItStartsSection,
  PricingSection,
  SecuritySection,
  FaqSection,
  FinalCtaSection,
  FooterSection,
} from './sections';

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
    const authTrigger = searchParams.get('auth');
    if (authTrigger === 'login') {
      setAuthModal({ open: true, mode: 'login' });
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

  const handleAuthOpen = (mode: 'login' | 'register') => setAuthModal({ open: true, mode });
  const handleNavigate = (path: string) => navigate(path);

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-hairline-soft">
        <div className="max-w-[1280px] mx-auto h-16 px-4 sm:px-8 flex items-center justify-between gap-5">
          <button onClick={() => navigate('/')} className="flex items-center">
            <BrandLogo />
          </button>

          <nav className="hidden lg:flex items-center gap-7 text-sm text-steel">
            <a href="#product" className="hover:text-ink transition-colors">Product</a>
            <a href="#problem" className="hover:text-ink transition-colors">Why MANEZA</a>
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
                          <UserCog className="w-4 h-4 text-brand-tag" />
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
              {isAuthenticated ? 'Open dashboard' : 'Start free'}
              {!isAuthenticated && <ArrowRight className="w-4 h-4" />}
            </button>

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

      {/* ─── Mobile Drawer ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-canvas lg:hidden animate-in fade-in slide-in-from-top-5 duration-200 border-b border-hairline overflow-y-auto">
          <div className="p-6 space-y-6">
            <nav className="flex flex-col gap-4 text-base font-medium text-steel">
              <a href="#product" onClick={() => setMobileMenuOpen(false)} className="hover:text-ink transition-colors py-2 border-b border-hairline-soft">Product</a>
              <a href="#problem" onClick={() => setMobileMenuOpen(false)} className="hover:text-ink transition-colors py-2 border-b border-hairline-soft">Why MANEZA</a>
              <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="hover:text-ink transition-colors py-2 border-b border-hairline-soft">Modules</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-ink transition-colors py-2 border-b border-hairline-soft">Pricing</a>
              
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
                    <a href="https://maneza.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-surface transition-colors text-ink">
                      <GraduationCap className="w-4 h-4 text-brand-green" />
                      <span className="text-sm font-medium">Owner Portal</span>
                    </a>
                    <a href="https://maneza-staff.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-surface transition-colors text-ink">
                      <UserCog className="w-4 h-4 text-brand-tag" />
                      <span className="text-sm font-medium">Staff Portal</span>
                    </a>
                    <a href="https://maneza-student.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-surface transition-colors text-ink">
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
                {isAuthenticated ? 'Open dashboard' : 'Start free'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Page Sections ─── */}
      <main>
        <HeroSection 
          isAuthenticated={isAuthenticated} 
          onAuthOpen={handleAuthOpen} 
          onNavigate={handleNavigate} 
        />
        <ProblemSection />
        <PositioningSection />
        <ShowcaseSection 
          isAuthenticated={isAuthenticated} 
          onAuthOpen={handleAuthOpen} 
          onNavigate={handleNavigate} 
        />
        <NotAnErpSection />
        <RolesSection 
          isAuthenticated={isAuthenticated} 
          onAuthOpen={handleAuthOpen} 
          onNavigate={handleNavigate} 
        />
        <WorkflowSection />
        <ModulesSection 
          isAuthenticated={isAuthenticated} 
          onAuthOpen={handleAuthOpen} 
          onNavigate={handleNavigate} 
        />
        <DifferentiationSection />
        <HowItStartsSection 
          isAuthenticated={isAuthenticated} 
          onAuthOpen={handleAuthOpen} 
          onNavigate={handleNavigate} 
        />
        <PricingSection 
          plans={plans} 
          loading={loading} 
          isAuthenticated={isAuthenticated} 
          onAuthOpen={handleAuthOpen} 
          onNavigate={handleNavigate} 
        />
        <SecuritySection 
          isAuthenticated={isAuthenticated} 
          onAuthOpen={handleAuthOpen} 
          onNavigate={handleNavigate} 
        />
        <FaqSection />
        <FinalCtaSection 
          isAuthenticated={isAuthenticated} 
          onAuthOpen={handleAuthOpen} 
          onNavigate={handleNavigate} 
        />
      </main>

      <FooterSection />

      <AuthModal 
        isOpen={authModal.open} 
        onClose={() => setAuthModal({ ...authModal, open: false })} 
        initialMode={authModal.mode} 
      />
    </div>
  );
}
