import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface FinalCtaSectionProps {
  isAuthenticated: boolean;
  onAuthOpen: (mode: 'login' | 'register') => void;
  onNavigate: (path: string) => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  isAuthenticated,
  onAuthOpen,
  onNavigate
}) => {
  const handleCtaClick = () => {
    if (isAuthenticated) {
      onNavigate('/dashboard');
    } else {
      onAuthOpen('register');
    }
  };

  return (
    <section className="bg-canvas py-20 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">
          YOUR INSTITUTE, UNCUT
        </p>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1] mt-2">
          Let the software disappear.
        </h2>
        <p className="mt-6 text-lg text-charcoal leading-[1.6] max-w-xl mx-auto">
          MANEZA handles the operational noise so your team can focus on teaching, students and growth.
        </p>
        
        <button
          onClick={handleCtaClick}
          className="mint-btn-brand mt-8 inline-flex items-center justify-center gap-2"
        >
          {isAuthenticated ? "Open dashboard" : "Start free"}
          <ArrowRight className="w-4 h-4" />
        </button>
        
        <div className="mt-6 flex flex-col space-y-1 text-sm text-steel">
          <p>No setup fee.</p>
          <p>No complicated implementation.</p>
          <p>Just a calmer way to run your institute.</p>
        </div>
      </div>
    </section>
  );
};
