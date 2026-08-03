import { Timestamp } from 'firebase/firestore';

/**
 * Firestore document shapes for SpendWise.
 * These interfaces define the exact structure stored in Firestore.
 * All reads from Firestore must be cast to these types.
 */

/**
 * /users/{uid}
 * User profile document. Created on first Google OAuth login.
 */
export interface UserDocument {
 uid: string;
 email: string;
 displayName: string | null;
 photoURL: string | null;
 createdAt: Timestamp;
 lastActive: Timestamp;
 /** True after the user completes the onboarding budget setup flow */
 onboardingComplete: boolean;
 /** Household ID this user belongs to */
 householdId: string;
}

/**
 * /households/{householdId}
 * Represents a shared budget/expense space.
 */
export interface HouseholdDocument {
 id: string;
 members: string[]; // array of uids
 createdBy: string;
 createdAt: Timestamp;
}

/**
 * /users/{uid}/budgets/{YYYY-MM}
 * Pre-aggregated budget summary for a given month.
 * Updated atomically (via writeBatch) whenever an expense is added/edited/deleted.
 * This allows the dashboard to load with a single document read.
 */
export interface BudgetDocument {
 /** Document ID, e.g. "2026-07" */
 id: string;
 /** User's defined monthly allowance */
 budgetAmount: number;
 /** System-calculated running total of all non-deleted expenses for this month */
 totalSpent: number;
 /** Optional map of categoryId to specific budget allowance */
 categoryBudgets?: Record<string, number>;
 createdAt: Timestamp;
 updatedAt: Timestamp;
}

/**
 * /users/{uid}/expenses/{expense_id}
 * Individual expense transaction. Never hard-deleted — uses soft-delete pattern.
 */
export interface ExpenseDocument {
 /** Firestore auto-generated document ID */
 id: string;
 /** Amount in INR (always positive) */
 amount: number;
 /** Foreign key referencing the category ID in /users/{uid}/categories/ */
 categoryId: string;
 /** Optional user note, max 200 characters */
 note: string | null;
 /** The datetime the expense occurred (may differ from createdAt if user edits) */
 date: Timestamp;
 /** Derived field "YYYY-MM" — used for Firestore queries without needing date math */
 month: string;
 /** Soft-delete flag. When true, this expense is excluded from budget calculations. */
 isDeleted: boolean;
 createdAt: Timestamp;
 /** Set when expense is edited */
 updatedAt?: Timestamp;
 /** UID of the user who added this expense */
 createdBy?: string;
}

/**
 * /users/{uid}/categories/{category_id}
 * Category definitions. In MVP, these are seeded from PRESET_CATEGORIES.
 * In v1.1, users can create custom categories (max 10).
 */
export interface CategoryDocument {
 id: string;
 name: string;
 emoji?: string;
 icon?: string;
 /** Hex color string, e.g. "#f97316" */
 color: string;
 /** True if created by the system (preset); false if user-created */
 isDefault: boolean;
 createdAt: Timestamp;
}
