import type { StateCreator } from 'zustand';
import type { User } from 'firebase/auth';
import type { AppStore } from './index';

import type { QuickAddPreset } from '@/types/firestore';

export interface AuthSlice {
  user: User | null;
  isAuthLoading: boolean;
  isOnboardingComplete: boolean;
  householdId: string | null;
  quickAddPresets: QuickAddPreset[] | null;
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setHouseholdId: (householdId: string | null) => void;
  setQuickAddPresets: (presets: QuickAddPreset[] | null) => void;
}

export const createAuthSlice: StateCreator<AppStore, [], [], AuthSlice> = (set) => ({
  user: null,
  isAuthLoading: true, // Start true — wait for Firebase to confirm auth state
  isOnboardingComplete: false,
  householdId: null,
  quickAddPresets: null,

  setUser: (user) => set({ user }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
  setOnboardingComplete: (isOnboardingComplete) => set({ isOnboardingComplete }),
  setHouseholdId: (householdId) => set({ householdId }),
  setQuickAddPresets: (quickAddPresets) => set({ quickAddPresets }),
});
