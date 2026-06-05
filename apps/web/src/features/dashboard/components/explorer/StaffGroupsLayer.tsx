import { useState, useEffect } from 'react';
import { Users, GraduationCap, ShieldCheck, Briefcase, ChevronRight, UserPlus, Loader2 } from 'lucide-react';
import { DrillDepth } from '../DashboardDrillDown';
import api from '../../../../lib/api';

interface StaffGroupsLayerProps {
  onNavigate: (depth: DrillDepth, data?: { studentId?: string }) => void;
}

export default function StaffGroupsLayer({ onNavigate }: StaffGroupsLayerProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/staff').then(({ data }) => {
      const staff = data.data;
      setStats({
        total: staff.length,
        teachers: staff.filter((s: any) => s.role === 'teacher').length,
        admin: staff.filter((s: any) => s.role === 'admin').length,
        others: staff.filter((s: any) => s.role !== 'teacher' && s.role !== 'admin').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const groups = [
    { id: 'teacher', title: 'Subject Teachers', icon: GraduationCap, color: 'brand-blue', desc: 'Manage your faculty, assign subjects, and track teaching performance.' },
    { id: 'admin', title: 'Administrative Staff', icon: ShieldCheck, color: 'brand-error', desc: 'Oversee institute management, roles, and administrative access.' },
    { id: 'support', title: 'Support & Ops', icon: Briefcase, color: 'brand-warn', desc: 'Coordinate with support staff, security, and operational teams.' },
    { id: 'all', title: 'Full Directory', icon: Users, color: 'brand-green', desc: 'View and manage your entire institutional staff directory.' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-ink uppercase tracking-tight">Staff Management / Groups</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <button 
            key={group.id}
            onClick={() => onNavigate('STAFF')}
            className="text-left bg-canvas rounded-2xl border border-hairline p-3 sm:p-8 hover:shadow-premium transition-all group relative overflow-hidden"
          >
            {/* Background Decorative Icon */}
            <div className="absolute top-0 right-0 p-3 sm:p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <group.icon className="w-32 h-32" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className={`w-14 h-14 rounded-2xl bg-${group.color === 'brand-blue' ? 'brand-blue' : group.color === 'brand-error' ? 'brand-error' : group.color === 'brand-warn' ? 'brand-warn' : 'brand-green'}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <group.icon className={`w-7 h-7 text-${group.color === 'brand-blue' ? 'brand-blue' : group.color === 'brand-error' ? 'brand-error' : group.color === 'brand-warn' ? 'brand-warn' : 'brand-green-deep'}`} />
              </div>

              <div>
                <h3 className="text-2xl font-black text-ink mb-2 tracking-tight">{group.title}</h3>
                <p className="text-steel text-sm font-medium opacity-60 leading-relaxed max-w-sm">
                  {group.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-hairline-soft">
                <div className="flex flex-col">
                   <span className="text-xl font-black text-ink">
                     {loading ? '...' : (
                       group.id === 'teacher' ? stats.teachers :
                       group.id === 'admin' ? stats.admin :
                       group.id === 'support' ? stats.others :
                       stats.total
                     )}
                   </span>
                   <span className="text-[10px] font-black text-steel uppercase tracking-widest opacity-60">Members</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-black text-brand-green-deep opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Group <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
