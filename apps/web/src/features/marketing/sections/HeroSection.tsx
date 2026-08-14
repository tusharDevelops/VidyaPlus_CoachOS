import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductMockup } from './ProductMockup';

export interface HeroSectionProps {
  isAuthenticated: boolean;
  onAuthOpen: (mode: 'login' | 'register') => void;
  onNavigate: (path: string) => void;
}

export function HeroSection({ isAuthenticated, onAuthOpen, onNavigate }: HeroSectionProps) {
  return (
    <section className="hero-backdrop border-b border-hairline-soft overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="mint-badge inline-flex items-center gap-2 mb-6 px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.5px]">The Calm Institute OS</span>
            </div>
            
            <h1 className="text-[32px] min-[360px]:text-[42px] sm:text-[56px] lg:text-[72px] leading-[1.05] font-semibold tracking-[-2px] text-ink mb-6">
              Clarity, at scale.
            </h1>
            
            <p className="text-base leading-[1.5] text-charcoal mb-8 max-w-lg">
              Run your coaching institute without the operational noise.<br /><br />
              Fees, attendance, students, batches, staff and daily work — brought together in one calm workspace.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => isAuthenticated ? onNavigate('/dashboard') : onAuthOpen('register')}
                className="mint-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3"
              >
                {isAuthenticated ? 'Open dashboard' : 'Start free'}
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => onNavigate('#workflow')}
                className="mint-btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3"
              >
                See how MANEZA works
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[13px] text-stone mt-6">
              Built for growing coaching institutes. Simple enough for everyday work.
            </p>
          </div>
          
          <div className="relative">
            <ProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
