'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/store';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global cached prompt so early window events are not lost across component lifecycles
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((listener) => listener(globalDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    promptListeners.forEach((listener) => listener(null));
    try {
      localStorage.setItem('spendwise_app_installed', 'true');
    } catch {}
  });
}

export function useMobileInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => globalDeferredPrompt);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  const isDownloadSheetOpen = useStore((s) => s.isDownloadSheetOpen);
  const openDownloadSheet = useStore((s) => s.openDownloadSheet);
  const closeDownloadSheet = useStore((s) => s.closeDownloadSheet);
  const addToast = useStore((s) => s.addToast);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || '';
    const iosCheck = /iPhone|iPad|iPod/i.test(ua);
    const androidCheck = /Android/i.test(ua);
    const mobileScreen = window.innerWidth < 768 || iosCheck || androidCheck || /Mobile|Silk|Kindle/i.test(ua);

    const standaloneCheck =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error - iOS Safari specific property
      navigator.standalone === true ||
      document.referrer.includes('android-app://');

    setIsIOS(iosCheck);
    setIsAndroid(androidCheck);
    setIsMobile(mobileScreen);
    setIsStandalone(standaloneCheck);

    const storedInstalled = localStorage.getItem('spendwise_app_installed') === 'true';
    setIsInstalled(standaloneCheck || storedInstalled);

    const handlePromptUpdate = (p: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(p);
    };

    promptListeners.add(handlePromptUpdate);

    const handleResize = () => {
      const isMob = window.innerWidth < 768 || iosCheck || androidCheck;
      setIsMobile(isMob);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      promptListeners.delete(handlePromptUpdate);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual_guide'> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          setIsInstalled(true);
          try {
            localStorage.setItem('spendwise_app_installed', 'true');
          } catch {}
          addToast({
            type: 'success',
            message: 'SpendWise installed successfully! Launch it anytime from your home screen.',
          });
          closeDownloadSheet();
          return 'accepted';
        } else {
          return 'dismissed';
        }
      } catch {
        return 'manual_guide';
      }
    }
    return 'manual_guide';
  }, [deferredPrompt, addToast, closeDownloadSheet]);

  return {
    isMobile,
    isIOS,
    isAndroid,
    isStandalone,
    isInstalled,
    canPromptDirectly: !!deferredPrompt,
    promptInstall,
    isDownloadSheetOpen,
    openDownloadSheet,
    closeDownloadSheet,
  };
}
