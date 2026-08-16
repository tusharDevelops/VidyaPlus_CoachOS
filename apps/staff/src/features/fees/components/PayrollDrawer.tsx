import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import {
  X, CheckCircle2, Clock, AlertCircle, FileText,
  IndianRupee, Loader2, Calendar, ShieldAlert,
  ArrowRight, Info, CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';

interface SalaryRecord {
  id: string;
  month: string;
  year: number;
  amount: number;
  paymentMode: string;
  referenceNo?: string;
  paymentDate: string;
}

interface PayrollDrawerProps {
  staffId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SalarySuggestion {
  baseSalary: number;
  totalDaysInMonth: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  totalDeductionDays: number;
  deductionAmount: number;
  suggestedAmount: number;
}

export default function PayrollDrawer({ staffId, onClose, onSuccess }: PayrollDrawerProps) {
  const { hasPermission } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [staff, setStaff] = useState<any>(null);
  const [summary, setSummary] = useState({ totalPaid: 0 });

  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMode, setPayoutMode] = useState('bank');
  const [payoutMonth, setPayoutMonth] = useState(new Date().getMonth() + 1);
  const [payoutYear, setPayoutYear] = useState(new Date().getFullYear());
  const [referenceNo, setReferenceNo] = useState('');
  const [processing, setProcessing] = useState(false);

  const [suggestion, setSuggestion] = useState<SalarySuggestion | null>(null);
  const [fetchingSuggestion, setFetchingSuggestion] = useState(false);

  const isCurrentMonthPaid = records.some(r => {
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const currentMonthLong = new Date().toLocaleString('default', { month: 'long' });
    return (r.month === currentMonth || r.month === currentMonthLong) && r.year === new Date().getFullYear();
  });

  const fetchSalaryLedger = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      const [staffRes, payrollRes] = await Promise.all([
        api.get(`/staff`),
        api.get(`/staff/payroll`, { params: { staffId } })
      ]);
      
      const staffMember = staffRes.data.data.find((s: any) => s.id === staffId);
      setStaff(staffMember);
      
      const payrollData = payrollRes.data.data;
      setRecords(payrollData.history || []);
      setSummary({ totalPaid: payrollData.totalPaid || 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  const fetchSuggestion = async () => {
    if (!staffId) return;
    setFetchingSuggestion(true);
    try {
      const { data } = await api.get('/staff/payroll/suggestion', {
        params: { staffId, month: payoutMonth, year: payoutYear }
      });
      setSuggestion(data.data);
      setPayoutAmount(data.data.suggestedAmount.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingSuggestion(false);
    }
  };

  useEffect(() => {
    if (staffId) {
      fetchSalaryLedger();
      setShowPayoutForm(false);
    }
  }, [staffId, fetchSalaryLedger]);

  useEffect(() => {
    if (showPayoutForm) {
      fetchSuggestion();
    }
  }, [showPayoutForm, payoutMonth, payoutYear]);

  const submitPayout = async () => {
    if (!staffId) return;
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) return;

    setProcessing(true);
    try {
      await api.post('/staff/payroll', {
        staffId,
        amount,
        paymentMode: payoutMode,
        month: payoutMonth,
        year: payoutYear,
        referenceNo: referenceNo || undefined,
      });
      setShowPayoutForm(false);
      fetchSalaryLedger();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record salary payment');
    } finally {
      setProcessing(false);
    }
  };

  if (!staffId) return null;

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[160] w-full max-w-xl bg-canvas shadow-premium flex flex-col animate-slide-in-right overflow-hidden rounded-l-[2rem] border-l border-hairline">
        
        {/* Header */}
        <div className="bg-surface/30 px-4 sm:px-8 py-10 border-b border-hairline flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink tracking-tight">Staff Salary Ledger</h2>
              {staff && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-2xl bg-brand-green/10 text-brand-green-deep border border-brand-green/20 flex items-center justify-center font-black text-sm">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink leading-none mb-1">{staff.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate">{staff.role}</p>
                  </div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-slate hover:text-ink hover:bg-surface rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="mint-card p-4 bg-canvas border border-hairline">
               <p className="text-[10px] font-black text-stone uppercase tracking-widest mb-1">Standard Pay</p>
               <h3 className="text-xl font-black text-ink font-mono">₹{staff ? Number(staff.baseSalary).toLocaleString() : '0'}</h3>
            </div>
            <div className="mint-card p-4 bg-brand-green-deep text-white border-none shadow-xl shadow-brand-green/20">
               <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Total Paid Overall</p>
               <h3 className="text-xl font-black font-mono">₹{summary.totalPaid.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-hide">
          {loading && !staff ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
              <p className="text-[11px] font-bold text-slate uppercase tracking-widest mt-6 tracking-widest">Accessing Ledger...</p>
            </div>
          ) : (
            <div className="space-y-6">
               {records.length === 0 ? (
                  <div className="text-center py-20 bg-surface/20 rounded-3xl border border-dashed border-hairline">
                     <FileText className="w-10 h-10 text-stone mx-auto mb-4 opacity-20" />
                     <p className="text-[10px] font-black text-slate uppercase tracking-widest">No payout history found</p>
                  </div>
               ) : (
                  records.map((record) => (
                    <div key={record.id} className="mint-card p-6 bg-canvas border border-hairline hover:border-brand-green transition-all">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-hairline">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-surface rounded-xl">
                                 <Calendar className="w-4 h-4 text-brand-green" />
                              </div>
                              <h4 className="text-sm font-bold text-ink font-mono">{record.month}/{record.year}</h4>
                           </div>
                           <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green-deep text-[10px] font-black uppercase tracking-widest">
                              <CheckCircle className="w-3 h-3" /> Fully Paid
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-6">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-stone uppercase tracking-widest">Disbursed Amount</p>
                              <p className="text-lg font-black text-ink font-mono">₹{record.amount.toLocaleString()}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-stone uppercase tracking-widest">Payment Mode</p>
                              <p className="text-xs font-bold text-slate uppercase tracking-widest bg-surface px-2 py-1 rounded-lg w-fit">{record.paymentMode}</p>
                           </div>
                        </div>

                        <div className="p-4 bg-surface/50 rounded-2xl border border-hairline flex items-center justify-between">
                           <div className="flex items-center gap-3 text-xs text-slate">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Recorded on {record.paymentDate}</span>
                           </div>
                           {record.referenceNo && <span className="text-[10px] font-mono text-slate bg-canvas px-2 py-1 rounded-lg border border-hairline">REF: {record.referenceNo}</span>}
                        </div>
                    </div>
                  ))
               )}

               {!showPayoutForm && (
                  <button onClick={() => setShowPayoutForm(true)}
                    disabled={isCurrentMonthPaid || !hasPermission('staff.manage')}
                    className={`w-full py-4 rounded-[1.5rem] flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest ${isCurrentMonthPaid || !hasPermission('staff.manage') ? 'bg-surface text-slate cursor-not-allowed border border-hairline' : 'mint-btn-primary'}`}>
                     <IndianRupee className="w-4 h-4" /> 
                     {!hasPermission('staff.manage') ? 'No Permission to Disburse' : isCurrentMonthPaid ? 'Current Month Already Paid' : 'Disburse New Payout'}
                  </button>
               )}
            </div>
          )}
        </div>

        {/* Payout Form Overlay */}
        {showPayoutForm && (
          <div className="absolute inset-0 z-[170] bg-canvas flex flex-col animate-slide-up">
            <div className="px-4 sm:px-8 py-6 border-b border-hairline flex items-center justify-between flex-shrink-0">
               <h3 className="text-sm font-black text-ink uppercase tracking-widest">Disburse Payout</h3>
               <button onClick={() => setShowPayoutForm(false)} className="p-2 text-slate hover:text-ink hover:bg-surface rounded-xl transition-all">
                 <X className="w-5 h-5" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone uppercase tracking-widest px-1">Period</label>
                  <div className="flex gap-2">
                    <select value={payoutMonth} onChange={(e) => setPayoutMonth(parseInt(e.target.value))}
                      className="mint-input w-1/2 h-12 font-bold text-xs">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', { month: 'short' })}</option>
                      ))}
                    </select>
                    <select value={payoutYear} onChange={(e) => setPayoutYear(parseInt(e.target.value))}
                      className="mint-input w-1/2 h-12 font-bold text-xs">
                      {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone uppercase tracking-widest px-1">Amount to Pay</label>
                  <div className="relative">
                     <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
                     <input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)}
                        className="mint-input w-full h-12 pl-10 font-bold text-brand-green-deep text-lg" />
                  </div>
                </div>
              </div>

              {/* Attendance-Based Suggestion Logic */}
              <div className="mint-card bg-surface/30 border border-hairline p-6 relative overflow-hidden group">
                 {fetchingSuggestion ? (
                    <div className="flex items-center gap-3 py-2">
                       <Loader2 className="w-4 h-4 text-brand-green animate-spin" />
                       <span className="text-[10px] font-bold text-slate uppercase tracking-widest">Analyzing Attendance...</span>
                    </div>
                 ) : suggestion ? (
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-brand-green/10 rounded-xl">
                                <ShieldAlert className="w-4 h-4 text-brand-green" />
                             </div>
                             <h4 className="text-xs font-black text-ink uppercase tracking-widest">Suggested Payout</h4>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-slate uppercase tracking-widest">Automatic Deduction</p>
                             <p className="text-sm font-bold text-brand-error">- ₹{suggestion.deductionAmount}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-3 gap-3">
                          {[
                             { label: 'Absents', value: suggestion.absentDays, color: 'text-brand-error' },
                             { label: 'Half Days', value: suggestion.halfDays, color: 'text-brand-tag' },
                             { label: 'Leaves', value: suggestion.leaveDays, color: 'text-ink' }
                          ].map(stat => (
                             <div key={stat.label} className="p-3 bg-canvas rounded-2xl border border-hairline text-center">
                                <p className="text-[8px] font-black text-stone uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
                             </div>
                          ))}
                       </div>

                       <div className="p-4 bg-brand-green/5 border border-brand-green/10 rounded-2xl flex items-start gap-3">
                          <Info className="w-4 h-4 text-brand-green mt-0.5" />
                          <p className="text-[10px] font-medium text-brand-green-deep leading-relaxed">
                             We suggest paying <span className="font-bold text-xs">₹{suggestion.suggestedAmount.toLocaleString()}</span> after deducting for {suggestion.totalDeductionDays} total absent days.
                          </p>
                       </div>
                    </div>
                 ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-stone uppercase tracking-widest px-1">Payment Method</label>
                   <select value={payoutMode} onChange={(e) => setPayoutMode(e.target.value)}
                     className="mint-input w-full h-12 font-bold uppercase tracking-widest text-[10px]">
                     <option value="bank">Bank Transfer</option>
                     <option value="upi">UPI / GPay</option>
                     <option value="cash">Cash</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-stone uppercase tracking-widest px-1">Reference No</label>
                   <input type="text" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)}
                     className="mint-input w-full h-12 font-mono text-xs" placeholder="Optional" />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8 border-t border-hairline bg-surface/30 flex-shrink-0">
               <button onClick={submitPayout} disabled={processing || !payoutAmount}
                 className="mint-btn-primary w-full py-4 rounded-[1.5rem] flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-brand-green/20">
                 {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                 Disburse Funds Now
               </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
