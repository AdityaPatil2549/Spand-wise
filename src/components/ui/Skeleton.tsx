'use client';

import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

/**
 * High-fidelity theme-aware Shimmer skeleton loader.
 * Uses hardware-accelerated shimmer animation with smooth opacity.
 */
export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={clsx(
      'relative overflow-hidden bg-theme-elevated/50 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-theme-surface/30 before:to-transparent',
      className
    )}
    aria-hidden="true"
  />
);

/** Skeleton preset for an individual transaction list item */
export const ExpenseItemSkeleton = () => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-theme-surface/40 border border-theme-border/20">
    <div className="flex items-center gap-3">
      <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </div>
    </div>
    <div className="space-y-1.5 flex flex-col items-end">
      <Skeleton className="h-5 w-20 rounded-md" />
      <Skeleton className="h-3 w-12 rounded-md" />
    </div>
  </div>
);

/** Multiple transaction rows skeleton group */
export const TransactionSkeletonGroup = ({ count = 4 }: { count?: number }) => (
  <div className="flex flex-col gap-2.5">
    {Array.from({ length: count }).map((_, i) => (
      <ExpenseItemSkeleton key={i} />
    ))}
  </div>
);

/** Skeleton preset for the budget hero card */
export const BudgetHeroSkeleton = () => (
  <div className="glass-panel rounded-3xl p-8 space-y-6 border border-theme-border/30">
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-28 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-3 w-24 rounded-md" />
      <Skeleton className="h-14 w-52 rounded-2xl" />
    </div>
    <div className="space-y-2 pt-4">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-2.5 w-full rounded-full" />
    </div>
  </div>
);

/** Skeleton preset for student goals cards */
export const GoalCardSkeleton = () => (
  <div className="p-5 rounded-2xl bg-theme-surface/50 border border-theme-border/30 space-y-4">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-10 rounded-full" />
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
    <div className="flex justify-between">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);
