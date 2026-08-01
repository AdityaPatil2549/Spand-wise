'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/firebase/auth';
import { userDocRef } from '@/lib/firebase/firestore';
import { getDoc } from 'firebase/firestore';
import { useStore } from '@/store';
import type { UserDocument } from '@/types/firestore';
import type { User } from 'firebase/auth';

/**
 * useAuth — Global auth state listener.
 * Must be called ONCE at the top-level AppShell or layout.
 * Syncs Firebase auth state to Zustand and reads onboardingComplete from Firestore.
 */
export const useAuthListener = (): void => {
  const { setUser, setAuthLoading, setOnboardingComplete, setHouseholdId } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        setUser(user);
        // Fetch onboarding status and householdId from Firestore
        try {
          const snap = await getDoc(userDocRef(user.uid));
          if (snap.exists()) {
            const data = snap.data() as UserDocument;
            setOnboardingComplete(data.onboardingComplete ?? false);
            setHouseholdId(data.householdId ?? user.uid); // Fallback to uid if missing
          } else {
             // Edge case: User doc not created yet, default household to uid
             setHouseholdId(user.uid);
          }
        } catch {
          // Non-fatal — default to incomplete and uid
          setOnboardingComplete(false);
          setHouseholdId(user.uid);
        }
      } else {
        setUser(null);
        setOnboardingComplete(false);
        setHouseholdId(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading, setOnboardingComplete, setHouseholdId]);
};

/**
 * useAuthGuard — Redirect unauthenticated users to /login.
 * Use in protected page components.
 */
export const useAuthGuard = (): { user: User | null; isLoading: boolean } => {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const isAuthLoading = useStore((s) => s.isAuthLoading);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  return { user, isLoading: isAuthLoading };
};
