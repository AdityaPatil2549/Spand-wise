import type { StateCreator } from 'zustand';
import type { AppStore } from './index';
import type { ExpenseDocument } from '@/types/firestore';

export interface ExpensesSlice {
  expenses: ExpenseDocument[];
  isExpensesLoading: boolean;
  /** The currently displayed month ("YYYY-MM") */
  selectedMonth: string;
  /** An array of months to load data for, starts with just selectedMonth */
  loadedMonths: string[];
  setExpenses: (expenses: ExpenseDocument[]) => void;
  setExpensesLoading: (loading: boolean) => void;
  setSelectedMonth: (month: string) => void;
  /** Add another month to the loaded list (for pagination) */
  addLoadedMonth: (month: string) => void;
  /** Optimistically add an expense to the list before Firestore confirms */
  addExpenseOptimistic: (expense: ExpenseDocument) => void;
  /** Optimistically remove a (soft-deleted) expense from the list */
  removeExpenseOptimistic: (id: string) => void;
  /** Restore a previously optimistically removed expense (undo) */
  restoreExpenseOptimistic: (expense: ExpenseDocument) => void;
  /** Update a specific expense in the list (after edit) */
  updateExpenseOptimistic: (updated: Partial<ExpenseDocument> & { id: string }) => void;
}

const currentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const createExpensesSlice: StateCreator<AppStore, [], [], ExpensesSlice> = (set) => ({
  expenses: [],
  isExpensesLoading: true,
  selectedMonth: currentMonth(),
  loadedMonths: [currentMonth()],

  setExpenses: (expenses) => set({ expenses }),
  setExpensesLoading: (isExpensesLoading) => set({ isExpensesLoading }),
  
  setSelectedMonth: (selectedMonth) => set({ 
    selectedMonth,
    loadedMonths: [selectedMonth] // reset loaded months when main month changes
  }),

  addLoadedMonth: (month) => set((state) => ({
    loadedMonths: state.loadedMonths.includes(month) ? state.loadedMonths : [...state.loadedMonths, month]
  })),

  addExpenseOptimistic: (expense) =>
    set((state) => ({
      expenses: [expense, ...state.expenses].sort(
        (a, b) => b.date.toMillis() - a.date.toMillis()
      ),
    })),

  removeExpenseOptimistic: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    })),

  restoreExpenseOptimistic: (expense) =>
    set((state) => ({
      expenses: [expense, ...state.expenses].sort(
        (a, b) => b.date.toMillis() - a.date.toMillis()
      ),
    })),

  updateExpenseOptimistic: (updated) =>
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === updated.id ? { ...e, ...updated } : e
      ),
    })),
});
