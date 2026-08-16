import { useState, useEffect } from 'react';
import { BookOpen, Users, Loader2, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { DrillDepth } from '../types';
import api from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth.store';
import LoadMore from '../../../components/LoadMore';
import BatchModal from '../components/modals/BatchModal';

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
  enrolledStudents: number;
}

interface StaffBatchesLayerProps {
  onNavigate: (depth: DrillDepth, data?: { batchId?: string }) => void;
}

export default function StaffBatchesLayer({ onNavigate }: StaffBatchesLayerProps) {
  const { hasPermission } = useAuthStore();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const fetchBatches = async (p = 1, append = false) => {
    setLoading(true);
    try {
      const { data } = await api.get('/batches', { params: { page: p, limit: 20, status: activeTab } });
      setBatches(prev => append ? [...prev, ...data.data] : data.data);
      if (data.meta) {
        setHasMore(data.meta.page < data.meta.totalPages);
        setTotal(data.meta.total);
        setPage(data.meta.page);
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => fetchBatches(page + 1, true);

  useEffect(() => {
    fetchBatches(1);
  }, [activeTab]);

  const deleteBatch = async (id: string) => {
    if (!hasPermission('batches.edit')) return;
    if (!window.confirm('Archive this batch? Enrolled students will be deactivated.')) return;
    try {
      await api.delete(`/batches/${id}`);
      fetchBatches();
    } catch (err) {
      alert('Operation failed');
    }
  };

  if (loading && batches.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" onClick={() => setActiveMenu(null)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Management Explorer / Batches</h2>
        {hasPermission('batches.edit') && (
          <button 
            className="mint-btn-brand py-2 px-4 text-xs"
            onClick={() => { setSelectedBatch(null); setShowBatchModal(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Batch
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline gap-8">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-colors ${
            activeTab === 'active' 
              ? 'text-brand-green border-b-2 border-brand-green' 
              : 'text-stone hover:text-ink'
          }`}
        >
          Active Classes
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-colors ${
            activeTab === 'completed' 
              ? 'text-ink border-b-2 border-ink' 
              : 'text-stone hover:text-ink'
          }`}
        >
          Past / Completed
        </button>
      </div>
      
      {batches.length === 0 ? (
        <div className="mint-card py-12 text-center border-dashed">
          <p className="text-steel mb-4">
            {activeTab === 'completed' ? 'No past batches found.' : 'No active batches found.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <div 
                key={batch.id}
                className="bg-canvas border border-hairline rounded-lg p-5 flex flex-col hover:border-brand-green/30 transition-all group relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-surface border border-hairline flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-charcoal" />
                  </div>
                  
                  {hasPermission('batches.edit') && (
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === batch.id ? null : batch.id); }}
                        className={`p-1.5 rounded-md transition-all ${activeMenu === batch.id ? 'bg-ink text-canvas' : 'text-steel hover:bg-surface'}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {activeMenu === batch.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-canvas rounded-md shadow-premium border border-hairline z-20 py-1 animate-slide-up origin-top-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedBatch(batch); setShowBatchModal(true); setActiveMenu(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ink hover:bg-surface transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteBatch(batch.id); setActiveMenu(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-error hover:bg-brand-error/5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="cursor-pointer" onClick={() => onNavigate('STUDENTS', { batchId: batch.id })}>
                  <h3 className="font-bold text-ink mb-1 truncate group-hover:text-brand-green-deep transition-colors">{batch.name}</h3>
                  <p className="text-xs text-steel mb-4 uppercase tracking-wider font-semibold">
                    {batch.subject || 'General'} • {batch.startTime} - {batch.endTime}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-hairline-soft gap-3">
                    <div className="flex items-center text-xs font-bold text-steel uppercase tracking-widest">
                      <Users className="w-3.5 h-3.5 mr-1.5" />
                      <span>{batch.enrolledStudents} Students</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate('EXAMS', { batchId: batch.id }); }}
                        className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/20 transition-all"
                      >
                        Exams
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate('ATTENDANCE', { batchId: batch.id }); }}
                        className="px-3 py-1.5 bg-brand-green/10 text-brand-green-deep rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-brand-green/20 transition-all"
                      >
                        Attendance
                      </button>
                      <span className="text-xs font-bold text-brand-green-deep ml-1 hidden sm:inline">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <LoadMore hasMore={hasMore} loading={loading} onLoadMore={loadMore} total={total} loaded={batches.length} />
        </>
      )}
      
      {showBatchModal && (
        <BatchModal
          batch={selectedBatch}
          onClose={() => { setShowBatchModal(false); setSelectedBatch(null); }}
          onSaved={() => { setShowBatchModal(false); setSelectedBatch(null); fetchBatches(); }}
        />
      )}
    </div>
  );
}
