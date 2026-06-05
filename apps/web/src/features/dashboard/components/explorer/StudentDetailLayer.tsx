import { useState, useEffect } from 'react';
import { User, IndianRupee, MessageSquare, Receipt, Phone, Mail, Calendar, MapPin, BookOpen, Loader2, Edit2, Trash2, AlertCircle, Plus, History as HistoryIcon } from 'lucide-react';
import { DrillDepth } from '../DashboardDrillDown.tsx';
import api from '../../../../lib/api';
import FeeCollectionDrawer from '../../../fees/components/FeeCollectionDrawer';
import StudentModal from '../modals/StudentModal.tsx';

interface StudentDetailLayerProps {
  studentId: string | null;
  onNavigate: (depth: DrillDepth) => void;
}

export default function StudentDetailLayer({ studentId, onNavigate }: StudentDetailLayerProps) {
  const [activeTab, setActiveTab] = useState<'fees' | 'messages' | 'profile'>('fees');
  const [student, setStudent] = useState<any>(null);
  const [ledger, setLedger] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFeeDrawer, setShowFeeDrawer] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ subject: '', content: '' });

  const fetchStudentData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const [stuRes, feeRes] = await Promise.all([
        api.get(`/students/${studentId}`),
        api.get(`/fees/student/${studentId}/ledger`)
      ]);
      setStudent(stuRes.data.data);
      setLedger(feeRes.data.data);
    } catch (err) {
      console.error('Failed to fetch student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!studentId || !emailDraft.subject || !emailDraft.content) {
      alert('Please provide both subject and content');
      return;
    }
    setSendingEmail(true);
    try {
      await api.post(`/students/${studentId}/send-email`, {
        subject: emailDraft.subject,
        content: emailDraft.content,
        title: `Academic Update: ${student.name}`
      });
      alert('Email dispatched successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to dispatch email');
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const deleteStudent = async () => {
    if (!window.confirm('Archive this student record permanently?')) return;
    try {
      await api.delete(`/students/${studentId}`);
      onNavigate('STUDENTS');
    } catch (err) {
      alert('Delete failed');
    }
  };

  const generateDue = async () => {
    try {
      await api.post(`/fees/student/${studentId}/generate-due`);
      fetchStudentData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate due');
    }
  };

  if (loading || !student) {
    return (
      <div className="flex items-center justify-center h-64 bg-canvas border border-hairline rounded-lg">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  const { summary, records } = ledger || { summary: { totalDues: 0, totalPaid: 0, balance: 0 }, records: [] };

  return (
    <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 bg-surface border-b border-hairline">
        <div className="flex flex-col md:flex-row gap-6 md:items-center">
          <div className="w-20 h-20 rounded-lg bg-canvas border border-hairline flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            {student.photoUrl ? (
              <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-charcoal" />
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-ink">{student.name}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
              <span className="flex items-center text-xs font-bold text-steel uppercase tracking-widest">
                <span className="opacity-50 mr-2">ID:</span> {student.profile?.studentCode || 'N/A'}
              </span>
              <span className="flex items-center text-xs font-bold text-steel uppercase tracking-widest">
                <span className="opacity-50 mr-2">Status:</span> 
                <span className={`capitalize ${student.status === 'active' ? 'text-brand-green-deep' : 'text-brand-error'}`}>
                  {student.status}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative group">
              <button 
                className="px-4 py-2 bg-ink text-canvas hover:bg-ink/90 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center transition-all shadow-lg"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-2" /> Connect
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-canvas rounded-xl shadow-premium border border-hairline z-20 py-2 hidden group-hover:block animate-slide-up origin-top-right">
                <button onClick={() => { setActiveTab('messages'); window.scrollTo({ top: 400, behavior: 'smooth' }); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-ink hover:bg-surface">
                  <MessageSquare className="w-4 h-4 text-brand-green" /> WhatsApp
                </button>
                <button onClick={() => { setActiveTab('messages'); window.scrollTo({ top: 400, behavior: 'smooth' }); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-ink hover:bg-surface">
                  <Mail className="w-4 h-4 text-brand-blue" /> Email
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-ink hover:bg-surface">
                  <AlertCircle className="w-4 h-4 text-brand-warn" /> SMS Alert
                </button>
                <a href={`tel:${student.phone}`} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-ink hover:bg-surface border-t border-hairline mt-2 pt-2">
                  <Phone className="w-4 h-4 text-steel" /> Direct Call
                </a>
              </div>
            </div>

            <button 
              onClick={generateDue}
              className="px-4 py-2 bg-brand-green/10 text-brand-green-deep hover:bg-brand-green/20 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center transition-all"
            >
              <HistoryIcon className="w-3.5 h-3.5 mr-2" /> Sync Ledger
            </button>
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-canvas border border-hairline text-ink hover:bg-surface rounded-lg text-xs font-bold uppercase tracking-widest flex items-center transition-all shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
            </button>
            <button 
              onClick={deleteStudent}
              className="px-4 py-2 bg-brand-error/10 text-brand-error border border-brand-error/20 rounded-lg hover:bg-brand-error hover:text-canvas transition-all text-xs font-bold uppercase tracking-widest"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto whitespace-nowrap border-b border-hairline px-4 bg-canvas sticky top-0 z-10 hide-scrollbar">
        <button 
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'fees' ? 'border-brand-green text-brand-green-deep' : 'border-transparent text-steel hover:text-ink'
          }`}
        >
          Fees & Payments
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'messages' ? 'border-brand-green text-brand-green-deep' : 'border-transparent text-steel hover:text-ink'
          }`}
        >
          Communication Center
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'profile' ? 'border-brand-green text-brand-green-deep' : 'border-transparent text-steel hover:text-ink'
          }`}
        >
          Full Profile
        </button>
      </div>

      {/* Content Layer */}
      <div className="p-6 sm:p-8 min-h-[400px]">
        {activeTab === 'fees' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-surface rounded-xl border border-hairline">
                <p className="text-[10px] font-black text-slate uppercase tracking-widest mb-1 opacity-60">Contracted Fee</p>
                <p className="text-2xl font-bold text-ink">₹{summary.totalDues || 0}</p>
              </div>
              <div className="p-5 bg-brand-green/5 rounded-xl border border-brand-green/20">
                <p className="text-[10px] font-black text-brand-green-deep uppercase tracking-widest mb-1 opacity-60">Total Paid</p>
                <p className="text-2xl font-bold text-brand-green-deep">₹{summary.totalPaid || 0}</p>
              </div>
              <div className="p-5 bg-brand-error/5 rounded-xl border border-brand-error/20">
                <p className="text-[10px] font-black text-brand-error uppercase tracking-widest mb-1 opacity-60">Outstanding Due</p>
                <p className="text-2xl font-bold text-brand-error">₹{summary.balance || 0}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                className="mint-btn-brand"
                onClick={() => setShowFeeDrawer(true)}
              >
                <IndianRupee className="w-4 h-4 mr-2" />
                Collect Payment
              </button>
              <button className="mint-btn-secondary">
                <Receipt className="w-4 h-4 mr-2" />
                Get PDF Receipt
              </button>
            </div>

            {/* Active Plans Section */}
            <div className="space-y-4">
               <h3 className="text-sm font-black text-ink uppercase tracking-widest opacity-60">Assigned Fee Plans</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student?.enrollments?.map((e: any) => e.feePlan && (
                    <div key={e.id} className="bg-canvas border border-hairline rounded-xl p-5 flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-surface border border-hairline flex items-center justify-center text-ink">
                             <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-ink">{e.feePlan.name}</p>
                             <p className="text-[10px] text-steel font-medium uppercase tracking-widest mt-0.5">{e.batch?.name || 'General'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-bold text-ink">₹{e.feePlan.amount}</p>
                          <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest mt-0.5">{e.feePlan.frequency}</p>
                       </div>
                    </div>
                  ))}
                  {(!student?.enrollments || student.enrollments.filter((e: any) => e.feePlan).length === 0) && (
                    <div className="col-span-full bg-surface border border-hairline border-dashed rounded-xl p-6 text-center">
                       <AlertCircle className="w-5 h-5 text-steel mx-auto mb-2" />
                       <p className="text-xs font-bold text-steel uppercase tracking-widest">No fee plan assigned</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-ink uppercase tracking-widest opacity-60">Fee Ledger History</h3>
                <span className="text-[10px] font-bold text-steel bg-surface px-2 py-0.5 rounded border border-hairline">
                  {records.length} Entries
                </span>
              </div>
              
              {records.length === 0 ? (
                <div className="p-16 text-center border-2 border-hairline border-dashed rounded-2xl bg-surface/30">
                  <div className="w-12 h-12 rounded-full bg-canvas border border-hairline flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-stone opacity-30" />
                  </div>
                  <p className="text-sm text-ink font-bold">No fee records found</p>
                  <p className="text-xs text-steel mt-1 max-w-xs mx-auto">This student has no generated dues. You can generate them now based on their assigned plan.</p>
                  <button 
                    onClick={generateDue}
                    className="mt-8 mint-btn-primary py-3 px-8 text-[11px] uppercase tracking-widest shadow-lg shadow-brand-green/10"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Generate Dues Now
                  </button>
                </div>
              ) : (
                <div className="bg-canvas border border-hairline rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface border-b border-hairline">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate uppercase tracking-widest">Plan / Period</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate uppercase tracking-widest">Due Date</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate uppercase tracking-widest">Amount</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate uppercase tracking-widest text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {records.map((record: any) => (
                        <tr key={record.id} className="hover:bg-surface-soft transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-ink">{record.planName}</p>
                            <p className="text-[10px] text-steel font-medium uppercase tracking-wider">{record.periodLabel}</p>
                          </td>
                          <td className="px-6 py-4 text-steel font-bold text-xs">
                            {new Date(record.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-ink">₹{record.amount}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              record.status === 'paid' ? 'bg-brand-green/10 text-brand-green-deep border-brand-green/20' :
                              record.status === 'partial' ? 'bg-brand-warn/10 text-brand-warn border-brand-warn/20' :
                              'bg-brand-error/10 text-brand-error border-brand-error/20'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-10 animate-fade-in max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* WhatsApp Section */}
              <div className="p-8 bg-surface border border-hairline rounded-2xl space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-ink uppercase tracking-widest flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-brand-green" /> WhatsApp Dispatch
                  </h3>
                  <span className="text-[10px] font-bold text-brand-green-deep bg-brand-green/10 px-2 py-0.5 rounded uppercase tracking-tighter">Verified</span>
                </div>
                
                <div className="space-y-4">
                  <textarea 
                    className="w-full h-32 p-4 bg-canvas border border-hairline rounded-xl text-sm focus:border-brand-green focus:ring-0 outline-none transition-colors font-medium shadow-inner"
                    placeholder="Type custom message to student/parent..."
                    defaultValue={`Hi ${student.name}, hope you are doing well. Just wanted to connect regarding...`}
                  ></textarea>
                  <button 
                    type="button"
                    onClick={() => {
                      const msg = `https://wa.me/${student.phone}?text=${encodeURIComponent(`Hi ${student.name}, hope you are doing well. Just wanted to connect regarding...`)}`;
                      window.open(msg, '_blank');
                    }}
                    className="bg-brand-green text-white hover:bg-brand-green-deep w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-lg shadow-brand-green/10"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    DISPATCH WHATSAPP NOW
                  </button>
                </div>

                <div className="space-y-3 pt-4">
                  <p className="text-[10px] font-black text-steel uppercase tracking-[0.2em] opacity-60">Smart WhatsApp Templates</p>
                  <div className="grid grid-cols-1 gap-2">
                    <TemplateButton 
                      title="Fee Reminder" 
                      desc={`Dear parent, fee of ₹${summary.balance} is pending for ${student.name}. Please pay by tomorrow.`} 
                    />
                    <TemplateButton 
                      title="Absence Alert" 
                      desc={`${student.name} was absent in today's class. Please ensure regular attendance.`} 
                    />
                  </div>
                </div>
              </div>

              {/* Email Section */}
              <div className="p-8 bg-surface border border-hairline rounded-2xl space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-ink uppercase tracking-widest flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-brand-blue" /> Email Channel
                  </h3>
                  <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded uppercase tracking-tighter">{student.email ? 'Connected' : 'Missing Email'}</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-steel uppercase tracking-widest ml-1">Subject Line</label>
                    <input 
                      type="text" 
                      placeholder="Enter email subject..."
                      className="mint-input w-full h-11"
                      value={emailDraft.subject}
                      onChange={(e) => setEmailDraft(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <textarea 
                    className="w-full h-24 p-4 bg-canvas border border-hairline rounded-xl text-sm focus:border-brand-blue focus:ring-0 outline-none transition-colors font-medium shadow-inner"
                    placeholder="Draft your email content..."
                    value={emailDraft.content}
                    onChange={(e) => setEmailDraft(prev => ({ ...prev, content: e.target.value }))}
                  ></textarea>
                  <button 
                    type="button"
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="h-12 w-full bg-brand-green text-white hover:bg-brand-green-deep rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-lg shadow-brand-green/20"
                  >
                    {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                    DISPATCH EMAIL NOW
                  </button>
                  {!student.email && (
                    <p className="text-[10px] text-brand-error font-bold text-center uppercase tracking-widest">
                      Missing email address. Update profile to enable.
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black text-steel uppercase tracking-[0.2em] opacity-60">Standard Email Templates</p>
                  <div className="grid grid-cols-1 gap-2">
                    <TemplateButton 
                      title="Monthly Fee Invoice" 
                      desc={`Hello, Please find the attached fee invoice for ${student.name} for the current month.`} 
                      onClick={() => setEmailDraft({ 
                        subject: `Fee Invoice - ${new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`, 
                        content: `Dear Parent,\n\nThis is a notification regarding the fee invoice for ${student.name} for the month of ${new Date().toLocaleDateString(undefined, { month: 'long' })}.\n\nTotal Balance: ₹${summary.balance}\n\nPlease ensure payment is made at the earliest to avoid late fees.\n\nBest Regards,\nVidyaPlus Accounts` 
                      })}
                    />
                    <TemplateButton 
                      title="Performance Report" 
                      desc={`Dear Parent, We have updated the academic performance report for ${student.name}. Please review.`} 
                      onClick={() => setEmailDraft({ 
                        subject: `Academic Performance Report: ${student.name}`, 
                        content: `Dear Parent,\n\nWe are pleased to share the latest performance report for ${student.name}.\n\nYour child has shown consistent progress in their recent assessments. You can view the detailed breakdown in the parent portal.\n\nIf you have any questions, feel free to schedule a call.\n\nBest Regards,\nAcademic Coordinator` 
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
            <div className="space-y-8">
              <h3 className="text-sm font-black text-ink uppercase tracking-[0.2em] flex items-center border-b border-hairline pb-3">
                <User className="w-4 h-4 mr-3 text-brand-green" />
                KYC & PERSONAL DATA
              </h3>
              <div className="space-y-6">
                <DetailRow label="Phone Number" value={student.phone} icon={Phone} />
                <DetailRow label="Email Identity" value={student.email || 'NOT_SET'} icon={Mail} />
                <DetailRow label="Guardian Name" value={student.profile?.parentName || 'NOT_PROVIDED'} />
                <DetailRow label="Guardian Phone" value={student.profile?.parentPhone || 'NOT_PROVIDED'} />
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-sm font-black text-ink uppercase tracking-[0.2em] flex items-center border-b border-hairline pb-3">
                <Calendar className="w-4 h-4 mr-3 text-brand-green" />
                ACADEMIC FOOTPRINT
              </h3>
              <div className="space-y-6">
                <DetailRow label="Admission Date" value={new Date(student.profile?.enrolledAt || student.createdAt).toLocaleDateString()} icon={Calendar} />
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate uppercase tracking-widest opacity-50">Active Class Enrollments</p>
                  <div className="flex flex-wrap gap-2">
                    {student.batches?.map((b: any) => (
                      <span key={b.id} className="px-3 py-1 bg-ink text-canvas rounded text-[9px] font-black uppercase tracking-widest">
                        {b.name}
                      </span>
                    )) || 'NO_ENROLLMENTS'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showFeeDrawer && (
        <FeeCollectionDrawer 
          studentId={studentId}
          onClose={() => setShowFeeDrawer(false)}
          onSuccess={fetchStudentData}
        />
      )}

      {showEditModal && (
        <StudentModal 
          student={student}
          onClose={() => setShowEditModal(false)}
          onSaved={() => { setShowEditModal(false); fetchStudentData(); }}
        />
      )}
    </div>
  );
}

function DetailRow({ label, value, icon: Icon }: any) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-black text-slate uppercase tracking-widest opacity-50">{label}</p>
      <div className="flex items-center text-sm font-bold text-ink">
        {Icon && <Icon className="w-3.5 h-3.5 mr-2 text-stone opacity-50" />}
        {value}
      </div>
    </div>
  );
}

function TemplateButton({ title, desc, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left p-5 bg-surface border border-hairline rounded-xl hover:border-brand-green transition-all group shadow-sm"
    >
      <p className="text-xs font-black text-ink uppercase tracking-widest mb-2 group-hover:text-brand-green-deep">{title}</p>
      <p className="text-[11px] text-steel font-medium leading-relaxed italic line-clamp-2">"{desc}"</p>
    </button>
  );
}
