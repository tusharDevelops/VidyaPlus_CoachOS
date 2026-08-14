import React from 'react';
import { Users, IndianRupee, CalendarCheck, BookOpen, UserCog, BarChart3 } from 'lucide-react';

export function PositioningSection() {
  const cards = [
    {
      title: 'Students',
      description: 'Keep profiles, contacts, batches, enrollment and records together.',
      icon: Users
    },
    {
      title: 'Fees',
      description: "Know what's due, what's collected and what's pending — without checking multiple registers.",
      icon: IndianRupee
    },
    {
      title: 'Attendance',
      description: 'Take attendance quickly and spot patterns before they become problems.',
      icon: CalendarCheck
    },
    {
      title: 'Batches',
      description: 'Keep classes, schedules, teachers and students organised.',
      icon: BookOpen
    },
    {
      title: 'Staff',
      description: 'Give every team member the access they actually need.',
      icon: UserCog
    },
    {
      title: 'Reports',
      description: "See what's happening across your institute without building spreadsheets.",
      icon: BarChart3
    }
  ];

  return (
    <section className="bg-canvas py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">
            ONE CALM WORKSPACE
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1] mb-2">
            Everything your institute needs.
          </h2>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1] mb-6">
            Nothing it doesn't.
          </h2>
          <p className="text-base leading-[1.5] text-charcoal">
            MANEZA gives owners and staff a single operational layer for the work that happens every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="mint-card p-6 hover:border-brand-green/30 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-ink" />
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2">
                  {card.title}
                </h3>
                <p className="text-sm leading-[1.5] text-steel">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
