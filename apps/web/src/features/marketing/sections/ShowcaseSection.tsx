import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductMockup } from './ProductMockup';

interface ShowcaseSectionProps {
  isAuthenticated: boolean;
  onAuthOpen: (mode: 'login' | 'register') => void;
  onNavigate: (path: string) => void;
}

export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({ isAuthenticated, onAuthOpen, onNavigate }) => {
  const handleCtaClick = () => {
    if (isAuthenticated) {
      onNavigate('/dashboard');
    } else {
      onAuthOpen('register');
    }
  };

  return (
    <section id="product" className="bg-surface border-y border-hairline-soft py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">
          BUILT FOR THE WORKDAY
        </p>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1]">
          Open MANEZA.<br />
          Know what needs attention.
        </h2>
        
        <div className="max-w-2xl mt-6">
          <p className="text-base leading-[1.5] text-charcoal">
            The dashboard shouldn't make you think.<br />
            It should answer the important questions immediately:
          </p>
          
          <ul className="mt-8 space-y-3">
            {[
              "Who joined?",
              "Who hasn't paid?",
              "Which batch needs attention?",
              "What's happening today?",
              "What changed since yesterday?"
            ].map((question, i) => (
              <li key={i} className="text-lg font-semibold text-ink pl-4 border-l-2 border-brand-green">
                {question}
              </li>
            ))}
          </ul>
          
          <p className="mt-8 italic text-steel">
            That's what MANEZA is designed for.
          </p>
          
          <button 
            onClick={handleCtaClick}
            className="mint-btn-primary mt-8 inline-flex items-center gap-2"
          >
            Explore the product <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-12">
          <ProductMockup />
        </div>
      </div>
    </section>
  );
};
