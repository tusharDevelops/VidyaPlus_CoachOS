import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Users, Loader2, 
  Search, Calendar as CalendarIcon, UserCheck, Coffee, Sun
} from 'lucide-react';
import api from '../../../../lib/api';
import { DrillDepth } from '../DashboardDrillDown.tsx';

interface StaffAttendanceLayerProps {
  onNavigate: (depth: DrillDepth) => void;
}

const STATUS_CONFIG = {
  present: { 
    label: 'Present', 
    color: 'bg-brand-green/10 text-brand-green-deep border-brand-green/20',
    icon: UserCheck
  },
  absent: { 
    label: 'Absent', 
    color: 'bg-brand-error/10 text-brand-error border-brand-error/20',
    icon: XCircle
  },
  leave: { 
    label: 'Leave', 
    color: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
    icon: Coffee
  },
  half_day: { 
    label: 'Half Day', 
    color: 'bg-brand-warn/10 text-brand-warn border-brand-warn/20',
    icon: Sun
  }
} as const;

export default function StaffAttendanceLayer({ onNavigate }: StaffAttendanceLayerProps) {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, attRes] = await Promise.all([
        api.get('/staff'),
        api.get('/staff/attendance/daily', { params: { date: selectedDate } })
      ]);
      
      setStaff(staffRes.data.data || []);
      
      const map: Record<string, string> = {};
      attRes.data.data.forEach((rec: any) => {
        map[rec.staffId] = rec.status;
      });
      setAttendance(map);
    } catch (err) {
      console.error('Failed to fetch staff attendance data', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([staffId, status]) => ({ staffId, status }));
      await api.post('/staff/attendance/mark', { date: selectedDate, records });
      alert('Staff attendance recorded successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to sync with central registry');
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    const map: Record<string, string> = {};
    staff.forEach(s => { map[s.id] = 'present'; });
    setAttendance(map);
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-canvas border border-hairline rounded-3xl">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Stats */}
      <div className="bg-canvas border border-hairline rounded-3xl p-6 sm:p-4 sm:p-10 shadow-premium-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center border border-brand-green/20">
                <UserCheck className="w-6 h-6 text-brand-green-deep" />
              </div>
              <h2 className="text-3xl font-black text-ink tracking-tight uppercase tracking-[0.05em]">Staff Attendance</h2>
            </div>
            <p className="text-[10px] font-black text-steel uppercase tracking-[0.2em] flex items-center opacity-60">
              <CalendarIcon className="w-4 h-4 mr-2" /> Centralized roll call for {new Date(selectedDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className="relative">
               <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-steel opacity-40 pointer-events-none" />
               <input 
                 type="date" 
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="mint-input h-14 pl-12 pr-6 font-black text-[10px] uppercase tracking-widest bg-surface border-hairline"
               />
             </div>
             <button 
               onClick={markAllPresent}
               className="h-14 px-3 sm:px-8 bg-canvas border border-hairline text-ink hover:bg-surface rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center transition-all shadow-sm group"
             >
               <CheckCircle2 className="w-4 h-4 mr-3 text-brand-green group-hover:scale-110 transition-transform" />
               Mark All Present
             </button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="relative w-full sm:w-[450px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-steel opacity-30" />
          <input 
            type="text"
            placeholder="Search by name or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mint-input w-full h-14 pl-14 pr-6 rounded-2xl text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-ink uppercase tracking-widest mb-1">Marking Progress</p>
            <p className="text-[9px] font-bold text-steel uppercase tracking-[0.2em] opacity-50">
              {Object.keys(attendance).length} / {staff.length} TEAM MEMBERS
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving || Object.keys(attendance).length === 0}
            className="flex-1 sm:flex-none h-14 px-12 bg-ink text-canvas hover:bg-ink/90 disabled:opacity-30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center transition-all shadow-premium"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <CheckCircle2 className="w-4 h-4 mr-3" />}
            Sync Registry
          </button>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-canvas border border-hairline rounded-3xl overflow-hidden shadow-premium-subtle">
        <div className="divide-y divide-hairline">
          {filteredStaff.length === 0 ? (
            <div className="p-24 text-center">
              <Users className="w-16 h-16 text-stone mx-auto mb-6 opacity-10" />
              <h3 className="text-lg font-black text-ink uppercase tracking-widest opacity-40">No personnel found</h3>
              <p className="text-xs text-steel font-medium mt-2">Adjust your search filters to find staff members.</p>
            </div>
          ) : (
            filteredStaff.map((member) => {
              const currentStatus = attendance[member.id];
              return (
                <div key={member.id} className={`flex flex-col lg:flex-row lg:items-center justify-between p-3 sm:p-8 gap-3 sm:gap-8 transition-all ${currentStatus ? 'bg-surface/40' : 'hover:bg-surface/20'}`}>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-canvas border-2 border-hairline flex items-center justify-center text-xl font-black text-ink shadow-sm shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-black text-ink tracking-tight">{member.name}</p>
                        <span className="px-3 py-1 bg-surface border border-hairline rounded-full text-[8px] font-black uppercase tracking-widest text-steel">
                          {member.role}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-steel uppercase tracking-[0.2em] mt-1.5 opacity-50">{member.phone}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {(['present', 'absent', 'leave', 'half_day'] as const).map((status) => {
                      const cfg = STATUS_CONFIG[status];
                      const isActive = currentStatus === status;
                      const Icon = cfg.icon;
                      
                      return (
                        <button
                          key={status}
                          onClick={() => setAttendance(prev => ({ ...prev, [member.id]: status }))}
                          className={`flex-1 sm:flex-none h-12 px-6 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all ${
                            isActive 
                              ? `${cfg.color} shadow-lg shadow-black/5` 
                              : 'bg-canvas border-hairline text-steel hover:border-ink hover:text-ink'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : 'opacity-40'}`} />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
