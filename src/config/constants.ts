/**
 * App-wide constants for SpendWise.
 * Use these instead of magic numbers throughout the codebase.
 */

/** Maximum allowed expense amount in INR */
export const MAX_EXPENSE_AMOUNT = 1_000_000;

/** Minimum allowed expense amount in INR */
export const MIN_EXPENSE_AMOUNT = 0.01;

/** Maximum note length for an expense */
export const MAX_NOTE_LENGTH = 200;

/** Maximum number of custom categories a user can add (post-MVP) */
export const MAX_CUSTOM_CATEGORIES = 10;

/** Budget warning threshold — show amber state when remaining % drops below this */
export const BUDGET_WARNING_PERCENT = 20;

/** Budget critical threshold — show red state when remaining falls below zero */
export const BUDGET_CRITICAL_PERCENT = 0;

/** Currency code for display */
export const CURRENCY_CODE = 'INR';

/** Currency symbol */
export const CURRENCY_SYMBOL = '₹';

/** Locale for number formatting */
export const LOCALE = 'en-IN';

/** Maximum expenses to fetch per Firestore query page */
export const EXPENSES_PAGE_SIZE = 100;

/** Duration (ms) for the undo toast after soft-deleting an expense */
export const UNDO_TOAST_DURATION_MS = 5000;

/** Duration (ms) for regular success/error toasts */
export const DEFAULT_TOAST_DURATION_MS = 3500;

/** App name */
export const APP_NAME = 'SpendWise';

/** App tagline */
export const APP_TAGLINE = 'Track your college spends in 3 seconds.';

/** Default minimum budget amount */
export const MIN_BUDGET_AMOUNT = 100;

/** Default maximum budget amount */
export const MAX_BUDGET_AMOUNT = 10_000_000;
