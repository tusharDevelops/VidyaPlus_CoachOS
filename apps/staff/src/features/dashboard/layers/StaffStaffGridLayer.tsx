import { useState, useEffect } from 'react';
import { Users, Search, Plus, Filter, MoreVertical, Shield, Mail, Phone, Loader2, ArrowUpRight, Calendar, Edit2 } from 'lucide-react';
import { DrillDepth } from '../types';
import api from '../../../lib/api';
import StaffModal from '../../staff/StaffModal';
import { useAuthStore } from '../../../stores/auth.store';
import LoadMore from '../../../components/LoadMore';

interface StaffStaffGridLayerProps {
  onNavigate: (depth: DrillDepth, data?: { staffId?: string }) => void;
}

export default function StaffStaffGridLayer({ onNavigate }: StaffStaffGridLayerProps) {
  const { hasPermission } = useAuthStore();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchStaff = async (p: number = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/staff', {
        params: { page: p, limit: 20 }
      });
      setStaff(prev => p === 1 ? data.data : [...prev, ...data.data]);
      if (data.meta) {
        setHasMore(data.meta.page < data.meta.totalPages);
        setTotal(data.meta.total);
      }
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchStaff(page + 1);
    }
  };

  useEffect(() => {
    fetchStaff(1);
  }, []);

  const handleEdit = (member: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStaff(member);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedStaff(null);
    setShowModal(true);
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                         s.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-canvas border border-hairline rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-steel opacity-40 group-focus-within:text-brand-green transition-colors" />
            <input 
              type="text"
              placeholder="Search staff by name or email..."
              className="w-full h-12 pl-12 pr-4 bg-surface border border-hairline rounded-xl text-sm focus:border-brand-green outline-none transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-steel ml-2 mr-1" />
            <select 
              className="h-12 px-4 bg-surface border border-hairline rounded-xl text-xs font-black uppercase tracking-widest outline-none cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="accountant">Accountants</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => onNavigate('STAFF_ATTENDANCE')}
            className="h-12 px-6 bg-canvas border border-hairline text-ink hover:bg-surface rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4 mr-2 text-brand-green" /> Manage Attendance
          </button>
          {hasPermission('staff.manage') && (
            <button 
              onClick={handleAdd}
              className="h-12 px-6 bg-ink text-canvas hover:bg-ink/90 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center transition-all shadow-xl"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Staff Member
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredStaff.length === 0 ? (
        <div className="p-20 text-center border-2 border-hairline border-dashed rounded-3xl bg-surface/30">
          <Users className="w-12 h-12 text-steel mx-auto mb-4 opacity-20" />
          <p className="text-sm font-bold text-ink uppercase tracking-widest">No staff members found</p>
          <p className="text-xs text-steel mt-2">Adjust your filters or add a new team member to get started.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStaff.map((member) => (
              <div 
                key={member.id}
                onClick={() => onNavigate('STAFF_DETAIL', { staffId: member.id })}
                className="bg-canvas border border-hairline rounded-3xl p-6 hover:shadow-premium transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface border border-hairline flex items-center justify-center text-xl font-black text-ink shadow-sm group-hover:scale-105 transition-transform">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-ink text-lg leading-none mb-2 group-hover:text-brand-green-deep transition-colors">{member.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        member.role === 'admin' ? 'bg-brand-error/10 text-brand-error border-brand-error/20' : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleEdit(member, e)}
                    className="p-2 text-steel opacity-40 hover:opacity-100 hover:bg-surface rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-steel text-xs font-bold opacity-60">
                    <Mail className="w-3.5 h-3.5" />
                    {member.email}
                  </div>
                  <div className="flex items-center gap-2 text-steel text-xs font-bold opacity-60">
                    <Phone className="w-3.5 h-3.5" />
                    {member.phone}
                  </div>
                </div>

                <div className="pt-5 border-t border-hairline-soft flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                     <span className="text-[10px] font-black text-steel uppercase tracking-widest opacity-60">Active Profile</span>
                  </div>
                  <span className="text-[10px] font-black text-brand-green-deep uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    Manage Profile <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
          <LoadMore hasMore={hasMore} loading={loading} onLoadMore={loadMore} total={total} loaded={staff.length} />
        </>
      )}

      {showModal && (
        <StaffModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          staff={selectedStaff}
          onSuccess={() => { setShowModal(false); fetchStaff(); }} 
        />
      )}
    </div>
  );
}
