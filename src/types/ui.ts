/**
 * UI component prop types and domain types for SpendWise.
 */

/** Possible variants for toast notifications */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** A single toast notification */
export interface Toast {
 id: string;
 type: ToastType;
 message: string;
 /** Duration in ms before auto-dismiss. Defaults to DEFAULT_TOAST_DURATION_MS. */
 duration?: number;
 /** Optional action label (e.g., "Undo") */
 actionLabel?: string;
 /** Callback fired when action button is clicked */
 onAction?: () => void;
}

/** Budget health states that drive the hero card color */
export type BudgetState = 'safe' | 'warning' | 'critical';

/** Grouped expenses for the timeline view */
export interface ExpenseDayGroup {
 /** Display label: "Today", "Yesterday", or "Mon, 21 Jul" */
 label: string;
 /** Raw date string "YYYY-MM-DD" used as key */
 dateKey: string;
 expenses: import('./firestore').ExpenseDocument[];
 /** Sum of all expenses in this group */
 totalAmount: number;
}

/** Navigation item definition */
export interface NavItem {
 id: string;
 label: string;
 href: string;
 icon: string; // Lucide icon name
}

/** Bottom sheet state */
export interface BottomSheetState {
 isOpen: boolean;
 /** The ID of the expense being edited, if in edit mode */
 editingExpenseId: string | null;
 /** The initial category to select when adding a new expense */
 initialCategoryId?: string | null;
}

/** Analytics category breakdown item */
export interface CategoryBreakdown {
 categoryId: string;
 categoryName: string;
 emoji: string;
 icon?: string;
 color: string;
 amount: number;
 percentage: number;
 count: number;
}

/** Month selector option */
export interface MonthOption {
 /** "YYYY-MM" */
 value: string;
 /** "July 2026" */
 label: string;
}
