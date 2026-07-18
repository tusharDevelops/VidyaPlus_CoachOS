import { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { Loader2, Mail, CheckCircle2, Building, ChevronRight, ArrowLeft, Sun, Moon } from 'lucide-react';
import { BrandLogo } from '@coachos/ui';

export default function LoginPage() {
  const { sendLoginOtp, verifyLoginOtp, selectProfile, isLoading, error, clearError } = useAuthStore();
  
  const [step, setStep] = useState<'email' | 'otp' | 'profile'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };
  
  // Profile selection state
  const [profiles, setProfiles] = useState<any[]>([]);
  const [sessionToken, setSessionToken] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendLoginOtp(email);
      setStep('otp');
    } catch {
      // Error handled in store
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    try {
      const result = await verifyLoginOtp(email, otp);
      if (result.type === 'select_profile' && result.profiles && result.sessionToken) {
        setProfiles(result.profiles);
        setSessionToken(result.sessionToken);
        setStep('profile');
      }
      // If 'authenticated', the store will update isAuthenticated and App.tsx will route away.
    } catch {
      // Error handled in store
    }
  };

  const handleSelectProfile = async (userId: string) => {
    try {
      await selectProfile(sessionToken, userId);
      // App.tsx will route away on auth
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Hero */}
      <div className="hero-backdrop flex-shrink-0 py-8 px-4 text-center border-b border-hairline relative">
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-full text-steel hover:bg-surface transition-colors bg-canvas shadow-sm border border-hairline"
            title="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 mb-2">
          <BrandLogo />
          <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Student Portal</p>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          
          {error && (
            <div className="px-4 py-3 rounded-lg bg-brand-error/10 border border-brand-error/20 text-sm text-brand-error font-medium animate-fade-in">
              {error}
            </div>
          )}

          {step === 'email' && (
            <div className="animate-fade-in space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-ink tracking-tight">Welcome back</h2>
                <p className="text-sm text-steel">Enter your email to receive a login code.</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-ink-muted uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearError(); }}
                      placeholder="you@example.com"
                      required
                      className="input-field pl-10"
                      autoComplete="email"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full mint-btn-primary h-11 text-sm font-bold flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>Send Login Code <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'otp' && (
            <div className="animate-fade-in space-y-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-brand-green" />
                </div>
                <h2 className="text-2xl font-bold text-ink tracking-tight">Check Your Email</h2>
                <p className="text-sm text-steel">
                  We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-ink-muted uppercase tracking-widest">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); clearError(); }}
                    placeholder="••••••"
                    className="input-field text-center text-2xl tracking-[0.5em] font-mono h-14"
                    required
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full mint-btn-primary h-11 text-sm font-bold"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setOtp(''); clearError(); }}
                    disabled={isLoading}
                    className="w-full h-11 text-sm font-medium text-steel hover:text-ink flex items-center justify-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Use a different email
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'profile' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-ink tracking-tight">Select Profile</h2>
                <p className="text-sm text-steel">Your email is linked to multiple accounts.</p>
              </div>

              <div className="space-y-3">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile.id)}
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
                        <h3 className="font-bold text-ink group-hover:text-brand-green transition-colors">{profile.name}</h3>
                        <p className="text-xs text-steel flex flex-col gap-0.5">
                          <span className="font-medium text-ink-muted">{profile.instituteName}</span>
                          <span className="uppercase tracking-wider text-[10px]">{profile.role}</span>
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
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
