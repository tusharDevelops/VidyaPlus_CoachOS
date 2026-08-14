import React from 'react';

interface HowItStartsSectionProps {
  isAuthenticated: boolean;
  onAuthOpen: (mode: 'login' | 'register') => void;
  onNavigate: (path: string) => void;
}

export const HowItStartsSection: React.FC<HowItStartsSectionProps> = () => {
  return (
    <section className="bg-surface border-y border-hairline-soft py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">GET STARTED</div>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1]">
          From setup to everyday work in minutes.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="mint-card p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-green text-primary font-semibold text-lg flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="text-lg font-semibold mt-5 text-ink">Create your institute</h3>
            <p className="text-sm text-steel mt-2">Add your institute, basic details and operating preferences.</p>
          </div>
          
          <div className="mint-card p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-green text-primary font-semibold text-lg flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="text-lg font-semibold mt-5 text-ink">Add your people</h3>
            <p className="text-sm text-steel mt-2">Create students, staff, teachers and batches.</p>
          </div>
          
          <div className="mint-card p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-green text-primary font-semibold text-lg flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="text-lg font-semibold mt-5 text-ink">Start running</h3>
            <p className="text-sm text-steel mt-2">Track fees, attendance and daily operations from one place.</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-base font-medium text-ink">No implementation project.</p>
          <p className="text-base font-medium text-ink">No complicated onboarding.</p>
        </div>
      </div>
    </section>
  );
};
