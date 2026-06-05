import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, CheckCircle2, XCircle, 
  Clock, Coffee, Sun, Loader2, ChevronLeft, 
  ChevronRight, CalendarDays
} from 'lucide-react';
import api from '../../lib/api';

const STATUS_CONFIG = {
  present: { 
    label: 'Present', 
    color: 'bg-brand-green/10 text-brand-green-deep border-brand-green/20',
    icon: CheckCircle2
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

export default function MyAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const dailyRes = await api.get('/staff/attendance/daily', { params: { month, year } });
        setHistory(dailyRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch attendance history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [month, year]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month - 1, i + 1);
    const dateStr = date.toISOString().split('T')[0];
    const record = history.find(r => r.date.split('T')[0] === dateStr);
    return { date, record };
  });

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-ink tracking-tight">My Attendance</h1>
        <p className="text-sm text-steel">Monthly overview of your presence and leave records.</p>
      </div>

      {/* Calendar Header */}
      <div className="bg-canvas border border-hairline rounded-3xl p-6 sm:p-10 shadow-premium-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center">
              <CalendarDays className="w-7 h-7 text-brand-green-deep" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-ink tracking-tight uppercase tracking-[0.1em]">
                {new Date(year, month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-[10px] font-bold text-steel uppercase tracking-[0.2em] mt-1 opacity-60">Your Activity Log</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={prevMonth}
              className="w-12 h-12 rounded-xl bg-surface border border-hairline flex items-center justify-center hover:bg-canvas transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextMonth}
              className="w-12 h-12 rounded-xl bg-surface border border-hairline flex items-center justify-center hover:bg-canvas transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {calendarDays.map(({ date, record }) => {
            const status = record?.status as keyof typeof STATUS_CONFIG;
            const cfg = status ? STATUS_CONFIG[status] : null;
            const Icon = cfg?.icon || CalendarIcon;
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <div 
                key={date.toISOString()}
                className={`mint-card p-5 flex flex-col items-center justify-center gap-3 transition-all ${
                  isToday ? 'border-brand-green ring-1 ring-brand-green/20' : ''
                } ${cfg ? 'bg-surface/50' : 'opacity-40'}`}
              >
                <p className="text-[9px] font-black text-steel uppercase tracking-widest">
                  {date.toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                  cfg ? cfg.color : 'bg-surface border-hairline'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-black text-ink">{date.getDate()}</p>
                {cfg && (
                  <span className="text-[8px] font-black uppercase tracking-widest text-steel opacity-60">
                    {cfg.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-8 border-t border-hairline">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${cfg.color.split(' ')[0]}`} />
            <span className="text-[10px] font-black text-ink uppercase tracking-widest">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
