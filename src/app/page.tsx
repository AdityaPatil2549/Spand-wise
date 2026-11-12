'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

/**
 * RootPage — Auth + Onboarding Router.
 * Waits for GlobalProviders' useAuthListener to finish hydrating both Firebase Auth
 * and Firestore user metadata before redirecting, avoiding any race condition.
 */
export default function RootPage() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const isAuthLoading = useStore((s) => s.isAuthLoading);
  const isOnboardingComplete = useStore((s) => s.isOnboardingComplete);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      router.replace('/login');
    } else if (isOnboardingComplete) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, [user, isAuthLoading, isOnboardingComplete, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-base">
      <div className="w-10 h-10 rounded-2xl bg-theme-accent/15 border border-theme-accent/30 flex items-center justify-center animate-pulse">
        <div className="w-4 h-4 rounded-full bg-theme-accent" />
      </div>
    </div>
  );
}
