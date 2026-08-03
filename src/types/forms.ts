/**
 * Form input types for SpendWise.
 * These are the validated shapes of data coming from React Hook Form + Zod.
 * They are different from Firestore document types (no Timestamps, no IDs).
 */

/**
 * Input for the Add Expense bottom sheet form.
 */
export interface AddExpenseInput {
 amount: number;
 categoryId: string;
 note?: string;
 /** ISO date string — defaults to current datetime, can be changed by user */
 date: string;
}

/**
 * Input for the Edit Expense bottom sheet form.
 * Same shape as Add, but requires the expense ID.
 */
export interface EditExpenseInput extends AddExpenseInput {
 id: string;
}

/**
 * Input for the onboarding budget setup form.
 */
export interface OnboardingInput {
 budgetAmount: number;
}

/**
 * Input for updating the budget in Settings.
 */
export interface UpdateBudgetInput {
 budgetAmount: number;
}

/**
 * Input for email/password sign in.
 */
export interface EmailSignInInput {
 email: string;
 password: string;
}

/**
 * Input for email/password sign up.
 */
export interface EmailSignUpInput {
 email: string;
 password: string;
 confirmPassword: string;
}
