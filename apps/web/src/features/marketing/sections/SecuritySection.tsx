import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export interface SecuritySectionProps {
  isAuthenticated: boolean;
  onAuthOpen: (mode: 'login' | 'register') => void;
  onNavigate: (path: string) => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  isAuthenticated,
  onAuthOpen,
  onNavigate
}) => {
  const handleCtaClick = () => {
    if (isAuthenticated) {
      onNavigate('/dashboard');
    } else {
      onAuthOpen('login');
    }
  };

  return (
    <section id="security" className="bg-canvas-dark text-on-dark py-16 lg:py-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-brand-green mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            SECURE BY DESIGN
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.5px] text-on-dark mt-2">
            Your institute's data should belong to your institute.
          </h2>
          <p className="mt-4 text-sm leading-[1.6] text-on-dark-muted">
            Role-based access keeps sensitive information in the right hands.
          </p>
          <div className="mt-4 flex flex-col space-y-1 text-sm text-on-dark-muted leading-[1.8]">
            <p>Owners control permissions.</p>
            <p>Staff only see what they need.</p>
            <p>Students see their own information.</p>
          </div>
          <p className="mt-4 text-sm text-on-dark-muted">
            MANEZA is built around clear access, controlled workflows and accountable operations.
          </p>
        </div>
        <div>
          <button
            onClick={handleCtaClick}
            className="bg-on-dark text-primary min-h-10 px-5 rounded-full text-sm font-medium inline-flex items-center justify-center gap-2"
          >
            {isAuthenticated ? "Open dashboard" : "Learn about security"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
