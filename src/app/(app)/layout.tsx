'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useStore } from '@/store';
import { BudgetHeroSkeleton, ExpenseItemSkeleton } from '@/components/ui/Skeleton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const isAuthLoading = useStore((s) => s.isAuthLoading);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return (
      <div
        className="min-h-[100dvh] w-full bg-theme-base text-theme-primary flex flex-col justify-center"
        aria-busy="true"
        aria-label="Verifying session"
      >
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6 opacity-70">
          <BudgetHeroSkeleton />
          <div className="space-y-3">
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
