import { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, X } from 'lucide-react';
import api from '../../lib/api';

export default function PaymentRequiredModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [modalContext, setModalContext] = useState<{isLimitReached?: boolean, message?: string} | null>(null);

  useEffect(() => {
    const handleUpgradeRequired = (e: any) => {
      setModalContext(e.detail || null);
      setIsOpen(true);
    };
    window.addEventListener('UPGRADE_REQUIRED', handleUpgradeRequired);
    return () => window.removeEventListener('UPGRADE_REQUIRED', handleUpgradeRequired);
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
    const plan = plans.find(p => p.id === planId);
    if (!plan || !plan.priceMonthly || Number(plan.priceMonthly) === 0) {
      alert('You are already on the free plan.');
      return;
    }

    setCheckoutLoadingId(planId);
    try {
      const { data } = await api.post('/payments/create-checkout-session', { planId });
      if (data?.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        alert('Failed to generate checkout link. Please try again.');
        setCheckoutLoadingId(null);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.error || 'Failed to initiate checkout. Please contact support.');
      setCheckoutLoadingId(null);
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
            {modalContext?.isLimitReached ? 'Upgrade Your Plan' : 'Select a Subscription Plan'}
          </h2>
          <p className="text-steel max-w-lg mx-auto">
            {modalContext?.isLimitReached 
              ? (modalContext.message || 'You have reached the limits of your current plan. Upgrade to unlock more capacity and premium features.')
              : 'Choose the plan that best fits your institute. Unlock premium features to scale your coaching business effortlessly.'}
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
                const storageLabel = plan.maxStorageMb >= 1000
                  ? `${Math.round(plan.maxStorageMb / 1000)} GB storage`
                  : `${plan.maxStorageMb} MB storage`;
                const studentsLabel = plan.maxStudents >= 10000 ? 'Unlimited students' : `Up to ${plan.maxStudents} students`;
                const staffLabel = plan.maxStaff >= 1000 ? 'Unlimited staff' : `Up to ${plan.maxStaff} staff`;
                const batchesLabel = plan.maxBatches >= 1000 ? 'Unlimited batches' : `Up to ${plan.maxBatches} batches`;

                const featuresList: string[] = [
                  studentsLabel,
                  staffLabel,
                  batchesLabel,
                  storageLabel,
                  'All features unlocked (LMS, Payroll, Exams)',
                  plan.featuresJson?.support ?? 'Help center support',
                ].filter(Boolean) as string[];

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
                      disabled={checkoutLoadingId !== null || Number(plan.priceMonthly) === 0}
                      className={`w-full h-11 rounded-full text-sm font-medium transition-colors flex items-center justify-center mb-6 ${
                        isFeatured
                          ? 'bg-brand-green text-primary hover:bg-brand-green-deep'
                          : Number(plan.priceMonthly) === 0
                          ? 'bg-surface text-steel cursor-not-allowed'
                          : 'bg-primary text-on-primary hover:bg-charcoal'
                      }`}
                    >
                      {checkoutLoadingId === plan.id ? 'Redirecting...' : (Number(plan.priceMonthly) === 0 ? 'Current Plan' : 'Select Plan')}
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
