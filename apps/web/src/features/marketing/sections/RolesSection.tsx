import React from 'react';
import { GraduationCap, UserCog, BookOpen, Users, ArrowRight } from 'lucide-react';

interface RolesSectionProps {
  isAuthenticated?: boolean;
  onAuthOpen?: (mode: 'login' | 'register') => void;
  onNavigate?: (path: string) => void;
}

export const RolesSection: React.FC<RolesSectionProps> = () => {
  return (
    <section className="bg-surface border-y border-hairline-soft py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel mb-3">
          FOR EVERYONE WHO KEEPS THE INSTITUTE MOVING
        </p>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-1px] text-ink leading-[1.1]">
          One system.<br />
          Different perspectives.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Card 1 */}
          <div className="mint-card p-8 hover:border-brand-green/30 hover:shadow-sm transition-all border border-hairline rounded-lg bg-canvas">
            <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-ink" />
            </div>
            <h3 className="text-xl font-semibold mt-4 text-ink">Institute Owners</h3>
            <p className="text-base font-medium text-ink mt-2">
              See the institute clearly.
            </p>
            <p className="text-sm text-steel mt-2">
              Track collections, student growth, attendance and operations without chasing updates from staff.
            </p>
            <a href="https://maneza.vercel.app/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-green mt-4 hover:underline">
              Owner dashboard <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Card 2 */}
          <div className="mint-card p-8 hover:border-brand-green/30 hover:shadow-sm transition-all border border-hairline rounded-lg bg-canvas">
            <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
              <UserCog className="w-6 h-6 text-ink" />
            </div>
            <h3 className="text-xl font-semibold mt-4 text-ink">Staff & Administrators</h3>
            <p className="text-base font-medium text-ink mt-2">
              Get today's work done faster.
            </p>
            <p className="text-sm text-steel mt-2">
              Students, fees, attendance, reminders and records — without jumping between tools.
            </p>
            <a href="https://maneza-staff.vercel.app/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-green mt-4 hover:underline">
              Staff workspace <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Card 3 */}
          <div className="mint-card p-8 hover:border-brand-green/30 hover:shadow-sm transition-all border border-hairline rounded-lg bg-canvas">
            <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-ink" />
            </div>
            <h3 className="text-xl font-semibold mt-4 text-ink">Teachers</h3>
            <p className="text-base font-medium text-ink mt-2">
              Spend less time on administration.
            </p>
            <p className="text-sm text-steel mt-2">
              Access your batches, students and attendance without navigating an admin-heavy system.
            </p>
            <a href="https://maneza-staff.vercel.app/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-green mt-4 hover:underline">
              Teacher portal <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Card 4 */}
          <div className="mint-card p-8 hover:border-brand-green/30 hover:shadow-sm transition-all border border-hairline rounded-lg bg-canvas">
            <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
              <Users className="w-6 h-6 text-ink" />
            </div>
            <h3 className="text-xl font-semibold mt-4 text-ink">Students & Parents</h3>
            <p className="text-base font-medium text-ink mt-2">
              A clearer view of the learning journey.
            </p>
            <p className="text-sm text-steel mt-2">
              Attendance, fees, schedules and important updates — without searching through WhatsApp messages.
            </p>
            <a href="https://maneza-student.vercel.app/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-green mt-4 hover:underline">
              Student portal <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
