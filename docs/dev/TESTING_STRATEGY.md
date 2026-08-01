# Testing Strategy
## SpendWise — Student Expense Tracker

---

## 1. Testing Philosophy

> "Test what matters. Skip what doesn't. Never ship without confidence."

We use a **risk-based testing approach** — the most critical paths (auth, expense CRUD, real-time sync, report generation) have the most coverage. Cosmetic UI details have minimal automated testing; they're reviewed visually.

### Testing Pyramid

```
         ╱─────╲
        ╱  E2E  ╲     ← 10% of tests — full user flows
       ╱──────────╲
      ╱ Integration╲  ← 20% — API + Firebase calls
     ╱──────────────╲
    ╱  Unit Tests    ╲  ← 70% — Business logic, utils, hooks
   ╱──────────────────╲
```

### Coverage Targets

| Layer | Target |
|---|---|
| Overall Coverage | ≥ 80% |
| Business Logic (lib/) | ≥ 95% |
| Store Slices | ≥ 90% |
| Utility Functions | ≥ 95% |
| React Components | ≥ 70% |
| E2E Critical Flows | 100% (all P0 flows covered) |

---

## 2. Testing Stack

| Tool | Version | Purpose |
|---|---|---|
| Vitest | 1.x | Unit + integration test runner |
| React Testing Library | 14.x | Component rendering tests |
| @testing-library/user-event | 14.x | User interaction simulation |
| Firebase Emulator Suite | Latest | Local Firebase for integration tests |
| Playwright | 1.x | E2E browser automation |
| MSW (Mock Service Worker) | 2.x | API mocking for component tests |
| @vitest/coverage-v8 | 1.x | Code coverage |

---

## 3. Unit Tests

### 3.1 What to Unit Test

**✅ Always unit test:**
- All functions in `src/lib/` (pure business logic)
- Zod validation schemas
- Zustand store actions and selectors
- Date/currency formatting utilities
- Budget calculation logic

**⚠️ Unit test key behaviors:**
- React components (not layout — just behavior)
- Custom hooks

**❌ Don't unit test:**
- Third-party library internals (Firebase, Recharts)
- CSS/styling
- Simple wrapper components with no logic

### 3.2 Unit Test Examples

```typescript
// src/lib/utils/format.test.ts

import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatPercent } from './format';

describe('formatCurrency', () => {
  it('formats whole numbers correctly', () => {
    expect(formatCurrency(1500)).toBe('₹1,500');
  });
  
  it('formats decimal amounts correctly', () => {
    expect(formatCurrency(1500.50)).toBe('₹1,500.50');
  });
  
  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });
  
  it('formats large amounts with commas', () => {
    expect(formatCurrency(100000)).toBe('₹1,00,000');  // Indian number format
  });
  
  it('throws on negative amounts', () => {
    expect(() => formatCurrency(-100)).toThrow();
  });
});

describe('formatPercent', () => {
  it('formats 85.7 as 85.7%', () => {
    expect(formatPercent(85.7)).toBe('85.7%');
  });
  
  it('caps display at 100% for over-budget amounts', () => {
    expect(formatPercent(120)).toBe('120%');
  });
});
```

```typescript
// src/lib/budget/budgetUtils.test.ts

import { describe, it, expect } from 'vitest';
import { calculateBudgetStatus, getRemainingAmount } from './budgetUtils';

describe('calculateBudgetStatus', () => {
  it('returns "safe" when percent used is below 80', () => {
    expect(calculateBudgetStatus(7000, 10000)).toBe('safe');
  });
  
  it('returns "warning" when percent used is 80–99', () => {
    expect(calculateBudgetStatus(8500, 10000)).toBe('warning');
    expect(calculateBudgetStatus(9999, 10000)).toBe('warning');
  });
  
  it('returns "exceeded" when spent equals or exceeds budget', () => {
    expect(calculateBudgetStatus(10000, 10000)).toBe('exceeded');
    expect(calculateBudgetStatus(12000, 10000)).toBe('exceeded');
  });
  
  it('returns "safe" when no expenses yet', () => {
    expect(calculateBudgetStatus(0, 10000)).toBe('safe');
  });
  
  it('throws when budget is 0', () => {
    expect(() => calculateBudgetStatus(0, 0)).toThrow('Budget amount cannot be zero');
  });
});
```

```typescript
// src/lib/expenses/schemas.test.ts

import { describe, it, expect } from 'vitest';
import { AddExpenseSchema } from './schemas';

describe('AddExpenseSchema', () => {
  const validExpense = {
    amount: 150,
    categoryId: 'food-dining',
    categoryName: 'Food & Dining',
    categoryEmoji: '🍔',
    categoryColor: '#f97316',
    note: 'Dinner at mess',
    date: new Date(),
  };
  
  it('accepts a valid expense', () => {
    const result = AddExpenseSchema.safeParse(validExpense);
    expect(result.success).toBe(true);
  });
  
  it('rejects zero amount', () => {
    const result = AddExpenseSchema.safeParse({ ...validExpense, amount: 0 });
    expect(result.success).toBe(false);
  });
  
  it('rejects negative amount', () => {
    const result = AddExpenseSchema.safeParse({ ...validExpense, amount: -100 });
    expect(result.success).toBe(false);
  });
  
  it('rejects amount above maximum', () => {
    const result = AddExpenseSchema.safeParse({ ...validExpense, amount: 1000001 });
    expect(result.success).toBe(false);
  });
  
  it('rejects note longer than 200 characters', () => {
    const result = AddExpenseSchema.safeParse({ 
      ...validExpense, 
      note: 'a'.repeat(201) 
    });
    expect(result.success).toBe(false);
  });
  
  it('accepts expense without note (optional)', () => {
    const { note, ...withoutNote } = validExpense;
    const result = AddExpenseSchema.safeParse(withoutNote);
    expect(result.success).toBe(true);
  });
  
  it('rejects invalid hex color', () => {
    const result = AddExpenseSchema.safeParse({ ...validExpense, categoryColor: 'notacolor' });
    expect(result.success).toBe(false);
  });
});
```

### 3.3 Store Slice Tests

```typescript
// src/store/expenses.slice.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './index';
import { mockExpense } from '@/test/factories';

describe('expenses slice', () => {
  beforeEach(() => {
    useStore.setState({ expenses: [] });
  });
  
  it('addExpense appends to the list', () => {
    const expense = mockExpense({ amount: 150 });
    useStore.getState().addExpense(expense);
    expect(useStore.getState().expenses).toHaveLength(1);
    expect(useStore.getState().expenses[0].amount).toBe(150);
  });
  
  it('removeExpense removes by id', () => {
    const expense = mockExpense({ id: 'exp-1' });
    useStore.setState({ expenses: [expense] });
    useStore.getState().removeExpense('exp-1');
    expect(useStore.getState().expenses).toHaveLength(0);
  });
  
  it('updateExpense changes the correct expense', () => {
    const expense = mockExpense({ id: 'exp-1', amount: 100 });
    useStore.setState({ expenses: [expense] });
    useStore.getState().updateExpense('exp-1', { amount: 200 });
    expect(useStore.getState().expenses[0].amount).toBe(200);
  });
});
```

---

## 4. Integration Tests

Integration tests test the actual Firebase operations using the **Firebase Emulator Suite**.

### 4.1 Setup

```typescript
// src/test/setup.ts
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const db = getFirestore(app);
const auth = getAuth(app);

// Point to local emulators
connectFirestoreEmulator(db, 'localhost', 8080);
connectAuthEmulator(auth, 'http://localhost:9099');
```

### 4.2 Integration Test Examples

```typescript
// src/lib/expenses/addExpense.integration.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { addExpense } from './addExpense';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { createTestUser, clearFirestore } from '@/test/helpers';

describe('addExpense (integration)', () => {
  let userId: string;
  
  beforeEach(async () => {
    userId = await createTestUser();
  });
  
  afterEach(async () => {
    await clearFirestore();
  });
  
  it('creates expense document in Firestore', async () => {
    const expenseId = await addExpense(userId, {
      amount: 150,
      categoryId: 'food-dining',
      categoryName: 'Food & Dining',
      categoryEmoji: '🍔',
      categoryColor: '#f97316',
      note: 'Test expense',
      date: new Date(),
    });
    
    const snap = await getDocs(
      query(collection(db, 'expenses'), where('userId', '==', userId))
    );
    
    expect(snap.docs).toHaveLength(1);
    expect(snap.docs[0].data().amount).toBe(150);
    expect(snap.docs[0].data().isDeleted).toBe(false);
  });
  
  it('updates budget totalSpent after adding expense', async () => {
    // Wait for Cloud Function
    await addExpense(userId, { ...expenseInput, amount: 500 });
    
    // Poll for Cloud Function to complete
    await waitForCondition(async () => {
      const budgetSnap = await getDoc(doc(db, 'budgets', `${userId}_${currentMonth()}`));
      return budgetSnap.data()?.totalSpent === 500;
    }, 5000);
    
    const budgetSnap = await getDoc(doc(db, 'budgets', `${userId}_${currentMonth()}`));
    expect(budgetSnap.data()?.totalSpent).toBe(500);
  });
});
```

---

## 5. E2E Tests (Playwright)

### 5.1 Critical User Flows (P0 — Must All Pass)

| Flow | Test File | Priority |
|---|---|---|
| Sign up with Google | `auth.spec.ts` | P0 |
| Set monthly budget (onboarding) | `onboarding.spec.ts` | P0 |
| Add expense (full flow) | `add-expense.spec.ts` | P0 |
| View dashboard with correct budget | `dashboard.spec.ts` | P0 |
| Real-time sync across 2 tabs | `sync.spec.ts` | P0 |
| Delete expense with undo | `expenses.spec.ts` | P0 |
| Download PDF report | `reports.spec.ts` | P0 |

### 5.2 E2E Test Examples

```typescript
// e2e/tests/add-expense.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../fixtures/auth.fixture';

test.describe('Add Expense Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard');
  });
  
  test('can add a valid expense in under 5 seconds', async ({ page }) => {
    const start = Date.now();
    
    // Open add expense sheet
    await page.getByTestId('expense-fab').click();
    
    // Enter amount
    await page.getByTestId('amount-input').fill('150');
    
    // Select category
    await page.getByTestId('category-food-dining').click();
    
    // Submit
    await page.getByTestId('submit-expense').click();
    
    const elapsed = Date.now() - start;
    
    // Performance check
    expect(elapsed).toBeLessThan(5000);
    
    // Verify expense appears in list
    await expect(page.getByTestId('expense-list')).toContainText('₹150');
    
    // Verify budget card updated
    await expect(page.getByTestId('remaining-budget')).not.toContainText('₹10,000');
    
    // Verify success toast
    await expect(page.getByRole('alert')).toContainText('Expense added');
  });
  
  test('shows validation error for zero amount', async ({ page }) => {
    await page.getByTestId('expense-fab').click();
    await page.getByTestId('amount-input').fill('0');
    await page.getByTestId('category-food-dining').click();
    await page.getByTestId('submit-expense').click();
    
    await expect(page.getByTestId('amount-error')).toBeVisible();
    await expect(page.getByTestId('amount-error')).toContainText('valid amount');
  });
  
  test('real-time sync — expense appears on second tab', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Login both tabs as the same user
    await loginAsTestUser(page1);
    await loginAsTestUser(page2);
    
    await page1.goto('/expenses');
    await page2.goto('/expenses');
    
    // Add expense on page1
    await page1.getByTestId('expense-fab').click();
    await page1.getByTestId('amount-input').fill('250');
    await page1.getByTestId('category-transport').click();
    await page1.getByTestId('submit-expense').click();
    
    // Verify it appears on page2 within 2 seconds
    await expect(page2.getByText('₹250')).toBeVisible({ timeout: 2000 });
    
    await context1.close();
    await context2.close();
  });
});
```

---

## 6. Test Data / Factories

```typescript
// src/test/factories.ts

export const mockExpense = (overrides?: Partial<ExpenseDocument>): ExpenseDocument => ({
  id: `exp-${Math.random().toString(36).substr(2, 9)}`,
  userId: 'test-user-123',
  amount: 150,
  categoryId: 'food-dining',
  categoryName: 'Food & Dining',
  categoryEmoji: '🍔',
  categoryColor: '#f97316',
  note: 'Test expense',
  date: Timestamp.fromDate(new Date()),
  month: '2026-07',
  year: 2026,
  dayOfWeek: 1,
  createdAt: Timestamp.fromDate(new Date()),
  updatedAt: Timestamp.fromDate(new Date()),
  deviceId: 'test-device',
  isDeleted: false,
  deletedAt: null,
  ...overrides,
});

export const mockBudget = (overrides?: Partial<BudgetDocument>): BudgetDocument => ({
  id: 'test-user-123_2026-07',
  userId: 'test-user-123',
  month: '2026-07',
  year: 2026,
  amount: 10000,
  totalSpent: 0,
  remainingAmount: 10000,
  percentUsed: 0,
  categoryBreakdown: {},
  dailySpending: new Array(31).fill(0),
  warned80Percent: false,
  warned100Percent: false,
  createdAt: Timestamp.fromDate(new Date()),
  updatedAt: Timestamp.fromDate(new Date()),
  ...overrides,
});
```

---

## 7. CI/CD Test Pipeline

```yaml
# .github/workflows/ci.yml

name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Unit tests
        run: npm run test:unit
      
      - name: Start Firebase Emulators
        run: npx firebase emulators:exec --only auth,firestore "npm run test:integration"
      
      - name: Build
        run: npm run build
      
      - name: E2E tests (Playwright)
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

---

## 8. Test Commands

```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Run with coverage
npm run test:coverage

# Run integration tests (requires emulators)
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run E2E in UI mode (debugging)
npm run test:e2e:ui

# Run all tests
npm run test:all
```

---

*Testing Strategy v1.0 — July 2026*
