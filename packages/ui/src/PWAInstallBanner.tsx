import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export function PWAInstallBanner({ appName = "VidyaPlus" }: { appName?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const dismissedTime = localStorage.getItem('pwa_prompt_dismissed');
      const now = Date.now();
      
      if (!dismissedTime || now - parseInt(dismissedTime, 10) > 7 * 24 * 60 * 60 * 1000) {
        setVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    } else {
      console.log('User dismissed the PWA install prompt');
      localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    }
    
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateY(-16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-toast-slide-in {
          animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      <div className="fixed top-4 left-4 right-4 md:top-6 md:left-auto md:right-6 md:w-[360px] z-[9999] animate-toast-slide-in">
        <div className="relative overflow-hidden rounded-xl bg-surface/95 backdrop-blur-xl border border-hairline p-4 shadow-xl flex items-center justify-between gap-3 pr-8">
          {/* Sleek left color accent band */}
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-brand-green" />
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center flex-shrink-0 shadow-sm">
              {/* SVG Brand Icon */}
              <svg className="w-5 h-5 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              </svg>
            </div>
            
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-ink leading-tight">Install {appName} App</h4>
              <p className="text-[10px] text-steel mt-0.5 font-semibold leading-none">
                Add to your home screen for quick access!
              </p>
            </div>
          </div>

          <button 
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 text-[11px] font-bold bg-brand-green text-canvas hover:opacity-90 rounded-md shadow-sm transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Install
          </button>

          {/* Absolute sleek X button in top-right */}
          <button 
            onClick={handleDismiss}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface text-steel hover:text-ink transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
