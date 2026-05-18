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
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user dismissed it recently
      const dismissedTime = localStorage.getItem('pwa_prompt_dismissed');
      const now = Date.now();
      
      if (!dismissedTime || now - parseInt(dismissedTime, 10) > 7 * 24 * 60 * 60 * 1000) {
        setVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app is already installed, hide
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
    
    // Show the native install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    } else {
      console.log('User dismissed the PWA install prompt');
      localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    }
    
    // We no longer need the prompt
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-50 animate-slide-up">
      <div className="relative overflow-hidden rounded-2xl bg-surface/95 backdrop-blur-xl border border-hairline p-5 shadow-2xl flex flex-col gap-4">
        {/* Sleek top brand line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-green to-blue-500" />
        
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-xl bg-ink flex items-center justify-center flex-shrink-0 shadow-md">
            {/* SVG Logo resembling graduation cap + forward */}
            <svg className="w-7 h-7 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-ink leading-tight">Install {appName} App</h4>
            <p className="text-xs text-steel mt-1 font-medium leading-relaxed">
              Add to your home screen for instant access, immersive full-screen mode, and smooth offline performance!
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end items-center mt-1">
          <button 
            onClick={handleDismiss}
            className="px-4 py-2 text-xs font-bold text-steel hover:text-ink hover:bg-surface-hover rounded-lg transition-all"
          >
            Later
          </button>
          <button 
            onClick={handleInstallClick}
            className="px-5 py-2 text-xs font-bold bg-brand-green text-canvas hover:opacity-90 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Install Now
          </button>
        </div>
      </div>
    </div>
  );
}
