import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../stores/auth.store';
import { Shield, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const { login, isLoading, error, clearError } = useAdminAuthStore();
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error is handled in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden hero-backdrop">
      <div className="absolute inset-x-0 top-0 h-24 bg-white/30 dark:bg-black/30" />
      
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={toggleDarkMode}
          className="w-10 h-10 flex items-center justify-center rounded-full text-steel hover:bg-surface transition-colors bg-canvas shadow-sm border border-hairline"
          title="Toggle Dark Mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative w-full max-w-[440px] animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary border border-hairline mb-5">
            <Shield className="w-7 h-7 text-brand-green" />
          </div>
          <h1 className="text-3xl font-semibold text-ink tracking-[-0.5px]">VidyaPlus</h1>
          <p className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mt-2">Super Admin Console</p>
        </div>

        <div className="bg-canvas rounded-lg p-8 sm:p-10 border border-hairline">
          <div className="mb-8">
            <h2 className="text-[28px] leading-tight font-semibold text-ink">Operator Login</h2>
            <p className="text-steel text-sm mt-2">Access the global platform management console</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-danger-50 border border-danger-200 text-brand-error text-sm flex items-center justify-between animate-fade-in">
              <span className="font-medium">{error}</span>
              <button onClick={clearError} className="ml-3 p-1 hover:bg-danger-50 rounded-md transition-colors flex-shrink-0">x</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[11px] font-semibold text-steel ml-1 uppercase tracking-[0.5px]">
                Admin Email
              </label>
              <div className="flex items-center bg-canvas border border-hairline rounded-md overflow-hidden focus-within:border-brand-green transition-colors">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="operator@vidyaplus.com"
                  className="w-full bg-transparent px-4 py-3 text-ink placeholder:text-stone focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-ink hover:underline transition-all">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="Password"
                  className="w-full pl-4 pr-14 py-3 bg-canvas border border-hairline rounded-md text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-steel hover:text-ink hover:bg-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="mint-btn-primary w-full disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In to Admin Console'
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-hairline text-center">
            <p className="text-steel text-[11px] font-semibold uppercase tracking-[0.5px]">
              Access restricted to CoachOS platform operators only.
            </p>
          </div>
        </div>

        <p className="text-center text-steel text-[11px] font-semibold uppercase tracking-[0.5px] mt-10">
          (c) 2026 VidyaPlus Technologies
        </p>
      </div>
    </div>
  );
}
