import { useEffect, useState } from 'react';
import { AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

interface BannerSettings {
  bannerEnabled: boolean;
  bannerText: string;
  bannerType: 'info' | 'warning' | 'danger';
}

export function GlobalPlatformBanner({ api }: { api: any }) {
  const [settings, setSettings] = useState<BannerSettings | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    api.get('/public/system-settings/banner')
      .then((res: any) => {
        if (res.data?.success && res.data.data) {
          setSettings(res.data.data);
          // Small delay for a smooth entrance animation
          setTimeout(() => setIsVisible(true), 150);
        }
      })
      .catch((err: any) => {
        console.error('Failed to fetch platform banner settings:', err);
      });
  }, [api]);

  if (!settings || !settings.bannerEnabled || !settings.bannerText || isDismissed) {
    return null;
  }

  // Define styles based on type
  const typeStyles = {
    info: 'bg-white/80 border-gray-200/50 text-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    warning: 'bg-amber-50/90 border-amber-200/50 text-amber-900 shadow-[0_8px_30px_rgb(251,191,36,0.15)]',
    danger: 'bg-red-50/90 border-red-200/50 text-red-900 shadow-[0_8px_30px_rgb(239,68,68,0.15)]'
  };

  const Icon = settings.bannerType === 'info' ? Info : 
               settings.bannerType === 'warning' ? AlertTriangle : AlertCircle;

  const iconColors = {
    info: 'text-blue-500',
    warning: 'text-amber-500',
    danger: 'text-red-500'
  };

  return (
    <div className="fixed top-4 left-0 w-full z-[100] flex justify-center px-4 pointer-events-none">
      <div 
        className={`
          pointer-events-auto
          flex items-center gap-3 px-4 py-2.5 rounded-full border backdrop-blur-md
          transform transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
          ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}
          ${typeStyles[settings.bannerType] || typeStyles.info}
        `}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className={`flex items-center justify-center ${iconColors[settings.bannerType] || iconColors.info}`}>
          <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
        </div>
        
        <span className="text-sm font-medium tracking-tight pr-2">
          {settings.bannerText}
        </span>

        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => setIsDismissed(true), 300); // wait for fade out
          }}
          className="ml-1 p-1 -mr-2 rounded-full hover:bg-black/5 transition-colors focus:outline-none"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}
