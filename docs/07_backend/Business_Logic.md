# Business Logic
## SpendWise — Student Expense Tracker

This document details the core business rules and logic implemented in `src/lib/`.

---

## 1. Expense Management Logic

### 1.1 addExpense (`src/lib/expenses/addExpense.ts`)

**Validation (client-side):**
- `amount > 0` and `amount <= 1,000,000`
- `categoryId` must be a valid preset or custom category ID
- `note` max 200 characters
- `date` cannot be more than 5 years in the past (sanity check)

**Write Pattern (Atomic):**
```typescript
// Use Firestore batch write to ensure consistency
const batch = writeBatch(db);

// 1. Add the new expense document
const expenseRef = doc(collection(db, `users/${uid}/expenses`));
batch.set(expenseRef, {
  ...expenseData,
  id: expenseRef.id,
  userId: uid,
  isDeleted: false,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

// 2. Update the budget aggregate atomically
const budgetRef = doc(db, `users/${uid}/budgets/${month}`);
batch.set(budgetRef, {
  totalSpent: increment(amount),
  remainingAmount: increment(-amount),
  [`categoryBreakdown.${categoryId}.total`]: increment(amount),
  [`categoryBreakdown.${categoryId}.count`]: increment(1),
  [`dailySpending.${dayIndex}`]: increment(amount),
  lastUpdatedAt: serverTimestamp(),
}, { merge: true });

await batch.commit();
```

### 1.2 updateExpense (`src/lib/expenses/updateExpense.ts`)

When an expense is edited, the budget must be adjusted for the **delta** (difference):
```typescript
const delta = newAmount - oldAmount;
// If delta > 0: user increased expense amount → deduct more from budget
// If delta < 0: user decreased expense amount → add difference back to budget
// Also handle category change (deduct from old category, add to new category)
```

### 1.3 softDeleteExpense (`src/lib/expenses/deleteExpense.ts`)

```typescript
const batch = writeBatch(db);

// 1. Mark expense as deleted
batch.update(expenseRef, { isDeleted: true, updatedAt: serverTimestamp() });

// 2. Add the amount back to the budget
batch.set(budgetRef, {
  totalSpent: increment(-amount),
  remainingAmount: increment(amount),
  [`categoryBreakdown.${categoryId}.total`]: increment(-amount),
  [`categoryBreakdown.${categoryId}.count`]: increment(-1),
  lastUpdatedAt: serverTimestamp(),
}, { merge: true });

await batch.commit();
```

---

## 2. Budget Management Logic

### 2.1 Budget Initialization (`src/lib/budget/initBudget.ts`)

Called during onboarding and at the start of each new month:
```typescript
const initBudget = async (uid: string, amount: number, month: string) => {
  const budgetRef = doc(db, `users/${uid}/budgets/${month}`);
  const existing = await getDoc(budgetRef);
  
  if (existing.exists()) return; // Don't overwrite existing budget
  
  await setDoc(budgetRef, {
    month,
    userId: uid,
    budgetAmount: amount,
    totalSpent: 0,
    remainingAmount: amount,
    categoryBreakdown: {},
    dailySpending: new Array(31).fill(0),
    lastUpdatedAt: serverTimestamp(),
  });
};
```

### 2.2 Budget Auto-Reset (Monthly)

There is no cron job in v1.0. The budget auto-init happens **lazily** when the user opens the app in a new month:

```typescript
// In the auth hook, after user loads:
const currentMonth = format(new Date(), 'yyyy-MM');
const budgetDoc = await getDoc(doc(db, `users/${uid}/budgets/${currentMonth}`));
if (!budgetDoc.exists()) {
  await initBudget(uid, user.defaultBudget, currentMonth);
}
```

---

## 3. Analytics Computation Logic

Analytics are **pre-aggregated** in the Budget document. The Analytics page reads a single Budget document and renders charts directly — no aggregation happens at query time.

**The category breakdown** is maintained via the atomic batch writes described above.

**Rule-Based Insights Generation:**
```typescript
// src/lib/analytics/generateInsights.ts
const generateInsights = (budget: BudgetDocument): InsightCard[] => {
  const insights: InsightCard[] = [];
  const { totalSpent, budgetAmount, categoryBreakdown, dailySpending } = budget;
  
  // Insight 1: Largest category
  const topCategory = Object.values(categoryBreakdown).sort((a, b) => b.total - a.total)[0];
  if (topCategory && (topCategory.total / totalSpent) > 0.4) {
    insights.push({
      type: 'warning',
      text: `${topCategory.emoji} ${topCategory.name} is consuming ${Math.round(topCategory.total/totalSpent*100)}% of your budget.`,
    });
  }
  
  // Insight 2: Pace warning
  const dayOfMonth = new Date().getDate();
  const percentUsed = (totalSpent / budgetAmount) * 100;
  const percentOfMonth = (dayOfMonth / getDaysInMonth(new Date())) * 100;
  if (percentUsed > percentOfMonth + 20) {
    insights.push({ type: 'danger', text: '⚡ You\'re spending faster than your budget allows.' });
  }
  
  return insights;
};
```
