import { StateCreator } from 'zustand';
import type { AppStore } from './index';
import type { GoalDocument } from '@/types/firestore';
import { goalsColRef, goalDocRef } from '@/lib/firebase/firestore';
import { getDocs, addDoc, updateDoc, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';

export interface GoalsSlice {
  goals: GoalDocument[];
  isGoalsLoading: boolean;

  // Actions
  loadGoals: (householdId: string) => Promise<void>;
  addGoal: (goal: Omit<GoalDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<GoalDocument>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number) => Promise<void>;
}

export const createGoalsSlice: StateCreator<
  AppStore,
  [['zustand/devtools', never]],
  [],
  GoalsSlice
> = (set, get) => ({
  goals: [],
  isGoalsLoading: false,

  loadGoals: async (householdId: string) => {
    if (!householdId) return;
    set({ isGoalsLoading: true });
    try {
      const q = query(goalsColRef(householdId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const goals: GoalDocument[] = snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      set({ goals });
    } catch (error) {
      console.error('Failed to load financial goals:', error);
    } finally {
      set({ isGoalsLoading: false });
    }
  },

  addGoal: async (newGoalData) => {
    const householdId = get().householdId;
    if (!householdId) return;

    try {
      const now = Timestamp.now();
      const payload: Omit<GoalDocument, 'id'> = {
        ...newGoalData,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(goalsColRef(householdId), payload as any);
      const createdGoal: GoalDocument = {
        id: docRef.id,
        ...payload,
      };

      set((state) => ({
        goals: [createdGoal, ...state.goals],
      }));
      get().addToast({ type: 'success', message: `Goal "${newGoalData.name}" created!` });
    } catch (error) {
      console.error('Failed to add goal:', error);
      get().addToast({ type: 'error', message: 'Failed to create goal.' });
    }
  },

  updateGoal: async (goalId, updates) => {
    const householdId = get().householdId;
    if (!householdId) return;

    // Optimistic update
    set((state) => ({
      goals: state.goals.map(g => (g.id === goalId ? { ...g, ...updates, updatedAt: Timestamp.now() } : g)),
    }));

    try {
      await updateDoc(goalDocRef(householdId, goalId), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to update goal:', error);
      get().addToast({ type: 'error', message: 'Failed to update goal.' });
    }
  },

  deleteGoal: async (goalId) => {
    const householdId = get().householdId;
    if (!householdId) return;

    // Optimistic removal
    set((state) => ({
      goals: state.goals.filter(g => g.id !== goalId),
    }));

    try {
      await deleteDoc(goalDocRef(householdId, goalId));
      get().addToast({ type: 'info', message: 'Goal removed.' });
    } catch (error) {
      console.error('Failed to delete goal:', error);
      get().addToast({ type: 'error', message: 'Failed to delete goal.' });
    }
  },

  contributeToGoal: async (goalId, amount) => {
    const householdId = get().householdId;
    if (!householdId || amount <= 0) return;

    const goal = get().goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = goal.currentAmount + amount;
    const isCompleted = newAmount >= goal.targetAmount;

    // Optimistic update
    set((state) => ({
      goals: state.goals.map(g =>
        g.id === goalId ? { ...g, currentAmount: newAmount, isCompleted, updatedAt: Timestamp.now() } : g
      ),
    }));

    try {
      await updateDoc(goalDocRef(householdId, goalId), {
        currentAmount: newAmount,
        isCompleted,
        updatedAt: Timestamp.now(),
      });
      get().addToast({
        type: 'success',
        message: isCompleted ? `🎉 Goal "${goal.name}" completed!` : `Added ₹${amount} towards "${goal.name}"!`,
      });
    } catch (error) {
      console.error('Failed to contribute to goal:', error);
      get().addToast({ type: 'error', message: 'Failed to update contribution.' });
    }
  },
});
