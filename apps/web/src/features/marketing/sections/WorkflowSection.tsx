import React from 'react';

export const WorkflowSection: React.FC = () => {
  return (
    <section id="workflow" className="bg-canvas py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">
          THE DAILY LOOP
        </p>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1]">
          The work stays simple.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {/* Step 1 */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-brand-green mb-2">
              01
            </p>
            <h3 className="text-lg font-semibold text-ink mb-2">
              — Start the day
            </h3>
            <p className="text-sm text-steel">
              Open MANEZA and see what needs attention.
            </p>
          </div>

          {/* Step 2 */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-brand-green mb-2">
              02
            </p>
            <h3 className="text-lg font-semibold text-ink mb-2">
              — Do the work
            </h3>
            <div className="text-sm text-steel space-y-1">
              <p>Take attendance.</p>
              <p>Collect fees.</p>
              <p>Update students.</p>
              <p>Manage batches.</p>
              <p>Handle today's tasks.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-brand-green mb-2">
              03
            </p>
            <h3 className="text-lg font-semibold text-ink mb-2">
              — Stay informed
            </h3>
            <p className="text-sm text-steel">
              Reports, reminders and operational signals keep everyone aligned.
            </p>
          </div>

          {/* Step 4 */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-brand-green mb-2">
              04
            </p>
            <h3 className="text-lg font-semibold text-ink mb-2">
              — Close the day
            </h3>
            <p className="text-sm text-steel">
              Know what's done, what's pending and what needs attention tomorrow.
            </p>
          </div>
        </div>
        
        <p className="mt-12 text-center text-lg font-medium text-charcoal italic">
          MANEZA stays in the background while your institute keeps moving.
        </p>
      </div>
    </section>
  );
};
