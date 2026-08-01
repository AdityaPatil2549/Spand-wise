# Use Cases
## SpendWise — Student Expense Tracker

Use cases describe specific interactions between a user (Actor) and the system, detailing the sequence of steps required to achieve a goal.

---

## UC001: Add a New Expense

**Actor:** Authenticated Student
**Precondition:** User is logged in. A budget for the current month exists.
**Primary Flow:**
1. User taps the floating action button (FAB) on Dashboard or Expense List.
2. System opens the "Add Expense" bottom sheet. Numeric keyboard appears automatically.
3. User enters the amount (e.g., `150`).
4. System formats the input as ₹150.
5. User selects a category from the grid (e.g., "Food 🍔").
6. [Optional] User taps the Note field and enters a description.
7. User taps the "Add Expense" button.
8. System writes the expense to Firestore and updates the budget aggregate optimistically.
9. System closes the bottom sheet and shows a success toast ("₹150 added to Food").

**Alternative Flow — Invalid Amount:**
- 3a. User enters 0 or leaves field empty.
- 3b. System disables the "Add Expense" button and shows inline error "Amount must be greater than ₹0".

**Alternative Flow — Offline:**
- 8a. Device has no internet connection.
- 8b. Firestore SDK queues the write locally.
- 8c. System closes sheet and shows toast with offline indicator.
- 8d. When connection is restored, the write is automatically committed.

---

## UC002: View Budget Status

**Actor:** Authenticated Student
**Precondition:** User is logged in. At least one expense has been logged this month.
**Primary Flow:**
1. User opens the app; the Dashboard is the default landing screen.
2. System retrieves the current month's budget document from Firestore.
3. System renders the Budget Card showing: Total Budget, Total Spent, Remaining, Progress Bar.
4. System renders color-coded status (green < 80%, amber 80–99%, red 100%+).
5. System renders the last 5 expenses below the budget card.

---

## UC003: Edit an Existing Expense

**Actor:** Authenticated Student
**Precondition:** At least one expense exists for the current month.
**Primary Flow:**
1. User navigates to the "Expenses" tab.
2. User taps an expense row.
3. System opens the "Edit Expense" bottom sheet, pre-filled with the expense's current data.
4. User changes the amount from ₹150 to ₹180.
5. User taps "Save Changes".
6. System updates the expense document in Firestore and recalculates the budget aggregate.
7. System closes the sheet. The list item and dashboard update instantly.

---

## UC004: Delete an Expense

**Actor:** Authenticated Student
**Primary Flow (Swipe Gesture — Mobile):**
1. User swipes left on an expense row.
2. A red "Delete" button is revealed.
3. User taps the Delete button.
4. System sets `isDeleted: true` on the expense document (soft delete).
5. Budget aggregate is updated (amount added back).
6. A toast appears: "Expense deleted. [UNDO]"
7. If user taps UNDO within 5 seconds, `isDeleted` is set back to `false`.

---

## UC005: Generate Monthly PDF Report

**Actor:** Authenticated Student
**Precondition:** At least one expense logged in the target month.
**Primary Flow:**
1. User navigates to the "Reports" tab.
2. User selects the target month (e.g., "July 2026") from the month picker.
3. User taps "Download PDF".
4. System fetches all expense documents for that month from Firestore.
5. System generates the PDF client-side using jsPDF.
6. On mobile: Browser triggers native Share Sheet.
7. On desktop: Browser downloads the file (`SpendWise_July_2026.pdf`).

---

## UC006: View Category Analytics

**Actor:** Authenticated Student
**Primary Flow:**
1. User taps the "Analytics" tab.
2. System loads the donut chart from pre-aggregated budget document data.
3. System renders the top categories list sorted by amount.
4. System renders 3–5 contextual insight cards.
5. User taps the "Food" segment on the donut chart.
6. System highlights the Food segment and scrolls the list to filter by Food.
7. User taps the month selector to view June 2026.
8. System re-renders all charts and insights for June 2026.

---

## UC007: Log In for the First Time

**Actor:** New Student User
**Primary Flow:**
1. User opens the app URL in their browser.
2. System detects no active session; renders the Login screen.
3. User taps "Continue with Google".
4. Browser redirects to Google OAuth screen.
5. User selects their Google account.
6. Firebase creates a new User document with `onboardingComplete: false`.
7. System detects `onboardingComplete: false` and navigates to the Onboarding screen.
8. User enters their monthly allowance (e.g., ₹10,000).
9. System creates the first Budget document.
10. System sets `onboardingComplete: true` and navigates to the Dashboard.
