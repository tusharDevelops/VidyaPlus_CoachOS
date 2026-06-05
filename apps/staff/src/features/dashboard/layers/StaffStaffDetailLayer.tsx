import { useState, useEffect } from 'react';
import { 
  User, Shield, MessageSquare, Mail, Phone, Calendar, 
  MapPin, Loader2, Edit2, Trash2, AlertCircle, Plus, 
  History as HistoryIcon, DollarSign, Wallet, CheckCircle2,
  BookOpen
} from 'lucide-react';
import { DrillDepth } from '../types';
import api from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth.store';
import StaffModal from '../../staff/StaffModal';

interface StaffDetailLayerProps {
  staffId: string;
  onNavigate: (depth: DrillDepth) => void;
}

export default function StaffStaffDetailLayer({ staffId, onNavigate }: StaffDetailLayerProps) {
  const { hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'payroll' | 'messages' | 'profile'>('payroll');
  const [staff, setStaff] = useState<any>(null);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);

  const fetchData = async () => {
    if (!staffId) return;
    setLoading(true);
    setError(null);
    try {
      const [sRes, pRes] = await Promise.all([
        api.get(`/staff/${staffId}`),
        api.get(`/staff/payroll?staffId=${staffId}`)
      ]);
      
      if (!sRes.data.success) throw new Error(sRes.data.error || 'Failed to fetch staff');
      
      setStaff(sRes.data.data);
      setPayroll(pRes.data.data.history || []);
    } catch (err: any) {
      console.error('Staff Fetch Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load staff member');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [staffId]);

  const deleteStaff = async () => {
    if (!hasPermission('staff.manage')) return;
    if (!window.confirm('Remove this staff member permanently?')) return;
    try {
      await api.delete(`/staff/${staffId}`);
      onNavigate('STAFF');
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-canvas border border-hairline rounded-3xl">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-canvas border border-hairline rounded-3xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-brand-error opacity-40" />
        <div>
          <h3 className="text-lg font-black text-ink uppercase tracking-widest">Load Failure</h3>
          <p className="text-xs text-steel font-medium max-w-xs">{error || 'Staff member not found or access denied.'}</p>
        </div>
        <button 
          onClick={fetchData}
          className="px-6 py-2 bg-ink text-canvas rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const totalPaid = payroll.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="bg-canvas border border-hairline rounded-3xl overflow-hidden animate-fade-in shadow-premium-subtle">
      {/* Profile Header */}
      <div className="p-4 sm:p-8 bg-surface border-b border-hairline">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-8 md:items-center">
          <div className="w-24 h-24 rounded-2xl bg-canvas border-2 border-hairline flex items-center justify-center shrink-0 overflow-hidden shadow-md">
            <span className="text-3xl font-black text-ink">{staff.name.charAt(0)}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-ink tracking-tight">{staff.name}</h2>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                staff.role === 'admin' ? 'bg-brand-error/10 text-brand-error border-brand-error/20' : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'
              }`}>
                {staff.role}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
              <span className="flex items-center text-xs font-black text-steel uppercase tracking-widest opacity-60">
                <span className="mr-2">Emp ID:</span> #{staff.id.slice(0, 8)}
              </span>
              <span className="flex items-center text-xs font-black text-steel uppercase tracking-widest opacity-60">
                <span className="mr-2">Joined:</span> {new Date(staff.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative group">
              <button className="h-12 px-6 bg-ink text-canvas hover:bg-ink/90 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center transition-all shadow-xl">
                <MessageSquare className="w-4 h-4 mr-2" /> Connect
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-canvas rounded-2xl shadow-premium border border-hairline z-20 py-2 hidden group-hover:block animate-slide-up origin-top-right overflow-hidden">
                <button onClick={() => { setActiveTab('messages'); }} className="w-full flex items-center gap-4 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-ink hover:bg-surface border-b border-hairline-soft">
                  <MessageSquare className="w-4 h-4 text-brand-green" /> WhatsApp Dispatch
                </button>
                <button onClick={() => { setActiveTab('messages'); }} className="w-full flex items-center gap-4 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-ink hover:bg-surface border-b border-hairline-soft">
                  <Mail className="w-4 h-4 text-brand-blue" /> Send Email
                </button>
                <a href={`tel:${staff.phone}`} className="w-full flex items-center gap-4 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-ink hover:bg-surface">
                  <Phone className="w-4 h-4 text-steel" /> Direct Call
                </a>
              </div>
            </div>

            {hasPermission('staff.manage') && (
              <>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="h-12 px-6 bg-canvas border border-hairline text-ink hover:bg-surface rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center transition-all shadow-sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </button>
                <button 
                  onClick={deleteStaff}
                  className="h-12 w-12 bg-brand-error/10 text-brand-error border border-brand-error/20 rounded-xl hover:bg-brand-error hover:text-canvas flex items-center justify-center transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {showEditModal && (
        <StaffModal 
          isOpen={showEditModal} 
          onClose={() => setShowEditModal(false)} 
          staff={staff}
          onSuccess={() => { setShowEditModal(false); fetchData(); }} 
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-hairline px-6 bg-canvas sticky top-0 z-10">
        <button 
          onClick={() => setActiveTab('payroll')}
          className={`px-6 py-5 text-xs font-black uppercase tracking-widest border-b-4 transition-all ${
            activeTab === 'payroll' ? 'border-brand-green text-brand-green-deep' : 'border-transparent text-steel opacity-60 hover:opacity-100'
          }`}
        >
          Payroll & Finance
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`px-6 py-5 text-xs font-black uppercase tracking-widest border-b-4 transition-all ${
            activeTab === 'messages' ? 'border-brand-green text-brand-green-deep' : 'border-transparent text-steel opacity-60 hover:opacity-100'
          }`}
        >
          Communications
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-5 text-xs font-black uppercase tracking-widest border-b-4 transition-all ${
            activeTab === 'profile' ? 'border-brand-green text-brand-green-deep' : 'border-transparent text-steel opacity-60 hover:opacity-100'
          }`}
        >
          Staff Profile
        </button>
      </div>

      {/* Content Layer */}
      <div className="p-4 sm:p-8 min-h-[500px]">
        {activeTab === 'payroll' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-surface rounded-2xl border border-hairline">
                <p className="text-[10px] font-black text-steel uppercase tracking-widest mb-2 opacity-50">Base Monthly Salary</p>
                <p className="text-3xl font-black text-ink">₹{staff.baseSalary || 0}</p>
              </div>
              <div className="p-6 bg-brand-green/5 rounded-2xl border border-brand-green/20">
                <p className="text-[10px] font-black text-brand-green-deep uppercase tracking-widest mb-2 opacity-50">Total Disbursed</p>
                <p className="text-3xl font-black text-brand-green-deep">₹{totalPaid}</p>
              </div>
              <div className="p-6 bg-brand-blue/5 rounded-2xl border border-brand-blue/20">
                <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2 opacity-50">Last Payment</p>
                <p className="text-3xl font-black text-brand-blue">{payroll[0]?.month || 'N/A'}</p>
              </div>
            </div>

            {hasPermission('settings.manage') && (
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  className="mint-btn-brand h-12 px-4 sm:px-8"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Disburse Salary
                </button>
                <button className="h-12 px-4 sm:px-8 bg-surface border border-hairline text-ink hover:bg-canvas rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bonus
                </button>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-black text-ink uppercase tracking-widest opacity-60">Payment History</h3>
              <div className="bg-canvas border border-hairline rounded-2xl overflow-x-auto shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-surface border-b border-hairline">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black text-steel uppercase tracking-widest">Period</th>
                      <th className="px-6 py-5 text-[10px] font-black text-steel uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-5 text-[10px] font-black text-steel uppercase tracking-widest">Method</th>
                      <th className="px-6 py-5 text-[10px] font-black text-steel uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline-soft">
                    {payroll.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-steel font-medium opacity-50">No salary disbursements recorded.</td>
                      </tr>
                    ) : (
                      payroll.map((p) => (
                        <tr key={p.id} className="hover:bg-surface transition-colors">
                          <td className="px-6 py-5 font-black text-ink text-sm uppercase">{p.month}</td>
                          <td className="px-6 py-5 font-black text-brand-green-deep text-sm">₹{p.amount}</td>
                          <td className="px-6 py-5 font-bold text-steel text-xs uppercase">{p.method}</td>
                          <td className="px-6 py-5 text-right">
                             <span className="px-3 py-1 bg-brand-green/10 text-brand-green-deep rounded-full text-[9px] font-black uppercase tracking-widest">Success</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-10 animate-fade-in max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              {/* WhatsApp Section */}
              <div className="p-4 sm:p-8 bg-surface border border-hairline rounded-3xl space-y-6">
                <h3 className="text-sm font-black text-ink uppercase tracking-widest flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-brand-green" /> WhatsApp Channel
                </h3>
                <textarea 
                  className="w-full h-32 p-4 bg-canvas border border-hairline rounded-2xl text-sm focus:border-brand-green outline-none transition-all font-medium"
                  placeholder="Type message to team member..."
                  defaultValue={`Hi ${staff.name}, hope you are doing well. This is regarding...`}
                ></textarea>
                <button 
                  onClick={() => {
                    const msg = `https://wa.me/${staff.phone}?text=${encodeURIComponent(`Hi ${staff.name}, hope you are doing well. This is regarding...`)}`;
                    window.open(msg, '_blank');
                  }}
                  className="bg-brand-green text-white hover:bg-brand-green-deep w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center shadow-lg shadow-brand-green/20 transition-all"
                >
                  DISPATCH WHATSAPP NOW
                </button>
              </div>

              {/* Email Section */}
              <div className="p-4 sm:p-8 bg-surface border border-hairline rounded-3xl space-y-6">
                <h3 className="text-sm font-black text-ink uppercase tracking-widest flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-brand-blue" /> Professional Email
                </h3>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Subject Line"
                    className="w-full h-12 px-4 bg-canvas border border-hairline rounded-xl text-sm outline-none focus:border-brand-blue"
                  />
                  <textarea 
                    className="w-full h-24 p-4 bg-canvas border border-hairline rounded-xl text-sm outline-none focus:border-brand-blue"
                    placeholder="Email content..."
                  ></textarea>
                  <button 
                    className="h-14 w-full bg-brand-blue text-white hover:bg-brand-blue-deep rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-lg shadow-brand-blue/20"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    SEND EMAIL NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
            <div className="space-y-8">
              <h3 className="text-xs font-black text-ink uppercase tracking-[0.2em] flex items-center border-b border-hairline-soft pb-4">
                <User className="w-4 h-4 mr-3 text-brand-green" />
                PERSONAL INFORMATION
              </h3>
              <div className="space-y-6">
                <DetailRow label="Primary Phone" value={staff.phone} icon={Phone} />
                <DetailRow label="Email Identity" value={staff.email} icon={Mail} />
                <DetailRow label="Role / Designation" value={staff.role} icon={Shield} />
                <DetailRow label="Permanent Address" value={staff.address || 'Not Provided'} icon={MapPin} />
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-xs font-black text-ink uppercase tracking-[0.2em] flex items-center border-b border-hairline-soft pb-4">
                <Calendar className="w-4 h-4 mr-3 text-brand-green" />
                EMPLOYMENT DATA
              </h3>
              <div className="space-y-6">
                <DetailRow label="Date of Joining" value={new Date(staff.createdAt).toLocaleDateString()} icon={Calendar} />
                <DetailRow label="Contract Status" value="Active / Full Time" icon={CheckCircle2} />
                <DetailRow label="Performance Score" value="---" />
              </div>

              {/* Assigned Batches Section */}
              {staff.assignedBatches?.length > 0 && (
                <div className="pt-8 border-t border-hairline mt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-green/10 rounded-lg">
                      <BookOpen className="w-4 h-4 text-brand-green" />
                    </div>
                    <h3 className="text-[10px] font-black text-ink uppercase tracking-widest">Assigned Classes</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {staff.assignedBatches.map((batch: any) => (
                      <div key={batch.id} className="p-4 bg-surface rounded-2xl border border-hairline group hover:border-brand-green transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-xs font-black text-ink uppercase tracking-tight">{batch.name}</h4>
                          <span className="text-[9px] font-mono font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-md">
                            {batch.startTime}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                            const isActive = (batch.daysJson as string[]).includes(day);
                            return (
                              <span key={day} className={`text-[8px] font-black w-6 h-6 rounded-md flex items-center justify-center border ${
                                isActive ? 'bg-ink text-canvas border-ink' : 'text-stone border-hairline opacity-30'
                              }`}>
                                {day.charAt(0)}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black text-steel uppercase tracking-widest opacity-50">{label}</p>
      <div className="flex items-center text-sm font-black text-ink">
        {Icon && <Icon className="w-4 h-4 mr-3 text-steel opacity-30" />}
        {value}
      </div>
    </div>
  );
}
