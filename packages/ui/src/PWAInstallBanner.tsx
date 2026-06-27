import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export function PWAInstallBanner({ 
  appName = "VidyaPlus",
  collapsed = false 
}: { 
  appName?: string;
  collapsed?: boolean;
}) {
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

  if (!visible) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="w-full flex items-center h-10 px-3 rounded-md text-sm font-medium text-brand-green hover:bg-brand-green/10 transition-colors group"
      title={`Install ${appName}`}
    >
      <Download className="w-4 h-4 flex-shrink-0 text-brand-green" />
      {!collapsed && <span className="ml-3">Install App</span>}
    </button>
  );
}
