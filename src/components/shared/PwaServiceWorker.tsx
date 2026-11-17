'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * PwaServiceWorker registers the Serwist service worker (/sw.js)
 * and displays an unobtrusive offline status indicator when the device is disconnected.
 */
export const PwaServiceWorker = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerWorker = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
      } catch (err) {
        // Silently catch in dev or if sw.js is not yet generated
        console.debug('[PWA] Service Worker registration skipped:', err);
      }
    };

    if (document.readyState === 'complete') {
      registerWorker();
    } else {
      window.addEventListener('load', registerWorker);
      return () => window.removeEventListener('load', registerWorker);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-amber-500/95 text-stone-950 font-medium text-xs shadow-xl backdrop-blur border border-amber-400/40 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0 text-stone-950" />
        <span>Offline Mode — Changes saved locally and will auto-sync when back online.</span>
      </div>
    </aside>
  );
};
