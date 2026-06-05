import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  Search, Plus, X, Users, Phone, Filter,
  Loader2, Mail, MoreVertical, BookOpen, Receipt, 
  Edit2, Trash2, ShieldAlert, CheckCircle2, 
  ExternalLink, Ban, UserCheck, MessageSquare, User,
  IndianRupee, Printer, ArrowRight, Sparkles, Info
} from 'lucide-react';
import FeeCollectionDrawer from '../fees/components/FeeCollectionDrawer';
import StudentModal from '../dashboard/components/modals/StudentModal.tsx';

interface Student {
  id: string; name: string; phone: string; email: string | null; status: string;
  photoUrl: string | null; dob: string | null; createdAt: string;
  profile: { id: string; studentCode: string; parentName: string | null; parentPhone: string | null; enrolledAt: string; balance?: number } | null;
  batches: { id: string; name: string; subject: string | null }[];
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<Student | null>(null);

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/students', { params });
      setStudents(data.data);
      setMeta(data.meta);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const toggleStatus = async (student: Student) => {
    try {
      const newStatus = student.status === 'active' ? 'inactive' : 'active';
      await api.patch(`/students/${student.id}`, { status: newStatus });
      fetchStudents(meta.page);
      setActiveMenu(null);
    } catch (err) { console.error('Status update failed'); }
  };

  const deleteStudent = async (id: string) => {
    if (!window.confirm('Archive this student record permanently?')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents(meta.page);
      setActiveMenu(null);
    } catch (err) { console.error('Delete failed'); }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 lg:pb-0" onClick={() => setActiveMenu(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-hairline pb-10">
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight uppercase tracking-widest">Student Directory</h1>
          <p className="text-sm text-slate mt-1">Manage student profiles, class enrollments, and payment status.</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setEditStudent(null); setShowModal(true); }} 
          className="mint-btn-primary h-12 px-3 sm:px-8 text-[10px] uppercase tracking-[0.2em]"
        >
          <Plus className="w-4 h-4" /> Add New Student
        </button>
      </div>

      {/* High-Precision Control Bar */}
      <div className="flex flex-col md:flex-row gap-4" onClick={e => e.stopPropagation()}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
          <input 
            type="text" 
            placeholder="SEARCH BY NAME, PHONE, OR ID..."
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="mint-input w-full h-12 pl-11 text-[10px] uppercase tracking-widest font-black" 
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone pointer-events-none" />
             <select 
               value={statusFilter} 
               onChange={e => setStatusFilter(e.target.value)}
               className="mint-input h-12 pl-10 pr-10 min-w-[160px] text-[10px] uppercase tracking-widest font-black appearance-none cursor-pointer"
             >
               <option value="">STATUS: ALL</option>
               <option value="active">ACTIVE_ONLY</option>
               <option value="inactive">INACTIVE_ONLY</option>
             </select>
          </div>
          <button onClick={() => fetchStudents()} className="h-12 px-6 bg-surface border border-hairline rounded-full hover:bg-canvas transition-all flex items-center justify-center">
             <Loader2 className={`w-4 h-4 text-ink ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Registry Table */}
      <div className="hidden lg:block overflow-visible">
        <div className="mint-card p-0 overflow-visible bg-canvas">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-hairline bg-surface/30">
                <th className="px-3 sm:px-8 py-5 text-[9px] font-black text-slate uppercase tracking-[0.2em]">Full Name</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate uppercase tracking-[0.2em]">Fee Status</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate uppercase tracking-[0.2em]">Assigned Classes</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate uppercase tracking-[0.2em] text-right pr-12 sticky right-0 bg-surface/90 backdrop-blur-sm z-20 border-l border-hairline">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-3 sm:px-8 py-5"><div className="h-12 w-48 bg-surface rounded-md" /></td>
                    <td className="px-6 py-5"><div className="h-6 w-20 bg-surface rounded-full mx-auto" /></td>
                    <td className="px-6 py-5"><div className="h-6 w-32 bg-surface rounded-full" /></td>
                    <td className="px-6 py-5"><div className="h-6 w-40 bg-surface rounded-md" /></td>
                    <td className="px-6 py-5"><div className="h-8 w-8 bg-surface rounded-full ml-auto" /></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 sm:px-8 py-24 text-center">
                    <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-hairline text-stone opacity-50">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-black text-ink uppercase tracking-widest">No Records Found</h3>
                    <p className="text-xs text-slate mt-2">Start by adding your first student profile.</p>
                  </td>
                </tr>
              ) : students.map(s => (
                <tr key={s.id} className="group hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => navigate(`/students/${s.id}`)}>
                  <td className="px-3 sm:px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-11 h-11 rounded-md bg-surface border border-hairline flex items-center justify-center text-ink text-sm font-black shadow-sm group-hover:scale-105 transition-transform overflow-hidden uppercase">
                        {s.photoUrl ? <img src={s.photoUrl} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-ink tracking-tight">{s.name}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                           <span className="text-[9px] font-black text-brand-tag font-mono tracking-tighter opacity-70">#{s.profile?.studentCode || 'VP-UNSET'}</span>
                           <span className="text-stone opacity-30">•</span>
                           <div className="flex items-center gap-1.5 text-[10px] font-black text-slate">
                             <Phone className="w-3 h-3 text-stone" /> {s.phone}
                           </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        s.status === 'active' ? 'bg-brand-green/10 text-brand-green-deep border-brand-green/20' : 'bg-surface text-stone border-hairline'
                      }`}>
                        {s.status}
                      </span>
                  </td>
                  <td className="px-6 py-6">
                    {s.profile?.balance && s.profile.balance > 0 ? (
                      <span className="inline-flex px-3 py-1 bg-brand-error/10 text-brand-error border border-brand-error/20 rounded-full text-[9px] font-black font-mono tracking-tighter">
                        DUE: ₹{s.profile.balance}
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 bg-brand-green/10 text-brand-green-deep border border-brand-green/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                        PAID
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-wrap gap-1.5">
                      {s.batches.length > 0 ? s.batches.map(b => (
                        <span key={b.id} className="px-2 py-0.5 rounded-md bg-surface text-ink text-[9px] font-black border border-hairline uppercase tracking-tighter">
                          {b.name}
                        </span>
                      )) : <span className="text-[9px] text-stone font-black uppercase tracking-widest opacity-40">NOT ENROLLED</span>}
                    </div>
                  </td>
                  <td className={`px-6 py-6 text-right pr-8 sticky right-0 transition-colors border-l border-hairline shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)] ${
                    activeMenu === s.id ? 'z-[100] bg-canvas' : 'z-10 bg-canvas/80 backdrop-blur-md group-hover:bg-surface'
                  }`}>
                    <div className="flex items-center justify-end gap-2.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedStudentId(s.id); }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] text-brand-green-deep bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/20 transition-all shadow-sm"
                        >
                          <Receipt className="w-3.5 h-3.5" /> 
                          <span>Fees</span>
                        </button>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditStudent(s); setShowModal(true); }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] text-ink bg-white hover:bg-ink hover:text-canvas border border-stone/20 hover:border-ink transition-all shadow-sm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <div className="relative">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === s.id ? null : s.id); }}
                             className={`p-2.5 rounded-lg transition-all border flex items-center justify-center shadow-sm ${
                               activeMenu === s.id 
                                 ? 'bg-ink text-canvas border-ink scale-105' 
                                 : 'bg-white text-stone border-stone/20 hover:text-ink hover:border-stone'
                             }`}
                           >
                             <MoreVertical className="w-4 h-4" />
                           </button>
                          
                          {activeMenu === s.id && (
                            <div className="absolute right-0 top-full mt-3 w-56 bg-canvas rounded-lg shadow-premium border border-hairline z-[100] py-2 animate-slide-up origin-top-right">
                              <p className="px-4 py-2 text-[8px] font-black text-slate uppercase tracking-[0.2em] border-b border-hairline mb-1 opacity-50">Quick Actions</p>
                              <MenuAction icon={BookOpen} label="Change Classes" onClick={() => { setEditStudent(s); setShowModal(true); setActiveMenu(null); }} />
                              <MenuAction icon={MessageSquare} label="Message Student" onClick={() => { setActiveMenu(null); }} />
                              <div className="h-px bg-hairline my-1.5" />
                              <MenuAction 
                                icon={s.status === 'active' ? Ban : UserCheck} 
                                label={s.status === 'active' ? 'Deactivate Account' : 'Activate Account'} 
                                color={s.status === 'active' ? 'text-brand-error' : 'text-brand-green-deep'}
                                onClick={() => { toggleStatus(s); setActiveMenu(null); }} 
                              />
                              <MenuAction icon={Trash2} label="Remove Student" color="text-brand-error" onClick={() => { deleteStudent(s.id); setActiveMenu(null); }} />
                            </div>
                          )}
                        </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Registry Interface */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mint-card h-32 animate-pulse bg-surface/50" />
          ))
        ) : (
          students.map(s => (
            <div 
              key={s.id} 
              className={`mint-card p-6 relative active:scale-[0.98] transition-all bg-canvas ${activeMenu === s.id ? 'z-[100] overflow-visible' : 'overflow-hidden'}`}
              onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}`); }}
            >
              <div className="flex gap-5">
                <div className="w-14 h-14 rounded-md bg-surface border border-hairline flex items-center justify-center text-ink text-xl font-black flex-shrink-0 shadow-sm uppercase">
                  {s.photoUrl ? <img src={s.photoUrl} className="w-full h-full object-cover rounded-md" /> : s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-black text-ink truncate tracking-tight">{s.name}</h3>
                      <p className="text-[9px] font-bold text-stone mt-1.5 font-mono tracking-tighter uppercase opacity-60">#{s.profile?.studentCode || 'VP-UNSET'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      s.status === 'active' ? 'bg-brand-green/10 text-brand-green-deep border-brand-green/20' : 'bg-surface text-stone border-hairline'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-5">
                     <button onClick={e => { e.stopPropagation(); setSelectedStudentId(s.id); }} 
                       className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                         s.profile?.balance && s.profile.balance > 0 ? 'bg-brand-error/10 text-brand-error border-brand-error/20' : 'bg-brand-green/10 text-brand-green-deep border-brand-green/20'
                       }`}>
                        <Receipt className="w-3.5 h-3.5" /> FEES
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); setEditStudent(s); setShowModal(true); }}
                       className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-lg transition-all border bg-surface text-ink border-hairline"
                     >
                        <Edit2 className="w-3.5 h-3.5" /> EDIT
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === s.id ? null : s.id); }}
                       className={`ml-auto p-2.5 rounded-lg transition-all border flex items-center justify-center relative ${activeMenu === s.id ? 'bg-ink text-canvas border-ink shadow-lg z-50' : 'text-stone border-hairline hover:bg-surface'}`}
                     >
                       <MoreVertical className="w-4 h-4" />
                       {activeMenu === s.id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-canvas rounded-lg shadow-premium border border-hairline z-[100] py-2 animate-slide-up origin-top-right text-ink">
                             <MenuAction icon={BookOpen} label="Classes" onClick={() => { setEditStudent(s); setShowModal(true); setActiveMenu(null); }} />
                             <MenuAction icon={MessageSquare} label="Message" onClick={() => { setActiveMenu(null); }} />
                             <div className="h-px bg-hairline my-1.5" />
                             <MenuAction 
                               icon={s.status === 'active' ? Ban : UserCheck} 
                               label={s.status === 'active' ? 'Deactivate' : 'Activate'} 
                               color={s.status === 'active' ? 'text-brand-error' : 'text-brand-green-deep'}
                               onClick={() => { toggleStatus(s); setActiveMenu(null); }} 
                             />
                             <MenuAction icon={Trash2} label="Remove" color="text-brand-error" onClick={() => { deleteStudent(s.id); setActiveMenu(null); }} />
                          </div>
                       )}
                     </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <StudentModal 
          student={editStudent}
          onClose={() => { setShowModal(false); setEditStudent(null); }} 
          onSaved={(createdStudent) => { 
            setShowModal(false); 
            setEditStudent(null); 
            fetchStudents(meta.page);
            if (!editStudent && createdStudent) setRegSuccess(createdStudent);
          }} 
        />
      )}

      {/* Atmospheric Success Modal */}
      {regSuccess && (
        <RegistrationSuccessModal 
          student={regSuccess!} 
          onClose={() => setRegSuccess(null)}
          onCollect={() => { setSelectedStudentId(regSuccess!.id); setRegSuccess(null); }}
        />
      )}

      <FeeCollectionDrawer 
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        onSuccess={fetchStudents}
      />

      <button 
        onClick={(e) => { e.stopPropagation(); setEditStudent(null); setShowModal(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-ink text-canvas rounded-full shadow-premium sm:hidden flex items-center justify-center active:scale-90 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

function RegistrationSuccessModal({ student, onClose, onCollect }: { student: Student; onClose: () => void; onCollect: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/80 backdrop-blur-xl p-4 animate-fade-in">
      <div className="w-full max-w-md bg-canvas rounded-lg p-12 text-center shadow-premium animate-slide-up border border-hairline">
        <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-10 relative border border-brand-green/20">
           <div className="absolute inset-0 bg-brand-green/20 rounded-full animate-ping opacity-30" />
           <Sparkles className="w-10 h-10 text-brand-green-deep" />
        </div>
        <h2 className="text-2xl font-black text-ink tracking-tight uppercase tracking-widest mb-3">Student Added Successfully</h2>
        <p className="text-slate font-black text-[11px] mb-12 uppercase tracking-widest opacity-60">Registered Name: <span className="text-ink">{student.name}</span></p>
        
        <div className="space-y-4">
          <button onClick={onCollect} className="mint-btn-primary w-full h-14 text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-brand-green/10">
             <IndianRupee className="w-4 h-4" /> Collect Initial Fees
          </button>
          <button onClick={onClose} className="w-full h-14 text-[10px] font-black uppercase tracking-[0.2em] text-slate hover:text-ink transition-all">
             Save Without Payment
          </button>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-3 text-[9px] font-black text-stone uppercase tracking-[0.2em] opacity-40">
           <Printer className="w-3.5 h-3.5" /> Print ID Card
        </div>
      </div>
    </div>
  );
}

function MenuAction({ icon: Icon, label, onClick, color = 'text-ink' }: any) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full flex items-center gap-4 px-5 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-surface transition-colors ${color}`}
    >
      <Icon className="w-4 h-4 opacity-40" /> {label}
    </button>
  );
}
