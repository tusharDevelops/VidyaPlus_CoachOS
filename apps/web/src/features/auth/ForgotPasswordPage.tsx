import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { ArrowLeft, Key, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '@coachos/ui';

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword, verifyResetOtp, resetPassword, isLoading, error, clearError } = useAuthStore();
  
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setStep('otp');
    } catch {
      // Error in store
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyResetOtp(email, otp);
      setStep('reset');
    } catch {
      // Error in store
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess(true);
    } catch {
      // Error in store
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 hero-backdrop">
        <div className="w-full max-w-[440px] bg-canvas rounded-lg p-4 sm:p-10 border border-hairline text-center space-y-6 animate-fade-in shadow-premium">
          <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-brand-green" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-ink">Success!</h2>
            <p className="text-sm text-steel">Your password has been reset successfully.</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full mint-btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden hero-backdrop">
      <div className="absolute inset-x-0 top-0 h-24 bg-white/30" />

      <div className="relative w-full max-w-[440px] animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo />
          </div>
          <p className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mt-2">Security Center</p>
        </div>

        <div className="bg-canvas rounded-lg p-3 sm:p-8 sm:p-4 sm:p-10 border border-hairline shadow-premium">
          <button
            onClick={() => step === 'email' ? navigate('/login') : setStep(step === 'reset' ? 'otp' : 'email')}
            className="flex items-center gap-2 text-[10px] font-bold text-steel hover:text-ink transition-colors uppercase tracking-[1px] mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          <div className="mb-8">
            <h2 className="text-[28px] leading-tight font-semibold text-ink">
              {step === 'email' && 'Forgot?'}
              {step === 'otp' && 'Verify'}
              {step === 'reset' && 'Reset'}
            </h2>
            <p className="text-steel text-sm mt-2">
              {step === 'email' && 'Enter your email for the OTP code.'}
              {step === 'otp' && `Enter code sent to ${email}`}
              {step === 'reset' && 'Set a new secure password.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-danger-50 border border-danger-200 text-brand-error text-sm animate-fade-in">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form 
            onSubmit={step === 'email' ? handleSendOtp : step === 'otp' ? handleVerifyOtp : handleResetPassword} 
            className="space-y-6"
          >
            {step === 'email' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-steel ml-1 uppercase tracking-[0.5px]">Email Address</label>
                <div className="flex items-center bg-canvas border border-hairline rounded-md overflow-hidden focus-within:border-brand-green">
                  <Mail className="ml-4 w-4 h-4 text-stone" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    placeholder="you@example.com"
                    required
                    className="flex-1 bg-transparent px-4 py-3 text-ink placeholder:text-stone focus:outline-none"
                  />
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-steel ml-1 uppercase tracking-[0.5px]">Verification Code</label>
                <div className="flex items-center bg-canvas border border-hairline rounded-md overflow-hidden focus-within:border-brand-green">
                  <Key className="ml-4 w-4 h-4 text-stone" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); clearError(); }}
                    placeholder="6-digit code"
                    required
                    className="flex-1 bg-transparent px-4 py-3 text-ink placeholder:text-stone focus:outline-none tracking-[0.5em] font-mono text-center"
                  />
                </div>
              </div>
            )}

            {step === 'reset' && (
              <>
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-steel ml-1 uppercase tracking-[0.5px]">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); clearError(); }}
                    placeholder="Min 8 characters"
                    required
                    className="w-full px-4 py-3 bg-canvas border border-hairline rounded-md text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-steel ml-1 uppercase tracking-[0.5px]">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                    placeholder="Repeat new password"
                    required
                    className="w-full px-4 py-3 bg-canvas border border-hairline rounded-md text-ink placeholder:text-stone focus:outline-none focus:border-brand-green transition-colors"
                  />
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="mint-btn-primary w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  step === 'email' ? 'Send Reset OTP' : step === 'otp' ? 'Verify OTP' : 'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-steel text-[11px] font-semibold uppercase tracking-[0.5px] mt-10">
          (c) 2026 MANEZA Technologies
        </p>
      </div>
    </div>
  );
}
