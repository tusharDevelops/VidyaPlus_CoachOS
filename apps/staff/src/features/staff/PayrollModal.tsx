import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Staff } from '../../types/staff';
import { 
  X, CreditCard, Check, Loader2, IndianRupee, 
  ShieldAlert, Info, Calendar, ArrowRight, CheckCircle
} from 'lucide-react';

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff;
  onSuccess: () => void;
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

export default function PayrollModal({ isOpen, onClose, staff, onSuccess }: PayrollModalProps) {
  const [amount, setAmount] = useState(staff.baseSalary.toString());
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'bank'>('bank');
  const [referenceNo, setReferenceNo] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [suggestion, setSuggestion] = useState<SalarySuggestion | null>(null);
  const [fetchingSuggestion, setFetchingSuggestion] = useState(false);

  const fetchSuggestion = async () => {
    setFetchingSuggestion(true);
    try {
      const { data } = await api.get('/staff/payroll/suggestion', {
        params: { staffId: staff.id, month, year }
      });
      setSuggestion(data.data);
      setAmount(data.data.suggestedAmount.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingSuggestion(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuggestion();
    }
  }, [isOpen, month, year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    try {
      await api.post('/staff/payroll', {
        staffId: staff.id,
        amount: parseFloat(amount),
        paymentMode,
        referenceNo: referenceNo || undefined,
        month,
        year,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record salary payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-ink/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-canvas rounded-[2rem] shadow-premium w-full max-w-lg overflow-hidden animate-slide-up border border-hairline flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-8 py-6 border-b border-hairline flex items-center justify-between bg-surface/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-green/10 rounded-2xl">
              <IndianRupee className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">Disburse Salary</h3>
              <p className="text-xs text-slate font-medium">Payout for {staff.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate hover:text-ink hover:bg-surface rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-hide">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone uppercase tracking-widest px-1">Period</label>
              <div className="flex gap-2">
                <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="mint-input w-1/2 h-12 font-bold text-xs">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', { month: 'short' })}</option>
                  ))}
                </select>
                <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
                  className="mint-input w-1/2 h-12 font-bold text-xs">
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone uppercase tracking-widest px-1">Amount (₹)</label>
              <div className="relative">
                 <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
                 <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="mint-input w-full h-12 pl-10 font-bold text-brand-green-deep text-lg" />
              </div>
            </div>
          </div>

          <div className="mint-card bg-surface/30 border border-hairline p-6">
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
                         Paying after <span className="font-bold">₹{suggestion.deductionAmount}</span> deduction for {suggestion.totalDeductionDays} total absent days.
                      </p>
                   </div>
                </div>
             ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-stone uppercase tracking-widest px-1">Method</label>
               <div className="flex gap-1.5 p-1 bg-surface rounded-xl border border-hairline">
                  {(['cash', 'upi', 'bank'] as const).map((mode) => (
                    <button type="button" key={mode} onClick={() => setPaymentMode(mode)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        paymentMode === mode ? 'bg-canvas text-ink shadow-sm border border-hairline' : 'text-slate'
                      }`}>
                      {mode} mode
                    </button>
                  ))}
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-stone uppercase tracking-widest px-1">Ref No.</label>
               <input type="text" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)}
                 className="mint-input w-full h-12 font-mono text-xs" placeholder="Optional" />
            </div>
          </div>
        </form>

        <div className="p-4 sm:p-8 border-t border-hairline bg-surface/30">
          <button onClick={handleSubmit} disabled={loading || !amount}
            className="mint-btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-brand-green/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Confirm Disbursal
          </button>
        </div>
      </div>
    </div>
  );
}
