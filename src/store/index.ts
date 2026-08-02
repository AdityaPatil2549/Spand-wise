import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createAuthSlice, type AuthSlice } from './auth.slice';
import { createExpensesSlice, type ExpensesSlice } from './expenses.slice';
import { createBudgetSlice, type BudgetSlice } from './budget.slice';
import { createUISlice, type UISlice } from './ui.slice';
import { createCategoriesSlice, type CategoriesSlice } from './categories.slice';

export type AppStore = AuthSlice & ExpensesSlice & BudgetSlice & UISlice & CategoriesSlice;

/**
 * Root Zustand store combining all domain slices.
 * devtools middleware is only active in development.
 */
export const useStore = create<AppStore>()(
  devtools(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createExpensesSlice(...a),
      ...createBudgetSlice(...a),
      ...createUISlice(...a),
      ...createCategoriesSlice(...a),
    }),
    { name: 'SpendWiseStore', enabled: process.env.NODE_ENV === 'development' }
  )
);
