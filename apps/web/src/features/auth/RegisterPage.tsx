import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Loader2, 
  Mail, 
  Building2, 
  User, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import api from '../../lib/api';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId') || '00000000-0000-0000-0000-000000000001'; // Default to Aarambh
  
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    name: '',
    instituteName: '',
    email: '',
    password: '',
    otp: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { fetchUser, registerSendOtp, registerVerify } = useAuthStore();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await registerSendOtp(formData.email);
      setStep('otp');
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
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 hero-backdrop overflow-hidden">
        <div className="relative w-full max-w-[440px] animate-fade-in">
          <div className="bg-canvas rounded-lg p-3 sm:p-8 sm:p-4 sm:p-10 border border-hairline shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-5">
                <ShieldCheck className="w-7 h-7 text-brand-green" />
              </div>
              <h2 className="text-[28px] leading-tight font-semibold text-ink">Verify Email</h2>
              <p className="text-steel text-sm mt-2">
                We've sent a 6-digit code to <span className="text-ink font-medium">{formData.email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-md bg-danger-50 border border-danger-200 text-brand-error text-sm animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-[12px] font-bold py-4 bg-canvas border border-hairline rounded-md text-ink focus:outline-none focus:border-brand-green transition-all"
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
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => setStep('form')}
                className="w-full text-xs text-steel hover:text-ink transition-colors"
              >
                Change email or edit details
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 hero-backdrop overflow-hidden">
      <div className="relative w-full max-w-[480px] animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary border border-hairline mb-4">
            <GraduationCap className="w-6 h-6 text-brand-green" />
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-[-0.5px]">Create your CoachOS account</h1>
          <p className="text-steel text-sm mt-2 font-medium">Start your 14-day free trial</p>
        </div>

        <div className="bg-canvas rounded-lg p-3 sm:p-8 sm:p-4 sm:p-10 border border-hairline shadow-2xl relative">
          <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-brand-green/50 to-transparent" />
          
          {error && (
            <div className="mb-6 p-4 rounded-md bg-danger-50 border border-danger-200 text-brand-error text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Institute Name
              </label>
              <input
                type="text"
                value={formData.instituteName}
                onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                placeholder="e.g. Apex Academy"
                className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-md text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] flex items-center gap-1.5">
                <User className="w-3 h-3" /> Your Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-md text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Business Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@institute.com"
                className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-md text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full pl-4 pr-12 py-2.5 bg-canvas border border-hairline rounded-md text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-all"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-steel hover:text-ink transition-colors"
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

          <div className="mt-8 pt-6 border-t border-hairline text-center">
            <p className="text-steel text-xs">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-ink font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-steel text-[10px] uppercase tracking-wider mt-8 opacity-60">
          By registering, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}
