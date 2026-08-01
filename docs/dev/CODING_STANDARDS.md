# Coding Standards
## SpendWise — Student Expense Tracker

---

## 1. General Principles

1. **Write for the next developer, not the compiler.** Code is read 10× more than it's written.
2. **Optimize for clarity, then performance.** Premature optimization is the root of all evil.
3. **One thing per function.** A function that does two things should be two functions.
4. **Fail loudly in development, fail gracefully in production.** Use `console.error` in dev, toast in prod.

---

## 2. TypeScript Standards

### 2.1 Type Declarations

```typescript
// ✅ Always use explicit return types for public functions
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// ✅ Use interfaces for object shapes
interface AddExpenseInput {
  amount: number;
  categoryId: string;
  note?: string;
  date: Date;
}

// ✅ Use type for unions and computed types
type BudgetStatus = 'safe' | 'warning' | 'exceeded';
type CategoryId = string;

// ❌ No 'any' type (use 'unknown' if truly unknown, then narrow)
const handleError = (error: unknown): void => {
  if (error instanceof FirebaseError) {
    // Narrow to known type
  }
};

// ✅ Use const assertions for literal arrays
const CATEGORIES = ['food', 'transport', 'education'] as const;
type Category = typeof CATEGORIES[number];  // 'food' | 'transport' | 'education'
```

### 2.2 Generics

```typescript
// ✅ Use generics for reusable utilities
const mapFirestoreDoc = <T>(snap: DocumentSnapshot): T & { id: string } => ({
  id: snap.id,
  ...(snap.data() as T),
});

// ✅ Constrain generics when possible
const findById = <T extends { id: string }>(items: T[], id: string): T | undefined => {
  return items.find(item => item.id === id);
};
```

### 2.3 Null Safety

```typescript
// ✅ Use nullish coalescing (??) not logical OR (||) for default values
const amount = expense.amount ?? 0;  // Only uses default if null/undefined
const amount = expense.amount || 0;  // ❌ Also uses default if amount is 0

// ✅ Use optional chaining (?.) 
const displayName = user?.displayName ?? 'Anonymous';

// ✅ Use early returns to flatten nesting
const getExpense = async (id: string): Promise<ExpenseDocument | null> => {
  const snap = await getDoc(doc(db, 'expenses', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ExpenseDocument;
};
```

---

## 3. React Standards

### 3.1 Component Structure

```typescript
// ✅ Correct component structure order:
// 1. Interface/Props type
// 2. Component function
// 3. Hooks (in this order: state, effects, derived values, handlers)
// 4. Early returns (loading, error, empty states)
// 5. JSX return

interface ExpenseCardProps {
  expense: ExpenseDocument;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export const ExpenseCard = ({ expense, onEdit, onDelete, className }: ExpenseCardProps) => {
  // 1. Zustand/context state
  const { showToast } = useUIStore();
  
  // 2. Local state
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 3. Effects (only if needed)
  
  // 4. Derived values
  const formattedAmount = formatCurrency(expense.amount);
  const timeAgo = formatRelativeTime(expense.date.toDate());
  
  // 5. Event handlers
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExpense(expense.userId, expense.id);
      showToast({ type: 'success', message: `Expense deleted · Undo`, undoFn: () => {} });
    } catch (error) {
      showToast({ type: 'error', message: 'Could not delete expense' });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // 6. Early returns
  if (isDeleting) return <ExpenseCardSkeleton />;
  
  // 7. Main render
  return (
    <div className={cn('expense-card', className)}>
      {/* content */}
    </div>
  );
};
```

### 3.2 Hooks

```typescript
// ✅ Custom hooks start with 'use'
export const useExpenses = (month: string) => {
  const expenses = useExpensesStore(state => state.expenses);
  const isLoading = useExpensesStore(state => state.isLoading);
  
  // Filter client-side to avoid additional Firestore query
  const monthExpenses = useMemo(
    () => expenses.filter(e => e.month === month && !e.isDeleted),
    [expenses, month]
  );
  
  return { expenses: monthExpenses, isLoading };
};

// ✅ Always clean up effects
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};
```

### 3.3 Performance

```typescript
// ✅ Memoize expensive computations
const categoryTotals = useMemo(() => {
  return expenses.reduce((acc, expense) => {
    acc[expense.categoryId] = (acc[expense.categoryId] ?? 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
}, [expenses]);

// ✅ Memoize callback functions passed to children
const handleExpenseDelete = useCallback((id: string) => {
  // ...
}, [deleteExpense, showToast]);

// ✅ Use React.memo for pure presentational components
export const CategoryIcon = React.memo(({ emoji, color }: CategoryIconProps) => (
  <div style={{ background: color }} className="category-icon">
    {emoji}
  </div>
));
CategoryIcon.displayName = 'CategoryIcon';
```

---

## 4. Firebase Standards

### 4.1 Firestore Operations

```typescript
// ✅ Always filter by userId AND isDeleted
const baseQuery = (userId: string) => query(
  collection(db, 'expenses'),
  where('userId', '==', userId),
  where('isDeleted', '==', false)
);

// ✅ Use transactions for related writes (atomic)
await runTransaction(db, async (tx) => {
  // Multiple reads first
  const snap1 = await tx.get(ref1);
  const snap2 = await tx.get(ref2);
  // Then all writes
  tx.set(ref3, data);
  tx.update(ref4, update);
});

// ✅ Use serverTimestamp() for timestamps — never client Date
await addDoc(collection(db, 'expenses'), {
  ...data,
  createdAt: serverTimestamp(),  // ✅
  // createdAt: new Date(),       // ❌ Client clock may be wrong
});

// ✅ Limit all queries
query(collection, where(...), orderBy(...), limit(100));
// Never: query(collection, where(...)) without a limit
```

### 4.2 Real-time Listeners

```typescript
// ✅ ALWAYS store and call unsubscribe
useEffect(() => {
  const unsubscribe = onSnapshot(
    query,
    (snap) => { /* handle */ },
    (error) => { /* handle error */ }
  );
  return unsubscribe;  // Cleanup
}, [userId, month]);

// ✅ Handle onSnapshot errors explicitly
const unsubscribe = onSnapshot(
  query,
  (snap) => { setData(snap.docs.map(d => d.data())); },
  (error) => {
    console.error('[Firestore listener error]', error);
    showToast({ type: 'error', message: 'Lost connection. Reconnecting...' });
  }
);
```

---

## 5. Error Handling Standards

### 5.1 Error Map

```typescript
// src/lib/utils/errors.ts
import { FirebaseError } from 'firebase/app';

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'You don\'t have permission to do that.',
  'not-found': 'This data no longer exists.',
  'already-exists': 'This already exists.',
  'resource-exhausted': 'Too many requests. Please wait a moment.',
  'unavailable': 'No internet connection. Changes saved locally.',
  'invalid-argument': 'Invalid input. Please check your data.',
  'internal': 'Something went wrong. Please try again.',
  'deadline-exceeded': 'Request timed out. Please try again.',
  // Auth errors
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 8 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/network-request-failed': 'No internet connection. Please try again.',
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    return FIREBASE_ERROR_MESSAGES[error.code] ?? 'Something went wrong. Please try again.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
};
```

### 5.2 Error Boundaries

```typescript
// Every major route should have an error boundary
// src/app/(app)/dashboard/error.tsx

'use client';

export default function DashboardError({ 
  error, 
  reset 
}: { 
  error: Error; 
  reset: () => void; 
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
    // Report to error monitoring (Sentry, etc.)
  }, [error]);
  
  return (
    <div className="error-state">
      <h2>Something went wrong loading your dashboard</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 6. CSS / Tailwind Standards

### 6.1 Class Order (Tailwind)

Follow this order for Tailwind classes:
1. Layout (display, position, flex, grid)
2. Sizing (width, height, min/max)
3. Spacing (margin, padding)
4. Typography (font, text, leading)
5. Colors (bg, text, border)
6. Effects (shadow, opacity)
7. Transitions / animations
8. Responsive prefixes (md:, lg:)
9. State variants (hover:, focus:, dark:)

```tsx
// ✅ Ordered and readable
<button className="
  flex items-center justify-center
  w-full h-12
  px-6 py-3
  text-sm font-semibold
  text-white bg-primary-600
  rounded-full shadow-brand
  transition-all duration-150
  hover:bg-primary-700 hover:scale-102
  focus:outline-none focus:ring-2 focus:ring-primary-500
  disabled:opacity-50 disabled:cursor-not-allowed
">
```

### 6.2 Use `cn()` for Conditional Classes

```typescript
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Usage:
<div className={cn(
  'base-class another-class',
  isActive && 'active-class',
  variant === 'primary' && 'primary-class',
  className  // Allow external overrides
)}>
```

---

## 7. Import Organization

```typescript
// Order of imports:
// 1. React and Next.js
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// 2. Third-party libraries
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where } from 'firebase/firestore';

// 3. Internal — types
import type { ExpenseDocument } from '@/types/firestore';

// 4. Internal — utilities and hooks
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency } from '@/lib/utils/format';
import { addExpense } from '@/lib/expenses/addExpense';

// 5. Internal — components
import { Button } from '@/components/ui/Button';
import { ExpenseListItem } from '@/components/expense/ExpenseListItem';

// 6. Styles (if any component-level)
// (prefer Tailwind — avoid component-level CSS files)
```

---

## 8. Comments and Documentation

```typescript
// ✅ Comment the WHY, not the WHAT
// We use soft delete (isDeleted flag) instead of hard delete because:
// 1. Budget recalculation Cloud Functions need the document to exist briefly
// 2. Enables "undo delete" feature
// 3. Maintains audit trail for debugging
const softDeleteExpense = async (id: string) => { ... };

// ✅ JSDoc for exported functions
/**
 * Formats a currency amount for display in Indian number format.
 * 
 * @param amount - The amount in paise (1 paise = 0.01 rupee)
 * @returns Formatted string like "₹1,50,000"
 * @throws If amount is negative
 */
export const formatCurrency = (amount: number): string => { ... };

// ❌ Don't comment obvious code
// Set amount to 0
const amount = 0;  // Useless comment

// ❌ Don't leave TODO comments without tracking
// TODO: Fix this later  ← Create a GitHub issue instead
```

---

## 9. Git Commit Hygiene

```bash
# ✅ Atomic commits (one logical change per commit)
git commit -m "feat(expenses): add swipe-to-delete on mobile"
git commit -m "test(expenses): add test for swipe-to-delete"

# ❌ Don't bundle unrelated changes
git commit -m "fix bug, update readme, add new feature, cleanup"

# ✅ Commit often — small, focused commits
# ❌ Don't commit:
#   - Console.log statements
#   - Commented-out code
#   - Failing tests
#   - .env files
```

---

*Coding Standards v1.0 — July 2026. Enforced via ESLint + Prettier + Husky pre-commit hooks.*
