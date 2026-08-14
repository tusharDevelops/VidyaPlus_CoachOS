import React from 'react';
import { BrandLogo } from '@coachos/ui';

export const FooterSection: React.FC = () => {
  return (
    <footer className="bg-canvas border-t border-hairline-soft py-12 lg:py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <BrandLogo />
            <p className="text-sm text-steel mt-3">
              Calm software for growing institutes.
            </p>
          </div>
          
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-4">
              Product
            </h3>
            <div className="flex flex-col space-y-2.5">
              <a href="#product" className="text-sm text-charcoal hover:text-ink transition-colors block">Dashboard</a>
              <a href="#modules" className="text-sm text-charcoal hover:text-ink transition-colors block">Modules</a>
              <a href="#pricing" className="text-sm text-charcoal hover:text-ink transition-colors block">Pricing</a>
              <a href="#security" className="text-sm text-charcoal hover:text-ink transition-colors block">Security</a>
            </div>
          </div>
          
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-4">
              Portals
            </h3>
            <div className="flex flex-col space-y-2.5">
              <a href="https://maneza.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-sm text-charcoal hover:text-ink transition-colors block">Owner Portal</a>
              <a href="https://maneza-staff.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-sm text-charcoal hover:text-ink transition-colors block">Staff Portal</a>
              <a href="https://maneza-student.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-sm text-charcoal hover:text-ink transition-colors block">Student App</a>
            </div>
          </div>
          
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-4">
              Company
            </h3>
            <div className="flex flex-col space-y-2.5">
              <a href="#problem" className="text-sm text-charcoal hover:text-ink transition-colors block">Why MANEZA</a>
              <a href="mailto:hello@maneza.in" className="text-sm text-charcoal hover:text-ink transition-colors block">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-hairline-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-stone">
            © 2026 MANEZA Technologies. All rights reserved.
          </p>
          <p className="text-[13px] font-medium text-steel">
            Calm. Precise. Yours.
          </p>
        </div>
      </div>
    </footer>
  );
};
