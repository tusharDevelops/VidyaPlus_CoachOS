import { useState, useEffect } from 'react';
import { 
  IndianRupee, TrendingUp, Calendar, 
  ArrowUpRight, Download, Loader2,
  FileText, CheckCircle2, AlertCircle
} from 'lucide-react';
import api from '../../lib/api';

export default function MySalaryPage() {
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState<any[]>([]);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await api.get('/staff/payroll');
        setPayroll(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch payroll history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[10px] font-bold text-steel uppercase tracking-widest mt-4">Generating Financial Statement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-ink tracking-tight">Earnings & Salary</h1>
        <p className="text-sm text-steel">View your payout history, bonuses, and tax deductions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="mint-card p-4 sm:p-8 bg-ink text-canvas relative overflow-hidden h-full">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-canvas/10 backdrop-blur-md flex items-center justify-center mb-6">
                <IndianRupee className="w-6 h-6 text-brand-green" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">Total Earnings (YTD)</p>
              <h2 className="text-4xl font-black mb-8 tracking-tight">
                <span className="text-brand-green">₹</span> 
                {payroll.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-canvas/5 rounded-2xl border border-canvas/10">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Last Payout</span>
                  <span className="text-sm font-bold">₹ {payroll[0]?.amount?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-canvas/5 rounded-2xl border border-canvas/10">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
                  <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${payroll.length > 0 ? 'text-brand-green' : 'text-steel'}`}>
                    {payroll.length > 0 ? (
                      <><CheckCircle2 className="w-3 h-3" /> {payroll[0]?.status || 'Paid'}</>
                    ) : (
                      'No records'
                    )}
                  </span>
                </div>
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-green/10 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Recent History */}
        <div className="lg:col-span-2">
          <div className="mint-card h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-hairline flex items-center justify-between bg-surface/30">
              <h3 className="text-sm font-black text-ink uppercase tracking-widest">Payment History</h3>
              <button className="text-[10px] font-black text-brand-green-deep uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                Download All <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {payroll.length === 0 ? (
                <div className="p-20 text-center">
                  <AlertCircle className="w-12 h-12 text-steel mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-bold text-ink uppercase tracking-widest opacity-40">No payment records</p>
                </div>
              ) : (
                <div className="divide-y divide-hairline">
                  {payroll.map((record) => (
                    <div key={record.id} className="p-6 flex items-center justify-between hover:bg-surface/50 transition-colors group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-surface border border-hairline flex items-center justify-center group-hover:bg-canvas transition-colors">
                          <FileText className="w-5 h-5 text-steel opacity-40" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink">Salary Payout — {record.month} {record.year}</p>
                          <p className="text-[9px] font-black text-steel uppercase tracking-widest mt-1 opacity-60">
                            {new Date(record.paymentDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-ink">₹ {record.amount.toLocaleString()}</p>
                        <p className="text-[9px] font-black text-brand-green uppercase tracking-widest mt-1">Paid via {record.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
