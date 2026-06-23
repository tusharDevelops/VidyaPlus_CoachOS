import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';
import {
  CalendarCheck, CreditCard, BookOpen, Bell,
  CheckCircle2, AlertTriangle, ArrowRight, Loader2,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, feeRes, examRes] = await Promise.all([
          api.get('/attendance/my-summary'),
          api.get('/fees/my-ledger'),
          api.get('/exams/my-results'),
        ]);
        setData({
          attendance: attendanceRes.data.data,
          fees: feeRes.data.data,
          exams: examRes.data.data || [],
        });
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[11px] font-bold text-steel uppercase tracking-widest">Loading your dashboard...</p>
      </div>
    );
  }

  const attendanceRate = data?.attendance?.summary?.attendanceRate || 0;
  const pendingFees = data?.fees?.summary?.balance || 0;
  const batchCount = data?.attendance?.byBatch?.length || 0;

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-ink tracking-tight">
          Hey, {user?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-sm text-steel">Here's your academic snapshot.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance */}
        <div className="mint-card p-5 flex flex-col gap-4 group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-brand-green-soft flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-brand-green-deep" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Attendance</p>
              <h3 className="text-2xl font-black text-ink font-mono">{attendanceRate}%</h3>
            </div>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${attendanceRate >= 75 ? 'bg-brand-green' : 'bg-brand-warn'}`}
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
          <p className="text-[10px] font-bold text-ink-muted flex items-center gap-1.5">
            {attendanceRate >= 75 ? <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> : <AlertTriangle className="w-3.5 h-3.5 text-brand-warn" />}
            {attendanceRate >= 75 ? 'On track' : 'Needs improvement'}
          </p>
        </div>

        {/* Fee Status */}
        <div className="mint-card p-5 flex flex-col gap-4 group">
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pendingFees > 0 ? 'bg-rose-50' : 'bg-brand-green-soft'}`}>
              <CreditCard className={`w-5 h-5 ${pendingFees > 0 ? 'text-brand-error' : 'text-brand-green-deep'}`} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Pending Dues</p>
              <h3 className={`text-2xl font-black font-mono ${pendingFees > 0 ? 'text-brand-error' : 'text-brand-green-deep'}`}>
                ₹{pendingFees.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <button
            onClick={() => navigate('/fees')}
            className={`w-full py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              pendingFees > 0
                ? 'bg-rose-50 text-brand-error border border-rose-200'
                : 'bg-brand-green-soft text-brand-green-deep border border-brand-green/20'
            }`}
          >
            {pendingFees > 0 ? 'View Dues' : 'Fee History'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Batches */}
        <div className="mint-card p-5 flex flex-col gap-4 group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-ink" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">My Batches</p>
              <h3 className="text-2xl font-black text-ink font-mono">{batchCount}</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {data?.attendance?.byBatch?.map((b: any) => (
              <span key={b.batchName} className="px-3 py-1 bg-surface border border-hairline rounded-full text-[10px] font-bold text-ink-muted uppercase tracking-widest">
                {b.batchName}
              </span>
            ))}
            {batchCount === 0 && <span className="text-[11px] text-stone italic">No batches enrolled</span>}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-ink">Recent Attendance</h3>
          <button
            onClick={() => navigate('/attendance')}
            className="text-xs font-bold text-brand-green-deep flex items-center gap-1 hover:underline"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mint-card overflow-hidden">
          <div className="divide-y divide-hairline-soft">
            {data?.attendance?.recentRecords?.length > 0 ? (
              data.attendance.recentRecords.slice(0, 5).map((rec: any, idx: number) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      rec.status === 'present' ? 'bg-brand-green-soft text-brand-green-deep' : 'bg-rose-50 text-brand-error'
                    }`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">{rec.batchName}</p>
                      <p className="text-[11px] text-steel mt-0.5">
                        {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                    rec.status === 'present'
                      ? 'bg-brand-green-soft text-brand-green-deep border-brand-green/20'
                      : 'bg-rose-50 text-brand-error border-rose-200'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-5 sm:p-10 text-center text-steel text-sm italic">No attendance records yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Exams */}
      {data?.exams?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-ink">Recent Exams</h3>
            <button
              onClick={() => navigate('/exams')}
              className="text-xs font-bold text-brand-green-deep flex items-center gap-1 hover:underline"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mint-card overflow-hidden">
            <div className="divide-y divide-hairline-soft">
              {data.exams.slice(0, 3).map((result: any) => {
                const percentage = Math.round((result.marksObtained / result.exam.maxMarks) * 100);
                const isPass = percentage >= 40;
                
                return (
                  <div key={result.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isPass ? 'bg-brand-green-soft' : 'bg-rose-50'
                      }`}>
                        <span className={`text-[10px] font-bold ${isPass ? 'text-brand-green-deep' : 'text-brand-error'}`}>
                          {percentage}%
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink truncate max-w-[150px]">{result.exam.title}</p>
                        <p className="text-[11px] text-steel mt-0.5">
                          {new Date(result.exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 text-right">
                      <span className={`text-sm font-black font-mono ${isPass ? 'text-brand-green-deep' : 'text-brand-error'}`}>
                        {result.marksObtained}
                      </span>
                      <span className="text-[10px] font-bold text-stone">/ {result.exam.maxMarks}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/exams')}
          className="mint-card p-3 flex flex-col items-center justify-center gap-2 group active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M8 18v-1"/><path d="M16 18v-3"/></svg>
          </div>
          <span className="text-[11px] font-bold text-ink">Exams</span>
        </button>
        <button
          onClick={() => navigate('/fees')}
          className="mint-card p-3 flex flex-col items-center justify-center gap-2 group active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-green-soft flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-brand-green-deep" />
          </div>
          <span className="text-[11px] font-bold text-ink">My Fees</span>
        </button>
        <button
          onClick={() => navigate('/notifications')}
          className="mint-card p-3 flex flex-col items-center justify-center gap-2 group active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
            <Bell className="w-5 h-5 text-ink" />
          </div>
          <span className="text-[11px] font-bold text-ink">Alerts</span>
        </button>
      </div>
    </div>
  );
}
