import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Staff } from './StaffPage';
import { X, Shield, Check, Loader2, UserPlus, Mail } from 'lucide-react';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSuccess: () => void;
}

const PERMISSION_GROUPS = [
  {
    id: 'students',
    title: 'Students & Inquiries',
    items: [
      { id: 'students.view', label: 'View student directory', description: 'Access student list and basic profiles' },
      { id: 'students.add', label: 'Enroll new students', description: 'Register new students into the system' },
      { id: 'students.edit', label: 'Modify student data', description: 'Update KYC, contact info, and status' },
      { id: 'students.delete', label: 'Remove student records', description: 'Permit removal or archiving of records' },
    ]
  },
  {
    id: 'academics',
    title: 'Academics & Attendance',
    items: [
      { id: 'batches.view', label: 'View batch schedules', description: 'See class schedules and assignments' },
      { id: 'batches.edit', label: 'Manage batch settings', description: 'Configure batch settings and timings' },
      { id: 'attendance.mark', label: 'Mark daily attendance', description: 'Record daily attendance for students' },
      { id: 'attendance.view', label: 'View attendance reports', description: 'Access past attendance logs' },
      { id: 'attendance.edit', label: 'Correct past attendance', description: 'Modify past attendance records' },
    ]
  },
  {
    id: 'finance',
    title: 'Financials & Fees',
    items: [
      { id: 'fees.view', label: 'Access fee dashboard', description: 'Access financial summaries and dues' },
      { id: 'fees.collect', label: 'Process fee payments', description: 'Record and verify fee collections' },
      { id: 'fees.edit', label: 'Edit fee structures', description: 'Modify fee plans and discounts' },
      { id: 'fees.delete', label: 'Void/Delete receipts', description: 'Cancel or delete payment records' },
      { id: 'wallet.view', label: 'Institute Wallet', description: 'Access wallet transactions and balance' },
    ]
  },
  {
    id: 'communications',
    title: 'Communications',
    items: [
      { id: 'notifications.view', label: 'View notification logs', description: 'View history of sent alerts' },
      { id: 'notifications.send', label: 'Send broadcast alerts', description: 'Send WhatsApp/Email notifications' },
      { id: 'marketing.campaigns', label: 'Marketing Campaigns', description: 'Manage promotional campaigns and offers' },
    ]
  },
  {
    id: 'system',
    title: 'System & Team',
    items: [
      { id: 'reports.view', label: 'View operational reports', description: 'Access institute-wide performance data' },
      { id: 'reports.export', label: 'Download data exports', description: 'Download CSV/PDF reports' },
      { id: 'staff.view', label: 'View staff members', description: 'See directory of staff members' },
      { id: 'staff.manage', label: 'Manage staff & payroll', description: 'Add/Edit team members and permissions' },
      { id: 'settings.manage', label: 'Institute settings access', description: 'Access system-wide configuration' },
    ]
  }
];

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  teacher: ['attendance.mark', 'attendance.view', 'batches.view', 'students.view', 'notifications.view'],
  accountant: ['fees.view', 'fees.collect', 'fees.edit', 'batches.view', 'students.view', 'reports.view', 'staff.view'],
  admin: PERMISSION_GROUPS.flatMap(g => g.items.map(p => p.id)),
  custom: []
};

export default function StaffModal({ isOpen, onClose, staff, onSuccess }: StaffModalProps) {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'teacher' | 'accountant' | 'admin' | 'custom'>('teacher');
  const [baseSalary, setBaseSalary] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setPhone(staff.phone);
      setEmail(staff.email || '');
      setRole(staff.role);
      setBaseSalary(staff.baseSalary.toString());
      setPermissions(staff.permissions || []);
      setStatus(staff.status);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setRole('teacher');
      setBaseSalary('0');
      setPermissions(DEFAULT_PERMISSIONS['teacher']);
      setStatus('active');
    }
  }, [staff]);

  const handleRoleChange = (newRole: any) => {
    setRole(newRole);
    if (newRole !== 'custom') {
      setPermissions(DEFAULT_PERMISSIONS[newRole] || []);
    }
  };

  const togglePermission = (permId: string) => {
    if (role !== 'custom' && role !== 'admin') return;
    if (permissions.includes(permId)) {
      setPermissions(permissions.filter(p => p !== permId));
    } else {
      setPermissions([...permissions, permId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    // Step 1: Send OTP
    if (!staff && email && step === 'form') {
      setLoading(true); setError('');
      try {
        await api.post('/auth/otp/send-verification', { email: email.trim() });
        setStep('otp');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to send OTP. Please check the email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true); setError('');
    try {
      const payload: any = {
        name, phone, email: email || undefined,
        role, baseSalary: parseFloat(baseSalary) || 0,
        permissions: role === 'custom' || role === 'admin' ? permissions : DEFAULT_PERMISSIONS[role],
        status,
        otp: step === 'otp' ? otp : undefined,
      };

      if (staff) {
        await api.patch(`/staff/${staff.id}`, payload);
      } else {
        await api.post('/staff', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save staff member');
      if (err.response?.data?.error === 'Invalid OTP') {
         // stay on otp step
      } else {
         setStep('form');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-canvas rounded-[2rem] shadow-premium w-full max-w-3xl overflow-hidden animate-slide-up flex flex-col h-[85vh] border border-hairline">
        <div className="px-3 sm:px-8 py-6 border-b border-hairline flex items-center justify-between bg-surface/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-green/10 rounded-2xl">
              <Shield className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">
                {staff ? 'Edit Member Details' : 'Add New Member'}
              </h3>
              <p className="text-xs text-slate font-medium">
                {step === 'otp' ? 'Verify member email' : 'Manage details and what they can access'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate hover:text-ink hover:bg-surface rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-brand-error/10 border border-brand-error/20 rounded-xl text-brand-error text-xs font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          {step === 'form' && (
            <form id="staff-form" onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
              {/* Identity Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="mint-input w-full h-12" placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Phone Number</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="mint-input w-full h-12" placeholder="e.g. 9876543210" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="mint-input w-full h-12" placeholder="e.g. john@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Monthly Salary (₹)</label>
                  <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)}
                    className="mint-input w-full h-12 font-bold text-brand-green-deep" placeholder="0" />
                </div>
              </div>

              {/* Role Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Role / Job Title</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['teacher', 'accountant', 'admin', 'custom'].map((r) => (
                    <button key={r} type="button" onClick={() => handleRoleChange(r)}
                      className={`py-3 px-4 rounded-2xl border text-xs font-bold capitalize transition-all ${
                        role === r ? 'bg-ink text-white border-ink shadow-lg' : 'bg-surface/50 text-slate border-hairline hover:border-brand-green'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delegation Matrix */}
              <div className="space-y-8 border-t border-hairline pt-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-[11px] font-black text-ink uppercase tracking-[0.25em]">Responsibility Matrix</h4>
                    <p className="text-xs text-steel font-medium mt-2">Modular features allowed for this role.</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${role === 'custom' ? 'bg-brand-green/5 border-brand-green/20' : 'bg-surface border-hairline'}`}>
                    <div className={`w-2 h-2 rounded-full ${role === 'custom' ? 'bg-brand-green animate-pulse' : 'bg-stone opacity-30'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${role === 'custom' ? 'text-brand-green-deep' : 'text-stone opacity-60'}`}>
                      {role === 'custom' ? 'Custom Engine Unlocked' : 'Template Locked'}
                    </span>
                  </div>
                </div>

                <div className="space-y-12">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.id} className="space-y-6 animate-slide-up">
                      <div className="flex items-center justify-between border-b border-hairline pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-green/5 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-brand-green" />
                          </div>
                          <h4 className="text-xs font-black text-ink uppercase tracking-widest">{group.title}</h4>
                        </div>
                        {role === 'custom' && (
                          <button 
                            type="button"
                            onClick={() => {
                              const groupPerms = group.items.map(p => p.id);
                              const allSelected = groupPerms.every(p => permissions.includes(p));
                              if (allSelected) {
                                setPermissions(prev => prev.filter(p => !groupPerms.includes(p)));
                              } else {
                                setPermissions(prev => [...new Set([...prev, ...groupPerms])]);
                              }
                            }}
                            className="text-[9px] font-black text-brand-green uppercase tracking-widest hover:underline"
                          >
                            {group.items.every(p => permissions.includes(p.id)) ? 'Deselect Module' : 'Select Module'}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {group.items.map(({ id, label, description }) => {
                            const isSelected = permissions.includes(id);
                            const isDisabled = role !== 'custom' && role !== 'admin';
                            
                            return (
                              <div 
                                key={id} 
                                onClick={() => togglePermission(id)}
                                className={`flex flex-col text-left p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                                  isSelected ? 'bg-canvas border-brand-green shadow-premium-subtle' : 'bg-surface/30 border-hairline opacity-60 grayscale-[0.5]'
                                } ${isDisabled ? 'cursor-not-allowed' : 'hover:scale-[1.02] hover:border-brand-green hover:grayscale-0 cursor-pointer active:scale-95'}`}
                              >
                                {isSelected && (
                                  <div className="absolute top-0 right-0 p-1">
                                    <div className="w-3 h-3 bg-brand-green rounded-bl-lg" />
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-4 mb-3">
                                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    isSelected 
                                      ? 'bg-brand-green border-brand-green text-white shadow-[0_0_12px_rgba(0,212,164,0.3)]' 
                                      : 'bg-canvas border-hairline group-hover:border-slate'
                                  }`}>
                                    {isSelected && <Check className="w-4 h-4 stroke-[4]" />}
                                  </div>
                                  <span className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? 'text-ink' : 'text-slate'}`}>
                                    {label}
                                  </span>
                                </div>
                                <p className={`text-[10px] font-medium leading-relaxed ${isSelected ? 'text-slate' : 'text-stone'}`}>
                                  {description}
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form id="staff-form" onSubmit={handleSubmit} className="space-y-8 animate-fade-in text-center max-w-sm mx-auto mt-12">
              <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-green">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-ink uppercase tracking-widest mb-2">Verify Email</h3>
                <p className="text-xs text-slate">We've sent a 6-digit code to <span className="font-bold text-ink">{email}</span></p>
              </div>
              <div className="space-y-3 text-left">
                <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1">Verification Code</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  placeholder="••••••"
                  required
                  className="mint-input w-full h-16 text-center text-2xl tracking-[0.5em] font-mono" 
                />
              </div>
              <button type="button" onClick={() => setStep('form')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate hover:text-ink">
                Back to Edit Details
              </button>
            </form>
          )}
        </div>

        <div className="px-3 sm:px-8 py-6 border-t border-hairline bg-surface/30 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-6 py-3 text-xs font-bold text-slate hover:text-ink transition-all">Cancel</button>
          <button form="staff-form" type="submit" disabled={loading || (step === 'otp' && otp.length !== 6)}
            className="mint-btn-primary flex items-center gap-2 px-3 sm:px-8 py-3 rounded-2xl">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {step === 'form' && email && !staff ? 'Send Verification' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
