import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Pagination from '../../components/Pagination';
import {
  Building2, Search, Plus, MoreVertical,
  Users, X, AlertTriangle, CheckCircle2,
} from 'lucide-react';

interface Institute {
  id: string;
  name: string;
  subdomain: string;
  phone: string;
  email: string | null;
  status: string;
  setupCompleted: boolean;
  createdAt: string;
  plan: { id: string; name: string; priceMonthly: string } | null;
  _count: { users: number; batches: number; studentProfiles: number };
  owner: { id: string; name: string; phone: string; email: string | null } | null;
}

interface Meta { page: number; limit: number; total: number; totalPages: number }

export default function InstitutesListPage() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const fetchInstitutes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/super-admin/institutes', { params });
      setInstitutes(data.data);
      setMeta(data.meta);
    } catch (err) {
      console.error('Failed to fetch institutes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchInstitutes(); }, [fetchInstitutes]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-[-0.5px]">Institutes</h1>
          <p className="text-sm text-steel mt-1">Manage coaching centers on the platform.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="mint-btn-primary">
          <Plus className="w-4 h-4" />
          Create Institute
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel" />
          <input
            type="text"
            placeholder="Search by name, subdomain, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mint-input w-full pl-10 pr-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-ink">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mint-input min-w-[150px]">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="mint-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-hairline-soft">
                {['Institute', 'Plan', 'Students', 'Owner', 'Status', 'Created', ''].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-steel uppercase tracking-[0.5px] px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-surface rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : institutes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Building2 className="w-10 h-10 text-stone mx-auto mb-3" />
                    <p className="text-steel text-sm">No institutes found</p>
                    <p className="text-stone text-xs mt-1">Create one to get started</p>
                  </td>
                </tr>
              ) : (
                institutes.map((inst) => (
                  <tr key={inst.id} className="hover:bg-surface/70 transition-colors cursor-pointer" onClick={() => navigate(`/institutes/${inst.id}`)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-ink text-sm font-semibold flex-shrink-0">
                          {inst.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{inst.name}</p>
                          <p className="text-xs text-steel">{inst.subdomain}.coachos.in</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {inst.plan ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-surface text-steel border border-hairline">
                          {inst.plan.name}
                        </span>
                      ) : (
                        <span className="text-xs text-stone">No plan</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-charcoal">
                        <Users className="w-3.5 h-3.5 text-steel" />
                        {inst._count.studentProfiles}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {inst.owner ? (
                        <div>
                          <p className="text-sm text-charcoal">{inst.owner.name}</p>
                          <p className="text-xs text-steel">{inst.owner.phone}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-stone">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={inst.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-steel">
                      {new Date(inst.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-full border border-hairline text-steel hover:text-ink hover:bg-surface flex items-center justify-center">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="px-5 pb-5">
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={meta.limit}
              onPageChange={(p) => fetchInstitutes(p)}
            />
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateInstituteModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchInstitutes(); }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'active';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
      active ? 'bg-brand-green-soft text-ink border-brand-green/20' : 'bg-danger-50 text-brand-error border-danger-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-brand-green' : 'bg-brand-error'}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

interface Plan { id: string; name: string; maxStudents: number; maxStaff: number; priceMonthly: string }

function CreateInstituteModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '', subdomain: '', phone: '', email: '', address: '',
    planId: '', academicYear: '2026-2027',
    ownerName: '', ownerPhone: '', ownerEmail: '', ownerPassword: '',
  });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/super-admin/plans').then(({ data }) => setPlans(data.data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'name') {
      setForm(prev => ({ ...prev, subdomain: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/super-admin/institutes', { ...form, planId: form.planId || undefined });
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create institute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-canvas rounded-lg border border-hairline p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-ink tracking-[-0.5px]">Create Institute</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-hairline text-steel hover:text-ink hover:bg-surface flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-danger-50 border border-danger-200 rounded-md text-brand-error text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-3">Institute Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Institute Name" name="name" value={form.name} onChange={handleChange} placeholder="Sharma Coaching" required />
              <InputField label="Subdomain" name="subdomain" value={form.subdomain} onChange={handleChange} placeholder="sharma-coaching" required suffix=".coachos.in" />
              <InputField label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" required />
              <InputField label="Email" name="email" value={form.email} onChange={handleChange} placeholder="info@institute.com" />
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-1.5">Plan</label>
                <select name="planId" value={form.planId} onChange={handleChange} className="mint-input w-full">
                  <option value="">No plan</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ₹{Number(p.priceMonthly).toLocaleString()}/mo</option>
                  ))}
                </select>
              </div>
              <InputField label="Academic Year" name="academicYear" value={form.academicYear} onChange={handleChange} placeholder="2026-2027" />
            </div>
          </div>

          <div className="border-t border-hairline-soft pt-6">
            <h3 className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-3">Owner Account</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Owner Name" name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Rahul Sharma" required />
              <InputField label="Owner Phone" name="ownerPhone" value={form.ownerPhone} onChange={handleChange} placeholder="9876543210" required />
              <InputField label="Owner Email" name="ownerEmail" value={form.ownerEmail} onChange={handleChange} placeholder="owner@institute.com" />
              <InputField label="Owner Password" name="ownerPassword" value={form.ownerPassword} onChange={handleChange} placeholder="Min 8 characters" required type="password" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="mint-btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="mint-btn-primary disabled:opacity-50">
              {loading ? 'Creating...' : <><CheckCircle2 className="w-4 h-4" /> Create Institute</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, placeholder, required, type = 'text', suffix }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; type?: string; suffix?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-1.5">{label}</label>
      <div className="relative">
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className={`mint-input w-full ${suffix ? 'pr-28' : ''}`} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-steel">{suffix}</span>}
      </div>
    </div>
  );
}
