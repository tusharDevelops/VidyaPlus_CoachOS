import { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, X } from 'lucide-react';
import api from '../../lib/api';

export default function PaymentRequiredModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const handleTrialEnded = () => setIsOpen(true);
    window.addEventListener('TRIAL_ENDED', handleTrialEnded);
    return () => window.removeEventListener('TRIAL_ENDED', handleTrialEnded);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const fetchPlans = async () => {
        try {
          const { data } = await api.get('/public/plans');
          setPlans(Array.isArray(data?.data) ? data.data : []);
        } catch (err) {
          console.error('Failed to fetch plans', err);
        } finally {
          setLoadingPlans(false);
        }
      };
      fetchPlans();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = async (planId: string) => {
    setCheckoutLoading(true);
    try {
      const { data } = await api.post('/wallet/subscription/pay', { planId });
      if (data?.data?.checkout_url) {
        window.location.href = data.data.checkout_url;
      }
    } catch (err) {
      console.error('Payment checkout failed', err);
      alert('Failed to initiate payment. Please try again later.');
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-canvas w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 my-8 relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-steel hover:text-ink hover:bg-surface rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 text-center border-b border-hairline-soft bg-surface/30">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-warn-soft text-brand-warn mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-2">
            Payment Required
          </h2>
          <p className="text-steel max-w-lg mx-auto">
            Your 14-day trial has ended or you requested a premium plan. Please select a plan to continue using CoachOS. All your data is safe.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-surface">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingPlans ? (
              [1, 2, 3].map(i => (
                <div key={i} className="mint-card p-6 animate-pulse bg-canvas">
                  <div className="h-6 bg-surface rounded w-2/5 mb-2" />
                  <div className="h-8 bg-surface rounded w-1/3 mb-6" />
                  <div className="h-10 bg-surface rounded-full w-full" />
                </div>
              ))
            ) : (
              plans.map((plan, index) => {
                const isFeatured = index === 1;
                const planShortName = plan.name.split(' ')[0];
                const storageLabel = plan.maxStorageMb >= 1024
                  ? `${plan.maxStorageMb / 1024} GB storage`
                  : `${plan.maxStorageMb} MB storage`;
                const studentsLabel = plan.maxStudents >= 10000 ? 'Unlimited students' : `Up to ${plan.maxStudents} students`;

                const featuresList: string[] = [
                  studentsLabel,
                  storageLabel,
                  'Fee collection & receipts',
                  index >= 1 ? 'Staff payroll module' : 'Basic attendance tracking',
                ];

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-xl p-6 transition-all ${
                      isFeatured
                        ? 'border-2 border-brand-green bg-canvas shadow-lg'
                        : 'border border-hairline bg-canvas'
                    }`}
                  >
                    {isFeatured && (
                      <div className="absolute top-4 right-4">
                        <span className="mint-badge text-[10px]">Most Popular</span>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-ink">{planShortName}</h3>
                    <div className="mt-4 mb-6">
                      <span className="text-3xl font-semibold font-mono text-ink">
                        ₹{Number(plan.priceMonthly).toLocaleString()}
                      </span>
                      <span className="text-sm text-steel">/mo</span>
                    </div>

                    <button
                      onClick={() => handlePay(plan.id)}
                      disabled={checkoutLoading}
                      className={`w-full h-11 rounded-full text-sm font-medium transition-colors flex items-center justify-center mb-6 ${
                        isFeatured
                          ? 'bg-brand-green text-primary hover:bg-brand-green-deep'
                          : 'bg-primary text-on-primary hover:bg-charcoal'
                      }`}
                    >
                      {checkoutLoading ? 'Redirecting...' : 'Select Plan'}
                    </button>

                    <ul className="space-y-3 flex-1 border-t border-hairline-soft pt-6">
                      {featuresList.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-green mt-0.5" />
                          <span className="text-sm text-charcoal">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
