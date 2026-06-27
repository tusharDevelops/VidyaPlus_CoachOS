import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Settings, Save, Check, Loader2, RefreshCw, Camera, Image as ImageIcon, CreditCard, AlertCircle, XCircle } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'billing'>('general');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings/profile');
      if (data.success) {
        const i = data.data;
        setName(i.name || '');
        setPhone(i.phone || '');
        setEmail(i.email || '');
        setAddress(i.address || '');
        setAcademicYear(i.academicYear || '');
        setLogoUrl(i.logoUrl || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadToCloudinary(file);
      setLogoUrl(url);
    } catch (err) {
      alert('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const fetchSubscription = async () => {
    setSubLoading(true);
    try {
      const { data } = await api.get('/payments/subscription-details');
      if (data.success) {
        setSubscriptionDetails(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSubscription();
  }, []);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of the billing period.')) return;
    setActionLoading(true);
    try {
      await api.post('/payments/cancel-subscription');
      alert('Subscription scheduled for cancellation.');
      fetchSubscription();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading(true);
    try {
      await api.post('/payments/reactivate-subscription');
      alert('Subscription reactivated successfully.');
      fetchSubscription();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reactivate subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Name and phone number are required');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch('/settings/profile', {
        name,
        phone,
        email: email || null,
        address: address || null,
        logoUrl: logoUrl || null,
        academicYear: academicYear || null,
      });
      alert('Institute settings updated successfully');
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save institute profile');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-green" /> Institute Configuration
          </h1>
          <p className="text-sm text-steel mt-1">Configure institute brand, academic details, and contact profiles</p>
        </div>
        <button onClick={fetchProfile}
          className="p-2 text-steel hover:text-ink hover:bg-surface rounded-lg transition-all" title="Reload Settings">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline mb-8">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${activeTab === 'general' ? 'border-brand-green text-brand-green' : 'border-transparent text-steel hover:text-ink'}`}
        >
          <Settings className="w-4 h-4" /> General Profile
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${activeTab === 'billing' ? 'border-brand-green text-brand-green' : 'border-transparent text-steel hover:text-ink'}`}
        >
          <CreditCard className="w-4 h-4" /> Billing & Subscriptions
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        </div>
      )}

      {!loading && activeTab === 'general' && (
        <form onSubmit={handleSave} className="bg-white border border-hairline rounded-2xl p-6 shadow-sm space-y-8 animate-fade-in">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-hairline">
             <div className="relative group">
                <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-hairline bg-surface flex items-center justify-center overflow-hidden transition-colors group-hover:border-brand-green/50">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-steel" />
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
             </div>
             <div className="text-center">
               <h3 className="text-sm font-bold text-ink">Institute Logo</h3>
               <p className="text-[11px] text-steel mt-1 uppercase tracking-widest font-bold">Recommended: Square PNG/JPG</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-2">Institute Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl outline-none focus:border-brand-green transition-all" placeholder="e.g. Vidya Coaching" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-2">Support Phone</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl outline-none focus:border-brand-green transition-all" placeholder="e.g. 9876543210" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-2">Contact Email (Optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl outline-none focus:border-brand-green transition-all" placeholder="e.g. info@vidyacoach.com" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-2">Academic Session Year (Optional)</label>
              <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl outline-none focus:border-brand-green transition-all" placeholder="e.g. 2026-2027" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-2">Mailing Address (Optional)</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl outline-none focus:border-brand-green transition-all" placeholder="Enter complete office address" />
          </div>

          <div className="pt-6 border-t border-hairline flex justify-end">
            <button type="submit" disabled={actionLoading || uploadingLogo}
              className="mint-btn-brand px-10">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
            </button>
          </div>
        </form>
      )}

      {!loading && activeTab === 'billing' && (
        <div className="bg-white border border-hairline rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-hairline flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Active Plan</h2>
              <p className="text-sm text-steel">Manage your subscription limits and billing</p>
            </div>
          </div>
          
          {subLoading || !subscriptionDetails ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="bg-surface border border-hairline rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-ink">{subscriptionDetails.plan?.name || 'Aarambh'}</h3>
                  <p className="text-sm text-steel mt-1">₹{subscriptionDetails.plan?.priceMonthly || '0'} / month</p>
                </div>
                <span className="px-3 py-1 bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-widest rounded-full border border-brand-green/20">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border border-hairline rounded-xl text-center">
                  <div className="text-2xl font-black text-ink">{subscriptionDetails.plan?.maxStudents === 99999 ? '∞' : subscriptionDetails.plan?.maxStudents}</div>
                  <div className="text-[11px] font-bold text-steel uppercase tracking-widest mt-1">Students</div>
                </div>
                <div className="p-4 border border-hairline rounded-xl text-center">
                  <div className="text-2xl font-black text-ink">{subscriptionDetails.plan?.maxStaff === 99999 ? '∞' : subscriptionDetails.plan?.maxStaff}</div>
                  <div className="text-[11px] font-bold text-steel uppercase tracking-widest mt-1">Staff</div>
                </div>
                <div className="p-4 border border-hairline rounded-xl text-center">
                  <div className="text-2xl font-black text-ink">{subscriptionDetails.plan?.maxBatches === 99999 ? '∞' : subscriptionDetails.plan?.maxBatches}</div>
                  <div className="text-[11px] font-bold text-steel uppercase tracking-widest mt-1">Batches</div>
                </div>
                <div className="p-4 border border-hairline rounded-xl text-center">
                  <div className="text-2xl font-black text-ink">{subscriptionDetails.plan?.maxStorageMb === 999999 ? 'Unlimited' : `${(subscriptionDetails.plan?.maxStorageMb || 0) / 1000} GB`}</div>
                  <div className="text-[11px] font-bold text-steel uppercase tracking-widest mt-1">Storage</div>
                </div>
              </div>

              {subscriptionDetails.subscription && subscriptionDetails.subscription.cancel_at_next_billing_date && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900">Subscription Pending Cancellation</h4>
                    <p className="text-sm text-amber-800 mt-1">
                      Your subscription is scheduled to cancel at the end of the current billing cycle. You will lose access to premium features and your account will be downgraded to the Aarambh plan.
                    </p>
                    <button onClick={handleReactivateSubscription} disabled={actionLoading} className="mt-3 px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
                      {actionLoading ? 'Processing...' : 'Reactivate Subscription'}
                    </button>
                  </div>
                </div>
              )}

              {subscriptionDetails.subscription && !subscriptionDetails.subscription.cancel_at_next_billing_date && (
                <div className="pt-6 border-t border-hairline flex flex-col items-start gap-2">
                  <h4 className="font-bold text-ink">Danger Zone</h4>
                  <p className="text-sm text-steel mb-2">Cancelling your subscription will downgrade your account to the free Aarambh plan at the end of your billing cycle. If you exceed the free plan limits, you will not be able to add new records.</p>
                  <button 
                    onClick={handleCancelSubscription} 
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 font-semibold text-sm hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} 
                    Cancel Subscription
                  </button>
                </div>
              )}
              
              {!subscriptionDetails.subscription && subscriptionDetails.plan?.priceMonthly > 0 && (
                 <div className="pt-6 border-t border-hairline flex flex-col items-start gap-2">
                     <p className="text-sm text-steel mb-2">No active recurring billing subscription found on Dodo Payments. If you believe this is an error, please contact support.</p>
                 </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
