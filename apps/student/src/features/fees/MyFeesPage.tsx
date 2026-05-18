import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  CreditCard, IndianRupee, ArrowLeft, Loader2, Calendar, CheckCircle2,
  AlertTriangle, Receipt, Clock, Sparkles, Printer, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyFeesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const fetchLedger = async () => {
    try {
      const res = await api.get('/fees/my-ledger');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch fees ledger', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleOpenReceipt = async (receiptNumber: string) => {
    setReceiptLoading(true);
    try {
      const res = await api.get(`/fees/receipt/${receiptNumber}`);
      setActiveReceipt(res.data.data);
    } catch (err) {
      console.error('Failed to load receipt details', err);
    } finally {
      setReceiptLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[11px] font-bold text-steel uppercase tracking-widest">Loading fees ledger...</p>
      </div>
    );
  }

  const summary = data?.summary || { totalDues: 0, totalPaid: 0, balance: 0 };
  const records = data?.records || [];

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 border border-hairline bg-surface rounded-full flex items-center justify-center hover:bg-surface-hover text-steel hover:text-ink active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">Fee Ledger</h1>
          <p className="text-xs text-steel font-medium">Track dues, payouts, and official receipts.</p>
        </div>
      </div>

      {/* KPI Balance Card */}
      <div className="mint-card p-6 bg-gradient-to-br from-surface-hover to-surface relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-5">
          <CreditCard className="w-24 h-24 text-ink" />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-steel uppercase tracking-widest">Remaining Balance</p>
          <h2 className={`text-3xl font-black font-mono ${summary.balance > 0 ? 'text-brand-error' : 'text-brand-green-deep'}`}>
            ₹{summary.balance.toLocaleString('en-IN')}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-hairline">
          <div>
            <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Total Billed</p>
            <p className="text-base font-bold text-ink font-mono mt-0.5">₹{summary.totalDues.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Total Paid</p>
            <p className="text-base font-bold text-brand-green-deep font-mono mt-0.5">₹{summary.totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Dues breakdown list */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider px-1">Fee Structure & Dues</h3>

        <div className="space-y-4">
          {records.length > 0 ? (
            records.map((rec: any, idx: number) => {
              const formattedDueDate = new Date(rec.dueDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div key={rec.id} className="mint-card p-4 space-y-4 transition-all">
                  {/* Title & Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-ink">{rec.planName}</h4>
                      <p className="text-[11px] text-steel mt-0.5 uppercase tracking-wider font-bold">
                        {rec.periodLabel} • {rec.frequency}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        rec.status === 'paid'
                          ? 'bg-brand-green-soft text-brand-green-deep border-brand-green/20'
                          : rec.status === 'partial'
                          ? 'bg-amber-50 text-brand-warn border-amber-200'
                          : 'bg-rose-50 text-brand-error border-rose-200'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-lg bg-surface border border-hairline font-mono text-center">
                    <div>
                      <p className="text-[9px] font-bold text-stone uppercase tracking-widest">Total Due</p>
                      <p className="text-xs font-bold text-ink mt-0.5">₹{rec.amount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-stone uppercase tracking-widest">Paid</p>
                      <p className="text-xs font-bold text-brand-green-deep mt-0.5">₹{rec.paid}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-stone uppercase tracking-widest">Balance</p>
                      <p className={`text-xs font-bold mt-0.5 ${rec.balance > 0 ? 'text-brand-error' : 'text-brand-green-deep'}`}>
                        ₹{rec.balance}
                      </p>
                    </div>
                  </div>

                  {/* Due Date & Payout History */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-steel flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-stone" />
                      Due on {formattedDueDate}
                    </span>

                    {rec.status !== 'paid' && rec.balance > 0 && (
                      <span className="text-[10px] font-semibold text-brand-error flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                      </span>
                    )}
                  </div>

                  {/* Payment Receipt Link list */}
                  {rec.payments?.length > 0 && (
                    <div className="mt-2 pt-3 border-t border-hairline space-y-2">
                      <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Receipts Issued</p>
                      <div className="space-y-1.5">
                        {rec.payments.map((pay: any) => (
                          <div key={pay.id} className="flex items-center justify-between p-2 bg-surface/50 border border-hairline rounded text-xs">
                            <div className="flex items-center gap-2">
                              <Receipt className="w-3.5 h-3.5 text-steel" />
                              <span className="font-bold text-ink">{pay.receiptNumber || 'RECEIPT_PENDING'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-steel font-mono uppercase tracking-wider">{pay.mode}</span>
                              {pay.receiptNumber && (
                                <button
                                  onClick={() => handleOpenReceipt(pay.receiptNumber)}
                                  className="text-[10px] font-bold text-brand-green-deep hover:underline flex items-center gap-0.5"
                                >
                                  View
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="mint-card p-12 text-center text-steel text-sm italic">
              No bills or ledger history synced in your account.
            </div>
          )}
        </div>
      </div>

      {/* printable Receipt Modal Drawer overlay */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-canvas border border-hairline w-full max-w-md rounded-xl p-6 shadow-premium relative space-y-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-surface border border-hairline flex items-center justify-center text-steel hover:bg-surface-hover hover:text-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Print Header */}
            <div className="text-center pb-4 border-b border-hairline space-y-1">
              <h2 className="text-lg font-black text-ink">{activeReceipt.institute?.name}</h2>
              <p className="text-xs text-steel max-w-[280px] mx-auto leading-tight">{activeReceipt.institute?.address}</p>
              <p className="text-[11px] text-steel font-semibold">Ph: {activeReceipt.institute?.phone} • Email: {activeReceipt.institute?.email}</p>
            </div>

            {/* Receipt Summary */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-green-soft text-brand-green-deep font-bold text-[10px] uppercase tracking-widest border border-brand-green/20">
                <Sparkles className="w-3.5 h-3.5" /> Official Fee Receipt
              </div>
              <h3 className="text-2xl font-black text-ink font-mono mt-2">
                ₹{Number(activeReceipt.payment?.amount).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs font-bold text-steel font-mono uppercase tracking-wider mt-1">
                No: {activeReceipt.receiptNumber}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-3 pt-3">
              <div className="flex justify-between text-xs border-b border-hairline-soft pb-2">
                <span className="text-steel font-medium">Student Name:</span>
                <span className="font-bold text-ink">{activeReceipt.payment?.feeRecord?.student?.user?.name}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-hairline-soft pb-2">
                <span className="text-steel font-medium">Fee Head:</span>
                <span className="font-bold text-ink">{activeReceipt.payment?.feeRecord?.feePlan?.name}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-hairline-soft pb-2">
                <span className="text-steel font-medium">Period:</span>
                <span className="font-bold text-ink">{activeReceipt.payment?.feeRecord?.periodLabel}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-hairline-soft pb-2">
                <span className="text-steel font-medium">Paid On:</span>
                <span className="font-bold text-ink">
                  {new Date(activeReceipt.payment?.paidAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-xs border-b border-hairline-soft pb-2">
                <span className="text-steel font-medium">Payment Mode:</span>
                <span className="font-bold text-ink uppercase font-mono">{activeReceipt.payment?.paymentMode}</span>
              </div>
              {activeReceipt.payment?.referenceNo && (
                <div className="flex justify-between text-xs border-b border-hairline-soft pb-2">
                  <span className="text-steel font-medium">Reference Code:</span>
                  <span className="font-bold text-ink font-mono">{activeReceipt.payment?.referenceNo}</span>
                </div>
              )}
            </div>

            {/* Print button / Cashier sign */}
            <div className="pt-6 flex flex-col gap-3">
              <div className="flex justify-between items-end text-xs italic text-stone">
                <div>* System generated electronic receipt.</div>
                <div className="text-right border-t border-dotted border-stone pt-2 px-4">Authorized Signature</div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full mint-btn-primary flex items-center justify-center gap-2 mt-4"
              >
                <Printer className="w-4 h-4" /> Print / Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {receiptLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-[2px] animate-fade-in">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        </div>
      )}
    </div>
  );
}
