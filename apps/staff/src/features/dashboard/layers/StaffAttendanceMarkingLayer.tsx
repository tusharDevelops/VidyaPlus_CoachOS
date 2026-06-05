import { useState, useEffect, useCallback } from 'react';
import { 
  Users, Calendar as CalendarIcon, CheckCircle2, 
  XCircle, Clock, Loader2, ChevronRight, Search, UserCheck, BookOpen
} from 'lucide-react';
import api from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth.store';
import { DrillDepth } from '../types';

interface StaffAttendanceMarkingLayerProps {
  batchId?: string | null;
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
  late: { 
    label: 'Late', 
    color: 'bg-brand-warn/10 text-brand-warn border-brand-warn/20',
    icon: Clock
  },
} as const;

export default function StaffAttendanceMarkingLayer({ batchId, onNavigate }: StaffAttendanceMarkingLayerProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/batches');
      const filtered = user?.role === 'teacher' 
        ? res.data.data.filter((b: any) => b.teacherId === user.id)
        : res.data.data;
      setBatches(filtered);
      
      if (batchId) {
        const found = filtered.find((b: any) => b.id === batchId);
        if (found) setSelectedBatch(found);
      }
    } catch (err) {
      console.error('Failed to fetch batches', err);
    } finally {
      setLoading(false);
    }
  }, [user, batchId]);

  const fetchAttendance = useCallback(async (bId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/batch/${bId}`, { params: { date: selectedDate } });
      setStudents(res.data.data.students);
      
      const map: Record<string, string> = {};
      res.data.data.students.forEach((s: any) => {
        if (s.status) map[s.userId] = s.status;
      });
      setAttendance(map);
    } catch (err) {
      console.error('Failed to fetch student attendance', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    if (selectedBatch) {
      fetchAttendance(selectedBatch.id);
    }
  }, [selectedBatch, fetchAttendance]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
      await api.post('/attendance/mark', { 
        batchId: selectedBatch.id, 
        date: selectedDate, 
        records 
      });
      alert('Attendance synced with central records');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    const map: Record<string, string> = {};
    students.forEach(s => { map[s.userId] = 'present'; });
    setAttendance(map);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[10px] font-bold text-steel uppercase tracking-widest mt-4">Loading your schedule...</p>
      </div>
    );
  }

  if (!selectedBatch) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h2 className="text-xl font-black text-ink tracking-tight uppercase tracking-tight">Select Batch</h2>
          <p className="text-xs text-steel font-medium">Select a class to begin marking attendance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-canvas border border-hairline border-dashed rounded-[2rem]">
              <Users className="w-12 h-12 text-steel mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold text-ink uppercase tracking-widest opacity-40">No assigned batches</p>
            </div>
          ) : (
            batches.map(batch => (
              <div 
                key={batch.id} 
                onClick={() => setSelectedBatch(batch)}
                className="mint-card p-4 sm:p-8 cursor-pointer group hover:border-brand-green/30 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center border border-hairline group-hover:bg-brand-green/10 transition-colors">
                    <BookOpen className="w-7 h-7 text-ink group-hover:text-brand-green-deep transition-colors" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-steel opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">{batch.name}</h3>
                <p className="text-[10px] font-bold text-steel uppercase tracking-widest mb-4">{batch.subject}</p>
                <div className="flex items-center gap-2 text-[10px] font-black text-brand-green-deep uppercase tracking-widest">
                  <Users className="w-3.5 h-3.5" />
                  {batch.enrolledStudents} Students
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-canvas border border-hairline rounded-[2rem] p-4 sm:p-8 shadow-premium-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSelectedBatch(null)}
              className="w-11 h-11 rounded-xl bg-surface border border-hairline flex items-center justify-center text-steel hover:text-ink hover:bg-canvas transition-all"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-xl font-black text-ink tracking-tight uppercase tracking-widest">{selectedBatch.name}</h2>
                <span className="px-3 py-1 bg-brand-green/10 text-brand-green-deep border border-brand-green/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {selectedBatch.subject}
                </span>
              </div>
              <p className="text-[10px] font-bold text-steel uppercase tracking-[0.2em] flex items-center opacity-60">
                <CalendarIcon className="w-4 h-4 mr-2" /> Marking attendance for {new Date(selectedDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <input 
               type="date" 
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="mint-input h-12 px-6 font-black text-[10px] uppercase tracking-widest bg-surface border-hairline rounded-xl shadow-sm"
             />
             <button 
               onClick={markAllPresent}
               className="h-12 px-4 sm:px-8 bg-canvas border border-hairline text-ink hover:bg-surface rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center transition-all shadow-sm group"
             >
               <CheckCircle2 className="w-4 h-4 mr-3 text-brand-green group-hover:scale-110 transition-transform" />
               Mark All Present
             </button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="relative w-full sm:w-[400px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-steel opacity-30" />
          <input 
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mint-input w-full h-12 pl-14 pr-6 rounded-2xl text-sm font-medium shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <button 
            onClick={handleSave}
            disabled={saving || Object.keys(attendance).length === 0}
            className="flex-1 sm:flex-none h-12 px-12 bg-ink text-canvas hover:bg-ink/90 disabled:opacity-30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center transition-all shadow-premium"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <CheckCircle2 className="w-4 h-4 mr-3" />}
            Save Attendance
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-canvas border border-hairline rounded-[2rem] overflow-hidden shadow-premium-subtle">
        <div className="divide-y divide-hairline">
          {filteredStudents.length === 0 ? (
            <div className="p-24 text-center">
              <Users className="w-16 h-16 text-stone mx-auto mb-6 opacity-10" />
              <h3 className="text-lg font-black text-ink uppercase tracking-widest opacity-40">No students found</h3>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const currentStatus = attendance[student.userId];
              return (
                <div key={student.userId} className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-8 gap-4 sm:gap-8 transition-all ${currentStatus ? 'bg-surface/40' : 'hover:bg-surface/20'}`}>
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-canvas border-2 border-hairline flex items-center justify-center text-xl font-black text-ink shadow-sm shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-black text-ink tracking-tight">{student.name}</p>
                      <p className="text-[10px] font-bold text-steel uppercase tracking-[0.2em] mt-1 opacity-50">{student.studentCode}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {(['present', 'absent', 'late'] as const).map((status) => {
                      const cfg = STATUS_CONFIG[status];
                      const isActive = currentStatus === status;
                      const Icon = cfg.icon;
                      
                      return (
                        <button
                          key={status}
                          onClick={() => setAttendance(prev => ({ ...prev, [student.userId]: status }))}
                          className={`flex-1 sm:flex-none h-11 px-6 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all ${
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
