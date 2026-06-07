import { useState, useEffect } from 'react';
import { X, User, Users, BookOpen, ShieldAlert, ArrowRight, Loader2, Mail } from 'lucide-react';
import api from '../../../../lib/api';

interface Student {
  id: string; name: string; phone: string; email: string | null; status: string;
  photoUrl: string | null; dob: string | null; createdAt: string;
  profile: { id: string; studentCode: string; parentName: string | null; parentPhone: string | null; enrolledAt: string; balance?: number } | null;
  batches: { id: string; name: string; subject: string | null }[];
}

interface Batch { id: string; name: string; subject: string | null; feePlanId?: string; admissionFee: number | string }
interface FeePlan { id: string; name: string; amount: string; frequency: string }

interface StudentModalProps {
  student?: Student | null;
  onClose: () => void;
  onSaved: (s?: Student) => void;
  initialBatchId?: string | null;
}

export default function StudentModal({ student, onClose, onSaved, initialBatchId }: StudentModalProps) {
  const isEdit = !!student;
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  
  const [form, setForm] = useState({ 
    name: student?.name || '', 
    phone: student?.phone || '', 
    email: student?.email || '', 
    dob: student?.dob ? new Date(student.dob).toISOString().split('T')[0] : '', 
    parentName: student?.profile?.parentName || '', 
    parentPhone: student?.profile?.parentPhone || '', 
    batchIds: student?.batches?.map(b => b.id) || (initialBatchId ? [initialBatchId] : []) as string[], 
    feePlanId: ''
  });
  const [batches, setBatches] = useState<Batch[]>([]);
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/batches'),
      api.get('/fee-plans')
    ]).then(([{ data: bData }, { data: fData }]) => {
      setBatches(bData.data);
      setFeePlans(fData.data);
    }).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleBatch = (id: string) => {
    setForm(prev => ({
      ...prev,
      batchIds: prev.batchIds.includes(id) ? prev.batchIds.filter(b => b !== id) : [...prev.batchIds, id],
    }));
  };

  const calculateFees = () => {
    const selectedBatches = batches.filter(b => form.batchIds.includes(b.id));
    const admissionTotal = selectedBatches.reduce((sum, b) => sum + Number(b.admissionFee || 0), 0);
    const selectedPlan = feePlans.find(fp => fp.id === form.feePlanId);
    const recurringAmount = selectedPlan ? Number(selectedPlan.amount) : 0;
    
    return {
      admissionTotal,
      recurringAmount,
      recurringFrequency: selectedPlan?.frequency || 'monthly',
      totalInitial: admissionTotal + recurringAmount
    };
  };

  const feeSummary = calculateFees();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setError('Please enter Name and Phone number'); return; }
    
    if (!isEdit && form.email && step === 'form') {
      setLoading(true); setError('');
      try {
        await api.post('/auth/otp/send-verification', { email: form.email.trim() });
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
        name: form.name.trim(), 
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        dob: form.dob || undefined,
        parentName: form.parentName.trim() || undefined,
        parentPhone: form.parentPhone.trim() || undefined,
        batchIds: form.batchIds.length > 0 ? form.batchIds : undefined,
        feePlanId: form.feePlanId || undefined,
        otp: step === 'otp' ? otp : undefined
      };

      if (isEdit) {
        await api.patch(`/students/${student!.id}`, payload);
        onSaved();
      } else {
        const res = await api.post('/students', payload);
        onSaved(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save student record');
      if (err.response?.data?.error === 'Invalid OTP') {
      } else {
         setStep('form');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 backdrop-blur-md p-2 sm:p-4 animate-fade-in overflow-hidden" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-canvas rounded-lg shadow-premium overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh] animate-slide-up border border-hairline" 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 sm:px-10 py-5 sm:py-10 border-b border-hairline flex items-center justify-between bg-canvas sticky top-0 z-20">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-ink tracking-tight uppercase tracking-widest">{isEdit ? 'Edit Profile' : 'Register Student'}</h2>
            <p className="text-[9px] sm:text-[10px] font-black text-slate mt-1 sm:mt-2 uppercase tracking-[0.2em] opacity-60">
              {step === 'otp' ? 'Verify student email' : 'Fill in details to enroll in classes.'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-stone hover:text-ink hover:bg-surface rounded-full transition-all">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-12 space-y-8 sm:space-y-12 custom-scrollbar">
          {error && (
            <div className="p-4 sm:p-5 bg-brand-error/10 border border-brand-error/20 rounded-md text-brand-error text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          {step === 'form' && (
            <form id="student-form" onSubmit={handleSubmit} className="space-y-8 sm:space-y-12 animate-fade-in">
              <FormSection icon={User} title="Basic Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3 sm:gap-8">
                  <Field label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="Student's Name" />
                  <Field label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required placeholder="Contact Number" />
                  <Field label="Email Address" name="email" value={form.email} onChange={handleChange} type="email" required placeholder="email@example.com" />
                  <Field label="Date of Birth" name="dob" value={form.dob} onChange={handleChange} type="date" />
                </div>
              </FormSection>

              <FormSection icon={Users} title="Parent / Guardian Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3 sm:gap-8">
                  <Field label="Parent's Name" name="parentName" value={form.parentName} onChange={handleChange} placeholder="Name" />
                  <Field label="Parent's Phone" name="parentPhone" value={form.parentPhone} onChange={handleChange} placeholder="Contact Number" />
                </div>
              </FormSection>

              <FormSection icon={BookOpen} title="Class Selection">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1 opacity-60">Choose Classes / Batches</label>
                  <div className="flex flex-wrap gap-2">
                    {batches.map(b => (
                      <button 
                        key={b.id} type="button" onClick={() => toggleBatch(b.id)}
                        className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all ${
                          form.batchIds.includes(b.id) 
                            ? 'bg-ink border-ink text-canvas shadow-lg' 
                            : 'bg-canvas border-hairline text-stone hover:border-ink'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-8 sm:pt-10 border-t border-hairline mt-8 sm:mt-10">
                  <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1 opacity-60">Fee Structure</label>
                  <div className="relative">
                    <select 
                      name="feePlanId" value={form.feePlanId} onChange={handleChange} 
                      className="mint-input w-full h-12 sm:h-14 pl-4 sm:pl-5 pr-10 appearance-none cursor-pointer text-[10px] font-black uppercase tracking-widest"
                    >
                      <option value="">{isEdit ? 'Keep Current Structure' : 'Use Class Default Fee'}</option>
                      {feePlans
                        .filter(fp => {
                          const isDefaultFee = fp.name.toLowerCase().includes('default fee');
                          if (form.batchIds.length === 0) return !isDefaultFee;
                          const isDefaultOfSelected = batches.some(b => b.feePlanId === fp.id && form.batchIds.includes(b.id));
                          return isDefaultOfSelected || !isDefaultFee;
                        })
                        .map(fp => (
                          <option key={fp.id} value={fp.id}>{fp.name} (₹{fp.amount}/{fp.frequency.toUpperCase()})</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone">
                      <ArrowRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>

                  {/* Fee Summary Card */}
                  {(feeSummary.admissionTotal > 0 || feeSummary.recurringAmount > 0) && (
                    <div className="mt-8 bg-surface/50 border border-hairline rounded-2xl p-6 sm:p-3 sm:p-8 animate-fade-in">
                       <h4 className="text-[10px] font-black text-ink uppercase tracking-widest mb-6 opacity-60">Investment Summary</h4>
                       <div className="space-y-4">
                          {feeSummary.admissionTotal > 0 && (
                            <div className="flex justify-between items-center">
                               <p className="text-xs font-medium text-slate uppercase tracking-widest">One-time Admission</p>
                               <p className="text-sm font-black text-ink font-mono">₹{feeSummary.admissionTotal.toLocaleString()}</p>
                            </div>
                          )}
                          {feeSummary.recurringAmount > 0 && (
                            <div className="flex justify-between items-center">
                               <p className="text-xs font-medium text-slate uppercase tracking-widest">{feeSummary.recurringFrequency} Fee</p>
                               <p className="text-sm font-black text-ink font-mono">₹{feeSummary.recurringAmount.toLocaleString()}</p>
                            </div>
                          )}
                          <div className="pt-4 border-t border-hairline flex justify-between items-center">
                             <p className="text-xs font-black text-ink uppercase tracking-widest">Total Initial Payment</p>
                             <p className="text-xl font-black text-brand-green font-mono">₹{feeSummary.totalInitial.toLocaleString()}</p>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </FormSection>
            </form>
          )}

          {step === 'otp' && (
            <form id="student-form" onSubmit={handleSubmit} className="space-y-8 animate-fade-in text-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-green">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-ink uppercase tracking-widest mb-2">Verify Email</h3>
                <p className="text-xs text-slate">We've sent a 6-digit code to <span className="font-bold text-ink">{form.email}</span></p>
              </div>
              <div className="space-y-3 text-left">
                <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1">Verification Code</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  placeholder="••••••"
                  required
                  className="mint-input w-full h-14 sm:h-16 text-center text-xl sm:text-2xl tracking-[0.5em] font-mono" 
                />
              </div>
              <button type="button" onClick={() => setStep('form')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate hover:text-ink">
                Back to Edit Details
              </button>
            </form>
          )}
        </div>

        <div className="px-5 sm:px-12 py-5 sm:py-10 bg-surface/50 border-t border-hairline flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-6 sticky bottom-0 z-20">
          <button type="button" onClick={onClose} className="order-2 sm:order-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate hover:text-ink transition-all py-3 sm:py-0">
            Cancel
          </button>
          <button 
            form="student-form" type="submit" disabled={loading || (step === 'otp' && otp.length !== 6)}
            className="order-1 sm:order-2 mint-btn-primary h-12 sm:h-14 px-10 sm:px-12 text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-brand-green/10"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
               <>{step === 'form' && form.email && !isEdit ? 'Send Verification' : 'Save Student'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ icon: Icon, title, children }: any) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-hairline">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-surface text-brand-tag flex items-center justify-center border border-hairline shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <h3 className="text-[10px] sm:text-[11px] font-black text-ink uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <div className="space-y-6 sm:space-y-8">{children}</div>
    </div>
  );
}

function Field({ label, name, value, onChange, required, type = 'text', placeholder }: any) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1">{label} {required && <span className="text-brand-error">*</span>}</label>
      <input 
        type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="mint-input w-full h-11 sm:h-14 text-sm" 
      />
    </div>
  );
}
