import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { 
  X, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Loader2, 
  Mail, 
  Building2, 
  User, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot' | 'verify-reset' | 'reset'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    instituteName: '',
    email: '',
    password: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { login, registerSendOtp, registerVerify, forgotPassword, verifyResetOtp, resetPassword, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId') || '00000000-0000-0000-0000-000000000001';

  // Sync mode with initialMode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = formData.email.trim();
    const password = formData.password;
    
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = formData.email.trim();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    try {
      await registerSendOtp(email);
      setMode('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await registerVerify({
        ...formData,
        planId
      });
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;
    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword(formData.email);
      setMode('verify-reset');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp) return;
    setIsLoading(true);
    setError(null);
    try {
      await verifyResetOtp(formData.email, formData.otp);
      setMode('reset');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(formData.email, formData.otp, formData.newPassword);
      setMode('login');
      alert('Password reset successful. Please sign in with your new password.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[460px] bg-canvas rounded-2xl border border-hairline shadow-2xl overflow-hidden animate-scale-up">
        {/* Header Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-brand-green/40 to-transparent" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-steel hover:text-ink hover:bg-surface rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-3 sm:p-8 sm:p-4 sm:p-10">
          {/* Logo & Intro */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary border border-hairline mb-4">
              <GraduationCap className="w-6 h-6 text-brand-green" />
            </div>
            <h2 className="text-2xl font-semibold text-ink tracking-tight">
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Create your account'}
              {mode === 'otp' && 'Verify Email'}
              {mode === 'forgot' && 'Forgot Password?'}
              {mode === 'verify-reset' && 'Verify OTP'}
              {mode === 'reset' && 'Set New Password'}
            </h2>
            <p className="text-steel text-sm mt-1.5 font-medium">
              {mode === 'login' && 'Sign in to your MANEZA command center'}
              {mode === 'register' && 'Create your account'}
              {mode === 'otp' && `We've sent a code to ${formData.email}`}
              {mode === 'forgot' && 'Enter your email to receive a reset code'}
              {mode === 'verify-reset' && `Enter the code sent to ${formData.email}`}
              {mode === 'reset' && 'Create a strong new password'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger-50 border border-danger-100 text-brand-error text-xs font-medium animate-fade-in flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-error mt-1 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-steel uppercase tracking-[0.5px] ml-0.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@institute.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-hairline rounded-lg text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-0.5">
                  <label className="text-[11px] font-bold text-steel uppercase tracking-[0.5px]">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setMode('forgot')}
                    className="text-[11px] font-bold text-ink hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password"
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-lg text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-steel hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !formData.email.trim().includes('@')}
                  className="mint-btn-primary w-full group"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Sign In to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-steel uppercase tracking-[0.5px] ml-0.5">Institute</label>
                  <input
                    type="text"
                    value={formData.instituteName}
                    onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                    placeholder="e.g. Apex"
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-lg text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-steel uppercase tracking-[0.5px] ml-0.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-lg text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-steel uppercase tracking-[0.5px] ml-0.5">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@institute.com"
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-lg text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-steel uppercase tracking-[0.5px] ml-0.5">Create Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 8 characters"
                    className="w-full pl-4 pr-12 py-2.5 bg-canvas border border-hairline rounded-lg text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-steel hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mint-btn-primary w-full group"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Send Verification Code
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* OTP Step */}
          {mode === 'otp' && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-center text-[11px] font-bold text-steel uppercase tracking-[0.5px]">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  placeholder="000000"
                  className="w-full text-center text-3xl tracking-[12px] font-bold py-5 bg-surface/30 border border-hairline rounded-xl text-ink focus:outline-none focus:border-brand-green transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || formData.otp.length !== 6}
                className="mint-btn-primary w-full group"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Complete Registration
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => setMode('register')}
                className="w-full text-xs font-semibold text-steel hover:text-ink transition-colors"
              >
                Change email or edit details
              </button>
            </form>
          )}

          {/* Forgot Password Flow */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-steel uppercase tracking-[0.5px] ml-0.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@institute.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-hairline rounded-lg text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="mint-btn-primary w-full">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send OTP'}
              </button>
              <button type="button" onClick={() => setMode('login')} className="w-full text-xs font-bold text-steel hover:text-ink">
                Back to Login
              </button>
            </form>
          )}

          {mode === 'verify-reset' && (
            <form onSubmit={handleVerifyResetOtp} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-center text-[11px] font-bold text-steel uppercase tracking-[0.5px]">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  placeholder="000000"
                  className="w-full text-center text-3xl tracking-[12px] font-bold py-5 bg-surface/30 border border-hairline rounded-xl text-ink focus:outline-none focus:border-brand-green transition-all"
                  required
                />
              </div>
              <button type="submit" disabled={isLoading || formData.otp.length !== 6} className="mint-btn-primary w-full">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify Code'}
              </button>
              <button type="button" onClick={() => setMode('forgot')} className="w-full text-xs font-bold text-steel hover:text-ink">
                Change email or resend
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-steel uppercase tracking-[0.5px] ml-0.5">New Password</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-lg text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-steel uppercase tracking-[0.5px] ml-0.5">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-lg text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                  required
                />
              </div>
              <button type="submit" disabled={isLoading} className="mint-btn-primary w-full">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Update Password'}
              </button>
            </form>
          )}

          {/* Toggle Footer */}
          {(mode === 'login' || mode === 'register') && (
            <div className="mt-8 pt-6 border-t border-hairline text-center">
              <p className="text-steel text-xs font-medium">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button 
                  onClick={toggleMode}
                  className="text-ink font-bold hover:underline"
                >
                  {mode === 'login' ? 'Create for free' : 'Sign In'}
                </button>
              </p>
            </div>
          )}

          {mode === 'register' && (
            <p className="text-center text-steel text-[10px] font-medium uppercase tracking-[0.2px] mt-6 opacity-60">
              By registering, you agree to our Terms and Privacy Policy
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
