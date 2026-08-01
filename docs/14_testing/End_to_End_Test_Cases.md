# End-to-End Test Cases
## SpendWise — Student Expense Tracker

---

## 1. E2E Strategy

E2E testing for SpendWise ensures the critical user journeys (CUJs) function correctly in a real browser environment. 
We use **Playwright** for E2E testing against a local Next.js build pointing to the Firebase Emulator Suite.

---

## 2. Critical User Journeys (CUJs)

### CUJ 1: Authentication & Onboarding
**Goal:** Verify a new user can sign up and initialize their budget.

**Steps:**
1. Navigate to `/login`.
2. Click "Sign in with Google" (simulated in emulator).
3. Verify redirect to `/onboarding` (since it's a new user).
4. Fill in the "Monthly Budget" field with `15000`.
5. Click "Continue".
6. Verify redirect to `/app/dashboard`.
7. Verify the budget card displays `₹15,000` remaining.

### CUJ 2: Adding an Expense
**Goal:** Verify the core action of the app works flawlessly.

**Steps:**
1. (Assuming logged in and on `/app/dashboard`).
2. Click the floating Action Button (+).
3. Verify the "Add Expense" bottom sheet opens.
4. Focus the amount input and type `350`.
5. Click the "Food 🍔" category chip.
6. Enter "Late night snacks" in the note field.
7. Click "Add Expense".
8. Verify bottom sheet closes.
9. Verify a success toast appears.
10. Verify the dashboard budget card remaining amount decreased by `350`.
11. Navigate to `/app/expenses`.
12. Verify the new expense is listed at the top.

### CUJ 3: Editing and Deleting an Expense
**Goal:** Verify data can be corrected.

**Steps:**
1. Navigate to `/app/expenses`.
2. Click on the previously created "Late night snacks" expense.
3. Click "Edit" in the expanded view.
4. Change the amount to `400`.
5. Click "Save".
6. Verify the UI updates to reflect `400`.
7. Click on the expense again, click "Delete".
8. Confirm deletion in the dialog.
9. Verify the expense disappears from the list.
10. Navigate to `/app/dashboard`.
11. Verify the budget remaining amount increased by `400` (refunded).

### CUJ 4: Exporting Data
**Goal:** Verify the user can extract their data.

**Steps:**
1. Navigate to `/app/reports`.
2. Click the "Export CSV" button.
3. Verify the browser triggers a file download.
4. Intercept the download in Playwright and verify the filename matches `spendwise-export-YYYY-MM.csv`.

---

## 3. Playwright Setup Considerations

- **Authentication state:** Instead of logging in via the UI for every test, use Playwright's `browserContext.storageState` to save and load an authenticated session cookie.
- **Firebase Emulator:** Tests must run against `localhost:8080` (Firestore) and `localhost:9099` (Auth) to prevent polluting the production database.
- **Mobile Emulation:** Run the test suite twice: once with desktop viewport, once with mobile viewport (e.g., iPhone 13) to ensure responsive layouts work.
