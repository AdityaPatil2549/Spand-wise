'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Download,
  Share,
  PlusSquare,
  WifiOff,
  Zap,
  RefreshCw,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useMobileInstall } from '@/hooks/useMobileInstall';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function AppDownloadSheet() {
  const {
    isMobile,
    isIOS,
    isStandalone,
    isInstalled,
    canPromptDirectly,
    promptInstall,
    isDownloadSheetOpen,
    openDownloadSheet,
    closeDownloadSheet,
  } = useMobileInstall();

  const [showAutoBanner, setShowAutoBanner] = useState(false);

  useEffect(() => {
    // Show smart install banner on mobile web outside standalone mode if not dismissed recently
    if (!isMobile || isStandalone || isInstalled) return;

    try {
      const dismissedTime = localStorage.getItem('spendwise_install_banner_dismissed_at');
      if (dismissedTime) {
        const diffHours = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60);
        if (diffHours < 48) return; // Don't nag if dismissed in last 48 hours
      }
    } catch {}

    const timer = setTimeout(() => {
      setShowAutoBanner(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isMobile, isStandalone, isInstalled]);

  const handleDismissBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAutoBanner(false);
    try {
      localStorage.setItem('spendwise_install_banner_dismissed_at', Date.now().toString());
    } catch {}
  };

  const handleInstallClick = async () => {
    if (canPromptDirectly) {
      await promptInstall();
    }
  };

  // If running in standalone mode, the app is already installed!
  if (isStandalone) return null;

  return (
    <>
      {/* 1. Mobile-Only Smart Slide-up Banner (Above BottomNav) */}
      <AnimatePresence>
        {showAutoBanner && !isDownloadSheetOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed left-3 right-3 bottom-[5.5rem] md:hidden z-[var(--z-fab)] pointer-events-auto"
          >
            <div
              onClick={() => {
                setShowAutoBanner(false);
                openDownloadSheet();
              }}
              className="glass-panel p-3.5 rounded-2xl bg-theme-surface/95 border border-theme-accent/40 shadow-2xl flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition-all backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-theme-accent text-theme-on-accent flex items-center justify-center shrink-0 shadow-sm">
                  <Download className="w-5 h-5 stroke-[2.4]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-theme-primary truncate">
                      Install SpendWise App
                    </span>
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-theme-accent/15 text-theme-accent">
                      Offline
                    </span>
                  </div>
                  <p className="text-[11px] text-theme-secondary truncate">
                    1-tap install on your phone · Works 100% offline
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAutoBanner(false);
                    openDownloadSheet();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-theme-accent text-theme-on-accent text-xs font-bold shadow-sm active:scale-95"
                >
                  Get
                </button>
                <button
                  type="button"
                  onClick={handleDismissBanner}
                  className="p-1.5 text-theme-secondary hover:text-theme-primary rounded-lg"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Full Smartphone Download & Installation Bottom Sheet */}
      <AnimatePresence>
        {isDownloadSheetOpen && (
          <div className="fixed inset-0 z-[var(--z-modal)] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDownloadSheet}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-lg bg-theme-surface rounded-t-[2rem] sm:rounded-3xl border border-theme-border/60 shadow-2xl p-6 overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Header with App Icon */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-theme-base border border-theme-border p-2.5 shadow-md flex items-center justify-center">
                    <BrandLogo size="md" showText={false} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold font-display text-theme-primary">
                        SpendWise App
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-theme-accent/15 text-theme-accent border border-theme-accent/20">
                        {isIOS ? 'iPhone' : 'Android'}
                      </span>
                    </div>
                    <p className="text-xs text-theme-secondary mt-0.5">
                      Fast, standalone mobile app with 100% offline access
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDownloadSheet}
                  className="p-2 rounded-full text-theme-secondary hover:text-theme-primary hover:bg-theme-base/60 transition-colors"
                  aria-label="Close download sheet"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3 Core Value Props */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                <div className="p-3 rounded-2xl bg-theme-base/60 border border-theme-border/40 text-center flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-theme-accent/15 text-theme-accent flex items-center justify-center mb-1.5">
                    <WifiOff className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold text-theme-primary block">
                    100% Offline
                  </span>
                  <span className="text-[10px] text-theme-secondary mt-0.5">
                    No signal needed
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-theme-base/60 border border-theme-border/40 text-center flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-theme-positive/15 text-theme-positive flex items-center justify-center mb-1.5">
                    <Zap className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold text-theme-primary block">
                    Instant Launch
                  </span>
                  <span className="text-[10px] text-theme-secondary mt-0.5">
                    Zero URL bar
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-theme-base/60 border border-theme-border/40 text-center flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center mb-1.5">
                    <RefreshCw className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold text-theme-primary block">
                    Auto-Sync
                  </span>
                  <span className="text-[10px] text-theme-secondary mt-0.5">
                    Syncs on Wi-Fi
                  </span>
                </div>
              </div>

              {/* OS-Specific Installation Flow */}
              {isIOS ? (
                /* iOS Safari 2-Step Visual Instructions */
                <div className="p-4 rounded-2xl bg-theme-base/80 border border-theme-border/60 mb-6 space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-theme-secondary">
                    How to install on your iPhone
                  </h4>

                  <div className="flex items-start gap-3 text-xs text-theme-primary">
                    <div className="w-6 h-6 rounded-lg bg-theme-surface border border-theme-border flex items-center justify-center shrink-0 font-bold text-theme-accent">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">
                        Tap Safari&apos;s <span className="text-theme-accent font-bold">Share</span> button in the bottom bar
                      </p>
                      <p className="text-[11px] text-theme-secondary mt-0.5 flex items-center gap-1.5">
                        <Share className="w-3.5 h-3.5 text-blue-400 inline" /> Look for the square box with upward arrow
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-theme-primary">
                    <div className="w-6 h-6 rounded-lg bg-theme-surface border border-theme-border flex items-center justify-center shrink-0 font-bold text-theme-accent">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">
                        Scroll down and tap <span className="text-theme-accent font-bold">Add to Home Screen</span>
                      </p>
                      <p className="text-[11px] text-theme-secondary mt-0.5 flex items-center gap-1.5">
                        <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> Tap &quot;Add&quot; in the top-right corner
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Android 1-Tap Native Install Flow */
                <div className="space-y-4 mb-6">
                  {canPromptDirectly ? (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={handleInstallClick}
                        className="w-full py-3.5 px-4 rounded-2xl bg-theme-accent hover:bg-theme-accent-hover text-theme-on-accent font-bold text-sm shadow-lg shadow-theme-accent/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 stroke-[2.5]" />
                        <span>Download &amp; Install App</span>
                      </button>
                      <p className="text-[11px] text-center text-theme-secondary">
                        Tapping will trigger Android&apos;s native app installation onto your home screen.
                      </p>
                    </div>
                  ) : (
                    /* Fallback Android Manual Step (e.g. if prompt already triggered or third-party browser) */
                    <div className="p-4 rounded-2xl bg-theme-base/80 border border-theme-border/60 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-theme-secondary">
                        How to install on Android
                      </h4>
                      <p className="text-xs text-theme-primary">
                        1. Tap Chrome&apos;s <span className="font-bold text-theme-accent">three dots (⋮)</span> in the top-right corner.
                      </p>
                      <p className="text-xs text-theme-primary">
                        2. Tap <span className="font-bold text-theme-accent">Install app</span> or <span className="font-bold text-theme-accent">Add to Home screen</span>.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Offline Guarantee Badge */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  All your data stays saved in your phone&apos;s local memory. Fully operational in Airplane Mode.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
