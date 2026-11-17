'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, LayoutGrid, ReceiptText, Wallet, RefreshCw } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function OfflineFallbackPage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen w-full bg-theme-base text-theme-primary flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-theme-accent/30 select-none">
      <div className="w-full max-w-md bg-theme-surface border border-theme-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="flex justify-center">
          <BrandLogo size="lg" showText={true} />
        </div>

        {/* Offline Badge & Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shadow-sm">
            <WifiOff className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-theme-primary">
              You&apos;re Offline
            </h1>
            <p className="text-xs sm:text-sm text-theme-secondary mt-1 text-balance">
              No internet connection detected, but your local data is safely stored on your phone.
            </p>
          </div>
        </div>

        {/* Offline Capabilities Card */}
        <div className="p-4 rounded-2xl bg-theme-base/60 border border-theme-border/40 text-left space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-theme-secondary block">
            Offline Access Ready
          </span>
          <p className="text-xs text-theme-primary leading-relaxed">
            You can still navigate cached pages, view your accounts, and log transactions. Any changes you make will automatically sync when you reconnect.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="space-y-2 pt-2">
          <Link
            href="/dashboard"
            className="w-full py-3 px-4 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-theme-on-accent font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
            <span>Open Dashboard</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/transactions"
              className="py-2.5 px-3 rounded-xl bg-theme-base hover:bg-theme-elevated text-theme-primary font-semibold text-xs border border-theme-border flex items-center justify-center gap-1.5 transition-all"
            >
              <ReceiptText className="w-3.5 h-3.5 text-theme-accent" />
              <span>Activity</span>
            </Link>

            <Link
              href="/accounts"
              className="py-2.5 px-3 rounded-xl bg-theme-base hover:bg-theme-elevated text-theme-primary font-semibold text-xs border border-theme-border flex items-center justify-center gap-1.5 transition-all"
            >
              <Wallet className="w-3.5 h-3.5 text-theme-positive" />
              <span>Wallets</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={handleReload}
            className="w-full py-2.5 px-3 rounded-xl text-theme-secondary hover:text-theme-primary text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-theme-base/40 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
}
