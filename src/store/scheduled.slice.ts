import type { StateCreator } from 'zustand';
import type { AppStore } from './index';
import type { ScheduledTransactionDocument } from '@/types/firestore';
import { getScheduledTransactions } from '@/lib/scheduled';

export interface ScheduledSlice {
  scheduledTransactions: ScheduledTransactionDocument[];
  isScheduledLoading: boolean;
  fetchScheduledTransactions: (householdId: string) => Promise<void>;
  addScheduledOptimistic: (transaction: ScheduledTransactionDocument) => void;
  updateScheduledOptimistic: (transaction: ScheduledTransactionDocument) => void;
  removeScheduledOptimistic: (id: string) => void;
}

export const createScheduledSlice: StateCreator<AppStore, [], [], ScheduledSlice> = (set) => ({
  scheduledTransactions: [],
  isScheduledLoading: false,

  fetchScheduledTransactions: async (householdId) => {
    set({ isScheduledLoading: true });
    try {
      const data = await getScheduledTransactions(householdId);
      set({ scheduledTransactions: data });
    } catch (error) {
      console.error('Error fetching scheduled transactions:', error);
    } finally {
      set({ isScheduledLoading: false });
    }
  },

  addScheduledOptimistic: (transaction) =>
    set((state) => ({
      scheduledTransactions: [...state.scheduledTransactions, transaction],
    })),

  updateScheduledOptimistic: (transaction) =>
    set((state) => ({
      scheduledTransactions: state.scheduledTransactions.map((t) =>
        t.id === transaction.id ? transaction : t
      ),
    })),

  removeScheduledOptimistic: (id) =>
    set((state) => ({
      scheduledTransactions: state.scheduledTransactions.filter((t) => t.id !== id),
    })),
});
