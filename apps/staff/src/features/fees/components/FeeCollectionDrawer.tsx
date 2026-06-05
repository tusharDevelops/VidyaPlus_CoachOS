import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import {
  X, CheckCircle2, Clock, AlertCircle, FileText,
  CreditCard, Loader2, IndianRupee, Printer, ArrowRight,
  Search, Wallet, TrendingUp, MessageCircle, ArrowDownCircle,
  ArrowUpCircle, ChevronRight, History, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeeRecord {
  id: string;
  planName: string;
  frequency: string;
  periodLabel: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
  payments: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  mode: string;
  receiptNumber: string;
}

interface FeeCollectionDrawerProps {
  studentId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function FeeCollectionDrawer({ studentId, onClose, onSuccess }: FeeCollectionDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalDues: 0, totalPaid: 0, balance: 0 });
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [student, setStudent] = useState<any>(null);
  const navigate = useNavigate();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [referenceNo, setReferenceNo] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchLedger = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const stuRes = await api.get(`/students/${studentId}`);
      setStudent(stuRes.data.data);

      const res = await api.get(`/fees/student/${studentId}/ledger`);
      setSummary(res.data.data.summary);
      setRecords(res.data.data.records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchLedger();
      setShowPaymentForm(false);
    }
  }, [studentId, fetchLedger]);

  const handlePayClick = (record: FeeRecord) => {
    setSelectedRecord(record);
    setPaymentAmount(record.balance.toString());
    setPaymentMode('cash');
    setReferenceNo('');
    setShowPaymentForm(true);
  };

  const submitPayment = async () => {
    if (!selectedRecord) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedRecord.balance) {
      alert('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      await api.post('/fees/payments', {
        feeRecordId: selectedRecord.id,
        amount,
        paymentMode,
        referenceNo: referenceNo || undefined,
      });
      setShowPaymentForm(false);
      fetchLedger();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add payment');
    } finally {
      setProcessing(false);
    }
  };

  const generateDue = async () => {
    setProcessing(true);
    try {
      await api.post(`/fees/student/${studentId}/generate-due`);
      fetchLedger();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate due');
    } finally {
      setProcessing(false);
    }
  };

  if (!studentId) return null;

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-ink/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-[160] w-full max-w-xl bg-canvas shadow-premium flex flex-col animate-slide-in-right overflow-hidden rounded-l-2xl border-l border-hairline">
        
        {/* Simple Header */}
        <div className="px-4 sm:px-8 py-10 border-b border-hairline bg-surface/50 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-ink tracking-tight">Student Fee Status</h2>
              {student && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-green text-primary flex items-center justify-center font-bold text-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">{student.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate">{student.studentProfile?.studentCode}</p>
                  </div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-ink hover:bg-surface rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="mint-card p-4 bg-canvas shadow-sm">
               <p className="text-[10px] font-bold text-steel uppercase tracking-widest mb-1">Total Received</p>
               <h3 className="text-xl font-bold text-brand-green-deep font-mono">₹{summary.totalPaid.toLocaleString()}</h3>
            </div>
            <div className="mint-card p-4 bg-canvas shadow-sm border-brand-error/20">
               <p className="text-[10px] font-bold text-steel uppercase tracking-widest mb-1">Still Due</p>
               <h3 className="text-xl font-bold text-brand-error font-mono">₹{summary.balance.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Next Payment Info Banner */}
        {!loading && student && (
          <div className="px-4 sm:px-8 py-3 bg-brand-green/5 border-b border-brand-green/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-green-deep" />
              <span className="text-[10px] font-bold text-brand-green-deep uppercase tracking-widest">Next Billing Cycle</span>
            </div>
            <span className="text-[10px] font-black text-ink font-mono">
              {records.length > 0 
                ? new Date(new Date(records[0].dueDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
                : student.profile?.enrolledAt
                  ? new Date(new Date(student.profile.enrolledAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'TBD'
              }
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {loading && !student ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
              <p className="text-[11px] font-bold text-steel uppercase tracking-widest mt-6">Loading details...</p>
            </div>
          ) : (
            <div className="space-y-6">
                {records.length === 0 ? (
                  <div className="text-center py-12 bg-surface/30 rounded-2xl border border-hairline border-dashed">
                     <FileText className="w-10 h-10 text-stone mx-auto mb-3 opacity-20" />
                     <p className="text-xs font-bold text-slate uppercase tracking-widest">No fee records found</p>
                     <p className="text-[10px] text-steel font-medium mt-2 max-w-[200px] mx-auto">Fees must be generated before they can be collected.</p>
                     
                     {student?.enrollments?.some((e: any) => e.feePlan) && (
                        <button 
                          onClick={generateDue}
                          disabled={processing}
                          className="mt-6 mint-btn-primary py-2.5 px-6 text-[10px] uppercase tracking-widest"
                        >
                          {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Plus className="w-3.5 h-3.5 mr-2" />}
                          Generate Current Due
                        </button>
                     )}
                  </div>
                ) : (
                  records.map((record) => (
                    <div key={record.id} className="mint-card p-6 hover:border-brand-green transition-all bg-canvas">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <p className="text-[10px] font-bold text-brand-green uppercase tracking-widest mb-1">Fee Plan</p>
                            <h4 className="text-sm font-bold text-ink">{record.planName}</h4>
                            <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-surface text-steel uppercase tracking-widest">
                               {record.periodLabel}
                            </span>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-bold text-steel uppercase tracking-widest mb-1">Due Date</p>
                            <p className="text-xs font-bold text-ink">{new Date(record.dueDate).toLocaleDateString()}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-hairline my-4">
                         <div>
                            <p className="text-[8px] font-bold text-steel uppercase tracking-widest">Fee</p>
                            <p className="text-xs font-bold text-ink font-mono">₹{record.amount.toLocaleString()}</p>
                         </div>
                         <div className="border-x border-hairline px-3">
                            <p className="text-[8px] font-bold text-steel uppercase tracking-widest">Paid</p>
                            <p className="text-xs font-bold text-brand-green-deep font-mono">₹{record.paid.toLocaleString()}</p>
                         </div>
                         <div className="pl-3">
                            <p className="text-[8px] font-bold text-steel uppercase tracking-widest">Pending</p>
                            <p className="text-xs font-bold text-brand-error font-mono">₹{record.balance.toLocaleString()}</p>
                         </div>
                      </div>

                      {record.payments.length > 0 && (
                         <div className="space-y-2 mt-4">
                            <p className="text-[8px] font-bold text-steel uppercase tracking-widest mb-2">Payment History</p>
                            {record.payments.map(p => (
                               <div key={p.id} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-hairline">
                                  <div className="flex items-center gap-3">
                                     <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                                     <div>
                                        <p className="text-[11px] font-bold text-ink">₹{p.amount.toLocaleString()} on {p.date}</p>
                                        <p className="text-[8px] font-medium text-steel uppercase tracking-widest">{p.mode}</p>
                                     </div>
                                  </div>
                                  <button onClick={() => navigate(`/fees/receipt/${p.receiptNumber}`)}
                                    className="p-1.5 text-steel hover:text-ink hover:bg-canvas rounded-lg transition-all">
                                     <Printer className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                            ))}
                         </div>
                      )}

                      {record.balance > 0 && !showPaymentForm && (
                         <button onClick={() => handlePayClick(record)}
                           className="mint-btn-primary w-full mt-5 text-[10px] uppercase tracking-widest py-2.5">
                            Collect Fee
                         </button>
                      )}
                    </div>
                  ))
               )}
            </div>
          )}
        </div>

        {/* Payment Form Panel */}
        {showPaymentForm && selectedRecord && (
          <div className="absolute inset-x-0 bottom-0 z-[170] bg-canvas border-t border-hairline shadow-premium p-4 sm:p-8 animate-slide-up rounded-t-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-ink uppercase tracking-widest">Add Payment</h3>
              <button onClick={() => setShowPaymentForm(false)} className="p-2 text-steel hover:text-ink hover:bg-surface rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-steel uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input type="number" min="1" max={selectedRecord.balance}
                    value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                    className="mint-input w-full h-11 text-base font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-steel uppercase tracking-widest ml-1">How paid?</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                    className="mint-input w-full h-11 uppercase font-bold tracking-widest text-[10px]">
                    <option value="cash">Cash</option>
                    <option value="upi">UPI / GPay</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {paymentMode !== 'cash' && (
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-steel uppercase tracking-widest ml-1">Transaction/Ref No.</label>
                  <input type="text" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)}
                    className="mint-input w-full h-11 font-mono text-xs" placeholder="Optional..." />
                </div>
              )}

              <button onClick={submitPayment} disabled={processing}
                className="mint-btn-primary w-full h-12 text-[10px] tracking-widest uppercase">
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Finish Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
