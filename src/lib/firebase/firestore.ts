import {
 collection,
 doc,
 type CollectionReference,
 type DocumentReference,
} from 'firebase/firestore';
import { db } from './index';
import type { UserDocument, BudgetDocument, ExpenseDocument, CategoryDocument, HouseholdDocument, GoalDocument } from '@/types/firestore';

/**
 * Typed Firestore collection and document reference helpers.
 * Centralizing these prevents typos in collection names throughout the codebase.
 */

/** /users/{uid} — User profile document reference */
export const userDocRef = (uid: string): DocumentReference<UserDocument> =>
 doc(db, 'users', uid) as DocumentReference<UserDocument>;

/** /households/{householdId} — Household document reference */
export const householdDocRef = (householdId: string): DocumentReference<HouseholdDocument> =>
 doc(db, 'households', householdId) as DocumentReference<HouseholdDocument>;

/** /households/{householdId}/budgets — Budget documents collection reference */
export const budgetsColRef = (householdId: string): CollectionReference<BudgetDocument> =>
 collection(db, 'households', householdId, 'budgets') as CollectionReference<BudgetDocument>;

/** /households/{householdId}/budgets/{monthId} — Budget document for a specific month */
export const budgetDocRef = (householdId: string, monthId: string): DocumentReference<BudgetDocument> =>
 doc(db, 'households', householdId, 'budgets', monthId) as DocumentReference<BudgetDocument>;

/** /households/{householdId}/expenses — Expenses collection reference */
export const expensesColRef = (householdId: string): CollectionReference<ExpenseDocument> =>
 collection(db, 'households', householdId, 'expenses') as CollectionReference<ExpenseDocument>;

/** /households/{householdId}/expenses/{expenseId} — Single expense document reference */
export const expenseDocRef = (householdId: string, expenseId: string): DocumentReference<ExpenseDocument> =>
 doc(db, 'households', householdId, 'expenses', expenseId) as DocumentReference<ExpenseDocument>;

/** /households/{householdId}/categories — Categories collection reference */
export const categoriesColRef = (householdId: string): CollectionReference<CategoryDocument> =>
 collection(db, 'households', householdId, 'categories') as CollectionReference<CategoryDocument>;

/** /households/{householdId}/categories/{categoryId} — Single category document reference */
export const categoryDocRef = (householdId: string, categoryId: string): DocumentReference<CategoryDocument> =>
 doc(db, 'households', householdId, 'categories', categoryId) as DocumentReference<CategoryDocument>;

/** /households/{householdId}/goals — Goals collection reference */
export const goalsColRef = (householdId: string): CollectionReference<GoalDocument> =>
 collection(db, 'households', householdId, 'goals') as CollectionReference<GoalDocument>;

/** /households/{householdId}/goals/{goalId} — Single goal document reference */
export const goalDocRef = (householdId: string, goalId: string): DocumentReference<GoalDocument> =>
 doc(db, 'households', householdId, 'goals', goalId) as DocumentReference<GoalDocument>;

