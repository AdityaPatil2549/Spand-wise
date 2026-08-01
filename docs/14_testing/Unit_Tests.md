# Unit Test Specification
## SpendWise — Student Expense Tracker

---

## 1. Testing Stack

| Tool | Purpose |
|:---|:---|
| **Jest** | Test runner + assertion library |
| **@testing-library/react** | Component testing (render + query + fire events) |
| **@testing-library/jest-dom** | Custom DOM matchers (`toBeInTheDocument`, etc.) |
| **Firebase Emulator Suite** | Local Firestore + Auth emulator for integration tests |
| **jest-environment-jsdom** | Browser-like environment for React component tests |

---

## 2. Test Structure

```
src/
├── lib/
│   ├── expenses/
│   │   ├── addExpense.ts
│   │   ├── addExpense.test.ts       ← Colocated unit test
│   │   ├── updateExpense.ts
│   │   ├── updateExpense.test.ts
│   │   └── deleteExpense.test.ts
│   ├── budget/
│   │   ├── initBudget.test.ts
│   │   └── getBudgetStatus.test.ts
│   └── utils/
│       ├── formatCurrency.test.ts
│       ├── formatDate.test.ts
│       └── generateInsights.test.ts
├── store/
│   ├── expenses.slice.test.ts
│   ├── budget.slice.test.ts
│   └── ui.slice.test.ts
e2e/
├── auth.spec.ts                     ← E2E tests (Playwright)
├── add-expense.spec.ts
└── reports.spec.ts
```

---

## 3. Unit Test Examples

### formatCurrency (utility)
```typescript
// src/lib/utils/formatCurrency.test.ts
describe('formatCurrency', () => {
  it('formats whole rupee amounts in Indian number system', () => {
    expect(formatCurrency(1000)).toBe('₹1,000');
    expect(formatCurrency(100000)).toBe('₹1,00,000');
    expect(formatCurrency(10000000)).toBe('₹1,00,00,000');
  });
  
  it('formats amounts with paise correctly', () => {
    expect(formatCurrency(150.50)).toBe('₹150.50');
    expect(formatCurrency(1000.99)).toBe('₹1,000.99');
  });
  
  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });
});
```

### addExpense (Firestore operation)
```typescript
// src/lib/expenses/addExpense.test.ts
// Uses Firebase Emulator — requires FIRESTORE_EMULATOR_HOST to be set
describe('addExpense', () => {
  beforeEach(() => {
    // Clear Firestore emulator data before each test
  });
  
  it('should create an expense document in Firestore', async () => {
    const uid = 'test-user-001';
    await addExpense(uid, { amount: 150, categoryId: 'food', note: 'Lunch', date: new Date() });
    
    const expenses = await getDocs(query(collection(db, `users/${uid}/expenses`)));
    expect(expenses.docs).toHaveLength(1);
    expect(expenses.docs[0].data().amount).toBe(150);
  });
  
  it('should update the budget totalSpent atomically', async () => {
    const uid = 'test-user-001';
    // First, init a budget
    await initBudget(uid, 10000, '2026-07');
    
    await addExpense(uid, { amount: 500, categoryId: 'food', note: '', date: new Date() });
    
    const budget = await getDoc(doc(db, `users/${uid}/budgets/2026-07`));
    expect(budget.data()?.totalSpent).toBe(500);
    expect(budget.data()?.remainingAmount).toBe(9500);
  });
  
  it('should throw an error if amount is 0', async () => {
    await expect(addExpense('uid', { amount: 0, categoryId: 'food', note: '', date: new Date() }))
      .rejects.toThrow('invalid-argument');
  });
  
  it('should throw an error if amount exceeds 1,000,000', async () => {
    await expect(addExpense('uid', { amount: 1_000_001, categoryId: 'food', note: '', date: new Date() }))
      .rejects.toThrow('invalid-argument');
  });
});
```

---

## 4. Zustand Store Tests

```typescript
// src/store/expenses.slice.test.ts
describe('ExpensesSlice', () => {
  it('addExpenseOptimistic adds expense to the beginning of the list', () => {
    const store = useAppStore.getState();
    const mockExpense = { id: '1', amount: 100 } as ExpenseDocument;
    
    store.addExpenseOptimistic(mockExpense);
    
    expect(useAppStore.getState().expenses[0]).toEqual(mockExpense);
  });
  
  it('removeExpenseOptimistic removes expense by id', () => {
    useAppStore.setState({ expenses: [{ id: '1', amount: 100 }, { id: '2', amount: 200 }] as ExpenseDocument[] });
    
    useAppStore.getState().removeExpenseOptimistic('1');
    
    expect(useAppStore.getState().expenses).toHaveLength(1);
    expect(useAppStore.getState().expenses[0].id).toBe('2');
  });
});
```

---

## 5. What NOT to Test

- Next.js routing (trust the framework)
- Firebase SDK internals (trust Google's testing)
- Styling/visual appearance (use Storybook or visual regression tools for that)
- Trivial getters/setters with no logic
