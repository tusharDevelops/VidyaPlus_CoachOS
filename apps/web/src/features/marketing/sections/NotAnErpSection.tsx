import React from 'react';

export const NotAnErpSection: React.FC = () => {
  return (
    <section className="bg-canvas py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">
          A DIFFERENT APPROACH
        </p>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1]">
          Not another ERP.<br />
          An operating layer.
        </h2>
        
        <div className="mt-6 max-w-2xl">
          <p className="text-base leading-[1.5] text-charcoal">
            Traditional ERP software asks you to adapt to the software.
            <br /><br />
            MANEZA works the other way around.
          </p>
          
          <ul className="mt-8 space-y-1">
            {[
              "Simple screens.",
              "Clear actions.",
              "Role-based access.",
              "Minimal configuration.",
              "No unnecessary complexity."
            ].map((principle, i) => (
              <li key={i} className="text-base text-charcoal leading-[2] pl-3 border-l-2 border-hairline-soft">
                {principle}
              </li>
            ))}
          </ul>
          
          <p className="mt-8 text-lg font-semibold text-ink">
            Everything you need, nothing you don't.
          </p>
        </div>
      </div>
    </section>
  );
};
