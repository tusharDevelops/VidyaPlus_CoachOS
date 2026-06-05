import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Users, UserPlus, CreditCard, Shield, Edit2, Trash2,
  Loader2, CheckCircle2, History, X, Calendar, Search,
  Check, AlertCircle, Clock, ArrowRight, UserCheck, ShieldAlert
} from 'lucide-react';
import StaffModal from './StaffModal';
import PayrollModal from './PayrollModal';

export interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: 'teacher' | 'accountant' | 'admin' | 'custom';
  baseSalary: number;
  permissions: string[];
  status: 'active' | 'inactive';
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'attendance' | 'roles'>('members');

  // Attendance specific state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyAttendance, setDailyAttendance] = useState<any[]>([]);
  const [marking, setMarking] = useState(false);

  // Modal control
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [payrollStaff, setPayrollStaff] = useState<Staff | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/staff');
      setStaffList(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyAttendance = async () => {
    try {
      const { data } = await api.get(`/staff/attendance/daily?date=${attendanceDate}`);
      setDailyAttendance(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchDailyAttendance();
    }
  }, [activeTab, attendanceDate]);

  const handleMark = async (staffId: string, status: string) => {
    setMarking(true);
    try {
      await api.post('/staff/attendance/mark', {
        date: attendanceDate,
        records: [{ staffId, status }]
      });
      fetchDailyAttendance();
    } catch (err) {
      console.error(err);
    } finally {
      setMarking(false);
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.delete(`/staff/${staffId}`);
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete staff member');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3 sm:px-8 py-10 animate-fade-in">
      {/* Cinematic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green-deep text-[10px] font-bold uppercase tracking-widest">
            <Users className="w-3 h-3" /> Team Management
          </div>
          <h1 className="text-4xl font-black text-ink tracking-tight">Team Members</h1>
          <p className="text-slate text-sm font-medium">Manage your teachers and staff members.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button onClick={() => { setSelectedStaff(null); setIsStaffModalOpen(true); }}
             className="mint-btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-brand-green/20">
             <UserPlus className="w-5 h-5" /> Add Team Member
           </button>
        </div>
      </div>

      {/* Atmospheric Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface/50 backdrop-blur-md rounded-2xl border border-hairline w-fit mb-8">
        {[
          { id: 'members', label: 'Members', icon: Users },
          { id: 'attendance', label: 'Check Attendance', icon: Calendar },
          { id: 'roles', label: 'Permissions', icon: Shield }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id ? 'bg-canvas text-ink shadow-premium border border-hairline' : 'text-slate hover:text-ink'
            }`}>
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-brand-green' : 'text-stone'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
           <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
            <p className="text-[10px] font-bold text-slate uppercase tracking-widest mt-4">Loading Team Members...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffList.map(staff => (
                <div key={staff.id} className="mint-card group hover:border-brand-green transition-all bg-canvas p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                     <button onClick={() => { setSelectedStaff(staff); setIsStaffModalOpen(true); }}
                       className="p-2 hover:bg-surface rounded-xl text-slate hover:text-brand-green transition-all">
                       <Edit2 className="w-4 h-4" />
                     </button>
                     <button onClick={() => handleDelete(staff.id)}
                       className="p-2 hover:bg-brand-error/10 rounded-xl text-slate hover:text-brand-error transition-all">
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center font-black text-xl text-brand-green border border-hairline">
                       {staff.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-ink leading-none mb-1">{staff.name}</h3>
                      <p className="text-[10px] font-bold text-slate uppercase tracking-widest">{staff.role}</p>
                      <div className="flex items-center gap-2 mt-3">
                         <span className={`w-2 h-2 rounded-full ${staff.status === 'active' ? 'bg-brand-green' : 'bg-stone'}`} />
                         <span className="text-[11px] font-medium text-slate capitalize">{staff.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 py-4 border-y border-hairline mb-4">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate font-medium">Contact</span>
                        <span className="text-ink font-bold font-mono">{staff.phone}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate font-medium">Monthly Pay</span>
                        <span className="text-brand-green-deep font-black font-mono">₹{staff.baseSalary.toLocaleString()}</span>
                     </div>
                  </div>

                  <button onClick={() => { setPayrollStaff(staff); setIsPayrollModalOpen(true); }}
                    className="w-full py-2.5 rounded-xl border border-hairline text-[10px] font-bold uppercase tracking-widest text-slate hover:text-ink hover:bg-surface transition-all flex items-center justify-center gap-2">
                    <History className="w-3.5 h-3.5" /> View Salary Logs
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="mint-card bg-canvas p-0 overflow-hidden border border-hairline">
               <div className="p-3 sm:p-8 border-b border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between bg-surface/30 gap-4">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-brand-green/10 rounded-2xl">
                        <Calendar className="w-6 h-6 text-brand-green" />
                     </div>
                     <div>
                        <h2 className="text-lg font-bold text-ink tracking-tight">Daily Attendance</h2>
                        <p className="text-xs text-slate font-medium">Record who was present today</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)}
                        className="mint-input h-11 text-xs font-bold px-4" />
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-hairline bg-surface/20">
                        <th className="px-3 sm:px-8 py-4 text-[10px] font-black text-slate uppercase tracking-widest">Team Member</th>
                        <th className="px-3 sm:px-8 py-4 text-[10px] font-black text-slate uppercase tracking-widest text-center">Status</th>
                        <th className="px-3 sm:px-8 py-4 text-[10px] font-black text-slate uppercase tracking-widest">Mark Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {staffList.map(staff => {
                        const record = dailyAttendance.find(r => r.staffId === staff.id);
                        return (
                          <tr key={staff.id} className="hover:bg-surface/30 transition-colors">
                            <td className="px-3 sm:px-8 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-[10px] font-bold text-brand-green border border-hairline">
                                     {staff.name.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-ink leading-none mb-1">{staff.name}</p>
                                     <p className="text-[9px] font-bold text-slate uppercase tracking-widest">{staff.role}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-3 sm:px-8 py-5 text-center">
                               {record ? (
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                                    record.status === 'present' ? 'bg-brand-green/10 text-brand-green-deep border-brand-green/20' :
                                    record.status === 'absent' ? 'bg-brand-error/10 text-brand-error border-brand-error/20' :
                                    'bg-surface text-slate border-hairline'
                                  }`}>
                                     {record.status}
                                  </span>
                               ) : (
                                  <span className="text-[9px] font-bold text-stone uppercase tracking-widest flex items-center justify-center gap-1.5">
                                     <Clock className="w-3 h-3" /> Not Marked
                                  </span>
                               )}
                            </td>
                            <td className="px-3 sm:px-8 py-5">
                               <div className="flex items-center gap-2">
                                  <button onClick={() => handleMark(staff.id, 'present')} disabled={marking}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                      record?.status === 'present' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'bg-surface text-slate hover:text-brand-green hover:bg-brand-green/10'
                                    }`}>
                                     Present
                                  </button>
                                  <button onClick={() => handleMark(staff.id, 'absent')} disabled={marking}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                      record?.status === 'absent' ? 'bg-brand-error text-white shadow-lg shadow-brand-error/20' : 'bg-surface text-slate hover:text-brand-error hover:bg-brand-error/10'
                                    }`}>
                                     Absent
                                  </button>
                                  <button onClick={() => handleMark(staff.id, 'leave')} disabled={marking}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                      record?.status === 'leave' ? 'bg-ink text-white' : 'bg-surface text-slate hover:text-ink'
                                    }`}>
                                     Leave
                                  </button>
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-1 space-y-6">
                  <div className="mint-card bg-brand-green-deep text-white p-3 sm:p-8">
                     <Shield className="w-10 h-10 mb-4 opacity-50" />
                      <h3 className="text-xl font-bold mb-2">Permissions & Roles</h3>
                      <p className="text-white/70 text-sm leading-relaxed mb-6">Control what each team member can see or edit. Use standard roles or create custom settings.</p>
                     <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Quick Tip</p>
                        <p className="text-xs font-medium italic">"Delegation is the key to growing your institute without losing your sanity."</p>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Administrator', desc: 'Full access to everything. Usually for partners or senior managers.', power: 'Full Access' },
                    { title: 'Teacher', desc: 'Focus on batches and attendance. Cannot see financials.', power: 'Teaching Only' },
                    { title: 'Accountant', desc: 'Focus on fees and salaries. No batch management.', power: 'Accounts Only' },
                    { title: 'Receptionist', desc: 'Can add students and mark basic attendance.', power: 'Front Office' }
                  ].map(role => (
                    <div key={role.title} className="mint-card bg-canvas p-6 border border-hairline hover:border-brand-green transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-ink">{role.title}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-surface text-[9px] font-black uppercase tracking-widest text-slate">{role.power}</span>
                       </div>
                       <p className="text-xs text-slate leading-relaxed mb-6">{role.desc}</p>
                       <button onClick={() => { setSelectedStaff(null); setIsStaffModalOpen(true); }}
                         className="text-[10px] font-bold text-brand-green uppercase tracking-widest hover:underline flex items-center gap-2">
                          Manage Template <ArrowRight className="w-3 h-3" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      )}

      {/* Staff Add/Edit Modal */}
      {isStaffModalOpen && (
        <StaffModal
          isOpen={isStaffModalOpen}
          onClose={() => setIsStaffModalOpen(false)}
          staff={selectedStaff}
          onSuccess={fetchStaff}
        />
      )}

      {/* Payroll record Modal */}
      {isPayrollModalOpen && payrollStaff && (
        <PayrollModal
          isOpen={isPayrollModalOpen}
          onClose={() => setIsPayrollModalOpen(false)}
          staff={payrollStaff}
          onSuccess={() => fetchStaff()}
        />
      )}
    </div>
  );
}
