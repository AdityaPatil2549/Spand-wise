'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Extend the window object to include the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if we've already asked
    const hasAsked = localStorage.getItem('pwa-prompt-dismissed');
    
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (hasAsked || isStandalone) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 bg-[var(--surface-primary)] p-4 rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--surface-secondary)] z-50 flex items-start gap-4 animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
        <Download className="w-6 h-6 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[var(--text-primary)] mb-1">Install SpendWise</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2">
          Add to your home screen for faster access and offline support.
        </p>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={handleInstall} className="flex-1 text-xs py-1.5">
            Install App
          </Button>
          <Button variant="outline" size="sm" onClick={handleDismiss} className="px-3">
            Not now
          </Button>
        </div>
      </div>
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] rounded-full transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
