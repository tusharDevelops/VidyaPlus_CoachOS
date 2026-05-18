import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Shield, Briefcase, IndianRupee, Loader2, Camera,
  ShieldCheck, Smartphone, Hash
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';

export default function MyProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setProfile(res.data.data.user);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[10px] font-bold text-steel uppercase tracking-widest mt-4">Retrieving Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-ink tracking-tight">My Profile</h1>
        <p className="text-sm text-steel">Manage your personal information and account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="mint-card p-8 text-center relative overflow-hidden group">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-3xl bg-surface border-4 border-canvas flex items-center justify-center text-4xl font-black text-ink shadow-premium overflow-hidden mx-auto">
                {profile?.photoUrl ? (
                  <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.name?.charAt(0)
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-ink text-canvas flex items-center justify-center shadow-lg hover:bg-brand-green transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-ink mb-1">{profile?.name}</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="px-3 py-1 bg-brand-green/10 text-brand-green-deep border border-brand-green/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                {profile?.role}
              </span>
              <span className="px-3 py-1 bg-surface border border-hairline rounded-full text-[9px] font-black uppercase tracking-widest text-steel">
                {profile?.status || 'Active'}
              </span>
            </div>

            <div className="pt-6 border-t border-hairline grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-[9px] font-black text-steel uppercase tracking-widest opacity-60 mb-1">Base Salary</p>
                <p className="text-sm font-bold text-ink flex items-center justify-center gap-1">
                  <IndianRupee className="w-3 h-3" /> {profile?.baseSalary?.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-steel uppercase tracking-widest opacity-60 mb-1">Joined On</p>
                <p className="text-sm font-bold text-ink">
                  {new Date(profile?.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="mint-card p-6 space-y-4">
            <h3 className="text-xs font-black text-ink uppercase tracking-[0.2em] mb-4">Quick Stats</h3>
            <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-hairline">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-brand-green-deep" />
                </div>
                <span className="text-[10px] font-bold text-ink uppercase tracking-widest">Attendance Score</span>
              </div>
              <span className="text-sm font-black text-brand-green-deep">{profile?.attendanceRate ? `${profile.attendanceRate}%` : '—'}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-hairline">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-brand-blue" />
                </div>
                <span className="text-[10px] font-bold text-ink uppercase tracking-widest">Batches Assigned</span>
              </div>
              <span className="text-sm font-black text-brand-blue">{profile?.batchCount ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mint-card p-8">
            <h3 className="text-lg font-bold text-ink mb-8 flex items-center gap-3">
              <User className="w-5 h-5 text-brand-green" /> Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-steel uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <Smartphone className="w-3 h-3" /> Contact Number
                </label>
                <p className="text-sm font-bold text-ink">{profile?.phone || 'Not provided'}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-steel uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <Mail className="w-3 h-3" /> Official Email
                </label>
                <p className="text-sm font-bold text-ink">{profile?.email || 'Not provided'}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-steel uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <Calendar className="w-3 h-3" /> Date of Birth
                </label>
                <p className="text-sm font-bold text-ink">
                  {profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-steel uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <MapPin className="w-3 h-3" /> Residential Address
                </label>
                <p className="text-sm font-bold text-ink">{profile?.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="mint-card p-8">
            <h3 className="text-lg font-bold text-ink mb-8 flex items-center gap-3">
              <Shield className="w-5 h-5 text-brand-blue" /> Employment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-steel uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <Hash className="w-3 h-3" /> Employee ID
                </label>
                <p className="text-sm font-bold text-ink">VP-{profile?.id?.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-steel uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <Briefcase className="w-3 h-3" /> Department
                </label>
                <p className="text-sm font-bold text-ink">{profile?.department || 'Not assigned'}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-steel uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <ShieldCheck className="w-3 h-3" /> Institute
                </label>
                <p className="text-sm font-bold text-ink">{profile?.institute?.name || 'VidyaPlus 2.0'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
