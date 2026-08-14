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
              <div key={i} className="mint-card p-6 animate-pulse">
                <div className="h-6 bg-surface rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-surface rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-surface rounded w-full"></div>
                  <div className="h-4 bg-surface rounded w-full"></div>
                  <div className="h-4 bg-surface rounded w-3/4"></div>
                </div>
              </div>
            ))
          ) : (
            plans.map((plan, index) => {
              const isFeatured = index === 1;
              const planNameParts = plan.name ? plan.name.split(' - ') : ['Plan'];
              const planShortName = planNameParts[0];
              const planTierMatch = plan.name ? plan.name.match(/\(([^)]+)\)/) : null;
              const planTier = planTierMatch ? planTierMatch[1] : '';

              let maxStudents = 'Unlimited';
              let maxBatches = 'Unlimited';
              let maxStaff = 'Unlimited';
              let storageLimit = 'Unlimited';

              if (plan.limits) {
                if (plan.limits.students !== -1) maxStudents = String(plan.limits.students);
                if (plan.limits.batches !== -1) maxBatches = String(plan.limits.batches);
                if (plan.limits.staff !== -1) maxStaff = String(plan.limits.staff);
                if (plan.limits.storage_mb !== -1) {
                  storageLimit = plan.limits.storage_mb >= 1024 
                    ? `${(plan.limits.storage_mb / 1024).toFixed(1)} GB` 
                    : `${plan.limits.storage_mb} MB`;
                }
              }

              const features = [
                `${maxStudents} Students`,
                `${maxBatches} Batches`,
                `${maxStaff} Staff Members`,
                `${storageLimit} Storage`,
                ...(plan.features || [])
              ];

              return (
                <div 
                  key={plan.id || index} 
                  className={`mint-card p-6 relative ${isFeatured ? 'border-2 border-brand-green' : ''}`}
                >
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="mint-badge bg-brand-green-soft px-3 py-1 text-xs font-medium text-brand-green rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <h3 className="text-xl font-semibold text-ink">{planShortName} {planTier && <span className="text-steel font-normal text-sm ml-1">({planTier})</span>}</h3>
                    <p className="text-sm text-steel mt-2 h-10">{taglines[index] || "For growing institutes."}</p>
                    
                    <div className="mt-6 mb-6">
                      <span className="text-3xl font-semibold text-ink font-mono">₹{plan.price_monthly || 0}</span>
                      <span className="text-sm text-steel">/month + GST</span>
                    </div>

                    <button 
                      className={`w-full justify-center flex items-center ${isFeatured ? 'mint-btn-brand' : 'mint-btn-primary'}`}
                      onClick={() => {
                        if (index === 2) {
                          onAuthOpen('login');
                        } else {
                          onAuthOpen('register');
                        }
                      }}
                    >
                      {ctaLabels[index] || "Get started"}
                    </button>

                    <div className="mt-8 space-y-3">
                      {features.map((feature: string, fIndex: number) => (
                        <div key={fIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0" />
                          <span className="text-sm text-charcoal">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-8 text-center text-[13px] text-steel flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Start free. Upgrade when your institute grows.</span>
        </div>
      </div>
    </section>
  );
};
