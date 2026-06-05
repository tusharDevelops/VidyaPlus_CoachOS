import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Users, Loader2, 
  ChevronLeft, History, Calendar as CalendarIcon, 
  Search, ArrowRight, UserCheck
} from 'lucide-react';
import api from '../../../lib/api';
import { DrillDepth } from '../types';
import { useAuthStore } from '../../../stores/auth.store';

interface AttendanceMarkingLayerProps {
  batchId: string | null;
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

export default function StaffAttendanceLayer({ batchId, onNavigate }: AttendanceMarkingLayerProps) {
  const { hasPermission } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    if (!batchId) return;
    setLoading(true);
    try {
      const [batchRes, attRes] = await Promise.all([
        api.get(`/batches/${batchId}`),
        api.get(`/attendance/batch/${batchId}`, { params: { date: selectedDate } })
      ]);
      
      setBatch(batchRes.data.data);
      setStudents(attRes.data.data.students);
      
      const map: Record<string, string> = {};
      attRes.data.data.students.forEach((s: any) => {
        if (s.status) map[s.userId] = s.status;
      });
      setAttendance(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [batchId, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!hasPermission('attendance.mark')) return;
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
      await api.post('/attendance/mark', { batchId, date: selectedDate, records });
      alert('Attendance saved successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save');
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

  if (loading && !batch) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-canvas border border-hairline rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-green/10 rounded-lg">
                <UserCheck className="w-5 h-5 text-brand-green-deep" />
              </div>
              <h2 className="text-2xl font-bold text-ink">{batch?.name}</h2>
            </div>
            <p className="text-xs text-steel font-bold uppercase tracking-widest flex items-center">
              <CalendarIcon className="w-3.5 h-3.5 mr-2" /> Marking attendance for {new Date(selectedDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
             <input 
               type="date" 
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="mint-input h-11 px-4 font-bold text-xs uppercase tracking-widest"
             />
             <button 
               onClick={markAllPresent}
               disabled={!hasPermission('attendance.mark')}
               className="h-11 px-6 bg-surface border border-hairline text-ink hover:bg-canvas rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Mark All Present
             </button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-steel" />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mint-input w-full h-12 pl-11 pr-4 rounded-xl"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <p className="text-[10px] font-black text-steel uppercase tracking-widest hidden sm:block">
            {Object.keys(attendance).length} / {students.length} Marked
          </p>
          <button 
            onClick={handleSave}
            disabled={saving || Object.keys(attendance).length === 0 || !hasPermission('attendance.mark')}
            className="flex-1 sm:flex-none h-12 px-4 sm:px-8 bg-ink text-canvas hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-lg"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Save Attendance
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-canvas border border-hairline rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-hairline">
          {filteredStudents.length === 0 ? (
            <div className="p-16 text-center">
              <Users className="w-12 h-12 text-stone mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold text-ink">No students found</p>
              <p className="text-xs text-steel mt-1">Make sure students are enrolled in this batch.</p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const currentStatus = attendance[student.userId];
              return (
                <div key={student.userId} className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6 transition-all ${currentStatus ? 'bg-surface/30' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-ink font-bold shadow-sm">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-ink">{student.name}</p>
                      <p className="text-[10px] font-bold text-steel uppercase tracking-widest mt-0.5">{student.studentCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(['present', 'absent', 'late'] as const).map((status) => {
                      const cfg = STATUS_CONFIG[status];
                      const isActive = currentStatus === status;
                      const Icon = cfg.icon;
                      
                      return (
                        <button
                          key={status}
                          disabled={!hasPermission('attendance.mark')}
                          onClick={() => setAttendance(prev => ({ ...prev, [student.userId]: status }))}
                          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isActive 
                              ? cfg.color 
                              : 'bg-canvas border-hairline text-steel hover:bg-surface'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
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
