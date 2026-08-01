import type { StateCreator } from 'zustand';
import type { AppStore } from './index';
import type { BudgetDocument } from '@/types/firestore';
import type { BudgetState } from '@/types/ui';
import { BUDGET_WARNING_PERCENT } from '@/config/constants';

export interface BudgetSlice {
  budget: BudgetDocument | null;
  isBudgetLoading: boolean;
  setBudget: (budget: BudgetDocument | null) => void;
  setBudgetLoading: (loading: boolean) => void;
  /** Optimistically adjust totalSpent (before Firestore batch confirms) */
  adjustTotalSpentOptimistic: (delta: number) => void;
  /** Optimistically set a category budget */
  setCategoryBudgetOptimistic: (categoryId: string, amount: number) => void;
  /** Derived: remaining budget in INR */
  getBudgetRemaining: () => number;
  /** Derived: budget health state for color coding */
  getBudgetState: () => BudgetState;
  /** Derived: percentage of budget remaining (0–1+) */
  getBudgetRemainingPercent: () => number;
}

export const createBudgetSlice: StateCreator<AppStore, [], [], BudgetSlice> = (set, get) => ({
  budget: null,
  isBudgetLoading: true,

  setBudget: (budget) => set({ budget }),
  setBudgetLoading: (isBudgetLoading) => set({ isBudgetLoading }),

  adjustTotalSpentOptimistic: (delta) =>
    set((state) => {
      if (!state.budget) return {};
      return {
        budget: {
          ...state.budget,
          totalSpent: Math.max(0, state.budget.totalSpent + delta),
        },
      };
    }),
    
  setCategoryBudgetOptimistic: (categoryId, amount) =>
    set((state) => {
      if (!state.budget) return {};
      return {
        budget: {
          ...state.budget,
          categoryBudgets: {
            ...state.budget.categoryBudgets,
            [categoryId]: amount,
          },
        },
      };
    }),

  getBudgetRemaining: () => {
    const { budget } = get();
    if (!budget) return 0;
    return budget.budgetAmount - (budget.totalSpent || 0);
  },

  getBudgetState: (): BudgetState => {
    const { budget } = get();
    if (!budget || budget.budgetAmount === 0) return 'safe';
    const totalSpent = budget.totalSpent || 0;
    const remainingPercent = ((budget.budgetAmount - totalSpent) / budget.budgetAmount) * 100;
    if (remainingPercent <= 0) return 'critical';
    if (remainingPercent <= BUDGET_WARNING_PERCENT) return 'warning';
    return 'safe';
  },

  getBudgetRemainingPercent: () => {
    const { budget } = get();
    if (!budget || budget.budgetAmount === 0) return 1;
    const totalSpent = budget.totalSpent || 0;
    return Math.max(0, (budget.budgetAmount - totalSpent) / budget.budgetAmount);
  },
});
