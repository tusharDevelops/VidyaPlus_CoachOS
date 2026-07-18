import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  Building2, CreditCard, Settings, Users, AlertTriangle,
  ChevronRight, ArrowUpRight, Globe, Zap, Shield
} from 'lucide-react';

interface KpiData {
  totalInstitutes: number;
  activeInstitutes: number;
  suspendedInstitutes: number;
  totalUsers: number;
  totalStudents: number;
  expiringPlans: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [recentInstitutes, setRecentInstitutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kpiRes, instRes] = await Promise.all([
          api.get('/super-admin/kpis'),
          api.get('/super-admin/institutes', { params: { page: 1, limit: 5 } })
        ]);
        setKpiData(kpiRes.data.data);
        setRecentInstitutes(instRes.data.data || []);
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleImpersonate = async (ownerId: string) => {
    try {
      const { data } = await api.post(`/super-admin/impersonate/${ownerId}`);
      const { accessToken, user } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.open('http://localhost:5173/dashboard', '_blank');
    } catch {
      alert('Impersonation failed. Make sure the institute has an owner.');
    }
  };

  const kpis = kpiData ? [
    { label: 'Platform Revenue', value: `₹${(kpiData.totalRevenue ?? 0).toLocaleString('en-IN')}`, icon: Zap, tint: 'mint', trend: 'Total collection' },
    { label: 'Active Institutes', value: (kpiData.activeInstitutes ?? 0).toLocaleString(), icon: Building2, tint: 'surface', trend: `${kpiData.totalInstitutes ?? 0} total` },
    { label: 'Total Users', value: (kpiData.totalUsers ?? 0).toLocaleString(), icon: Users, tint: 'surface', trend: `${kpiData.totalStudents ?? 0} students` },
    { label: 'Suspended', value: (kpiData.suspendedInstitutes ?? 0).toString(), icon: AlertTriangle, tint: 'error', trend: (kpiData.suspendedInstitutes ?? 0) === 0 ? 'No alerts' : 'Needs attention' },
  ] : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-[-0.5px]">Platform Command</h1>
          <p className="text-sm text-steel mt-1">Global oversight and infrastructure management.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 px-3 py-1.5 bg-brand-green-soft text-ink rounded-full border border-brand-green/20">
          <span className="w-2 h-2 bg-brand-green rounded-full" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.5px]">Live View</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {!loading && kpiData ? kpis.map((kpi) => (
          <div key={kpi.label} className="mint-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                kpi.tint === 'mint' ? 'bg-brand-green-soft text-ink' :
                kpi.tint === 'error' ? 'bg-danger-50 text-brand-error' :
                'bg-surface text-ink'
              }`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-stone" />
            </div>
            <p className="text-3xl font-semibold text-ink font-mono tracking-tight mb-1">{kpi.value}</p>
            <p className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">{kpi.label}</p>
            <div className="mt-4 pt-4 border-t border-hairline-soft">
              <p className="text-xs text-steel">{kpi.trend}</p>
            </div>
          </div>
        )) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mint-card p-6 h-40 animate-pulse">
              <div className="w-10 h-10 bg-surface rounded-lg mb-4" />
              <div className="h-8 w-20 bg-surface rounded mb-2" />
              <div className="h-4 w-32 bg-surface rounded" />
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-ink" /> Recent Institute Onboarding
            </h2>
            <button onClick={() => navigate('/institutes')} className="text-sm font-medium text-ink hover:underline">
              View all registry
            </button>
          </div>
          <div className="mint-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface border-b border-hairline-soft">
                    {['Institute', 'Tier', 'Status', 'Ownership'].map((h) => (
                      <th key={h} className="px-6 py-4 text-[11px] font-semibold text-steel uppercase tracking-[0.5px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-soft">
                  {!loading && recentInstitutes.map((inst: any) => (
                    <tr key={inst.id} className="hover:bg-surface/70 transition-colors group cursor-pointer" onClick={() => navigate(`/institutes/${inst.id}`)}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-ink">{inst.name}</p>
                        <div className="flex items-center gap-1 text-xs text-steel mt-0.5">
                          <Globe className="w-3 h-3" /> {inst.subdomain}.maneza.in
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-surface text-steel border border-hairline">
                          {inst.plan?.name || 'Trial'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          inst.status === 'active' ? 'bg-brand-green-soft text-ink border-brand-green/20' : 'bg-danger-50 text-brand-error border-danger-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${inst.status === 'active' ? 'bg-brand-green' : 'bg-brand-error'}`} />
                          {inst.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-charcoal">{inst.owner?.name || '-'}</p>
                            <p className="text-xs text-steel">{inst.owner?.phone || ''}</p>
                          </div>
                          {inst.owner && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleImpersonate(inst.owner.id); }}
                              className="w-8 h-8 rounded-full border border-hairline text-steel hover:text-ink hover:bg-surface flex items-center justify-center"
                              title="Impersonate owner"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && recentInstitutes.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-steel text-sm">No active registrations found</td></tr>
                  )}
                  {loading && Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-4"><div className="h-10 bg-surface rounded" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-ink tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-ink" /> Platform Shortcuts
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Manage Institutes', sub: 'Provision and audit accounts', icon: Building2, path: '/institutes' },
              { label: 'Subscription Tiers', sub: 'Configure feature sets and pricing', icon: CreditCard, path: '/plans' },
              { label: 'Platform Settings', sub: 'Global config and security', icon: Settings, path: '/settings' },
            ].map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)} className="w-full flex items-center gap-4 p-4 mint-card hover:bg-surface text-left transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-ink">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="text-xs text-steel">{item.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-stone" />
              </button>
            ))}
          </div>

          <div className="bg-canvas-dark rounded-lg p-6 text-on-dark">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-brand-green" />
              <p className="font-semibold tracking-tight">Security Protocol</p>
            </div>
            <p className="text-sm text-on-dark-muted leading-relaxed mb-4">
              You are operating within the global admin console. All actions are logged for audit purposes.
            </p>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-full bg-brand-green" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
