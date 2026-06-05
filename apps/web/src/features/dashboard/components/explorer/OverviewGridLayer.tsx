import { useState, useEffect } from 'react';
import { Users, GraduationCap, Loader2 } from 'lucide-react';
import { DrillDepth } from '../DashboardDrillDown';
import api from '../../../../lib/api';

interface Stats {
  batches: number;
  students: number;
  staff: number;
}

interface OverviewGridLayerProps {
  onNavigate: (depth: DrillDepth) => void;
}

export default function OverviewGridLayer({ onNavigate }: OverviewGridLayerProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd have a dedicated /stats endpoint.
    // For now, we'll fetch from the main entities.
    Promise.all([
      api.get('/batches'),
      api.get('/students'),
      api.get('/staff'),
    ]).then(([{ data: bData }, { data: sData }, { data: stData }]) => {
      setStats({
        batches: bData.data.length,
        students: sData.data.length,
        staff: stData.data.length
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <button 
        onClick={() => onNavigate('BATCHES')}
        className="text-left bg-canvas rounded-lg border border-hairline p-3 sm:p-8 hover:shadow-premium transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
          <GraduationCap className="w-32 h-32" />
        </div>
        
        <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <GraduationCap className="w-6 h-6 text-brand-green-deep" />
        </div>
        
        <h2 className="text-2xl font-black text-ink mb-2 uppercase tracking-tight">Batches & Students</h2>
        <div className="flex flex-wrap items-center gap-4 mb-4">
           {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-steel" />
           ) : (
              <>
                 <div className="flex flex-col">
                    <span className="text-xl font-black text-brand-green-deep">{stats?.batches || 0}</span>
                    <span className="text-[10px] font-black text-steel uppercase tracking-widest opacity-60">Active Batches</span>
                 </div>
                 <div className="w-px h-8 bg-hairline" />
                 <div className="flex flex-col">
                    <span className="text-xl font-black text-ink">{stats?.students || 0}</span>
                    <span className="text-[10px] font-black text-steel uppercase tracking-widest opacity-60">Enrolled Students</span>
                 </div>
              </>
           )}
        </div>
        <p className="text-steel text-sm leading-relaxed max-w-sm">
          Manage your classes, view enrolled students, update their fees, and send messages directly.
        </p>
      </button>

      <button 
        onClick={() => onNavigate('STAFF')}
        className="text-left bg-canvas rounded-lg border border-hairline p-3 sm:p-8 hover:shadow-premium transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
          <Users className="w-32 h-32" />
        </div>

        <div className="w-12 h-12 rounded-full bg-brand-warn/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Users className="w-6 h-6 text-brand-warn" />
        </div>
        
        <h2 className="text-2xl font-black text-ink mb-2 uppercase tracking-tight">Staff Team</h2>
        <div className="flex flex-wrap items-center gap-4 mb-4">
           {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-steel" />
           ) : (
              <div className="flex flex-col">
                 <span className="text-xl font-black text-brand-warn-deep">{stats?.staff || 0}</span>
                 <span className="text-[10px] font-black text-steel uppercase tracking-widest opacity-60">Active Members</span>
              </div>
           )}
        </div>
        <p className="text-steel text-sm leading-relaxed max-w-sm">
          View your staff members, manage their access, and track salary information.
        </p>
      </button>
    </div>
  );
}
