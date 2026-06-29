import { useState, useEffect } from 'react';
import { 
  Users, GraduationCap, Loader2, IndianRupee, 
  BarChart3, CalendarCheck, ClipboardList, 
  UserPlus, ChevronRight, Zap, Search, Shield,
  Bell
} from 'lucide-react';
import { DrillDepth } from '../types';
import api from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth.store';
import { useNavigate } from 'react-router-dom';

interface Stats {
  batches: number;
  students: number;
  staff: number;
}

interface StaffOverviewLayerProps {
  onNavigate: (depth: DrillDepth) => void;
}

export default function StaffOverviewLayer({ onNavigate }: StaffOverviewLayerProps) {
  const { user, hasPermission } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/batches'),
      api.get('/students'),
      api.get('/staff'),
    ]).then(([{ data: bData }, { data: sData }, { data: stData }]) => {
      setStats({
        batches: bData.data?.length || 0,
        students: sData.data?.length || 0,
        staff: stData.data?.length || 0
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const QUICK_ACTIONS = [
    { 
      id: 'mark-attendance', 
      label: 'Mark Attendance', 
      icon: CalendarCheck, 
      color: 'bg-brand-green/10 text-brand-green',
      permission: 'attendance.mark',
      onClick: () => onNavigate('BATCHES')
    },
    { 
      id: 'collect-fee', 
      label: 'Collect Fee', 
      icon: IndianRupee, 
      color: 'bg-emerald-500/10 text-emerald-600',
      permission: 'fees.collect',
      onClick: () => navigate('/fees')
    },
    { 
      id: 'add-student', 
      label: 'Enroll Student', 
      icon: UserPlus, 
      color: 'bg-blue-500/10 text-blue-600',
      permission: 'students.add',
      onClick: () => onNavigate('BATCHES') // Redirect to student listing/add
    },
  ].filter(action => hasPermission(action.permission));

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Search Bar - Handy at the top */}
      <div className="relative group lg:hidden">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-steel group-focus-within:text-brand-green transition-colors" />
        <input 
          type="text" 
          placeholder="Quick search students or batches..." 
          className="w-full h-14 pl-12 pr-4 bg-canvas border border-hairline rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green transition-all outline-none shadow-sm"
        />
      </div>

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-ink tracking-tight">
            Hi, {user?.name.split(' ')[0]} <span className="inline-block animate-bounce-slow">👋</span>
          </h1>
          <p className="text-slate font-medium text-lg mt-1">Ready to manage your day?</p>
        </div>
      </div>

      {/* Priority Actions - Thumb-friendly Grid */}
      {QUICK_ACTIONS.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-6 bg-canvas border border-hairline rounded-3xl hover:border-brand-green hover:shadow-premium transition-all text-center group active:scale-95"
            >
              <div className={`w-16 h-16 rounded-2xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-black text-ink uppercase tracking-widest">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Authorized Modules - Compact & Clear */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-brand-green fill-brand-green" />
          <h3 className="text-[10px] font-black text-stone uppercase tracking-[0.2em]">Management Centers</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasPermission('batches.view') && (
            <button 
              onClick={() => onNavigate('BATCHES')}
              className="flex items-center gap-6 p-6 bg-canvas rounded-3xl border border-hairline hover:shadow-premium transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7 text-brand-green-deep" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="font-black text-ink uppercase tracking-tight">Academic Hub</h2>
                <div className="flex items-center gap-3 mt-1 opacity-60">
                   {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                     <span className="text-[10px] font-bold text-steel uppercase tracking-widest">{stats?.batches} Batches • {stats?.students} Students</span>
                   )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate group-hover:translate-x-1 transition-all" />
            </button>
          )}

          {hasPermission('fees.view') && (
            <button 
              onClick={() => navigate('/fees')}
              className="flex items-center gap-6 p-6 bg-canvas rounded-3xl border border-hairline hover:shadow-premium transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <IndianRupee className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="font-black text-ink uppercase tracking-tight">Financials</h2>
                <p className="text-[10px] font-bold text-steel uppercase tracking-widest mt-1 opacity-60">Collections • Dues • Payouts</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate group-hover:translate-x-1 transition-all" />
            </button>
          )}

          {hasPermission('staff.view') && (
            <button 
              onClick={() => onNavigate('STAFF')}
              className="flex items-center gap-6 p-6 bg-canvas rounded-3xl border border-hairline hover:shadow-premium transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-warn/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-brand-warn" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="font-black text-ink uppercase tracking-tight">Team Management</h2>
                <div className="flex items-center gap-3 mt-1 opacity-60">
                   {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                     <span className="text-[10px] font-bold text-steel uppercase tracking-widest">{stats?.staff} Members</span>
                   )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate group-hover:translate-x-1 transition-all" />
            </button>
          )}



          {hasPermission('notifications.view') && (
            <button 
              onClick={() => navigate('/notifications')}
              className="flex items-center gap-6 p-6 bg-canvas rounded-3xl border border-hairline hover:shadow-premium transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Bell className="w-7 h-7 text-sky-600" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="font-black text-ink uppercase tracking-tight">Notifications</h2>
                <p className="text-[10px] font-bold text-steel uppercase tracking-widest mt-1 opacity-60">Alerts • Broadcasts</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate group-hover:translate-x-1 transition-all" />
            </button>
          )}



          {hasPermission('reports.view') && (
            <button 
              onClick={() => navigate('/reports')}
              className="flex items-center gap-6 p-6 bg-canvas rounded-3xl border border-hairline hover:shadow-premium transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="font-black text-ink uppercase tracking-tight">Analytics Hub</h2>
                <p className="text-[10px] font-bold text-steel uppercase tracking-widest mt-1 opacity-60">Growth • Trends • Reports</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate group-hover:translate-x-1 transition-all" />
            </button>
          )}

          {!hasPermission('batches.view') && !hasPermission('fees.view') && !hasPermission('staff.view') && !hasPermission('reports.view') && !hasPermission('notifications.view') && (
            <div className="col-span-full py-20 text-center bg-surface/30 border-2 border-hairline border-dashed rounded-[2.5rem]">
               <Shield className="w-12 h-12 text-steel mx-auto mb-4 opacity-20" />
               <h3 className="text-sm font-black text-ink uppercase tracking-widest opacity-40">No Authorized Modules</h3>
               <p className="text-xs text-steel font-medium mt-2 max-w-xs mx-auto">Your access profile doesn't include any management modules yet. Please contact your administrator to delegate responsibilities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
