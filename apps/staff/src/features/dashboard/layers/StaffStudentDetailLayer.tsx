import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, 
  MapPin, Loader2, ArrowLeft, GraduationCap,
  BookOpen, ShieldCheck, TrendingUp, IndianRupee,
  MessageSquare, Receipt, Edit2, Trash2,
  AlertCircle, Plus, History as HistoryIcon,
  ChevronRight, Sparkles, BarChart2
} from 'lucide-react';
import { DrillDepth } from '../types';
import api from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth.store';
import { downloadCSV } from '../../../lib/export';
import FeeCollectionDrawer from '../../fees/components/FeeCollectionDrawer';
import StudentModal from '../components/modals/StudentModal';

interface StaffStudentDetailLayerProps {
  studentId: string;
  onNavigate: (depth: DrillDepth) => void;
}

export default function StaffStudentDetailLayer({ studentId, onNavigate }: StaffStudentDetailLayerProps) {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'fees' | 'messages' | 'profile'>('fees');
  const [student, setStudent] = useState<any>(null);
  const [ledger, setLedger] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeeDrawer, setShowFeeDrawer] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ subject: '', content: '' });

  const fetchData = async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const promises: any[] = [api.get(`/students/${studentId}`)];
      
      // Only fetch ledger if staff has fee view permission
      if (hasPermission('fees.view')) {
        promises.push(api.get(`/fees/student/${studentId}/ledger`));
      }

      const results = await Promise.all(promises);
      setStudent(results[0].data.data);
      if (results[1]) {
        setLedger(results[1].data.data);
      }
    } catch (err: any) {
      console.error('Student Fetch Error:', err);
      setError(err.response?.data?.error || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Default tab based on permissions
    if (!hasPermission('fees.view')) {
      setActiveTab('profile');
    }
  }, [studentId]);

  const exportCSV = () => {
    if (!student || !ledger) return;
    const dataToExport = [
      { Category: 'Student Name', Value: student.name },
      { Category: 'Phone', Value: student.phone },
      { Category: 'Student ID', Value: student.studentProfile?.studentCode },
      { Category: 'Enrolled On', Value: new Date(student.studentProfile?.enrolledAt || student.createdAt).toLocaleDateString() },
      { Category: '', Value: '' },
      { Category: 'Total Dues', Value: ledger.summary.totalDues },
      { Category: 'Total Paid', Value: ledger.summary.totalPaid },
      { Category: 'Total Balance', Value: ledger.summary.balance },
    ];
    downloadCSV(dataToExport, `${student.name}_Report.csv`);
  };

  const exportPDF = () => {
    window.print();
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
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate due');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-canvas border border-hairline rounded-[2.5rem]">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-canvas border border-hairline rounded-[2.5rem] text-center space-y-4">
        <p className="text-sm font-black text-ink uppercase tracking-widest opacity-40">{error || 'Student not found'}</p>
        <button onClick={() => onNavigate('STUDENTS')} className="px-6 py-2 bg-ink text-canvas rounded-xl text-[10px] font-black uppercase tracking-widest">Back to Directory</button>
      </div>
    );
  }

  const { summary, records } = ledger || { summary: { totalDues: 0, totalPaid: 0, balance: 0 }, records: [] };

  return (
    <div className="bg-canvas border border-hairline rounded-[2.5rem] overflow-hidden animate-fade-in shadow-premium-subtle">
      {/* Profile Header */}
      <div className="p-4 sm:p-8 sm:p-10 bg-surface border-b border-hairline print:hidden">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-8 md:items-center">
          <div className="w-24 h-24 rounded-3xl bg-canvas border-2 border-hairline flex items-center justify-center shrink-0 overflow-hidden shadow-md group">
            {student.photoUrl ? (
              <img src={student.photoUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            ) : (
              <span className="text-3xl font-black text-ink">{student.name.charAt(0)}</span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-ink tracking-tight">{student.name}</h2>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-brand-green/10 text-brand-green-deep border-brand-green/20">
                 #{student.studentProfile?.studentCode || 'N/A'}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
              <span className="flex items-center text-xs font-black text-steel uppercase tracking-widest opacity-60">
                <Mail className="w-3.5 h-3.5 mr-2" /> {student.email || 'No email'}
              </span>
              <span className="flex items-center text-xs font-black text-steel uppercase tracking-widest opacity-60">
                <Phone className="w-3.5 h-3.5 mr-2" /> {student.phone}
              </span>
              <span className="flex items-center text-xs font-black text-steel uppercase tracking-widest opacity-60">
                <MapPin className="w-3.5 h-3.5 mr-2" /> {student.address || 'No address provided'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {hasPermission('fees.collect') && (
              <button 
                onClick={() => setShowFeeDrawer(true)}
                className="flex items-center justify-center px-4 py-2 bg-brand-green-deep text-canvas rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-green transition-all shadow-premium print:hidden"
              >
                <Plus className="w-3.5 h-3.5 mr-2" /> Collect Fee
              </button>
            )}

            <div className="relative group w-full sm:w-auto print:hidden">
              <button className="w-full sm:w-auto justify-center px-4 py-2 bg-canvas border border-hairline text-ink hover:bg-surface rounded-lg text-xs font-bold uppercase tracking-widest flex items-center transition-all shadow-sm">
                Export Data
              </button>
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-48 bg-canvas rounded-xl shadow-premium border border-hairline z-50 py-2 hidden group-hover:block animate-slide-up origin-top">
                <button onClick={exportPDF} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-ink hover:bg-surface">
                  Save as PDF
                </button>
                <button onClick={exportCSV} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-ink hover:bg-surface border-t border-hairline mt-1 pt-2">
                  Download CSV
                </button>
              </div>
            </div>

            {hasPermission('students.edit') && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="h-12 px-5 bg-canvas border border-hairline text-ink hover:bg-surface rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </button>
            )}

            {hasPermission('students.delete') && (
              <button 
                onClick={deleteStudent}
                className="w-12 h-12 bg-brand-error/10 text-brand-error border border-brand-error/20 rounded-xl hover:bg-brand-error hover:text-canvas transition-all flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button 
              onClick={() => onNavigate('STUDENTS')}
              className="w-12 h-12 bg-canvas border border-hairline text-ink hover:bg-surface rounded-xl flex items-center justify-center transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto whitespace-nowrap border-b border-hairline px-4 bg-canvas sticky top-0 z-10 hide-scrollbar print:hidden">
        {hasPermission('fees.view') && (
          <TabButton 
            active={activeTab === 'fees'} 
            onClick={() => setActiveTab('fees')} 
            label="Fees & Payments" 
          />
        )}
        <TabButton 
          active={activeTab === 'messages'} 
          onClick={() => setActiveTab('messages')} 
          label="Communication" 
        />
        <TabButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          label="Full Profile" 
        />
      </div>

      {/* Content Layer */}
      <div className="p-6 sm:p-3 sm:p-8 min-h-[400px] print:block">
        {activeTab === 'fees' && hasPermission('fees.view') && (
          <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatsCard label="Contracted Fee" value={`₹${summary.totalDues || 0}`} color="bg-surface border-hairline" />
              <StatsCard label="Total Paid" value={`₹${summary.totalPaid || 0}`} color="bg-brand-green/5 border-brand-green/20 text-brand-green-deep" />
              <StatsCard label="Outstanding Due" value={`₹${summary.balance || 0}`} color="bg-brand-error/5 border-brand-error/20 text-brand-error" />
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  const latestRecordWithPayment = records.find((r: any) => r.payments && r.payments.length > 0);
                  if (latestRecordWithPayment && latestRecordWithPayment.payments[0].receiptNumber) {
                    navigate(`/fees/receipt/${latestRecordWithPayment.payments[0].receiptNumber}`);
                  } else {
                    alert('No payment receipts available for this student yet.');
                  }
                }}
                className="h-14 px-4 sm:px-8 bg-surface border border-hairline rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-canvas transition-all flex items-center"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Get PDF Receipt
              </button>
            </div>

            {/* Assigned Plans */}
            <div className="space-y-6">
               <SectionHeader icon={BookOpen} title="Assigned Fee Plans" />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student?.enrollments?.map((e: any) => e.feePlan && (
                    <div key={e.id} className="bg-canvas border border-hairline rounded-2xl p-6 flex items-center justify-between group hover:border-brand-green transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-surface border border-hairline flex items-center justify-center text-ink group-hover:scale-110 transition-transform">
                             <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="font-bold text-ink tracking-tight">{e.feePlan.name}</p>
                             <p className="text-[10px] text-steel font-black uppercase tracking-widest mt-0.5 opacity-60">{e.batch?.name || 'General'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-bold text-ink tracking-tighter">₹{e.feePlan.amount}</p>
                          <p className="text-[9px] text-brand-green font-black uppercase tracking-widest mt-0.5">{e.feePlan.frequency}</p>
                       </div>
                    </div>
                  ))}
                  {(!student?.enrollments || student.enrollments.filter((e: any) => e.feePlan).length === 0) && (
                    <div className="col-span-full bg-surface/30 border-2 border-hairline border-dashed rounded-[2rem] p-5 sm:p-10 text-center">
                       <AlertCircle className="w-6 h-6 text-stone mx-auto mb-3 opacity-30" />
                       <p className="text-[10px] font-black text-steel uppercase tracking-widest opacity-60">No fee plan assigned</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Ledger History */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <SectionHeader icon={HistoryIcon} title="Fee Ledger History" />
                <span className="text-[10px] font-black text-steel bg-surface px-3 py-1 rounded-full border border-hairline uppercase tracking-widest">
                  {records.length} Entries
                </span>
              </div>
              
              {records.length === 0 ? (
                <div className="p-20 text-center border-2 border-hairline border-dashed rounded-[2.5rem] bg-surface/20">
                  <div className="w-16 h-16 rounded-full bg-canvas border border-hairline flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-stone opacity-20" />
                  </div>
                  <p className="text-sm text-ink font-bold tracking-tight">No fee records found</p>
                  <p className="text-xs text-steel mt-2 max-w-xs mx-auto opacity-60">This student has no generated dues. You can generate them based on their assigned plan.</p>
                  {hasPermission('fees.view') && (
                    <button 
                      onClick={generateDue}
                      className="mt-10 mint-btn-primary py-4 px-10 text-[11px] uppercase tracking-widest shadow-xl shadow-brand-green/10"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Generate Dues Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-canvas border border-hairline rounded-[2rem] overflow-x-auto shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface border-b border-hairline">
                      <tr>
                        <th className="px-4 sm:px-8 py-5 text-[10px] font-black text-slate uppercase tracking-widest">Plan / Period</th>
                        <th className="px-4 sm:px-8 py-5 text-[10px] font-black text-slate uppercase tracking-widest">Due Date</th>
                        <th className="px-4 sm:px-8 py-5 text-[10px] font-black text-slate uppercase tracking-widest">Amount</th>
                        <th className="px-4 sm:px-8 py-5 text-[10px] font-black text-slate uppercase tracking-widest text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {records.map((record: any) => (
                        <tr key={record.id} className="hover:bg-surface/50 transition-colors">
                          <td className="px-4 sm:px-8 py-6">
                            <p className="font-bold text-ink tracking-tight">{record.planName}</p>
                            <p className="text-[10px] text-steel font-black uppercase tracking-wider opacity-60">{record.periodLabel}</p>
                          </td>
                          <td className="px-4 sm:px-8 py-6 text-steel font-bold text-xs">
                            {new Date(record.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 sm:px-8 py-6 font-black text-ink">₹{record.amount}</td>
                          <td className="px-4 sm:px-8 py-6 text-right">
                            <span className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
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
          <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* WhatsApp */}
              <div className="p-5 sm:p-10 bg-surface border border-hairline rounded-[2.5rem] space-y-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-ink uppercase tracking-[0.2em] flex items-center">
                    <MessageSquare className="w-5 h-5 mr-3 text-brand-green" /> WhatsApp Dispatch
                  </h3>
                  <span className="px-3 py-1 bg-brand-green/10 text-brand-green-deep text-[9px] font-black uppercase tracking-widest rounded-full border border-brand-green/20">Active</span>
                </div>
                
                <textarea 
                  className="w-full h-40 p-6 bg-canvas border border-hairline rounded-[1.5rem] text-sm focus:border-brand-green outline-none transition-all font-medium shadow-inner"
                  placeholder="Type message..."
                  defaultValue={`Hi ${student.name}, hope you are doing well. Just wanted to connect regarding...`}
                />
                
                <button 
                  onClick={() => {
                    const msg = `https://wa.me/${student.phone}?text=${encodeURIComponent(`Hi ${student.name}, hope you are doing well. Just wanted to connect regarding...`)}`;
                    window.open(msg, '_blank');
                  }}
                  className="w-full h-14 bg-brand-green text-white hover:bg-brand-green-deep rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-xl shadow-brand-green/20"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> DISPATCH WHATSAPP
                </button>

                <div className="space-y-4 pt-4">
                  <p className="text-[9px] font-black text-steel uppercase tracking-[0.2em] opacity-60">Handy Templates</p>
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

              {/* Email */}
              <div className="p-5 sm:p-10 bg-surface border border-hairline rounded-[2.5rem] space-y-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-ink uppercase tracking-[0.2em] flex items-center">
                    <Mail className="w-5 h-5 mr-3 text-brand-blue" /> Email Channel
                  </h3>
                  <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest rounded-full border border-brand-blue/20">{student.email ? 'Connected' : 'Missing Email'}</span>
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Subject Line"
                    className="mint-input w-full h-12 px-5"
                    value={emailDraft.subject}
                    onChange={(e) => setEmailDraft(prev => ({ ...prev, subject: e.target.value }))}
                  />
                  <textarea 
                    className="w-full h-32 p-6 bg-canvas border border-hairline rounded-[1.5rem] text-sm focus:border-brand-blue outline-none transition-all font-medium shadow-inner"
                    placeholder="Draft content..."
                    value={emailDraft.content}
                    onChange={(e) => setEmailDraft(prev => ({ ...prev, content: e.target.value }))}
                  />
                  <button 
                    onClick={handleSendEmail}
                    disabled={sendingEmail || !student.email}
                    className="w-full h-14 bg-brand-blue text-white hover:bg-brand-blue-deep rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-xl shadow-brand-blue/20 disabled:opacity-50"
                  >
                    {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                    SEND EMAIL NOW
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  <p className="text-[9px] font-black text-steel uppercase tracking-[0.2em] opacity-60">Professional Templates</p>
                  <TemplateButton 
                    title="Monthly Invoice" 
                    desc={`Hello, Please find the attached fee invoice for ${student.name} for the current month.`} 
                    onClick={() => setEmailDraft({ 
                      subject: `Fee Invoice - ${new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`, 
                      content: `Dear Parent,\n\nThis is a notification regarding the fee invoice for ${student.name}.\n\nTotal Balance: ₹${summary.balance}\n\nBest Regards,\nVidyaPlus Accounts` 
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in print:block ${activeTab === 'profile' ? 'block' : 'hidden'}`}>
          <div className="space-y-8 print:mb-8">
            <h3 className="text-sm font-black text-ink uppercase tracking-[0.2em] flex items-center border-b border-hairline pb-3">
              <User className="w-4 h-4 mr-3 text-brand-green" />
              KYC & PERSONAL DATA
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                <DetailItem label="Full Legal Name" value={student.name} />
                <DetailItem label="Student ID Code" value={student.studentProfile?.studentCode || 'VP-UNSET'} />
                <DetailItem label="Primary Phone" value={student.phone} icon={Phone} />
                <DetailItem label="Email Identity" value={student.email || 'NOT_SET'} icon={Mail} />
                <DetailItem label="Guardian Name" value={student.studentProfile?.parentName || 'NOT_PROVIDED'} />
                <DetailItem label="Guardian Contact" value={student.studentProfile?.parentPhone || 'NOT_PROVIDED'} />
            </div>

            <div className="pt-8 space-y-4">
                 <p className="text-[9px] font-black text-slate uppercase tracking-widest opacity-50 ml-1">Current Address</p>
                 <div className="p-6 bg-surface rounded-2xl border border-hairline flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-stone shrink-0 mt-1" />
                    <p className="text-sm font-bold text-ink leading-relaxed">{student.address || 'No residential address on file. Please update the profile to maintain accurate records.'}</p>
                 </div>
            </div>

            <div className="p-4 sm:p-8 bg-brand-green/5 border border-brand-green/20 rounded-[2rem] space-y-5">
               <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-brand-green fill-brand-green animate-pulse" />
                  <h4 className="text-[11px] font-black text-ink uppercase tracking-widest">Academic Status</h4>
               </div>
               <p className="text-xs text-steel font-medium leading-relaxed">This student is currently in good standing. All academic records and attendance markers are up to date for the current session.</p>
            </div>
          </div>

          <div className="space-y-8 md:col-span-2 mt-4 print:mt-8">
            <h3 className="text-sm font-black text-ink uppercase tracking-[0.2em] flex items-center border-b border-hairline pb-3">
              <BarChart2 className="w-4 h-4 mr-3 text-brand-blue" />
              PERFORMANCE ANALYTICS
            </h3>
            {student.examResults && student.examResults.length > 0 ? (
              <div className="bg-canvas border border-hairline rounded-lg overflow-x-auto">
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
                    {student.examResults.map((result: any) => {
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
              <div className="p-8 text-center border-2 border-hairline border-dashed rounded-xl bg-surface/30">
                <p className="text-sm text-ink font-bold">No exam records found</p>
                <p className="text-xs text-steel mt-1">This student has not been graded for any offline exams yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFeeDrawer && hasPermission('fees.collect') && (
        <FeeCollectionDrawer 
          studentId={studentId}
          onClose={() => setShowFeeDrawer(false)}
          onSuccess={fetchData}
        />
      )}

      {showEditModal && hasPermission('students.edit') && (
        <StudentModal 
          student={student}
          onClose={() => setShowEditModal(false)}
          onSaved={() => { setShowEditModal(false); fetchData(); }}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest border-b-[3px] transition-all relative ${
        active 
          ? 'border-brand-green text-brand-green-deep' 
          : 'border-transparent text-steel hover:text-ink hover:border-hairline'
      }`}
    >
      {label}
      {active && <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-green animate-scale-x" />}
    </button>
  );
}

function StatsCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`p-4 sm:p-8 rounded-[2rem] border transition-all hover:shadow-premium-subtle ${color}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">{label}</p>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <h3 className="text-[11px] font-black text-ink uppercase tracking-[0.2em] flex items-center border-b border-hairline pb-5">
      <Icon className="w-5 h-5 mr-4 text-brand-green" />
      {title}
    </h3>
  );
}

function DetailItem({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black text-slate uppercase tracking-widest opacity-50 ml-1">{label}</p>
      <div className="flex items-center text-sm font-bold text-ink">
        {Icon && <Icon className="w-4 h-4 mr-3 text-stone opacity-40" />}
        {value}
      </div>
    </div>
  );
}

function TemplateButton({ title, desc, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left p-6 bg-canvas border border-hairline rounded-2xl hover:border-brand-green transition-all group shadow-sm active:scale-[0.98]"
    >
      <p className="text-[10px] font-black text-ink uppercase tracking-widest mb-2 group-hover:text-brand-green-deep transition-colors">{title}</p>
      <p className="text-[11px] text-steel font-medium leading-relaxed italic line-clamp-2 opacity-70">"{desc}"</p>
    </button>
  );
}
