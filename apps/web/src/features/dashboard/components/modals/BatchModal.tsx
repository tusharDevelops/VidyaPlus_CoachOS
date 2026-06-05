import { useState, useEffect } from 'react';
import { X, BookOpen, IndianRupee, Calendar, Ticket, RefreshCcw, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../../../lib/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Batch {
  id: string;
  name: string;
  subject: string | null;
  room: string | null;
  daysJson: string[];
  startTime: string;
  endTime: string;
  capacity: number;
  status: string;
  teacher?: { id: string; name: string } | null;
  teacherId?: string | null;
  admissionFee?: string | number;
  feePlan?: { amount: string; frequency: string } | null;
}

interface BatchModalProps {
  batch?: Batch | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function BatchModal({ batch, onClose, onSaved }: BatchModalProps) {
  const isEdit = !!batch;
  const [form, setForm] = useState({ 
    name: batch?.name || '', 
    subject: batch?.subject || '', 
    room: batch?.room || '', 
    startTime: batch?.startTime || '09:00', 
    endTime: batch?.endTime || '10:00', 
    capacity: batch?.capacity?.toString() || '30', 
    daysJson: batch?.daysJson || [] as string[],
    admissionFee: batch?.admissionFee?.toString() || '',
    feeAmount: batch?.feePlan?.amount || '', 
    feeType: batch?.feePlan?.frequency || 'monthly',
    teacherId: batch?.teacher?.id || batch?.teacherId || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data } = await api.get('/staff');
        setStaffList(data.data || []);
      } catch (err) {
        console.error('Failed to fetch staff for teacher assignment', err);
      }
    };
    fetchStaff();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      daysJson: prev.daysJson.includes(day) ? prev.daysJson.filter(d => d !== day) : [...prev.daysJson, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.daysJson.length === 0) { setError('Schedule must include at least one operation day'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        teacherId: form.teacherId || null,
        capacity: parseInt(form.capacity),
        admissionFee: form.admissionFee ? parseFloat(form.admissionFee) : undefined,
        feeAmount: form.feeAmount ? parseFloat(form.feeAmount) : undefined,
        feeType: form.feeAmount ? form.feeType : undefined,
        subject: form.subject || undefined,
        room: form.room || undefined,
      };

      if (isEdit) {
        await api.patch(`/batches/${batch!.id}`, payload);
      } else {
        await api.post('/batches', payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error || 'System failed to deploy batch config');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 backdrop-blur-md p-2 sm:p-4 animate-fade-in overflow-hidden" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-canvas rounded-lg shadow-premium overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-slide-up border border-hairline" 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-3 sm:px-3 sm:px-8 py-5 sm:py-6 border-b border-hairline flex items-center justify-between bg-canvas sticky top-0 z-20">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-ink tracking-tight uppercase tracking-[0.05em]">{isEdit ? 'Edit Class Details' : 'Add New Class'}</h2>
            <p className="text-[9px] font-black text-slate mt-1 uppercase tracking-[0.2em] opacity-50">Set up class name, fees, and weekly schedule.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-stone hover:text-ink hover:bg-surface rounded-lg transition-all border border-transparent hover:border-hairline">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-3 sm:p-8 space-y-8 sm:space-y-10 custom-scrollbar">
          {error && (
            <div className="p-4 sm:p-5 bg-brand-error/10 border border-brand-error/20 rounded-md text-brand-error text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          <form id="batch-form" onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
            <FormSection icon={BookOpen} title="Class Details">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                 <Field label="Class / Batch Name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Physics Morning" />
                 <Field label="Subject" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Physics" />
                 <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1 opacity-70">Max Students (Strength)</label>
                       <input 
                          type="number" name="capacity" value={form.capacity} onChange={handleChange}
                          className="mint-input w-full h-11 sm:h-12 text-sm" 
                          placeholder="e.g. 30"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1 opacity-70">Assigned Teacher</label>
                        <select 
                           name="teacherId" value={form.teacherId} onChange={handleChange}
                           className="mint-input w-full h-11 sm:h-12 text-sm appearance-none bg-canvas"
                        >
                           <option value="">Select Teacher</option>
                           {staffList.map(s => (
                             <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                           ))}
                        </select>
                    </div>
                 </div>
               </div>
            </FormSection>

            <FormSection icon={IndianRupee} title="Fee Structure">
               <div className="p-4 sm:p-6 bg-surface/30 rounded-xl border border-hairline space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-3 sm:gap-8">
                     <div className="space-y-2.5">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate uppercase tracking-widest ml-1 opacity-70">
                           <Ticket className="w-3.5 h-3.5 text-brand-tag" /> One-time / Admission Fee
                        </label>
                        <input 
                           type="number" name="admissionFee" value={form.admissionFee} onChange={handleChange}
                           className="mint-input w-full h-12 font-mono text-base sm:text-lg"
                           placeholder="0.00"
                        />
                     </div>
                     <div className="space-y-2.5">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate uppercase tracking-widest ml-1 opacity-70">
                           <RefreshCcw className="w-3.5 h-3.5 text-brand-tag" /> Regular / Tuition Fee
                        </label>
                        <div className="flex flex-col xs:flex-row gap-2">
                           <input 
                              type="number" name="feeAmount" value={form.feeAmount} onChange={handleChange}
                              className="flex-1 mint-input h-12 font-mono text-base sm:text-lg"
                              placeholder="0.00"
                           />
                           <select 
                              name="feeType" value={form.feeType} onChange={handleChange}
                              className="w-full xs:w-32 sm:w-36 mint-input h-12 uppercase tracking-widest font-black text-[10px]"
                           >
                              <option value="monthly">Monthly</option>
                              <option value="one-time">Total</option>
                           </select>
                        </div>
                     </div>
                  </div>
               </div>
            </FormSection>

            <FormSection icon={Calendar} title="Schedule">
               <div className="space-y-8 sm:space-y-10">
                  <div className="space-y-4">
                     <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1">Days of the Week</label>
                     <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {DAYS.map(d => (
                           <button 
                              key={d} type="button" onClick={() => toggleDay(d)}
                              className={`flex-1 min-w-[70px] sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all ${
                                 form.daysJson.includes(d) 
                                    ? 'bg-ink border-ink text-canvas shadow-lg' 
                                    : 'bg-canvas border-hairline text-stone hover:border-ink'
                              }`}
                           >
                              {d}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                     <Field label="Start Time" name="startTime" value={form.startTime} onChange={handleChange} type="time" required />
                     <Field label="End Time" name="endTime" value={form.endTime} onChange={handleChange} type="time" required />
                  </div>
                  <Field label="Location / Room Name" name="room" value={form.room} onChange={handleChange} placeholder="e.g. Room 101 or Online" />
               </div>
            </FormSection>
          </form>
        </div>

        <div className="px-3 sm:px-3 sm:px-8 py-5 sm:py-6 bg-canvas border-t border-hairline flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-6 sticky bottom-0 z-20">
          <button type="button" onClick={onClose} className="order-2 sm:order-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate hover:text-ink transition-all py-3 sm:py-0">
            Cancel
          </button>
          <button 
            form="batch-form" type="submit" disabled={loading}
            className="order-1 sm:order-2 mint-btn-primary h-12 sm:h-12 px-10 text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-brand-green/10"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ icon: Icon, title, children }: any) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-hairline">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface text-brand-tag flex items-center justify-center border border-hairline shrink-0">
          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
        <h3 className="text-[10px] font-black text-ink uppercase tracking-[0.15em]">{title}</h3>
      </div>
      <div className="space-y-5 sm:space-y-6">{children}</div>
    </div>
  );
}

function Field({ label, name, value, onChange, required, type = 'text', placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1 opacity-70">{label} {required && <span className="text-brand-error">*</span>}</label>
      <input 
        type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="mint-input w-full h-11 sm:h-12 text-sm" 
      />
    </div>
  );
}
