import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';
import {
  User, Mail, Phone, Calendar, MapPin, Building,
  BookOpen, Shield, Clock, Loader2, Moon, Sun, Download, BarChart2
} from 'lucide-react';

export default function MyProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [attRes, examRes] = await Promise.all([
          api.get('/attendance/my-summary'),
          api.get('/exams/my-results').catch(() => ({ data: { data: [] } }))
        ]);
        setAttendanceData(attRes.data.data);
        setExamResults(examRes.data.data);
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[11px] font-bold text-steel uppercase tracking-widest">Loading profile...</p>
      </div>
    );
  }

  const profile = user?.studentProfile;
  const enrolledAtDate = profile?.enrolledAt
    ? new Date(profile.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Not available';

  const dobDate = user?.dob
    ? new Date(user.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Not provided';

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-1 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-ink tracking-tight">My Profile</h1>
          <p className="text-sm text-steel">Manage your personal and academic details.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-canvas border border-hairline hover:bg-surface text-ink rounded-lg text-xs font-bold uppercase tracking-widest flex items-center transition-all shadow-sm print:hidden"
          >
            <Download className="w-4 h-4 mr-2" /> Save as PDF
          </button>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-hairline bg-surface flex items-center justify-center text-steel hover:bg-surface-hover hover:text-ink active:scale-95 transition-all print:hidden"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Student Identity Card */}
      <div className="mint-card p-6 flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-b from-brand-green/5 to-transparent">
        <div className="w-20 h-20 rounded-full bg-surface border-2 border-brand-green flex items-center justify-center overflow-hidden mb-4 shadow-sm">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-brand-green-deep" />
          )}
        </div>
        
        <h2 className="text-lg font-bold text-ink">{user?.name}</h2>
        <p className="text-xs font-semibold text-brand-green-deep bg-brand-green-soft px-3 py-1 rounded-full mt-2 border border-brand-green/20 font-mono tracking-wider">
          {profile?.studentCode || 'NO_CODE'}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-6 border-t border-hairline text-left">
          <div>
            <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Roll Number</p>
            <p className="text-sm font-bold text-ink mt-0.5 font-mono">{profile?.studentCode || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Admission Date</p>
            <p className="text-sm font-bold text-ink mt-0.5">{enrolledAtDate}</p>
          </div>
        </div>
      </div>

      {/* Personal & Parent Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider px-1">Personal & Parents Details</h3>
        
        <div className="mint-card divide-y divide-hairline-soft overflow-hidden">
          {/* Email */}
          <div className="p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-steel">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Email Address</p>
              <p className="text-sm font-medium text-ink mt-0.5">{user?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-steel">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Contact Phone</p>
              <p className="text-sm font-medium text-ink mt-0.5">{user?.phone || 'N/A'}</p>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-steel">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Date of Birth</p>
              <p className="text-sm font-medium text-ink mt-0.5">{dobDate}</p>
            </div>
          </div>

          {/* Address */}
          <div className="p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-steel">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Home Address</p>
              <p className="text-sm font-medium text-ink mt-0.5">{user?.address || 'Not specified'}</p>
            </div>
          </div>

          {/* Parent Name */}
          <div className="p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-steel">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Parent / Guardian Name</p>
              <p className="text-sm font-medium text-ink mt-0.5">{profile?.parentName || 'N/A'}</p>
            </div>
          </div>

          {/* Parent Phone */}
          <div className="p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-steel">
              <Phone className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Parent Contact</p>
              <p className="text-sm font-medium text-ink mt-0.5">{profile?.parentPhone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Batches Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider px-1">Academic Enrollments</h3>
        
        <div className="space-y-3">
          {attendanceData?.byBatch?.length > 0 ? (
            attendanceData.byBatch.map((batch: any, index: number) => (
              <div key={index} className="mint-card p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-green-soft flex items-center justify-center text-brand-green-deep">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink leading-tight">{batch.batchName}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-steel mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{batch.total} attendance classes</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[9px] font-bold text-stone uppercase tracking-widest">Attendance</p>
                  <p className="text-base font-black text-ink font-mono mt-0.5">
                    {batch.total > 0 ? Math.round(((batch.present + batch.late) / batch.total) * 100) : 0}%
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="mint-card p-4 sm:p-8 text-center text-steel text-sm italic">
              No active batch enrollments found.
            </div>
          )}
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="space-y-4 print:mt-8">
        <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider px-1 flex items-center">
          <BarChart2 className="w-4 h-4 mr-2" />
          Performance Analytics
        </h3>
        
        {examResults && examResults.length > 0 ? (
          <div className="bg-canvas border border-hairline rounded-lg overflow-x-auto shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-hairline">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate uppercase tracking-widest">Exam / Test</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate uppercase tracking-widest">Marks Obtained</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate uppercase tracking-widest">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {examResults.map((result: any) => {
                  const percentage = Math.round((Number(result.marksObtained) / Number(result.exam.maxMarks)) * 100);
                  return (
                    <tr key={result.id} className="hover:bg-surface-soft transition-colors">
                      <td className="px-6 py-4 font-bold text-ink">{result.exam.title}</td>
                      <td className="px-6 py-4 text-steel font-bold text-xs">{new Date(result.exam.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-ink">{result.marksObtained} / {result.exam.maxMarks}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          percentage >= 75 ? 'bg-brand-green/10 text-brand-green-deep border-brand-green/20' :
                          percentage >= 40 ? 'bg-brand-warn/10 text-brand-warn border-brand-warn/20' :
                          'bg-brand-error/10 text-brand-error border-brand-error/20'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mint-card p-8 text-center bg-surface/30">
            <p className="text-sm text-ink font-bold">No exam records found</p>
            <p className="text-xs text-steel mt-1">You have not been graded for any offline exams yet.</p>
          </div>
        )}
      </div>

      {/* Institute Info */}
      <div className="mint-card p-4 bg-surface/50 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-surface border border-hairline flex items-center justify-center text-steel">
          <Building className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Enrolled Institute</p>
          <p className="text-sm font-bold text-ink">{user?.institute?.name || 'VidyaPlus Institute'}</p>
        </div>
      </div>
    </div>
  );
}
