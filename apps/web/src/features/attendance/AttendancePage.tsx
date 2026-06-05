import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import {
  Calendar, CheckCircle2, XCircle, Clock, Users, ChevronLeft, ChevronRight,
  Loader2, Lock, AlertTriangle, BookOpen,
} from 'lucide-react';

const STATUS_CONFIG = {
  present: { 
    label: 'P', 
    active: 'bg-emerald-600 text-white shadow-emerald-200', 
    inactive: 'bg-emerald-50 text-emerald-400 hover:bg-emerald-100 hover:text-emerald-600', 
    ring: 'ring-emerald-500', 
    icon: CheckCircle2 
  },
  absent: { 
    label: 'A', 
    active: 'bg-rose-600 text-white shadow-rose-200', 
    inactive: 'bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600', 
    ring: 'ring-rose-500', 
    icon: XCircle 
  },
  late: { 
    label: 'L', 
    active: 'bg-amber-600 text-white shadow-amber-200', 
    inactive: 'bg-amber-50 text-amber-400 hover:bg-amber-100 hover:text-amber-600', 
    ring: 'ring-amber-500', 
    icon: Clock 
  },
} as const;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Batch { id: string; name: string; subject: string | null; daysJson: string[]; enrolledStudents: number }
interface StudentRow { userId: string; studentProfileId: string; name: string; phone: string; studentCode: string; status: string | null; note: string | null; recordId: string | null; isLocked: boolean }
interface CalendarDay { present: number; absent: number; late: number; total: number; isLocked: boolean }

export default function AttendancePage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [summary, setSummary] = useState<{ total: number; present: number; absent: number; late: number; unmarked: number } | null>(null);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [calendarData, setCalendarData] = useState<Record<string, CalendarDay>>({});
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<{ date: string; name: string }[]>([]);

  // Fetch batches
  useEffect(() => {
    api.get('/batches').then(({ data }) => {
      const active = data.data.filter((b: any) => b.status === 'active');
      setBatches(active);
      if (active.length > 0 && !selectedBatch) setSelectedBatch(active[0].id);
    }).catch(console.error);
  }, []);

  // Fetch attendance for selected batch + date
  const fetchAttendance = useCallback(async () => {
    if (!selectedBatch || !selectedDate) return;
    setLoading(true);
    setSaved(false);
    try {
      const { data } = await api.get(`/attendance/batch/${selectedBatch}`, { params: { date: selectedDate } });
      setStudents(data.data.students);
      setSummary(data.data.summary);
      const map: Record<string, string> = {};
      data.data.students.forEach((s: StudentRow) => {
        if (s.status) map[s.userId] = s.status;
      });
      setAttendance(map);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [selectedBatch, selectedDate]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  // Fetch calendar heatmap
  const fetchCalendar = useCallback(async () => {
    if (!selectedBatch) return;
    try {
      const { data } = await api.get(`/attendance/calendar/${selectedBatch}`, { params: { month: calendarMonth, year: calendarYear } });
      setCalendarData(data.data.calendar);
      setHolidays(data.data.holidays);
    } catch (err) { console.error(err); }
  }, [selectedBatch, calendarMonth, calendarYear]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const markAllPresent = () => {
    const map: Record<string, string> = {};
    students.forEach(s => { map[s.userId] = 'present'; });
    setAttendance(map);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedBatch) return;
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
      if (records.length === 0) return;
      await api.post('/attendance/mark', { batchId: selectedBatch, date: selectedDate, records });
      setSaved(true);
      fetchAttendance();
      fetchCalendar();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const renderCalendar = () => {
    const firstDay = new Date(calendarYear, calendarMonth - 1, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const data = calendarData[dateStr];
      const holiday = holidays.find(h => h.date === dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate;

      let bg = 'bg-slate-50 text-slate-400';
      if (holiday) bg = 'bg-purple-50 text-purple-600';
      else if (data) {
        const rate = data.total > 0 ? (data.present + data.late) / data.total : 0;
        bg = rate >= 0.9 ? 'bg-emerald-100 text-emerald-700' : rate >= 0.7 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
      }

      cells.push(
        <button key={day} onClick={() => { setSelectedDate(dateStr); }}
          className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${bg} ${isSelected ? 'ring-2 ring-primary-500 ring-offset-1' : ''} ${isToday ? 'font-bold' : ''} hover:ring-2 hover:ring-primary-300`}
          title={holiday ? `🎉 ${holiday.name}` : data ? `P:${data.present} A:${data.absent} L:${data.late}` : 'No data'}>
          {day}
        </button>
      );
    }
    return cells;
  };

  const markedCount = Object.keys(attendance).length;
  const isAllLocked = students.length > 0 && students.every(s => s.isLocked);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">Mark and track daily attendance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl shadow-premium p-6 border border-slate-100">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Batch</label>
                <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer">
                  {batches.length === 0 && <option>No batches found</option>}
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name} {b.subject ? `(${b.subject})` : ''}</option>)}
                </select>
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:border-primary-500 outline-none transition-all" />
              </div>
              <button onClick={markAllPresent}
                className="px-6 py-3 rounded-2xl text-sm font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-all whitespace-nowrap active:scale-95">
                Mark All Present
              </button>
            </div>
          </div>

          {summary && !loading && (
            <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap gap-4">
              {[
                { label: 'Total', value: summary.total, color: 'bg-slate-100 text-slate-600 col-span-2 sm:col-span-1' },
                { label: 'Present', value: summary.present, color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Absent', value: summary.absent, color: 'bg-rose-50 text-rose-700' },
                { label: 'Late', value: summary.late, color: 'bg-amber-50 text-amber-700' },
                { label: 'Unmarked', value: summary.unmarked, color: 'bg-slate-50 text-slate-400' },
              ].map(s => (
                <div key={s.label} className={`flex-1 rounded-2xl px-4 py-3 text-center transition-all ${s.color}`}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-premium border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No students enrolled</h3>
                <p className="text-sm text-slate-500 mt-1">Add students to this batch to start tracking.</p>
              </div>
            ) : (
              <>
                {isAllLocked && (
                  <div className="flex items-center gap-3 px-6 py-4 bg-amber-50 border-b border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider">
                    <Lock className="w-4 h-4" /> Attendance is locked for this date
                  </div>
                )}
                <div className="divide-y divide-slate-50">
                  {students.map(student => {
                    const currentStatus = attendance[student.userId];
                    return (
                      <div key={student.userId}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 py-5 gap-4 transition-all ${currentStatus ? 'bg-slate-50/30' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 text-base font-black shadow-sm overflow-hidden flex-shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{student.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.studentCode}</span>
                              {student.isLocked && <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Locked</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {(['present', 'absent', 'late'] as const).map(status => {
                            const sc = STATUS_CONFIG[status];
                            const isActive = currentStatus === status;
                            const Icon = sc.icon;
                            return (
                              <button key={status} onClick={() => !student.isLocked && setAttendance(prev => ({ ...prev, [student.userId]: status }))}
                                disabled={student.isLocked}
                                className={`group relative w-12 h-12 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center ${
                                  isActive 
                                    ? `${sc.active} ring-4 ${sc.ring}/20 scale-110 z-10 shadow-lg` 
                                    : `${sc.inactive} border border-transparent`
                                } ${student.isLocked ? 'opacity-30 cursor-not-allowed grayscale' : 'cursor-pointer active:scale-90'}`}
                                title={status.toUpperCase()}
                              >
                                {isActive ? <Icon className="w-5 h-5" /> : sc.label}
                                {isActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm"><div className={`w-1.5 h-1.5 rounded-full ${sc.active.split(' ')[0]}`} /></div>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-500">{markedCount}/{students.length} marked</p>
                  <div className="flex items-center gap-4">
                    {saved && <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5" /> Saved!</span>}
                    <button onClick={handleSave} disabled={saving || markedCount === 0 || isAllLocked}
                      className="px-8 py-3 rounded-2xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all">
                      {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-5 h-5" /> Save Attendance</>}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-premium p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Calendar</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => { if (calendarMonth === 1) { setCalendarMonth(12); setCalendarYear(y => y - 1); } else { setCalendarMonth(m => m - 1); } }}
                  className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
                <span className="text-xs font-black text-slate-700 w-28 text-center uppercase tracking-widest">{MONTHS[calendarMonth - 1]} {calendarYear}</span>
                <button onClick={() => { if (calendarMonth === 12) { setCalendarMonth(1); setCalendarYear(y => y + 1); } else { setCalendarMonth(m => m + 1); } }}
                  className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map(d => <div key={d} className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest py-1">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 pt-6 border-t border-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-100" /> &gt;90%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-100" /> 70-90%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-100" /> &lt;70%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-100" /> Holiday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
