import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: "Is MANEZA only for large coaching institutes?",
    answer: "No. MANEZA is designed to work for solo tutors, small institutes and growing coaching centres."
  },
  {
    question: "Do I need technical knowledge?",
    answer: "No. If your staff can use WhatsApp and basic smartphone apps, they can learn MANEZA."
  },
  {
    question: "Can I have multiple teachers and batches?",
    answer: "Yes. MANEZA is designed around institutes with multiple batches, teachers and staff members."
  },
  {
    question: "Can different staff members have different access?",
    answer: "Yes. Role-based access lets institute owners control what each person can view and manage."
  },
  {
    question: "Do students get access?",
    answer: "Yes. Student-facing workflows can provide students with relevant information without exposing administrative data."
  },
  {
    question: "Can I start for free?",
    answer: "Yes. The Aarambh plan is designed as the entry point for small institutes."
  }
];

export const FaqSection: React.FC = () => {
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="bg-surface border-y border-hairline-soft py-20 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-8 text-center">
          QUESTIONS, ANSWERED
        </p>
        <div>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndices.includes(index);
            return (
              <div key={index} className="border-b border-hairline-soft py-5">
                <button
                  onClick={() => toggleItem(index)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-base font-semibold text-ink">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-steel transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-3 text-sm text-charcoal leading-[1.6]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
