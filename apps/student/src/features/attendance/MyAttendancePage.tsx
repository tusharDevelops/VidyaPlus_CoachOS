import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  CalendarCheck, Clock, CheckCircle2, AlertTriangle, XCircle,
  BookOpen, ArrowLeft, Loader2, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyAttendancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/my-summary');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch attendance details', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[11px] font-bold text-steel uppercase tracking-widest">Loading attendance...</p>
      </div>
    );
  }

  const summary = data?.summary || { total: 0, present: 0, absent: 0, late: 0, attendanceRate: 0 };
  const rate = summary.attendanceRate;

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 border border-hairline bg-surface rounded-full flex items-center justify-center hover:bg-surface-hover text-steel hover:text-ink active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">Attendance Ledger</h1>
            <p className="text-xs text-steel">Track your academic presence logs.</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-9 h-9 border border-hairline bg-surface rounded-full flex items-center justify-center hover:bg-surface-hover text-steel hover:text-ink active:scale-95 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Primary Summary Stats */}
      <div className="mint-card p-5 bg-gradient-to-br from-brand-green-soft/30 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Aggregate Presence</p>
            <h2 className="text-3xl font-black text-ink font-mono mt-1">{rate}%</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-white shadow-sm font-mono font-bold text-sm">
            {summary.present + summary.late}/{summary.total}
          </div>
        </div>

        {/* Breakdown Badges */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-hairline">
          <div className="text-center bg-brand-green-soft/40 border border-brand-green/10 rounded-lg py-2.5">
            <span className="text-[9px] font-bold text-brand-green-deep uppercase tracking-widest block">Present</span>
            <span className="text-lg font-black text-brand-green-deep font-mono mt-0.5 block">{summary.present}</span>
          </div>
          <div className="text-center bg-rose-50 border border-rose-100 rounded-lg py-2.5">
            <span className="text-[9px] font-bold text-brand-error uppercase tracking-widest block">Absent</span>
            <span className="text-lg font-black text-brand-error font-mono mt-0.5 block">{summary.absent}</span>
          </div>
          <div className="text-center bg-amber-50 border border-amber-100 rounded-lg py-2.5">
            <span className="text-[9px] font-bold text-brand-warn uppercase tracking-widest block">Late</span>
            <span className="text-lg font-black text-brand-warn font-mono mt-0.5 block">{summary.late}</span>
          </div>
        </div>
      </div>

      {/* Batch Attendance Progress */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider px-1">Enrolled Batches Breakdown</h3>

        <div className="mint-card divide-y divide-hairline-soft overflow-hidden">
          {data?.byBatch?.length > 0 ? (
            data.byBatch.map((batch: any, idx: number) => {
              const total = batch.total;
              const present = batch.present + batch.late;
              const percent = total > 0 ? Math.round((present / total) * 100) : 0;

              return (
                <div key={idx} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-steel" />
                      <span className="text-sm font-bold text-ink">{batch.batchName}</span>
                    </div>
                    <span className="text-sm font-black text-ink font-mono">{percent}%</span>
                  </div>

                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        percent >= 75 ? 'bg-brand-green' : percent >= 60 ? 'bg-brand-warn' : 'bg-brand-error'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-stone uppercase tracking-widest font-mono">
                    <span>Classes Held: {total}</span>
                    <span>Attended: {present}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-steel text-sm italic">No batch enrollment data available.</div>
          )}
        </div>
      </div>

      {/* Daily Activity Stream */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider px-1">Daily Log Stream</h3>

        <div className="mint-card overflow-hidden">
          <div className="divide-y divide-hairline-soft">
            {data?.recentRecords?.length > 0 ? (
              data.recentRecords.map((rec: any, idx: number) => {
                const dateLabel = new Date(rec.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  weekday: 'short',
                });

                return (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          rec.status === 'present'
                            ? 'bg-brand-green-soft text-brand-green-deep'
                            : rec.status === 'absent'
                            ? 'bg-rose-50 text-brand-error'
                            : 'bg-amber-50 text-brand-warn'
                        }`}
                      >
                        {rec.status === 'present' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : rec.status === 'absent' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">{rec.batchName}</p>
                        <p className="text-[11px] text-steel mt-0.5">{dateLabel}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      {rec.note && (
                        <span className="text-[11px] text-brand-warn bg-amber-50/50 border border-amber-100/50 px-2 py-0.5 rounded italic max-w-[200px] truncate">
                          {rec.note}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border flex-shrink-0 ${
                          rec.status === 'present'
                            ? 'bg-brand-green-soft text-brand-green-deep border-brand-green/20'
                            : rec.status === 'absent'
                            ? 'bg-rose-50 text-brand-error border-rose-200'
                            : 'bg-amber-50 text-brand-warn border-amber-200'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-steel text-sm italic bg-surface/50">
                No recent attendance records found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
