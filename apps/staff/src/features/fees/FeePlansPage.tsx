import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import {
  Plus, X, IndianRupee, Users, Calendar, AlertTriangle,
  CheckCircle2, Loader2, Pencil,
} from 'lucide-react';

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: 'Monthly', quarterly: 'Quarterly', course: 'One-time', installment: 'Installment',
};

interface FeePlan {
  id: string; name: string; amount: string; frequency: string; dueDay: number | null;
  description: string | null; status: string; activeStudents: number; createdAt: string;
}

export default function FeePlansPage() {
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/fee-plans');
      setFeePlans(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between border-b border-hairline pb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Fee Setup</h1>
          <p className="text-sm text-slate mt-1">Create and manage how you charge for your courses.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="mint-btn-primary px-6 py-2.5 text-xs uppercase tracking-widest">
          <Plus className="w-4 h-4" /> New Fee Plan
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mint-card h-48 animate-pulse bg-surface/50" />
          ))}
        </div>
      ) : feePlans.length === 0 ? (
        <div className="mint-card p-20 text-center border-dashed">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <IndianRupee className="w-8 h-8 text-stone" />
          </div>
          <h3 className="text-base font-bold text-ink uppercase tracking-widest">No Fee Plans Yet</h3>
          <p className="text-xs text-slate mt-2 max-w-xs mx-auto">Add a fee plan to start collecting payments from students.</p>
          <button onClick={() => setShowModal(true)} className="mt-8 text-brand-green font-bold text-xs uppercase tracking-widest hover:underline">
            + Create your first plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feePlans.map(fp => (
            <div key={fp.id} className="mint-card p-6 group hover:border-brand-green transition-all bg-canvas">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-base font-bold text-ink tracking-tight">{fp.name}</h3>
                <span className="mint-badge !rounded-md px-1.5 py-0.5 text-[9px] bg-brand-green-soft text-brand-green-deep border-brand-green/20">
                  {FREQUENCY_LABELS[fp.frequency] || fp.frequency}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-ink font-mono tracking-tighter">
                  ₹{Number(fp.amount).toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-steel uppercase tracking-widest mt-1">Per {fp.frequency} Cycle</p>
              </div>

              {fp.description && <p className="text-xs text-slate mb-6 line-clamp-2">{fp.description}</p>}

              <div className="flex items-center gap-6 pt-5 border-t border-hairline">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-brand-tag" />
                  <span className="text-[10px] font-bold text-ink font-mono">{fp.activeStudents} Students</span>
                </div>
                {fp.dueDay && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-brand-tag" />
                    <span className="text-[10px] font-bold text-ink uppercase tracking-widest">Day {fp.dueDay} Due</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <CreateFeePlanModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); fetchPlans(); }} />}
    </div>
  );
}

function CreateFeePlanModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', amount: '', frequency: 'monthly', dueDay: '5', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/fee-plans', {
        name: form.name,
        amount: parseFloat(form.amount),
        frequency: form.frequency,
        dueDay: form.frequency === 'monthly' || form.frequency === 'quarterly' ? parseInt(form.dueDay) : undefined,
        description: form.description || undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create fee plan');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md bg-canvas rounded-2xl shadow-premium p-5 sm:p-10 animate-slide-up border border-hairline" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-ink tracking-tight uppercase tracking-widest">New Fee Plan</h2>
          <button onClick={onClose} className="p-2 text-steel hover:text-ink hover:bg-surface rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-brand-error/10 border border-brand-error/20 rounded-xl text-brand-error text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-steel uppercase tracking-widest ml-1">Plan Name</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Maths Class Monthly"
              className="mint-input w-full h-12" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-steel uppercase tracking-widest ml-1">Fee Amount (₹)</label>
              <input name="amount" type="number" value={form.amount} onChange={handleChange} required placeholder="0.00" min="0" step="0.01"
                className="mint-input w-full h-12 font-mono" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-steel uppercase tracking-widest ml-1">Frequency</label>
              <select name="frequency" value={form.frequency} onChange={handleChange}
                className="mint-input w-full h-12 uppercase tracking-widest font-bold">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="course">One-time</option>
                <option value="installment">Installment</option>
              </select>
            </div>
          </div>

          {(form.frequency === 'monthly' || form.frequency === 'quarterly') && (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-steel uppercase tracking-widest ml-1">Due Date (Day of Month)</label>
              <input name="dueDay" type="number" value={form.dueDay} onChange={handleChange} min="1" max="31"
                className="mint-input w-full h-12 font-mono" />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-steel uppercase tracking-widest ml-1">Notes (Optional)</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Add any notes about this plan..."
              className="mint-input w-full h-24 py-3 resize-none" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading}
              className="mint-btn-primary w-full h-14 text-xs tracking-[0.2em] uppercase">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Save Fee Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
