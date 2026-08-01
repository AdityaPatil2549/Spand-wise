# Naming Conventions
## SpendWise — Student Expense Tracker

---

## 1. File & Directory Naming

| Type | Convention | Examples |
|:---|:---|:---|
| React components | `PascalCase.tsx` | `ExpenseListItem.tsx`, `BudgetCard.tsx` |
| Non-component TypeScript | `camelCase.ts` | `addExpense.ts`, `useExpenses.ts`, `formatCurrency.ts` |
| Directories | `kebab-case/` | `expense-list/`, `budget-card/`, `add-expense/` |
| Test files | `*.test.ts` or `*.spec.ts` | `addExpense.test.ts` |
| Style files | `camelCase.css` | `tokens.css`, `globals.css` |
| Config files | `camelCase.ts` | `categories.ts`, `constants.ts`, `env.ts` |
| Next.js special files | lowercase (enforced by Next.js) | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |

---

## 2. Code Identifiers

### Interfaces & Types
```typescript
// ✅ Interfaces: PascalCase with descriptive noun suffix
interface ExpenseDocument { }
interface AddExpenseInput { }
interface BudgetSlice { }
interface CategoryConfig { }

// ✅ Types: PascalCase
type CategoryId = string;
type Month = string;   // 'YYYY-MM' format
type Theme = 'light' | 'dark' | 'system';
```

### Enums
```typescript
// ✅ Enum: PascalCase, values: SCREAMING_SNAKE_CASE
enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}
```

### Functions
```typescript
// ✅ Functions: camelCase, verb-first
const addExpense = async (uid: string, input: AddExpenseInput): Promise<void> => {};
const formatCurrency = (amount: number): string => {};
const getMonthlyExpenses = async (uid: string, month: string): Promise<ExpenseDocument[]> => {};
const calculateBudgetUtilization = (spent: number, budget: number): number => {};
```

### Constants
```typescript
// ✅ Constants: SCREAMING_SNAKE_CASE
const MAX_CUSTOM_CATEGORIES = 3;
const DEFAULT_BUDGET_WARNING_PERCENT = 80;
const MAX_EXPENSE_AMOUNT = 1_000_000;
const MAX_NOTE_LENGTH = 200;
```

### React Components
```typescript
// ✅ PascalCase
export const ExpenseListItem = () => {};
export const BudgetProgressBar = () => {};
export const CategoryDonutChart = () => {};
```

### Component Props Interfaces
```typescript
// ✅ [ComponentName]Props
interface ExpenseListItemProps {
  expense: ExpenseDocument;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}
```

### Zustand Actions
```typescript
// ✅ camelCase, verb-first
const setExpenses = (expenses: ExpenseDocument[]) => {};
const addExpenseOptimistic = (expense: ExpenseDocument) => {};
const setBudgetLoading = (loading: boolean) => {};
const openAddExpense = () => {};
```

### Hooks
```typescript
// ✅ useVerbNoun or usePluralNoun
const useAuth = () => {};
const useExpenses = () => {};
const useBudget = () => {};
const useCategories = () => {};
const useFormatCurrency = () => {};
```

---

## 3. CSS / Tailwind

```typescript
// ✅ Use CSS variable tokens mapped to Tailwind
className="bg-surface-primary text-text-primary rounded-xl p-6"

// ✅ Compound class names with cn() utility
className={cn('base-styles', condition && 'conditional-styles', className)}

// ❌ Never use arbitrary values for colors
className="bg-[#8B5CF6]"

// ❌ Never use inline style for colors
style={{ color: '#8B5CF6' }}
```

---

## 4. Firestore Collections & Document IDs

| Collection | ID Strategy | Example |
|:---|:---|:---|
| `users` | Firebase Auth UID | `7f3jXkL9mN2` |
| `expenses` | Auto-generated (`doc()`) | `abc123xyz789` |
| `budgets` | Month key (`YYYY-MM`) | `2026-07` |
| `categories` | Auto-generated | `cat_abc123` |

---

## 5. Event Handler Naming

```typescript
// ✅ on + PascalCase + Event
const onAddExpense = () => {};
const onDeleteExpense = (id: string) => {};
const onCategorySelect = (categoryId: string) => {};
const onMonthChange = (month: string) => {};
```
