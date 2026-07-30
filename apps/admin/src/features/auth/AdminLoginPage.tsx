import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../stores/auth.store';
import { Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';
import { BrandLogo, useTheme } from '@coachos/ui';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { login, isLoading, error, clearError } = useAdminAuthStore();
  const navigate = useNavigate();

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
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-full text-steel hover:bg-surface transition-colors bg-canvas shadow-sm border border-hairline"
          title="Toggle Dark Mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative w-full max-w-[440px] animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo />
          </div>
          <p className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mt-2">Super Admin Console</p>
        </div>

        <div className="bg-canvas rounded-lg p-4 sm:p-8 sm:p-10 border border-hairline">
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
                  placeholder="operator@maneza.com"
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
              Access restricted to MANEZA platform operators only.
            </p>
          </div>
        </div>

        <p className="text-center text-steel text-[11px] font-semibold uppercase tracking-[0.5px] mt-10">
          (c) 2026 MANEZA Technologies
        </p>
      </div>
    </div>
  );
}
