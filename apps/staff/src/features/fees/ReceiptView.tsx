import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { ArrowLeft, Printer, Loader2, Download, CheckCircle2 } from 'lucide-react';

export default function ReceiptView() {
  const { receiptNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const { data } = await api.get(`/fees/receipt/${receiptNumber}`);
        setReceipt(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (receiptNumber) fetchReceipt();
  }, [receiptNumber]);

  if (loading && !receipt) {
    return (
      <div className="flex items-center justify-center h-screen bg-canvas">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-20 text-center bg-canvas h-screen">
        <h2 className="text-xl font-black text-ink uppercase tracking-widest">Receipt Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-8 text-brand-green font-black text-xs uppercase tracking-widest hover:underline">
          Return to Ledger
        </button>
      </div>
    );
  }

  const inst = receipt.institute;
  const pay = receipt.payment;
  const stu = pay.feeRecord.student;
  const plan = pay.feeRecord.feePlan;

  return (
    <div className="max-w-2xl mx-auto bg-surface/30 min-h-screen py-12 px-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button onClick={() => navigate(-1)} className="p-2.5 text-ink hover:bg-canvas rounded-full transition-all border border-hairline bg-canvas/50 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-4">
          <button onClick={() => window.print()}
            className="mint-btn-secondary px-6 py-2.5 text-[10px] uppercase tracking-widest bg-canvas">
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          <button className="mint-btn-primary px-6 py-2.5 text-[10px] uppercase tracking-widest">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Printable Receipt Area */}
      <div className="mint-card p-0 overflow-hidden bg-canvas shadow-premium print:shadow-none print:border-hairline">
        {/* Atmospheric Header for Context */}
        <div className="hero-backdrop-revenue p-5 sm:p-10 text-center border-b border-hairline">
          <h1 className="text-2xl font-black text-ink uppercase tracking-[0.2em]">{inst.name}</h1>
          <p className="text-[10px] font-black text-slate uppercase tracking-widest mt-2">{inst.address}</p>
          <p className="text-[10px] font-black text-brand-green-deep uppercase tracking-widest mt-1 font-mono">{inst.phone} • {inst.email}</p>
        </div>

        <div className="p-12">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-lg font-black text-ink uppercase tracking-widest">Transaction Certificate</h2>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] font-black text-slate uppercase tracking-widest">Receipt Index:</span>
                <span className="text-xs font-black text-ink font-mono">#{receipt.receiptNumber}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate uppercase tracking-widest block mb-1">Issue Date</span>
              <span className="text-xs font-black text-ink font-mono uppercase">{new Date(pay.paidAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-12 p-4 sm:p-8 bg-surface/30 rounded-lg border border-hairline">
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-slate uppercase tracking-widest mb-1">Beneficiary</p>
                <p className="text-sm font-black text-ink uppercase tracking-tight">{stu.user.name}</p>
                <p className="text-[10px] font-black text-slate font-mono">{stu.user.phone}</p>
              </div>
            </div>
            <div className="text-right space-y-4">
              <div>
                <p className="text-[9px] font-black text-slate uppercase tracking-widest mb-1">Fee Reference</p>
                <p className="text-sm font-black text-ink uppercase tracking-tight">{plan.name}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-12 border-collapse">
            <thead>
              <tr className="border-b border-hairline text-left text-[9px] text-slate font-black uppercase tracking-widest">
                <th className="py-4">Description</th>
                <th className="py-4 text-right">Settlement Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              <tr>
                <td className="py-6">
                  <p className="text-xs font-black text-ink uppercase tracking-tight">Standard Payout - {plan.name}</p>
                  <p className="text-[9px] text-slate uppercase tracking-widest mt-1 font-mono">Channel: {pay.paymentMode}</p>
                </td>
                <td className="py-6 text-right font-black text-ink font-mono text-sm">
                  ₹{Number(pay.amount).toLocaleString()}
                </td>
              </tr>
            </tbody>
            <tfoot className="border-t-2 border-ink">
              <tr>
                <td className="py-6 text-right text-[10px] font-black text-ink uppercase tracking-widest">Net Collection Total</td>
                <td className="py-6 text-right font-black text-brand-green-deep font-mono text-2xl tracking-tighter">
                  ₹{Number(pay.amount).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="flex items-center gap-2 mb-12">
            <CheckCircle2 className="w-4 h-4 text-brand-green" />
            <p className="text-[9px] font-black text-brand-green-deep uppercase tracking-[0.2em]">Transaction Confirmed & Verified</p>
          </div>

          <div className="flex justify-between items-end pt-12 border-t border-hairline border-dashed">
            <div className="text-center text-[10px] text-steel px-4 pb-4">
              This is a digital certificate of payment processed through MANEZA Finance. Secure transmission ID: {receipt.id}
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-hairline mb-3"></div>
              <p className="text-[10px] font-black text-ink uppercase tracking-widest">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .max-w-2xl {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .bg-surface\\/30 {
            background-color: white !important;
          }
          .bg-canvas {
            background-color: white !important;
          }
          .mint-card {
            visibility: visible;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
          }
          .mint-card * {
            visibility: visible;
          }
          .hero-backdrop-revenue {
            background: linear-gradient(to bottom, #f0f9ff, #ffffff) !important;
          }
        }
      `}</style>
    </div>
  );
}
