import { useState, useEffect } from 'react';
import { 
  Shield, Server, Bell, HardDrive, Cpu, 
  Database, RefreshCw, Save, Check, Loader2, AlertCircle
} from 'lucide-react';

export default function PlatformSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Settings State with Simulated Database Persistence via localStorage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('platform_settings');
    if (saved) return JSON.parse(saved);
    return {
      sessionTimeout: 120,
      mfaRequired: false,
      ipRestriction: '',
      apiLogLevel: 'info',
      bannerEnabled: false,
      bannerText: '',
      bannerType: 'info',
      redisMaxMemory: 2048,
      dbPoolLimit: 50,
      smtpServer: 'smtp.gmail.com',
      smtpPort: 587,
    };
  });

  // Simulated live metrics
  const [metrics, setMetrics] = useState({
    cpu: 18,
    memory: 42,
    disk: 55,
    latency: 24,
  });

  // Dynamic live metric fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.max(5, Math.min(95, prev.cpu + Math.floor(Math.random() * 7) - 3)),
        memory: Math.max(30, Math.min(85, prev.memory + Math.floor(Math.random() * 3) - 1)),
        latency: Math.max(10, Math.min(90, prev.latency + Math.floor(Math.random() * 9) - 4)),
        disk: prev.disk
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    // Simulate API roundtrip
    await new Promise(resolve => setTimeout(resolve, 800));
    
    localStorage.setItem('platform_settings', JSON.stringify(settings));
    setSaving(false);
    setSuccess(true);
    
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setClearingCache(false);
    alert('Global Redis caches and API query storage cleared successfully!');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-[-0.5px]">Platform Settings</h1>
          <p className="text-sm text-steel mt-1">Configure global security policies, system limits, and infrastructure.</p>
        </div>
        
        {success && (
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-green-soft text-ink rounded-lg border border-brand-green/20 animate-fade-in">
            <Check className="w-4 h-4 text-brand-green" />
            <span className="text-xs font-semibold uppercase tracking-[0.5px]">Settings Applied</span>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Form Control */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          
          {/* Security & Access */}
          <div className="mint-card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-ink tracking-tight flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-ink" /> Security Protocols
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-1.5">
                  Max Session Lifetime (Minutes)
                </label>
                <input 
                  type="number" 
                  value={settings.sessionTimeout} 
                  onChange={e => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                  className="mint-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-1.5">
                  API Logging Verbosity
                </label>
                <select 
                  value={settings.apiLogLevel} 
                  onChange={e => setSettings({ ...settings, apiLogLevel: e.target.value })}
                  className="mint-input w-full"
                >
                  <option value="error">Errors Only</option>
                  <option value="warn">Warnings & Errors</option>
                  <option value="info">Info (Standard)</option>
                  <option value="debug">Verbose Debug</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-hairline-soft mt-2">
              <div>
                <p className="text-sm font-medium text-ink">Require Multi-Factor Authentication</p>
                <p className="text-xs text-steel mt-0.5">Enforce SMS/Authenticator verification for all super admins.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.mfaRequired} 
                  onChange={e => setSettings({ ...settings, mfaRequired: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-surface-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green"></div>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mb-1.5">
                Restricted IP Ranges (Whitelist)
              </label>
              <input 
                type="text" 
                value={settings.ipRestriction} 
                onChange={e => setSettings({ ...settings, ipRestriction: e.target.value })}
                placeholder="Comma separated e.g. 192.168.1.1, 10.0.0.0/24 (leave blank for unrestricted)"
                className="mint-input w-full"
              />
            </div>
          </div>

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
                  placeholder="e.g. VidyaPlus will undergo scheduled database maintenance on May 20th at 02:00 IST. Please save your work."
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

        {/* Right Column - Status, Cache, Database Metrics */}
        <div className="space-y-6">
          
          {/* System Performance & Diagnostics */}
          <div className="mint-card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-ink tracking-tight flex items-center gap-2.5">
              <Server className="w-5 h-5 text-ink" /> Core Diagnostics
            </h2>

            <div className="space-y-4">
              {/* CPU Usage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-charcoal flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-steel" /> API Gateway CPU
                  </span>
                  <span className="font-semibold text-ink font-mono">{metrics.cpu}%</span>
                </div>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      metrics.cpu > 80 ? 'bg-brand-error' : metrics.cpu > 50 ? 'bg-amber-500' : 'bg-brand-green'
                    }`}
                    style={{ width: `${metrics.cpu}%` }} 
                  />
                </div>
              </div>

              {/* Memory Allocation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-charcoal flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-steel" /> Database Pool Used
                  </span>
                  <span className="font-semibold text-ink font-mono">{metrics.memory}%</span>
                </div>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-green transition-all duration-1000"
                    style={{ width: `${metrics.memory}%` }} 
                  />
                </div>
              </div>

              {/* Disk Storage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-charcoal flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-steel" /> Media Storage Disk
                  </span>
                  <span className="font-semibold text-ink font-mono">{metrics.disk}%</span>
                </div>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-green transition-all duration-1000"
                    style={{ width: `${metrics.disk}%` }} 
                  />
                </div>
              </div>

              {/* Latency */}
              <div className="pt-4 border-t border-hairline-soft flex items-center justify-between">
                <span className="text-xs font-medium text-steel">Average Response Time</span>
                <span className="text-sm font-semibold text-brand-green font-mono">{metrics.latency}ms</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Caches */}
          <div className="mint-card p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-ink tracking-tight">Infrastructure Caching</h3>
              <p className="text-xs text-steel mt-1">Flush global state cache layers or database query stores.</p>
            </div>
            
            <button 
              type="button" 
              onClick={handleClearCache}
              disabled={clearingCache}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-hairline text-sm font-semibold text-ink bg-canvas hover:bg-surface transition-colors disabled:opacity-50"
            >
              {clearingCache ? <Loader2 className="w-4 h-4 animate-spin text-steel" /> : <RefreshCw className="w-4 h-4 text-steel" />}
              Flush Global Redis Caches
            </button>
          </div>

          {/* Secure Environment Notice */}
          <div className="bg-canvas-dark rounded-lg p-6 text-on-dark border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-brand-green" />
              <p className="font-semibold tracking-tight">Security Audit Logging</p>
            </div>
            <p className="text-xs text-on-dark-muted leading-relaxed">
              Modifying platform settings triggers an entry in the master server ledger, visible to secondary platform compliance officers and audit checkers.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
