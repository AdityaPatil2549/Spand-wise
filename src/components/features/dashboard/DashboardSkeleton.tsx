'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Deterministic SSR layout skeleton for the Bento Grid dashboard.
 * Matches exact desktop (3-column) and mobile bounding geometry to achieve CLS = 0.000.
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col w-full pb-32 md:pb-16 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      {/* Top Header Shell */}
      <div className="mb-6 space-y-2.5">
        <Skeleton className="h-3.5 w-32 rounded-full" />
        <Skeleton className="h-10 w-72 sm:w-96 rounded-xl" />
        <Skeleton className="h-4 w-60 sm:w-80 rounded-md" />
      </div>

      {/* 3-Column Bento Grid Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Tile A: Hero Balance & Safe Daily Spend (Col-Span 7) */}
        <div className="lg:col-span-7 rounded-[28px] p-6 sm:p-8 bg-theme-surface/70 border border-theme-border/40 min-h-[340px] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="space-y-3 my-6">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-12 w-64 rounded-xl" />
            <Skeleton className="h-5 w-44 rounded-full" />
          </div>
          <div className="space-y-3 pt-4 border-t border-theme-border/20">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-3.5 w-24 rounded-md" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        </div>

        {/* Tile B: 30-Day Velocity Pacing Sparkline (Col-Span 5) */}
        <div className="lg:col-span-5 rounded-[28px] p-6 sm:p-8 bg-theme-surface/70 border border-theme-border/40 min-h-[340px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded-md" />
              <Skeleton className="h-5 w-36 rounded-md" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-36 w-full rounded-2xl my-3" />
          <div className="flex justify-between items-center pt-3 border-t border-theme-border/20">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-3.5 w-20 rounded-md" />
          </div>
        </div>

        {/* Tile C: 1-Tap Fast-Log Bar (Col-Span 12) */}
        <div className="lg:col-span-12 rounded-2xl p-4 bg-theme-surface/70 border border-theme-border/40 flex flex-wrap gap-2.5 items-center">
          <Skeleton className="h-4 w-28 rounded-md mr-3" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>

        {/* Tile D: Recent Activity Ledger (Col-Span 8) */}
        <div className="lg:col-span-8 rounded-[24px] p-6 bg-theme-surface/70 border border-theme-border/40 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-theme-border/20">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-theme-border/10 last:border-b-0">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Tile E: Upcoming Subscriptions & Split Hub (Col-Span 4) */}
        <div className="lg:col-span-4 rounded-[24px] p-6 bg-theme-surface/70 border border-theme-border/40 space-y-5">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-md" />
            <div className="p-3.5 rounded-xl bg-theme-base/60 border border-theme-border/30 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>
          <div className="space-y-3 pt-3 border-t border-theme-border/20">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
