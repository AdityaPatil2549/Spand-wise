# AGENTS.md — Project Rules & AI Agent Guidelines
## SpendWise — Student Expense Tracker

> This file defines rules, patterns, and guidelines for AI agents (and human developers) working on this codebase. Every agent MUST read this file before making any changes.

---

## 1. Project Identity

**Project Name:** SpendWise  
**Type:** Next.js 14 Progressive Web App (App Router)  
**Domain:** Student expense tracking with real-time multi-device sync  
**Stack:** Next.js + TypeScript + Tailwind CSS + Firebase  

---

## 2. Core Principles (READ FIRST)

### 2.1 Simplicity Over Complexity
- Write the minimum code necessary to solve the problem
- Do NOT add speculative features, "future-proofing," or unused utilities
- If 50 lines can do what 200 lines do, write 50 lines

### 2.2 Surgical Changes Only
- Touch ONLY the files necessary for the task
- Do NOT refactor adjacent code unless it's directly broken
- Do NOT rename variables or restructure files unless the task requires it
- Do NOT add console.log statements and forget to remove them

### 2.3 Type Safety is Non-Negotiable
- Every function must have explicit TypeScript types
- No `any` type unless absolutely unavoidable (with a comment explaining why)
- All Firestore document shapes must reference interfaces in `src/types/`

### 2.4 Design System Compliance
- Every UI change must use design tokens from `src/styles/tokens.css`
- No hardcoded hex colors anywhere in component files
- No hardcoded pixel values for spacing (use spacing scale)

### 2.5 Accessibility is Required
- Every interactive element needs an ARIA label if it's icon-only
- All images need meaningful alt text
- Minimum touch target: 44×44px (use `min-h-[44px] min-w-[44px]`)

---

## 3. Folder Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Unauthenticated routes
│   │   ├── login/
│   │   └── onboarding/
│   ├── (app)/                  # Authenticated routes (with nav)
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── expenses/
│   │   ├── analytics/
│   │   ├── reports/
│   │   └── settings/
│   ├── globals.css
│   └── layout.tsx
│
├── components/                 # Reusable UI components
│   ├── ui/                     # Primitive components (Button, Input, Card, etc.)
│   ├── expense/                # Expense-specific components
│   ├── budget/                 # Budget-specific components
│   ├── analytics/              # Chart and analytics components
│   ├── layout/                 # Navigation, sidebar, shell
│   └── shared/                 # Cross-domain shared components
│
├── lib/                        # Business logic + utilities
│   ├── firebase/               # Firebase initialization + helpers
│   │   ├── index.ts            # Firebase app init
│   │   ├── auth.ts             # Auth helpers
│   │   ├── firestore.ts        # Firestore helpers
│   │   └── listeners.ts        # Real-time listener management
│   ├── expenses/               # Expense CRUD operations
│   ├── budget/                 # Budget operations
│   ├── categories/             # Category operations
│   ├── reports/                # PDF/CSV generation
│   └── utils/                  # Generic utilities (format, date, etc.)
│
├── store/                      # Zustand global state
│   ├── index.ts                # Store creation + slice combination
│   ├── auth.slice.ts
│   ├── expenses.slice.ts
│   ├── budget.slice.ts
│   └── ui.slice.ts
│
├── types/                      # TypeScript interfaces and types
│   ├── firestore.ts            # Firestore document shapes
│   ├── forms.ts                # Form input types
│   └── ui.ts                   # UI component prop types
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useExpenses.ts
│   ├── useBudget.ts
│   └── useCategories.ts
│
├── styles/                     # Global styles
│   ├── tokens.css              # Design tokens (THE source of truth)
│   └── globals.css             # Tailwind directives + global base styles
│
└── config/                     # App configuration
    ├── env.ts                  # Environment variable validation (Zod)
    ├── categories.ts           # Preset categories data
    └── constants.ts            # App-wide constants
```

---

## 4. Naming Conventions

### 4.1 Files and Directories
| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `ExpenseListItem.tsx` |
| Non-component files | camelCase | `useExpenses.ts`, `addExpense.ts` |
| Directories | kebab-case | `expense-list/` |
| Test files | `*.test.ts` or `*.spec.ts` | `addExpense.test.ts` |
| Type files | camelCase | `firestore.ts` |

### 4.2 Code Identifiers
```typescript
// Interfaces: PascalCase with descriptive suffix
interface ExpenseDocument { ... }
interface AddExpenseInput { ... }
interface BudgetSlice { ... }

// Types: PascalCase
type CategoryId = string;
type Month = string;  // 'YYYY-MM'

// Enums: PascalCase + SCREAMING_SNAKE values
enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

// Functions: camelCase, verb-first
const addExpense = async () => {};
const formatCurrency = () => {};
const getMonthlyExpenses = async () => {};

// Constants: SCREAMING_SNAKE_CASE
const MAX_CUSTOM_CATEGORIES = 10;
const DEFAULT_BUDGET_WARNING_PERCENT = 80;

// React components: PascalCase
const ExpenseListItem = () => {};

// Zustand actions: camelCase, verb-first
const setExpenses = () => {};
const addExpenseOptimistic = () => {};
```

### 4.3 Component Props
```typescript
// Always use explicit Props interface, named [ComponentName]Props
interface ExpenseListItemProps {
  expense: ExpenseDocument;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const ExpenseListItem = ({ expense, onEdit, onDelete, className }: ExpenseListItemProps) => {};
```

---

## 5. Code Quality Rules

### 5.1 TypeScript
```typescript
// ✅ CORRECT — Explicit types
const getExpense = async (userId: string, expenseId: string): Promise<ExpenseDocument | null> => {}

// ❌ WRONG — Implicit any
const getExpense = async (userId, expenseId) => {}

// ✅ CORRECT — Type narrowing
if (snap.exists()) {
  const data = snap.data() as ExpenseDocument;
}

// ❌ WRONG — Bypassing types
const data = snap.data() as any;
```

### 5.2 Error Handling
```typescript
// ✅ CORRECT — Typed error handling with user feedback
try {
  await addExpense(userId, input);
  showToast({ type: 'success', message: 'Expense added!' });
} catch (error) {
  if (error instanceof FirebaseError) {
    handleFirebaseError(error);  // Maps error codes to user messages
  } else {
    showToast({ type: 'error', message: 'Something went wrong. Please try again.' });
    console.error('[addExpense]', error);
  }
}

// ❌ WRONG — Silent error swallowing
try {
  await addExpense(userId, input);
} catch (e) {
  // nothing
}
```

### 5.3 Async/Await
```typescript
// ✅ CORRECT
const data = await fetchData();
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// ❌ WRONG — .then() chains (less readable, harder to debug)
fetchData().then(data => { ... }).catch(e => { ... });
```

### 5.4 React Components
```typescript
// ✅ CORRECT — Named exports only
export const ExpenseListItem = () => {};

// ❌ WRONG — Default exports (harder to refactor)
export default function ExpenseListItem() {}
// EXCEPTION: Next.js page files must use default exports

// ✅ CORRECT — Early returns for empty states
if (!expense) return null;
if (isLoading) return <Skeleton />;
return <ExpenseCard expense={expense} />;

// ❌ WRONG — Deeply nested conditionals
return (
  <div>
    {isLoading ? <Skeleton /> : (
      expense ? <ExpenseCard expense={expense} /> : null
    )}
  </div>
);
```

---

## 6. Firebase Rules

### 6.1 Firestore Access Patterns
```typescript
// ✅ CORRECT — Always include userId filter + isDeleted filter
query(
  collection(db, 'expenses'),
  where('userId', '==', userId),
  where('isDeleted', '==', false),
  orderBy('date', 'desc'),
  limit(100)
)

// ❌ WRONG — Missing security filters (will fail security rules anyway, but be explicit)
query(collection(db, 'expenses'), where('month', '==', month))

// ✅ CORRECT — Use transactions for related writes
await runTransaction(db, async (tx) => {
  tx.set(expenseRef, expenseData);
  tx.update(budgetRef, budgetUpdates);
});

// ❌ WRONG — Sequential writes that can leave data inconsistent
await setDoc(expenseRef, expenseData);
await updateDoc(budgetRef, budgetUpdates);
```

### 6.2 Real-time Listeners
```typescript
// ✅ CORRECT — Always store unsubscribe function and call it on cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(query, callback);
  return () => unsubscribe();
}, [userId]);

// ❌ WRONG — Memory leak (listener never cleaned up)
useEffect(() => {
  onSnapshot(query, callback);
}, [userId]);
```

---

## 7. Styling Rules

### 7.1 Use Design Tokens
```tsx
// ✅ CORRECT — Using Tailwind classes mapped to tokens
<div className="bg-surface-primary text-text-primary rounded-xl p-6">

// ✅ CORRECT — CSS custom properties in inline styles when Tailwind can't express
<div style={{ background: 'var(--gradient-hero)' }}>

// ❌ WRONG — Hardcoded colors
<div style={{ backgroundColor: '#7c3aed' }}>
<div className="bg-[#7c3aed]">
```

### 7.2 Responsive Design
```tsx
// ✅ CORRECT — Mobile first, then larger breakpoints
<div className="p-4 md:p-6 lg:p-8">
<div className="flex flex-col lg:flex-row">

// ❌ WRONG — Desktop first
<div className="flex-row sm:flex-col">
```

### 7.3 Animation
```tsx
// ✅ CORRECT — Use Framer Motion for complex animations
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.25, ease: 'easeOut' }}
>

// ✅ CORRECT — Use Tailwind transitions for simple hover/focus
<button className="transition-all duration-150 ease-out hover:scale-105">

// ❌ WRONG — CSS @keyframes inline in component files
<div style={{ animation: 'fadeIn 0.3s ease' }}>
```

---

## 8. Testing Rules

### 8.1 What to Test
- All utility functions in `src/lib/utils/`
- All Zustand store slice actions
- All form validation schemas (Zod)
- All custom hooks that contain business logic
- E2E: critical user flows (add expense, view dashboard, export report)

### 8.2 Test File Location
- Unit tests: colocated with source file (`addExpense.ts` → `addExpense.test.ts`)
- E2E tests: `e2e/` directory at project root

### 8.3 Test Standards
```typescript
// ✅ CORRECT — Descriptive test names
describe('addExpense', () => {
  it('should successfully add a valid expense to Firestore', async () => { ... });
  it('should throw invalid-argument error when amount is 0', async () => { ... });
  it('should throw invalid-argument error when amount exceeds 1,000,000', async () => { ... });
});

// ❌ WRONG — Vague test names
it('works', async () => { ... });
it('test 1', async () => { ... });
```

---

## 9. Git Rules

### 9.1 Branch Naming
```
feature/US-006-add-expense-flow
bugfix/US-013-budget-display-incorrect
hotfix/auth-redirect-broken
chore/update-dependencies
docs/add-api-spec
```

### 9.2 Commit Message Format (Conventional Commits)
```
feat(expenses): add expense entry bottom sheet with optimistic UI
fix(dashboard): correct budget remaining calculation on month reset
chore(deps): upgrade firebase to v10.12.0
docs(api): add addExpense API specification
test(expenses): add unit tests for addExpense utility
refactor(store): split expenses slice from monolithic store
style(dashboard): align budget card with design token updates
perf(analytics): lazy-load chart components
```

### 9.3 PR Rules
- Every PR must link to a User Story (US-XXX)
- PRs must pass all CI checks before merge
- Minimum 1 reviewer approval required
- No "WIP" PRs merged to main
- Maximum 400 lines changed per PR (break up large PRs)

---

## 10. Environment Rules

### 10.1 Never hardcode environment values
```typescript
// ✅ CORRECT
const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// ❌ WRONG
const projectId = 'spendwise-production';
```

### 10.2 Environment files
- `.env.local` — Local development secrets (NEVER commit)
- `.env.example` — Template with placeholder values (COMMIT this)
- `.env.test` — Test environment values (commit safe values only)
- `.env.production` — Production values set via CI/CD secrets (NEVER commit)

---

## 11. Performance Rules

1. **Never import entire libraries** — Use named imports
   ```typescript
   // ✅ import { format } from 'date-fns';
   // ❌ import * as dateFns from 'date-fns';
   ```

2. **Lazy load heavy components** — jsPDF, SheetJS only on Reports page
   ```typescript
   const PDFGenerator = dynamic(() => import('@/components/reports/PDFGenerator'), { ssr: false });
   ```

3. **Limit Firestore reads** — Use real-time listeners, not repeated `getDoc()` in render
4. **Paginate large lists** — Maximum 100 expenses per query, load more on scroll
5. **Memoize expensive computations** — Category breakdown calculations use `useMemo`

---

## 12. Security Rules

1. **Never log sensitive data** — No user amounts, email, or IDs in client-side logs
2. **Validate all inputs client-side AND via Firestore rules** — Defense in depth
3. **Verify ownership before every Firestore write** — Firestore rules + client check
4. **No sensitive data in URL params** — No `?userId=xxx` in routes
5. **Auth check on every protected route** — Use middleware or `useAuth` hook guard

---

## 13. AI Agent Behavior

When an AI agent makes changes to this codebase, it MUST:

1. ✅ Read this AGENTS.md before any code changes
2. ✅ State which User Story or task the change relates to
3. ✅ Only modify files necessary for the stated task
4. ✅ Follow all naming conventions listed above
5. ✅ Add TypeScript types to any new functions
6. ✅ Use design tokens (not hardcoded values) in all UI changes
7. ✅ Add error handling to all async operations
8. ✅ Write tests for utility functions
9. ✅ Verify no existing tests were broken

When an AI agent is uncertain, it MUST:
1. ❓ State the ambiguity explicitly
2. ❓ List available options with tradeoffs
3. ❓ Ask the human before proceeding
4. ❌ NEVER make assumptions that affect data integrity
5. ❌ NEVER delete data (use soft delete pattern)

---

*This file is the law of the codebase. Last updated: July 2026.*
