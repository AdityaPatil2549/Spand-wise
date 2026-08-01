# Exhaustive User Flows
## SpendWise — Student Expense Tracker

---

## 1. Flow Overview
User flows map the exact logical paths a user takes through the application. Each flow includes entry conditions, primary paths, edge cases, and exit states.

---

## 2. Flow: Authentication & First-Time Setup (Onboarding)

**Entry Point:** User visits `spendwise.app` on a fresh device.

### 2.1 State Evaluation (Middleware)
1. Middleware checks for `__session` cookie.
2. If `null`, redirect to `/login`.

### 2.2 Login Flow
1. UI presents "SpendWise" logo and "Sign in with Google" button.
2. User taps button -> Triggers Firebase `signInWithPopup` (or redirect on mobile).
3. Auth Success: Server mints session cookie.
4. Client checks Firestore: `users/{uid}` document exists?
   - **YES (Returning User):** Route to `/app/dashboard`.
   - **NO (New User):** Route to `/onboarding`.

### 2.3 Onboarding Flow
1. User arrives at `/onboarding`.
2. UI displays: "Welcome [First Name]! What's your monthly allowance?"
3. User can tap quick-picks (₹3,000, ₹5,000, ₹10,000) or enter a custom amount.
4. User taps "Set Budget".
5. **Database Transaction:**
   - Create `users/{uid}` with `{ name, email, createdAt }`.
   - Create `users/{uid}/budgets/{current_YYYY-MM}` with `{ budgetAmount: value, totalSpent: 0, remainingAmount: value }`.
6. Success: Route to `/app/dashboard`.

---

## 3. Flow: The "3-Second" Expense Logging

**Entry Point:** User taps the persistent Floating Action Button (+) on `/app/dashboard` or `/app/expenses`.

### 3.1 The Input Path
1. Tap (+) -> Bottom Sheet slides up. Background fades to 40% opacity.
2. `Amount` input is auto-focused. Native OS numeric keypad opens.
3. User types `250`.
4. User taps "Food 🍔" from the horizontally scrolling category list.
   - *Logic:* The UI validates that both Amount > 0 and a Category is selected. The "Add Expense" button changes from disabled (gray) to active (purple).
5. (Optional) User taps "Add note" and types "Dominos".
6. User taps "Add Expense".

### 3.2 The Execution Path
1. **Optimistic UI Update:**
   - Bottom Sheet slides down.
   - Expense appears at the top of the timeline instantly.
   - Dashboard Hero Card subtracts ₹250 instantly.
   - Success Toast appears: "₹250 added to Food".
2. **Background Network Request:**
   - Firebase `writeBatch` initiated.
   - If success: Local cache is validated.
   - If error (e.g., Firestore permission denied):
     - Store reverses the optimistic update (Expense vanishes, Budget returns to previous).
     - Error Toast appears: "Failed to save expense. Please try again."

---

## 4. Flow: Expense Modification & Recovery

**Entry Point:** User realizes they made a mistake and taps an existing expense in the `/app/expenses` list.

### 4.1 Edit Flow
1. User taps expense row. Row expands to show "Edit" and "Delete" buttons.
2. User taps "Edit". Bottom Sheet opens, pre-populated with the expense data.
3. User changes amount from ₹250 to ₹350. Taps "Save".
4. **Logic:** Budget `totalSpent` must be adjusted by the difference (`+100`).
5. Batch commit: Update expense doc + update budget doc.

### 4.2 Delete / Soft-Delete Flow
1. User taps "Delete".
2. **Optimistic UI:** Expense is immediately removed from list. Budget remaining amount increases by ₹350.
3. Toast appears: "Expense deleted. [UNDO]" with a 5-second progress bar.
4. **Background:** A `setTimeout` is triggered for 5000ms.
5. **Logic Gate:**
   - If user taps "UNDO": Timeout clears. Expense returns to UI. Budget reverts. No network call is made.
   - If 5s expires: Network call executes `writeBatch` setting `isDeleted: true` on the expense, and decreasing the budget `totalSpent`.

---

## 5. Flow: Offline Mode Degradation

**Entry Point:** User attempts to log an expense in the subway (No Signal).

1. `navigator.onLine` evaluates to `false`.
2. UI displays subtle yellow banner at top: "Offline Mode. Changes will sync later."
3. User logs expense via the normal 3-Second Flow.
4. **Firebase SDK Magic:** `batch.commit()` resolves successfully because the Firebase SDK caches the write locally in IndexedDB.
5. The UI updates optimistically.
6. When signal is restored, Firebase SDK automatically flushes the local write queue to the cloud.

---
*Document Status: FINAL*
