import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Plus, CreditCard, Users, Shield, HardDrive,
  Pencil, AlertTriangle, X, Loader2, Save, Trash2
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  maxStudents: number;
  maxStaff: number;
  maxStorageMb: number;
  priceMonthly: string | number;
  featuresJson: any;
  status: string;
  _count?: { institutes: number };
}

export default function PlanManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/super-admin/plans');
      setPlans(data.data);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDelete = async (plan: Plan) => {
    if (!window.confirm(`Are you sure you want to delete the "${plan.name}" plan? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/super-admin/plans/${plan.id}`);
      fetchPlans();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete plan';
      alert(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-[-0.5px]">Subscription Plans</h1>
          <p className="text-sm text-steel mt-1">Configure product tiers and platform limits.</p>
        </div>
        <button onClick={() => { setEditingPlan(null); setShowModal(true); }} className="mint-btn-primary">
          <Plus className="w-4 h-4" /> Create New Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const featured = index === 1 || plan.name.toLowerCase().includes('lift');
          return (
            <div key={plan.id} className={`bg-canvas rounded-lg p-4 sm:p-8 border transition-colors ${
              featured ? 'border-2 border-brand-green shadow-[rgba(0,212,164,0.08)_0px_8px_24px]' :
              plan.status === 'active' ? 'border-hairline' : 'border-danger-200 opacity-75'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-ink">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(plan)} title="Edit Plan" className="w-8 h-8 rounded-full border border-hairline text-steel hover:text-ink hover:bg-surface flex items-center justify-center transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(plan)} title="Delete Plan" className="w-8 h-8 rounded-full border border-hairline text-steel hover:text-brand-error hover:bg-danger-50 flex items-center justify-center transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold text-ink tracking-[-0.5px]">{plan.name}</h3>
                  {featured && <span className="mint-badge">Featured</span>}
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-5xl font-semibold text-ink font-mono tracking-[-1.5px]">₹{Number(plan.priceMonthly).toLocaleString()}</span>
                  <span className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">/ Month</span>
                </div>
              </div>

              <div className="space-y-4 py-6 border-y border-hairline-soft mb-6">
                <FeatureItem icon={Users} label="Max Students" value={plan.maxStudents.toLocaleString()} />
                <FeatureItem icon={Shield} label="Max Staff" value={plan.maxStaff.toLocaleString()} />
                <FeatureItem icon={HardDrive} label="Storage" value={`${(plan.maxStorageMb / 1000).toFixed(1)} GB`} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">Active Tenants</span>
                  <span className="text-sm font-medium text-charcoal">{plan._count?.institutes || 0}</span>
                </div>
                <StatusBadge status={plan.status} />
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <PlanModal
          plan={editingPlan}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchPlans(); }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'active';
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
      active ? 'bg-brand-green-soft text-ink border-brand-green/20' : 'bg-danger-50 text-brand-error border-danger-200'
    }`}>
      {status}
    </span>
  );
}

function FeatureItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Icon className="w-3.5 h-3.5 text-steel" />
        <span className="text-sm text-charcoal">{label}</span>
      </div>
      <span className="text-sm font-medium text-ink font-mono">{value}</span>
    </div>
  );
}

function PlanModal({ plan, onClose, onSaved }: { plan: Plan | null, onClose: () => void, onSaved: () => void }) {
  const [form, setForm] = useState({
    name: plan?.name || '',
    maxStudents: plan?.maxStudents || 100,
    maxStaff: plan?.maxStaff || 10,
    maxStorageMb: plan?.maxStorageMb || 1000,
    priceMonthly: plan?.priceMonthly || 999,
    status: plan?.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (plan) {
        await api.patch(`/super-admin/plans/${plan.id}`, form);
      } else {
        await api.post('/super-admin/plans', form);
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg bg-canvas rounded-lg p-4 sm:p-8 border border-hairline" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-ink tracking-[-0.5px]">
            {plan ? `Configure ${plan.name}` : 'Design New Subscription Tier'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-hairline text-steel hover:text-ink hover:bg-surface flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-md text-brand-error text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField label="Plan Name" value={form.name} onChange={value => setForm({ ...form, name: value })} placeholder="Professional" required />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Monthly Price" type="number" value={form.priceMonthly} onChange={value => setForm({ ...form, priceMonthly: Number(value) })} required />
            <InputField label="Storage (MB)" type="number" value={form.maxStorageMb} onChange={value => setForm({ ...form, maxStorageMb: Number(value) })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Max Students" type="number" value={form.maxStudents} onChange={value => setForm({ ...form, maxStudents: Number(value) })} required />
            <InputField label="Max Staff" type="number" value={form.maxStaff} onChange={value => setForm({ ...form, maxStaff: Number(value) })} required />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-1.5">Visibility Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="mint-input w-full">
              <option value="active">Public / Active</option>
              <option value="inactive">Archived / Hidden</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="mint-btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="mint-btn-primary disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {plan ? 'Apply Changes' : 'Launch Tier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, required, type = 'text' }: {
  label: string; value: string | number; onChange: (value: string) => void; placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} className="mint-input w-full" />
    </div>
  );
}
