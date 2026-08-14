import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface BannerSettings {
  bannerEnabled: boolean;
  bannerText: string;
  bannerType: 'info' | 'warning' | 'danger';
}

export function GlobalPlatformBanner({ api }: { api: any }) {
  const [settings, setSettings] = useState<BannerSettings | null>(null);

  useEffect(() => {
    // Fetch banner settings from public API
    api.get('/public/system-settings/banner')
      .then((res: any) => {
        if (res.data?.success && res.data.data) {
          setSettings(res.data.data);
        }
      })
      .catch((err: any) => {
        console.error('Failed to fetch platform banner settings:', err);
      });
  }, []);

  if (!settings || !settings.bannerEnabled || !settings.bannerText) return null;

  return (
    <div className={`w-full p-3 text-sm font-medium flex items-center justify-center gap-2.5 z-50 ${
      settings.bannerType === 'info' ? 'bg-primary-soft text-ink border-b border-primary/20' :
      settings.bannerType === 'warning' ? 'bg-amber-500/10 text-ink border-b border-amber-500/20' :
      'bg-danger-50 text-brand-error border-b border-danger-200'
    }`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{settings.bannerText}</span>
    </div>
  );
}
