import React from 'react';

export function ProblemSection() {
  return (
    <section className="bg-surface border-y border-hairline-soft">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-20 lg:py-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-4">
          THE OLD WAY
        </p>
        
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1]">
          Your institute isn't complicated.
        </h2>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1] mt-2">
          Your tools are.
        </h2>
        
        <div className="mt-10 max-w-2xl">
          <p className="text-lg leading-[1.8] text-charcoal mt-3">
            A WhatsApp group for communication.
          </p>
          <p className="text-lg leading-[1.8] text-charcoal mt-3">
            A notebook for fees.
          </p>
          <p className="text-lg leading-[1.8] text-charcoal mt-3">
            Excel for attendance.
          </p>
          <p className="text-lg leading-[1.8] text-charcoal mt-3">
            Spreadsheets for reports.
          </p>
          <p className="text-lg leading-[1.8] text-charcoal mt-3">
            And someone's memory holding everything together.
          </p>
        </div>
        
        <p className="mt-10 text-lg leading-[1.6] text-ink font-medium max-w-2xl">
          MANEZA brings the important parts into one place — without turning your institute into another complicated software project.
        </p>
      </div>
    </section>
  );
}
