import { useState, useEffect } from 'react';
import Pagination from '../../components/Pagination';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  ArrowLeft, Building2, Users, BookOpen, CreditCard, Settings,
  Mail, Phone, MapPin, Calendar, Shield, Loader2,
  CheckCircle2, XCircle, UserPlus, TrendingUp, MoreVertical, Zap
} from 'lucide-react';

interface InstituteDetail {
  id: string; name: string; subdomain: string; phone: string; email: string | null;
  address: string | null; logoUrl: string | null; status: string; academicYear: string | null;
  setupCompleted: boolean; createdAt: string; updatedAt: string;
  plan: { id: string; name: string; maxStudents: number; maxStaff: number; maxStorageMb: number; priceMonthly: string } | null;
  _count: { users: number; batches: number; studentProfiles: number; feePlans: number };
  users: { id: string; name: string; phone: string; email: string | null; role: string; status: string; lastLoginAt: string | null; createdAt: string }[];
  breakdown?: { roles: Record<string, number> };
}

const STATUS_ACTIONS: Record<string, { label: string; to: string }> = {
  active: { label: 'Suspend', to: 'suspended' },
  suspended: { label: 'Reactivate', to: 'active' },
  inactive: { label: 'Reactivate', to: 'active' },
};

export default function InstituteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [institute, setInstitute] = useState<InstituteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'payments'>('overview');
  const [logs, setLogs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [logsMeta, setLogsMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [paymentsMeta, setPaymentsMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [paymentsLoaded, setPaymentsLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/super-admin/institutes/${id}`)
      .then(({ data }) => setInstitute(data.data))
      .catch(() => navigate('/institutes'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const fetchAuditLogs = async (page = 1) => {
    setLogsLoading(true);
    try {
      const { data } = await api.get(`/super-admin/institutes/${id}/audit-logs`, { params: { page, limit: 20 } });
      setLogs(data.data);
      if (data.meta) setLogsMeta(data.meta);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLogsLoading(false);
      setLogsLoaded(true);
    }
  };

  const fetchPayments = async (page = 1) => {
    setPaymentsLoading(true);
    try {
      const { data } = await api.get(`/super-admin/institutes/${id}/payments`, { params: { page, limit: 20 } });
      setPayments(data.data);
      if (data.meta) setPaymentsMeta(data.meta);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setPaymentsLoading(false);
      setPaymentsLoaded(true);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit' && !logsLoaded) {
      fetchAuditLogs();
    }
    if (activeTab === 'payments' && !paymentsLoaded) {
      fetchPayments();
    }
  }, [activeTab, id, logsLoaded, paymentsLoaded]);

  const handleStatusChange = async (newStatus: string) => {
    if (!institute) return;
    setUpdating(true);
    try {
      await api.patch(`/super-admin/institutes/${institute.id}`, { status: newStatus });
      setInstitute(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleImpersonate = async (ownerId: string) => {
    try {
      const { data } = await api.post(`/super-admin/impersonate/${ownerId}`);
      const { accessToken, user } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.open('http://localhost:5173/dashboard', '_blank');
    } catch {
      alert('Impersonation failed. Make sure the institute has an active owner.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  if (!institute) return null;

  const statusAction = STATUS_ACTIONS[institute.status];
  const owner = institute.users.find(u => u.role === 'owner');
  const staffMembers = institute.users.filter(u => u.role !== 'student' && u.role !== 'parent');

  return (
    <div className="animate-fade-in space-y-6">
      <button onClick={() => navigate('/institutes')} className="flex items-center gap-2 text-sm text-steel hover:text-ink transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Institutes
      </button>

      <div className="mint-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-lg bg-surface flex items-center justify-center text-ink text-2xl font-semibold">
              {institute.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold text-ink tracking-[-0.5px]">{institute.name}</h1>
                <StatusBadge status={institute.status} />
              </div>
              <p className="text-sm text-steel mt-1">{institute.subdomain}.coachos.in</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {owner && (
              <button onClick={() => handleImpersonate(owner.id)} className="mint-btn-primary">
                <Zap className="w-4 h-4" /> Impersonate Owner
              </button>
            )}
            {statusAction && (
              <button onClick={() => handleStatusChange(statusAction.to)} disabled={updating} className="mint-btn-secondary disabled:opacity-50">
                {updating ? 'Processing...' : statusAction.label}
              </button>
            )}
            <button className="w-10 h-10 rounded-full border border-hairline text-steel hover:text-ink hover:bg-surface flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-hairline-soft">
          {[
            { icon: Phone, label: 'Support Phone', value: institute.phone },
            { icon: Mail, label: 'Billing Email', value: institute.email || '-' },
            { icon: MapPin, label: 'Location', value: institute.address || 'Global' },
            { icon: Calendar, label: 'Academic Year', value: institute.academicYear || '-' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] flex items-center gap-1.5">
                <item.icon className="w-3 h-3" /> {item.label}
              </span>
              <span className="text-sm font-medium text-charcoal">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'overview', label: 'Overview', icon: Building2 },
          { key: 'users', label: 'User Directory', icon: Users },
          { key: 'audit', label: 'Audit Logs', icon: Shield },
          { key: 'payments', label: 'Platform Fees', icon: CreditCard },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key as any)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            activeTab === key ? 'bg-primary text-on-primary border-primary' : 'bg-canvas text-steel border-hairline hover:text-ink'
          }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: institute._count.users, icon: Users },
                { label: 'Total Students', value: institute._count.studentProfiles, icon: UserPlus },
                { label: 'Active Batches', value: institute._count.batches, icon: BookOpen },
                { label: 'Revenue Generated', value: `₹${(institute._count.feePlans * 1500).toLocaleString()}`, icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="mint-card p-5">
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-ink mb-4">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-semibold text-ink font-mono tracking-tight">{stat.value}</p>
                  <p className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mt-1">{stat.label}</p>
                </div>
              ))}

              <div className="col-span-full mint-card p-6 mt-2">
                <h3 className="text-sm font-semibold text-ink mb-6 flex items-center gap-2">
                  <Users className="w-4 h-4 text-ink" /> User Distribution
                </h3>
                <div className="space-y-4">
                  {Object.entries(institute.breakdown?.roles || {}).map(([role, count]) => {
                    const total = institute.users.length || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={role} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">
                          <span>{role.replace('_', ' ')}</span>
                          <span>{count} ({percent}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-brand-green transition-all duration-1000" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="mint-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">Platform Plan</h3>
                  <span className="p-1.5 rounded-md bg-surface text-ink"><CreditCard className="w-4 h-4" /></span>
                </div>
                {institute.plan ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-2xl font-semibold text-ink">{institute.plan.name}</p>
                      <p className="text-sm text-steel mt-0.5">₹{Number(institute.plan.priceMonthly).toLocaleString()}/month</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-hairline-soft">
                      <Limit label="Students" value={institute.plan.maxStudents} />
                      <Limit label="Staff" value={institute.plan.maxStaff} />
                    </div>
                    <button className="mint-btn-secondary w-full">Upgrade Plan</button>
                  </div>
                ) : <p className="text-sm text-steel">No plan assigned</p>}
              </div>

              {owner && (
                <div className="mint-card p-6">
                  <h3 className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-4">Account Owner</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center text-ink font-semibold">
                      {owner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{owner.name}</p>
                      <p className="text-xs text-steel mt-0.5">{owner.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <DataTable
            headers={['Staff Member', 'Role', 'Status', 'Last Activity', '']}
            rows={staffMembers.map(user => [
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-surface flex items-center justify-center text-xs font-semibold text-ink">{user.name.charAt(0)}</div>
                <div><p className="text-sm font-medium text-ink">{user.name}</p><p className="text-xs text-steel">{user.email || user.phone}</p></div>
              </div>,
              <span className="inline-flex px-2 py-0.5 rounded-sm text-[11px] font-medium bg-surface text-steel border border-hairline">{user.role.replace('_', ' ')}</span>,
              <span className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.5px] ${user.status === 'active' ? 'text-ink' : 'text-brand-error'}`}>
                {user.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> : <XCircle className="w-3.5 h-3.5" />} {user.status}
              </span>,
              <span className="text-xs text-steel">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never'}</span>,
              <button className="w-8 h-8 rounded-full text-steel hover:text-ink hover:bg-surface flex items-center justify-center"><MoreVertical className="w-4 h-4" /></button>,
            ])}
          />
        )}

        {activeTab === 'audit' && (
          <div className="mint-card overflow-hidden">
            <div className="p-4 border-b border-hairline-soft flex items-center justify-between">
              <h3 className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">Recent Tenant Actions</h3>
              {logsLoading && <Loader2 className="w-4 h-4 text-brand-green animate-spin" />}
            </div>
            <DataTable
              headers={['Action', 'User', 'Time', 'Entity']}
              rows={logs.map(log => [
                <span className="text-sm font-medium text-ink">{log.action.replace('.', ' ')}</span>,
                <div><p className="text-xs font-medium text-ink">{log.user.name}</p><p className="text-[11px] text-steel uppercase tracking-[0.5px]">{log.user.role}</p></div>,
                <span className="text-xs text-steel">{new Date(log.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>,
                <span className="text-xs text-steel">{log.entityType} ID: ...{log.entityId?.slice(-6)}</span>,
              ])}
              empty="No activity recorded for this tenant"
            />
            <Pagination
              page={logsMeta.page}
              totalPages={logsMeta.totalPages}
              total={logsMeta.total}
              limit={logsMeta.limit}
              onPageChange={(p) => fetchAuditLogs(p)}
            />
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            {paymentsLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 text-brand-green animate-spin" />
              </div>
            )}
            <DataTable
              headers={['Period', 'Plan', 'Amount', 'Mode', 'Status']}
              rows={payments.map(p => [
                <span className="text-sm font-medium text-ink">{p.feeRecord?.periodLabel || 'System'}</span>,
                <span className="text-xs text-steel">{p.feeRecord?.feePlan?.name || 'Subscription'}</span>,
                <span className="text-sm font-semibold text-ink font-mono">₹{Number(p.amount).toLocaleString()}</span>,
                <span className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">{p.paymentMode}</span>,
                <StatusBadge status={p.status} />,
              ])}
              empty="No platform payments found"
            />
            <Pagination
              page={paymentsMeta.page}
              totalPages={paymentsMeta.totalPages}
              total={paymentsMeta.total}
              limit={paymentsMeta.limit}
              onPageChange={(p) => fetchPayments(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'active' || status === 'paid' || status === 'success';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
      active ? 'bg-brand-green-soft text-ink border-brand-green/20' : 'bg-danger-50 text-brand-error border-danger-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-brand-green' : 'bg-brand-error'}`} />
      {status}
    </span>
  );
}

function Limit({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">{label}</p>
      <p className="text-sm font-medium text-ink font-mono">{value}</p>
    </div>
  );
}

function DataTable({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty?: string }) {
  return (
    <div className="mint-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface border-b border-hairline-soft">
              {headers.map(h => <th key={h} className="text-left text-[11px] font-semibold text-steel uppercase tracking-[0.5px] px-6 py-4">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {rows.length > 0 ? rows.map((row, i) => (
              <tr key={i} className="hover:bg-surface/70 transition-colors">
                {row.map((cell, j) => <td key={j} className="px-6 py-4">{cell}</td>)}
              </tr>
            )) : (
              <tr><td colSpan={headers.length} className="px-6 py-12 text-center text-steel text-sm">{empty || 'No records found'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
