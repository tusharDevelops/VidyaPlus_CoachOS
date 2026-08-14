import React from 'react';
import { Layers3, Users, BookOpen, IndianRupee, CalendarCheck, UserCog, Bell, BarChart3, ArrowRight } from 'lucide-react';

interface ModulesSectionProps {
  isAuthenticated: boolean;
  onAuthOpen: (mode: 'login' | 'register') => void;
  onNavigate: (path: string) => void;
}

export const ModulesSection: React.FC<ModulesSectionProps> = ({
  isAuthenticated,
  onAuthOpen,
  onNavigate
}) => {
  const modules = [
    { icon: Layers3, title: "Dashboard", description: "A clear operational snapshot of your institute." },
    { icon: Users, title: "Student Directory", description: "Profiles, contacts, enrollment and student history." },
    { icon: BookOpen, title: "Classes & Batches", description: "Organise students, teachers, schedules and classes." },
    { icon: IndianRupee, title: "Fee Operations", description: "Track dues, collections, receipts and student ledgers." },
    { icon: CalendarCheck, title: "Attendance", description: "Record daily attendance and identify gaps." },
    { icon: UserCog, title: "Staff Management", description: "Create roles and control access across your team." },
    { icon: Bell, title: "Reminders", description: "Keep fees, absences and important actions from slipping through." },
    { icon: BarChart3, title: "Reports", description: "Turn daily activity into useful visibility." }
  ];

  return (
    <section id="modules" className="bg-surface border-y border-hairline-soft py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">CORE WORKFLOWS</div>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1]">
          Everything important, arranged for fast scanning.
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {modules.map((mod, idx) => (
            <div key={idx} className="mint-card p-6 hover:border-brand-green/30 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-canvas flex items-center justify-center">
                <mod.icon className="w-5 h-5 text-ink" />
              </div>
              <h3 className="text-base font-semibold text-ink mt-4">{mod.title}</h3>
              <p className="text-sm text-steel mt-1.5">{mod.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <button 
            className="mint-btn-primary flex items-center gap-2"
            onClick={() => isAuthenticated ? onNavigate('/dashboard') : onAuthOpen('register')}
          >
            Explore all modules <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
