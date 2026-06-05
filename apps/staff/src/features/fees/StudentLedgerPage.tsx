import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import {
  ArrowLeft, CheckCircle2, Clock, AlertCircle, FileText,
  CreditCard, Loader2, IndianRupee, Printer, X, History, MessageCircle, Trash2
} from 'lucide-react';

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


export default function StudentLedgerPage() {
  const { hasPermission } = useAuthStore();
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalDues: 0, totalPaid: 0, balance: 0 });
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [student, setStudent] = useState<any>(null);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [referenceNo, setReferenceNo] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchLedger = async () => {
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
  };

  useEffect(() => {
    if (studentId) fetchLedger();
  }, [studentId]);

  const handlePay = (record: FeeRecord) => {
    setSelectedRecord(record);
    setPaymentAmount(record.balance.toString());
    setPaymentMode('cash');
    setReferenceNo('');
    setShowPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!selectedRecord) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedRecord.balance) {
      alert('Invalid amount');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post('/fees/payments', {
        feeRecordId: selectedRecord.id,
        amount,
        paymentMode,
        referenceNo: referenceNo || undefined,
      });
      setShowPaymentModal(false);
      fetchLedger();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading && !student) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header - Atmospheric Revenue Context */}
      <div className="hero-backdrop rounded-lg border border-hairline p-4 sm:p-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-2.5 text-ink hover:bg-canvas rounded-full transition-all border border-hairline bg-canvas/50 shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-ink tracking-tight uppercase tracking-widest">{student?.name}'s Fee History</h1>
            <p className="text-[10px] font-black text-slate uppercase tracking-widest mt-1 font-mono">
              {student?.phone} • {student?.studentProfile?.studentCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="mint-btn-secondary h-10 px-4 text-[10px] uppercase tracking-widest">
            <Printer className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="mint-card p-6 flex items-center gap-4 bg-canvas border-hairline">
          <div className="p-3 rounded-md bg-surface text-brand-tag border border-hairline"><FileText className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-slate uppercase tracking-widest mb-1">Total Fees</p>
            <h3 className="text-2xl font-black text-ink font-mono tracking-tighter">₹{summary.totalDues.toLocaleString()}</h3>
          </div>
        </div>
        <div className="mint-card p-6 flex items-center gap-4 bg-canvas border-hairline">
          <div className="p-3 rounded-md bg-brand-green-soft text-brand-green-deep border border-brand-green/20"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-slate uppercase tracking-widest mb-1">Total Paid</p>
            <h3 className="text-2xl font-black text-brand-green-deep font-mono tracking-tighter">₹{summary.totalPaid.toLocaleString()}</h3>
          </div>
        </div>
        <div className="mint-card p-6 flex items-center gap-4 bg-canvas border-brand-error/20">
          <div className="p-3 rounded-md bg-brand-error/10 text-brand-error border border-brand-error/20"><AlertCircle className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-brand-error uppercase tracking-widest mb-1">Total Pending</p>
            <h3 className="text-2xl font-black text-brand-error font-mono tracking-tighter">₹{summary.balance.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* High-Density Ledger Table */}
      <div className="mint-card overflow-hidden bg-canvas">
        <div className="px-6 py-4 border-b border-hairline bg-surface/30">
          <h3 className="text-[11px] font-black text-ink uppercase tracking-widest">Transaction List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-hairline text-[9px] uppercase tracking-widest text-slate font-black">
                <th className="px-6 py-4">Fee Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {records.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate text-xs">No transaction history available.</td></tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-ink">{record.planName}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="mint-badge !rounded-md px-1.5 py-0.5 text-[9px] bg-surface text-steel">
                            {record.periodLabel}
                          </span>
                          <span className="text-[9px] text-slate font-mono uppercase">Due: {new Date(record.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top pt-5">
                      <span className={`mint-badge !rounded-md px-1.5 py-0.5 text-[9px] ${
                        record.status === 'paid' ? 'bg-brand-green-soft text-brand-green-deep border-brand-green/20' :
                        'bg-brand-error/10 text-brand-error border-brand-error/20'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top pt-5 text-sm font-black text-ink font-mono tracking-tighter">₹{record.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 align-top pt-5 text-sm font-black text-brand-error font-mono tracking-tighter text-right">₹{record.balance.toLocaleString()}</td>
                    <td className="px-6 py-4 align-top pt-4 text-right flex flex-col items-end gap-2">
                      {record.balance > 0 && hasPermission('fees.collect') && (
                        <button onClick={() => handlePay(record)}
                          className="mint-btn-primary px-4 py-2 text-[9px] uppercase tracking-widest ml-auto">
                          <IndianRupee className="w-3 h-3" /> Collect
                        </button>
                      )}
                      
                      {/* Detailed Payout History with Void Action */}
                      {record.payments.length > 0 && (
                        <div className="mt-2 space-y-1.5 w-full">
                          {record.payments.map(p => (
                            <div key={p.id} className="flex items-center justify-end gap-3 text-[9px] text-brand-green-deep bg-brand-green-soft px-2 py-1.5 rounded-md border border-brand-green/10 ml-auto w-fit">
                              <span className="font-black font-mono">+₹{p.amount.toLocaleString()}</span>
                              <span className="opacity-60 font-mono">{p.date}</span>
                              <button onClick={() => navigate(`/fees/receipt/${p.receiptNumber}`)}
                                className="text-ink hover:underline font-black uppercase tracking-tighter border-l border-brand-green/20 pl-2">
                                #{p.receiptNumber}
                              </button>
                              
                              {hasPermission('fees.delete') && (
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Void receipt #${p.receiptNumber}? This action is permanent.`)) {
                                      try {
                                        await api.delete(`/fees/payments/${p.id}`);
                                        fetchLedger();
                                      } catch (err: any) {
                                        alert(err.response?.data?.error || 'Void failed');
                                      }
                                    }
                                  }}
                                  className="text-brand-error hover:bg-brand-error/10 p-1 rounded transition-colors border-l border-brand-green/20 pl-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedRecord && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowPaymentModal(false)}>
          <div className="w-full max-w-md bg-canvas rounded-lg shadow-premium p-5 sm:p-10 animate-slide-up border border-hairline" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black text-ink tracking-tight uppercase tracking-widest">Add Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 text-steel hover:text-ink hover:bg-surface rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="mint-card p-4 bg-surface/30 border-hairline">
                <p className="text-[9px] font-black text-slate uppercase tracking-widest mb-1">Selected Fee</p>
                <p className="text-sm font-black text-ink">{selectedRecord.planName} ({selectedRecord.periodLabel})</p>
                <div className="flex justify-between mt-3 pt-3 border-t border-hairline">
                  <span className="text-[9px] font-black text-slate uppercase tracking-widest">Pending Amount:</span>
                  <span className="text-[11px] font-black text-brand-error font-mono">₹{selectedRecord.balance.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-steel uppercase tracking-widest ml-1">Payment Amount (₹)</label>
                <input type="number" min="1" max={selectedRecord.balance} step="0.01"
                  value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                  className="mint-input w-full h-12 font-mono text-lg" />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-steel uppercase tracking-widest ml-1">Payment Mode</label>
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                  className="mint-input w-full h-12 uppercase font-black tracking-widest">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {paymentMode !== 'cash' && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-steel uppercase tracking-widest ml-1">Transaction Ref.</label>
                  <input type="text" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)}
                    className="mint-input w-full h-12 font-mono" placeholder="TXN982..." />
                </div>
              )}

              <div className="pt-6">
                <button onClick={submitPayment} disabled={processing}
                  className="mint-btn-brand w-full h-14 text-xs tracking-[0.2em] uppercase shadow-lg shadow-brand-green/10">
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Save Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
