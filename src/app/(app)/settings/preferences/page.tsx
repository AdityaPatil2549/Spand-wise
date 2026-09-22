'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { ThemeSelector } from '@/components/shared/ThemeSelector';

export default function PreferencesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-32 animate-fade-in">
      <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-theme-surface transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-theme-primary" />
          </button>
          <h1 className="text-2xl font-bold text-theme-primary tracking-tight">Preferences</h1>
        </div>

        <div className="space-y-8">
          
          {/* Theme Section */}
          <section>
            <h2 className="text-sm font-semibold text-theme-secondary mb-4 uppercase tracking-wider">Appearance</h2>
            <ThemeSelector />
          </section>

          {/* Device Section */}
          <section>
            <h2 className="text-sm font-semibold text-theme-secondary mb-4 uppercase tracking-wider">Device Settings</h2>
            <div className="bg-theme-surface border border-theme-border rounded-3xl overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-4 hover:bg-theme-elevated transition-colors"
                onClick={() => {
                  if (navigator.vibrate) {
                    navigator.vibrate(50);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-theme-primary">Haptic Feedback</div>
                    <div className="text-xs text-theme-secondary">Vibrate on interactions</div>
                  </div>
                </div>
                <div className="w-12 h-6 bg-theme-accent rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
