'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col w-full pb-32 md:pb-16 animate-pulse" aria-busy="true">
      {/* Top Header Shell */}
      <div className="mb-6 flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-32 rounded-full" />
          <Skeleton className="h-8 w-56 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Grid of Domain Modules */}
      <div className="space-y-6">
        {/* Row 1: Health Gauge & Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 rounded-[28px] p-7 bg-theme-surface/70 border border-theme-border/40 min-h-[300px] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-36 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-14 w-32 rounded-2xl my-4" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          <div className="lg:col-span-6 rounded-[28px] p-7 bg-theme-surface/70 border border-theme-border/40 min-h-[300px] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-36 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
            <Skeleton className="h-40 w-40 rounded-full mx-auto my-2" />
            <Skeleton className="h-8 w-full rounded-xl" />
          </div>
        </div>

        {/* Row 2: Burn Velocity Trajectory */}
        <div className="rounded-[28px] p-7 bg-theme-surface/70 border border-theme-border/40 min-h-[280px] space-y-4">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>

        {/* Row 3: Goals */}
        <div className="rounded-[28px] p-7 bg-theme-surface/70 border border-theme-border/40 min-h-[220px] space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-40 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
