# User Flows
## SpendWise — Student Expense Tracker

This document maps out the step-by-step user journeys for key actions within the SpendWise app.

---

## 1. Onboarding Flow (First-Time User)

**Goal:** Get the user to input their monthly budget with minimal friction.

1.  **Launch:** User opens the app for the first time.
2.  **Auth Wall:** User presented with Login screen.
3.  **Action:** User taps "Continue with Google" (primary) or enters Email/Password.
4.  **Auth Success:** Backend creates User document. App detects `onboardingComplete: false`.
5.  **Onboarding Screen 1:** "Welcome! Let's set up your monthly allowance/budget."
6.  **Input:** User enters an amount (e.g., ₹10,000) or taps a quick-pick chip (₹5k, ₹8k).
7.  **Action:** User taps "Let's Track!".
8.  **Completion:** Backend creates current month's Budget document. `onboardingComplete` set to true.
9.  **Destination:** User lands on the Dashboard.

---

## 2. Daily Tracking Flow (Adding an Expense)

**Goal:** Log an expense in under 5 seconds (frictionless entry).

1.  **Entry Point:** User taps the floating '+' button (FAB) available on Dashboard/Expenses tabs.
2.  **Interaction:** Bottom Sheet slides up. The numeric keyboard automatically opens. The Amount field is auto-focused.
3.  **Input 1 (Amount):** User types `1` `5` `0`. Field formats as ₹150.
4.  **Input 2 (Category):** User taps "Food 🍔" from the horizontal grid. (CTA "Add Expense" unlocks).
5.  **Input 3 (Optional):** User taps "Note", types "Lunch", hits Done.
6.  **Action:** User taps "Add Expense (₹150)".
7.  **Resolution:**
    *   Bottom Sheet slides down.
    *   Haptic feedback (on mobile).
    *   Toast appears: "₹150 added to Food".
    *   Dashboard budget card updates instantly (Optimistic UI).

---

## 3. Review & Correction Flow (Edit/Delete)

**Goal:** Easily fix mistakes.

1.  **Entry Point:** User goes to the "Expenses" tab (List view).
2.  **Action (Delete):** User swipes left on an expense row. Taps the red "Delete" icon.
3.  **Resolution (Delete):** Item disappears. Toast: "Expense deleted [UNDO]". Budget restores.
4.  **Action (Edit):** User taps anywhere on the expense row (or swipes right).
5.  **Interaction:** Bottom Sheet slides up, pre-filled with expense data.
6.  **Input:** User changes amount from ₹150 to ₹180.
7.  **Action:** Taps "Save Changes".
8.  **Resolution:** Sheet closes. List and Budget update instantly.

---

## 4. Analysis Flow (End of Week/Month)

**Goal:** Understand spending patterns.

1.  **Entry Point:** User taps the "Analytics" tab.
2.  **Interaction:** App loads Donut chart and daily trend line.
3.  **Action:** User wants to see why "Shopping" is so high. User taps the "Shopping 🛍️" slice on the Donut chart.
4.  **Resolution:** List below filters to show only Shopping transactions.
5.  **Action (Time Travel):** User taps the Month selector at the top (e.g., "July 2026") and selects "June 2026".
6.  **Resolution:** Entire analytics view re-renders with June's data.

---

## 5. Reporting Flow (Requesting Money)

**Goal:** Generate a PDF to send to parents.

1.  **Entry Point:** User taps "Reports" tab.
2.  **Action:** User selects "July 2026" and taps "Download PDF".
3.  **Interaction:** Spinner shows "Generating Report...".
4.  **Resolution (Mobile):** Native OS Share Sheet opens. User selects "WhatsApp" and sends the PDF directly to "Dad".
5.  **Resolution (Desktop):** Browser triggers a standard file download (`SpendWise_July_2026.pdf`).

---

## 6. Settings & Administration Flow

**Goal:** Change core parameters.

1.  **Entry Point:** User taps "Settings" tab.
2.  **Action (Change Budget):** Taps "Monthly Budget". Changes ₹10,000 to ₹12,000. Taps Save.
3.  **Resolution:** Global state updates. Dashboard now reflects new budget limit.
4.  **Action (Theme):** Taps "Appearance". Selects "Dark Mode". App theme updates instantly.
5.  **Action (Logout):** Taps "Logout". Confirmation dialog. Returns to Login screen.
