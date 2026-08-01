'use client';

import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

/**
 * Shimmer skeleton loader.
 * Use for content areas while data is being fetched.
 */
export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={clsx('shimmer rounded-xl', className)}
    aria-hidden="true"
  />
);

/** Skeleton preset for an expense list item */
export const ExpenseItemSkeleton = () => (
  <div className="flex items-center gap-3 p-4">
    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-5 w-16" />
  </div>
);

/** Skeleton preset for the budget hero card */
export const BudgetHeroSkeleton = () => (
  <div className="bg-violet-800/30 rounded-2xl p-6 space-y-4">
    <Skeleton className="h-4 w-24 bg-white/10" />
    <Skeleton className="h-12 w-48 bg-white/20" />
    <Skeleton className="h-2 w-full bg-white/10 rounded-full" />
  </div>
);
