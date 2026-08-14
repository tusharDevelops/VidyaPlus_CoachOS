import React from 'react';

export const DifferentiationSection: React.FC = () => {
  return (
    <section className="bg-canvas py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">DESIGNED DIFFERENTLY</div>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1]">
          Less interface.<br />
          More institute.
        </h2>
        
        <div className="mt-6 max-w-2xl">
          <p className="text-base leading-[1.5] text-charcoal">
            We don't believe software should demand attention just to prove that it is powerful.
          </p>
          <p className="mt-4 text-base leading-[1.5] text-charcoal">
            MANEZA is designed around a simple principle:
          </p>
          <p className="mt-4 text-xl font-semibold text-ink">
            If an action can be simpler, make it simpler.
          </p>
          
          <ul className="mt-8 space-y-1">
            <li className="text-base text-charcoal leading-[2]">Fewer clicks.</li>
            <li className="text-base text-charcoal leading-[2]">Clearer screens.</li>
            <li className="text-base text-charcoal leading-[2]">Useful defaults.</li>
            <li className="text-base text-charcoal leading-[2]">No feature clutter.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
