import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import {
  Plus, BookOpen, Users, Clock, Calendar, MapPin,
  Loader2, MoreVertical, Ticket, RefreshCcw, Edit2, Trash2
} from 'lucide-react';
import BatchModal from '../dashboard/components/modals/BatchModal.tsx';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Batch {
  id: string; name: string; subject: string | null; room: string | null;
  daysJson: string[]; startTime: string; endTime: string; capacity: number; status: string;
  teacher: { id: string; name: string } | null; enrolledStudents: number; createdAt: string;
  admissionFee?: string | number;
  feePlan?: { amount: string; frequency: string } | null;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBatch, setEditBatch] = useState<Batch | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/batches');
      setBatches(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const deleteBatch = async (id: string) => {
    if (!window.confirm('Archive this batch? Enrolled students will be deactivated.')) return;
    try {
      await api.delete(`/batches/${id}`);
      fetchBatches();
    } catch (err) { alert('Operation failed'); }
  };

  return (
    <div className="space-y-10 animate-fade-in" onClick={() => setActiveMenu(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-hairline pb-10">
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight uppercase tracking-widest">Classes / Batches</h1>
          <p className="text-sm text-slate mt-1">Manage your class schedules and fee structures.</p>
        </div>
        <button 
          onClick={() => { setEditBatch(null); setShowModal(true); }} 
          className="mint-btn-primary h-12 px-3 sm:px-8 text-[10px] uppercase tracking-[0.2em]"
        >
          <Plus className="w-4 h-4" /> Add New Class
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mint-card h-64 animate-pulse bg-surface/50" />
          ))}
        </div>
      ) : batches.length === 0 ? (
        <div className="mint-card py-24 text-center flex flex-col items-center border-dashed">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-6 border border-hairline text-stone">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-ink uppercase tracking-widest">No Classes Found</h3>
          <p className="text-xs text-slate mt-2 mb-8 max-w-xs mx-auto">Add your first class to start enrolling students and managing schedules.</p>
          <button onClick={() => { setEditBatch(null); setShowModal(true); }} className="text-brand-green font-black text-xs uppercase tracking-widest hover:underline">
            + Add First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {batches.map(batch => {
             const occupancy = (batch.enrolledStudents / batch.capacity) * 100;
             const isFull = occupancy >= 95;
             return (
              <div key={batch.id} className="mint-card p-0 flex flex-col group relative overflow-hidden bg-canvas">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-green/5 blur-3xl -mr-20 -mt-20 pointer-events-none" />
                
                <div className="p-3 sm:p-8 pb-4">
                  <div className="flex items-start justify-between mb-6">
                      <div className="space-y-2 overflow-hidden">
                         <h3 className="text-lg font-black text-ink truncate tracking-tight">{batch.name}</h3>
                         <span className="mint-badge !rounded-md px-1.5 py-0.5 text-[9px] bg-surface text-brand-tag border-hairline">
                           {batch.subject || 'GENERAL_CORE'}
                         </span>
                      </div>
                      
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === batch.id ? null : batch.id); }}
                          className={`p-2.5 rounded-lg transition-all border flex items-center justify-center ${
                            activeMenu === batch.id 
                              ? 'bg-ink text-canvas border-ink shadow-lg scale-110' 
                              : 'bg-surface text-stone border-hairline hover:text-ink hover:border-stone active:scale-90'
                          }`}
                        >
                           <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenu === batch.id && (
                          <div className="absolute right-0 mt-3 w-48 bg-canvas rounded-lg shadow-premium border border-hairline z-50 py-2 animate-slide-up origin-top-right">
                             <button 
                               onClick={(e) => { e.stopPropagation(); setEditBatch(batch); setShowModal(true); setActiveMenu(null); }}
                               className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-ink hover:bg-surface transition-colors"
                             >
                               <Edit2 className="w-3.5 h-3.5" /> Edit Class
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); deleteBatch(batch.id); setActiveMenu(null); }}
                               className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-brand-error hover:bg-brand-error/5 transition-colors"
                             >
                               <Trash2 className="w-3.5 h-3.5" /> Stop / Deactivate Class
                             </button>
                          </div>
                        )}
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                     <div className="p-4 bg-surface rounded-md border border-hairline group-hover:border-ink transition-colors">
                        <p className="text-[8px] font-black text-slate uppercase tracking-widest mb-1 flex items-center gap-1.5 opacity-60">
                          <Ticket className="w-2.5 h-2.5" /> One-time Fee
                        </p>
                        <p className="text-sm font-black text-ink font-mono tracking-tighter">₹{batch.admissionFee || '0'}</p>
                     </div>
                     <div className="p-4 bg-brand-green-soft rounded-md border border-brand-green/10 group-hover:border-brand-green transition-colors">
                        <p className="text-[8px] font-black text-brand-green-deep uppercase tracking-widest mb-1 flex items-center gap-1.5 opacity-60">
                          <RefreshCcw className="w-2.5 h-2.5" /> Regular Fee
                        </p>
                        <p className="text-sm font-black text-brand-green-deep font-mono tracking-tighter">₹{batch.feePlan?.amount || '0'}</p>
                     </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-8">
                    {DAYS.map(day => {
                      const isActive = (batch.daysJson as string[]).includes(day);
                      return (
                        <span 
                          key={day} 
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-black transition-all border ${
                            isActive 
                              ? 'bg-ink text-canvas border-ink shadow-sm' 
                              : 'bg-canvas text-stone border-hairline opacity-40'
                          }`}
                        >
                          {day.charAt(0)}
                        </span>
                      );
                    })}
                  </div>

                  <div className="space-y-3 mb-8">
                     <div className="flex items-center gap-3 text-[10px] font-black text-slate uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5 text-brand-tag" />
                        <span>{batch.startTime} — {batch.endTime}</span>
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-black text-slate uppercase tracking-widest">
                        <MapPin className="w-3.5 h-3.5 text-brand-tag" />
                        <span className="truncate">{batch.room || 'ONLINE_CLASS'}</span>
                     </div>
                  </div>
                </div>

                <div className="mt-auto px-3 sm:px-8 py-6 bg-surface/50 border-t border-hairline space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-stone" /> Capacity ({batch.enrolledStudents}/{batch.capacity})
                      </span>
                      <span className={`text-[10px] font-black font-mono tracking-tighter ${isFull ? 'text-brand-error' : 'text-ink'}`}>
                        {Math.round(occupancy)}%
                      </span>
                   </div>
                   <div className="h-1.5 w-full bg-canvas rounded-full overflow-hidden border border-hairline">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-in-out ${
                          isFull ? 'bg-brand-error' : occupancy > 80 ? 'bg-amber-500' : 'bg-brand-green shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        }`} 
                        style={{ width: `${Math.min(occupancy, 100)}%` }} 
                      />
                   </div>
                </div>
              </div>
             );
          })}
        </div>
      )}

      {showModal && (
        <BatchModal 
          batch={editBatch} 
          onClose={() => { setShowModal(false); setEditBatch(null); }} 
          onSaved={() => { setShowModal(false); setEditBatch(null); fetchBatches(); }} 
        />
      )}
    </div>
  );
}
