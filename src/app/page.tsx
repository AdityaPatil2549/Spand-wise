'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { onAuthChange } from '@/lib/firebase/auth';

/**
 * Root route — redirects based on auth state.
 * Unauthenticated → /login
 * Authenticated + onboarding complete → /dashboard
 * Authenticated + not onboarded → /onboarding
 */
export default function RootPage() {
 const router = useRouter();

 useEffect(() => {
 const unsubscribe = onAuthChange((user) => {
 if (!user) {
 router.replace('/login');
 } else {
 // Check Zustand store for onboarding state
 const { isOnboardingComplete } = useStore.getState();
 if (isOnboardingComplete) {
 router.replace('/dashboard');
 } else {
 router.replace('/onboarding');
 }
 }
 });
 return () => unsubscribe();
 }, [router]);

 // Show nothing while redirecting
 return (
 <div className="min-h-screen bg-[var(--surface-base)] flex items-center justify-center">
 <div className="w-8 h-8 rounded-full border-3 border-violet-600 border-t-transparent animate-spin" />
 </div>
 );
}
