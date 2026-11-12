'use client';

import React, { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Download,
  Palette,
  FolderKanban,
  SlidersHorizontal,
  ChevronRight,
  Tags,
  Sparkles,
} from 'lucide-react';
import { ThemeSelector } from '@/components/shared/ThemeSelector';

export default function SettingsPage() {
  const { user, isLoading } = useAuthGuard();
  const router = useRouter();
  const addToast = useStore((s) => s.addToast);
  const [isThemesExpanded, setIsThemesExpanded] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      const { useStore } = await import('@/store');
      useStore.getState().setUser(null);
      useStore.getState().setHouseholdId(null);
      router.push('/login');
    } catch {
      addToast({ type: 'error', message: 'Sign out failed.' });
    }
  };

  if (isLoading) return null;

  return (
    <div className="text-theme-primary flex flex-col w-full pb-32 md:pb-12">
      <div className="px-4 sm:px-6 md:px-8 py-4 max-w-5xl mx-auto w-full flex-1 space-y-6">
        {/* Profile Identity Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-theme-surface/80 border border-theme-border/60 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-theme-accent/15 border border-theme-accent/30 flex items-center justify-center text-theme-accent text-xl font-bold shadow-sm shrink-0">
              {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-theme-accent mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span>SpendWise Studio</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-theme-primary truncate">
                {user?.displayName || 'SpendWise User'}
              </h1>
              <p className="text-theme-secondary text-xs sm:text-sm truncate font-sans">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/settings/export')}
            className="inline-flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-theme-base hover:bg-theme-elevated border border-theme-border/60 text-theme-primary transition-all active:scale-95 cursor-pointer shrink-0 self-start sm:self-center"
          >
            <Download className="w-4 h-4 text-theme-accent" />
            <span>Export CSV / PDF</span>
          </button>
        </div>

        {/* Dedicated Theme Studio (Expanded by Default) */}
        <section className="rounded-3xl bg-theme-surface/80 border border-theme-border/60 p-4 sm:p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setIsThemesExpanded((prev) => !prev)}
            className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-theme-accent/15 text-theme-accent flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base sm:text-lg text-theme-primary">
                  Theme Studio
                </h2>
                <p className="text-xs text-theme-secondary">
                  20 distinct personal styles with calibrated contrast, typography &amp; mood
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 text-theme-secondary transition-transform duration-200 ${
                isThemesExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>

          {isThemesExpanded && (
            <div className="mt-5 pt-4 border-t border-theme-border/40 animate-in fade-in duration-150">
              <ThemeSelector />
            </div>
          )}
        </section>

        {/* Budget, Categories & Account Controls */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-theme-tertiary uppercase tracking-wider px-1">
            Preferences &amp; Controls
          </h2>
          <div className="space-y-1.5 rounded-3xl bg-theme-surface/80 border border-theme-border/60 p-2 shadow-sm">
            <button
              type="button"
              onClick={() => router.push('/settings/categories')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-theme-surface-hover rounded-2xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 text-theme-primary">
                <FolderKanban className="w-4 h-4 text-theme-secondary group-hover:text-theme-accent transition-colors" />
                <div className="text-left">
                  <span className="font-semibold text-sm block">Manage Categories</span>
                  <span className="text-xs text-theme-secondary">
                    Customize icons, colors, and income categories
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-theme-secondary opacity-70" />
            </button>

            <button
              type="button"
              onClick={() => router.push('/settings/limits')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-theme-surface-hover rounded-2xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 text-theme-primary">
                <SlidersHorizontal className="w-4 h-4 text-theme-secondary group-hover:text-theme-accent transition-colors" />
                <div className="text-left">
                  <span className="font-semibold text-sm block">Adjust Category Limits</span>
                  <span className="text-xs text-theme-secondary">
                    Tune monthly allowance and per-category caps
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-theme-secondary opacity-70" />
            </button>

            <button
              type="button"
              onClick={() => router.push('/tags')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-theme-surface-hover rounded-2xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 text-theme-primary">
                <Tags className="w-4 h-4 text-theme-secondary group-hover:text-theme-accent transition-colors" />
                <div className="text-left">
                  <span className="font-semibold text-sm block">Hashtag &amp; Event Labels</span>
                  <span className="text-xs text-theme-secondary">
                    Review auto-grouped #hashtags from transaction notes
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-theme-secondary opacity-70" />
            </button>

            <div className="h-px bg-theme-border/40 my-1 mx-2" />

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-3.5 hover:bg-rose-500/10 rounded-2xl transition-all cursor-pointer group text-rose-500"
            >
              <div className="flex items-center gap-3.5">
                <LogOut className="w-4 h-4" />
                <span className="font-semibold text-sm">Sign Out</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
