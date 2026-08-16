import { useState, useEffect } from 'react';
import { User, Search, Loader2, Plus, MoreVertical, Edit2, Trash2, UserMinus } from 'lucide-react';
import { DrillDepth } from '../types';
import api from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth.store';
import LoadMore from '../../../components/LoadMore';
import StudentModal from '../components/modals/StudentModal';

interface Student {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  photoUrl: string | null;
  dob: string | null;
  createdAt: string;
  profile: { id: string; studentCode: string; parentName: string | null; parentPhone: string | null; enrolledAt: string; balance?: number } | null;
  batches: { id: string; name: string; subject: string | null }[];
}

interface StaffStudentsLayerProps {
  batchId: string | null;
  onNavigate: (depth: DrillDepth, data?: { studentId?: string }) => void;
}

export default function StaffStudentsLayer({ batchId, onNavigate }: StaffStudentsLayerProps) {
  const { hasPermission } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchStudents = async (p: number = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/students', { 
        params: { batchId, search, page: p, limit: 20 } 
      });
      setStudents(prev => p === 1 ? data.data : [...prev, ...data.data]);
      if (data.meta) {
        setHasMore(data.meta.page < data.meta.totalPages);
        setTotal(data.meta.total);
      }
      setPage(p);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchStudents(1);
  }, [batchId, search]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchStudents(page + 1);
    }
  };

  const deleteStudent = async (id: string) => {
    if (!hasPermission('students.delete')) return;
    if (!window.confirm('Remove this student from the system? This will also remove them from all batches.')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert('Delete operation failed');
    }
  };

  const removeFromBatch = async (studentId: string) => {
    if (!batchId || !hasPermission('batches.edit')) return;
    if (!window.confirm('Unenroll this student from the current batch?')) return;
    try {
      await api.post(`/batches/${batchId}/unenroll/${studentId}`);
      fetchStudents();
    } catch (err) {
      alert('Unenrollment failed');
    }
  };

  return (
    <div className="space-y-6" onClick={() => setActiveMenu(null)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-ink">Batch Students</h2>
          {hasPermission('students.add') && (
            <button 
              className="mint-btn-brand py-1.5 px-3 text-[10px]"
              onClick={() => { setSelectedStudent(null); setShowStudentModal(true); }}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Enroll Student
            </button>
          )}
        </div>
        
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel" />
          <input 
            type="text" 
            placeholder="Search within batch..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mint-input w-full pl-9 h-10 text-xs"
          />
        </div>
      </div>

      {loading && students.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="mint-card py-12 text-center border-dashed">
          <p className="text-steel mb-4">No students enrolled in this batch.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center p-4 bg-canvas border border-hairline rounded-lg hover:border-brand-green/30 transition-all text-left group relative"
              >
                <div 
                  className="flex flex-1 items-center cursor-pointer min-w-0"
                  onClick={() => onNavigate('STUDENT_DETAIL', { studentId: student.id })}
                >
                  <div className="w-12 h-12 rounded-lg bg-surface border border-hairline flex items-center justify-center mr-4 group-hover:bg-brand-green/10 transition-colors shrink-0 overflow-hidden">
                    {student.photoUrl ? (
                      <img src={student.photoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-charcoal group-hover:text-brand-green-deep" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink truncate group-hover:text-brand-green-deep transition-colors">{student.name}</h3>
                    <p className="text-[10px] font-bold text-steel uppercase tracking-wider">ID: {student.profile?.studentCode || 'N/A'}</p>
                  </div>
                </div>

                {(hasPermission('students.edit') || hasPermission('students.delete')) && (
                  <div className="relative ml-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === student.id ? null : student.id); }}
                      className={`p-1.5 rounded-md transition-all ${activeMenu === student.id ? 'bg-ink text-canvas' : 'text-steel hover:bg-surface'}`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {activeMenu === student.id && (
                      <div className="absolute right-0 mt-2 w-44 bg-canvas rounded-md shadow-premium border border-hairline z-20 py-1 animate-slide-up origin-top-right">
                        {hasPermission('students.edit') && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setShowStudentModal(true); setActiveMenu(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ink hover:bg-surface transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                          </button>
                        )}
                        {batchId && hasPermission('batches.edit') && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeFromBatch(student.id); setActiveMenu(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-warn hover:bg-brand-warn/5 transition-colors"
                          >
                            <UserMinus className="w-3.5 h-3.5" /> Unenroll from Batch
                          </button>
                        )}
                        {hasPermission('students.delete') && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteStudent(student.id); setActiveMenu(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-error hover:bg-brand-error/5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Student
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <LoadMore hasMore={hasMore} loading={loading} onLoadMore={loadMore} total={total} loaded={students.length} />
        </>
      )}
      
      {showStudentModal && (
        <StudentModal
          student={selectedStudent}
          onClose={() => { setShowStudentModal(false); setSelectedStudent(null); }}
          onSaved={() => { setShowStudentModal(false); setSelectedStudent(null); fetchStudents(1); }}
          initialBatchId={batchId}
        />
      )}
    </div>
  );
}
