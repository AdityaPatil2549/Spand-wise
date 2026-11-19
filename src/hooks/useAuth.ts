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
  const { setUser, setAuthLoading, setOnboardingComplete, setHouseholdId, setQuickAddPresets } = useStore();

  useEffect(() => {
    let activeSessionId = 0;

    const unsubscribe = onAuthChange((user) => {
      activeSessionId += 1;
      const sessionId = activeSessionId;

      if (user) {
        setUser(user);
        setHouseholdId(user.uid);
        // Unblock the authenticated shell immediately; user prefs hydrate asynchronously below.
        setAuthLoading(false);

        void getDoc(userDocRef(user.uid))
          .then((snap) => {
            if (sessionId !== activeSessionId) return;
            if (snap.exists()) {
              const data = snap.data() as UserDocument;
              setOnboardingComplete(data.onboardingComplete ?? false);
              setHouseholdId(data.householdId ?? user.uid);
              setQuickAddPresets(data.quickAddPresets ?? null);
            } else {
              setHouseholdId(user.uid);
              setQuickAddPresets(null);
            }
          })
          .catch(() => {
            if (sessionId !== activeSessionId) return;
            setOnboardingComplete(false);
            setHouseholdId(user.uid);
            setQuickAddPresets(null);
          });
      } else {
        // Preserve guest demo session if active
        const currentUser = useStore.getState().user;
        if (currentUser?.uid === 'guest_demo_user') {
          return;
        }

        setUser(null);
        setOnboardingComplete(false);
        setHouseholdId(null);
        setQuickAddPresets(null);
        setAuthLoading(false);
      }
    });

    return () => {
      activeSessionId += 1;
      unsubscribe();
    };
  }, [setUser, setAuthLoading, setOnboardingComplete, setHouseholdId, setQuickAddPresets]);
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
