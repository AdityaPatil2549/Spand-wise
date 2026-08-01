# State Management Architecture (Zustand)
## SpendWise — Student Expense Tracker

---

## 1. Why Zustand?

We evaluated Redux Toolkit, Context API, and Zustand. 
- **Context API:** Causes unnecessary re-renders when context values change; lacks selector capabilities.
- **Redux Toolkit:** High boilerplate; excessive for a simple expense tracker.
- **Zustand:** Atomic, hook-based, supports transient state updates without forcing component re-renders. Perfect for our performance budget.

---

## 2. Store Slices

The global store is divided into logical slices using the Slice Pattern.

### 2.1 Expense Slice (`src/store/expenses.slice.ts`)
Manages the real-time cache of the user's financial data.

```typescript
interface ExpenseSlice {
  expenses: ExpenseDocument[];
  budget: BudgetDocument | null;
  isLoading: boolean;
  
  // Actions
  setExpenses: (expenses: ExpenseDocument[]) => void;
  setBudget: (budget: BudgetDocument) => void;
  
  // Optimistic Mutations
  addExpenseOptimistic: (expense: ExpenseDocument) => void;
  removeExpenseOptimistic: (id: string) => void;
  updateExpenseOptimistic: (expense: ExpenseDocument) => void;
}
```

### 2.2 UI Slice (`src/store/ui.slice.ts`)
Manages ephemeral interface states that span across different route trees.

```typescript
interface UISlice {
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;
  
  // Bottom Sheet Engine
  activeSheet: 'ADD' | 'EDIT' | 'SETTINGS' | null;
  sheetPayload: any;
  openSheet: (type: string, payload?: any) => void;
  closeSheet: () => void;
  
  // Global Toast System
  toast: { message: string, type: 'success' | 'error' } | null;
  showToast: (message: string, type: 'success' | 'error') => void;
  clearToast: () => void;
}
```

---

## 3. The Optimistic Update Pattern

Network latency over 3G connections can take up to 2 seconds. Waiting for Firestore to confirm a write before updating the UI breaks the "3-Second Logging" rule.

We solve this using Optimistic Updates via Zustand:

```typescript
// 1. User clicks "Add Expense"
const handleSubmit = async (data) => {
  // 2. Generate a temporary ID
  const tempId = `temp_${Date.now()}`;
  const newExpense = { ...data, id: tempId, isDeleted: false };
  
  // 3. Update store immediately (UI updates instantly)
  addExpenseOptimistic(newExpense);
  closeSheet();
  
  try {
    // 4. Fire actual network request
    await firebaseAddExpense(newExpense);
    // 5. Firebase onSnapshot listener will eventually fire and overwrite the store with the real ID
  } catch (error) {
    // 6. Rollback if network fails
    removeExpenseOptimistic(tempId);
    showToast('Failed to save', 'error');
  }
}
```

---

## 4. Avoiding Re-renders (Selectors)

Components MUST use selectors to subscribe to only the exact slice of state they need.

```typescript
// ❌ BAD: Component re-renders every time ANY state in the store changes
const { toast } = useAppStore(); 

// ✅ GOOD: Component only re-renders when the toast object changes
const toast = useAppStore((state) => state.toast);
```
