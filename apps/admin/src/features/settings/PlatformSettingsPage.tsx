import { useState, useEffect } from 'react';
import { 
  Bell, Save, Check, Loader2, AlertCircle
} from 'lucide-react';
import { api } from '@coachos/ui';

export default function PlatformSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState({
    bannerEnabled: false,
    bannerText: '',
    bannerType: 'info',
  });

  useEffect(() => {
    // Fetch initial settings
    api.get('/public/system-settings/banner')
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setSettings(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch platform settings:', err);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    try {
      await api.put('/super-admin/system-settings/banner', settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-[-0.5px]">Platform Settings</h1>
          <p className="text-sm text-steel mt-1">Configure global platform notices and announcements.</p>
        </div>
        
        {success && (
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-green-soft text-ink rounded-lg border border-brand-green/20 animate-fade-in">
            <Check className="w-4 h-4 text-brand-green" />
            <span className="text-xs font-semibold uppercase tracking-[0.5px]">Settings Applied</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Sitewide Announcements */}
        <div className="mint-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink tracking-tight flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-ink" /> Platform Banner Notice
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.bannerEnabled} 
                onChange={e => setSettings({ ...settings, bannerEnabled: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-surface-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green"></div>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-1.5">
                Notice Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'info', label: 'Info Alert', color: 'bg-primary/10 border-primary text-ink' },
                  { type: 'warning', label: 'Warning Notice', color: 'bg-amber-500/10 border-amber-500 text-ink' },
                  { type: 'danger', label: 'System Alert', color: 'bg-danger-50 border-brand-error text-brand-error' },
                ].map(option => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setSettings({ ...settings, bannerType: option.type })}
                    className={`py-2 px-3 border text-xs font-semibold rounded-lg text-center transition-all ${
                      settings.bannerType === option.type ? option.color : 'bg-canvas hover:bg-surface text-steel'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-1.5">
                Banner Text Message
              </label>
              <textarea 
                rows={3}
                value={settings.bannerText} 
                onChange={e => setSettings({ ...settings, bannerText: e.target.value })}
                placeholder="e.g. MANEZA will undergo scheduled database maintenance on May 20th at 02:00 IST. Please save your work."
                className="mint-input w-full"
                disabled={!settings.bannerEnabled}
              />
            </div>

            {settings.bannerEnabled && settings.bannerText && (
              <div className="p-4 rounded-lg border border-hairline bg-surface/50 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-steel block mb-2">Live Preview:</span>
                <div className={`p-3.5 rounded border text-xs font-medium flex items-center gap-2.5 ${
                  settings.bannerType === 'info' ? 'bg-primary-soft text-ink border-primary/20' :
                  settings.bannerType === 'warning' ? 'bg-amber-500/10 text-ink border-amber-500/20' :
                  'bg-danger-50 text-brand-error border-danger-200'
                }`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{settings.bannerText}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <button 
            type="submit" 
            disabled={saving}
            className="mint-btn-primary px-6"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Platform Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
