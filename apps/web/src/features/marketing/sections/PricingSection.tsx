import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface PricingSectionProps {
  plans: any[];
  loading: boolean;
  isAuthenticated: boolean;
  onAuthOpen: (mode: 'login' | 'register') => void;
  onNavigate: (path: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  plans,
  loading,
  isAuthenticated,
  onAuthOpen,
  onNavigate
}) => {
  const taglines = [
    "For solo tutors and small institutes getting started.",
    "For growing institutes managing multiple batches.",
    "For larger institutes and multi-branch operations."
  ];

  const ctaLabels = [
    "Start free →",
    "Get started →",
    "Talk to us →"
  ];

  return (
    <section id="pricing" className="bg-canvas py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="text-center mb-14">
          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">SIMPLE PRICING</div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1] mb-2">
            Start small.
          </h2>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1]">
            Grow when you need to.
          </h2>
          <p className="text-base text-steel max-w-xl mx-auto mt-4">
            No setup fees. No complicated contracts. No surprise pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="mint-card p-3 sm:p-8 animate-pulse">
                <div className="h-7 bg-surface rounded w-2/5 mb-2" />
                <div className="h-3 bg-surface rounded w-1/3 mb-5" />
                <div className="h-4 bg-surface rounded w-3/4 mb-8" />
                <div className="h-14 bg-surface rounded w-full mb-2" />
                <div className="h-3 bg-surface rounded w-1/4 mb-8" />
                <div className="h-10 bg-surface rounded-full w-full mb-8" />
                <div className="space-y-3">
                  {[1,2,3,4,5].map(j => <div key={j} className="h-3.5 bg-surface rounded w-full" />)}
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
                'All features unlocked',
              ];

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-lg p-3 sm:p-8 transition-all ${
                    isFeatured
                      ? 'border-2 border-brand-green bg-canvas shadow-[rgba(0,212,164,0.08)_0px_8px_24px]'
                      : 'border border-hairline bg-canvas'
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute top-6 right-6">
                      <span className="mint-badge">Most Popular</span>
                    </div>
                  )}

                  <div className="mb-1">
                    <h3 className="text-[28px] leading-[1.25] font-semibold text-ink">{planShortName}</h3>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mt-0.5">({planTier})</p>
                  </div>

                  <p className="mt-3 text-sm text-steel leading-[1.5]">{taglines[index]}</p>

                  <div className="mt-8 mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[56px] font-semibold font-mono text-ink tracking-[-1.5px] leading-none">
                        ₹{Number(plan.priceMonthly).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] text-steel">/month + GST</p>
                  </div>

                  <button
                    onClick={() => {
                      if (index === 2) {
                        onAuthOpen('login');
                      } else {
                        onAuthOpen('register');
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

        <p className="mt-8 text-center text-[13px] text-steel flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-green flex-shrink-0" />
          Start free. Upgrade when your institute grows.
        </p>
      </div>
    </section>
  );
};

