# Empty States
## SpendWise — Student Expense Tracker

Empty states occur when there is no data to display. Instead of showing blank screens or technical errors, we use these moments to educate, encourage action, and reinforce the app's friendly tone.

---

## 1. Design Principles for Empty States
1.  **Illustrative:** Use a clean, branded SVG illustration (e.g., an empty wallet, a calendar, a ghost).
2.  **Clear Copy:** Explain *why* it's empty and *what* to do next.
3.  **Actionable:** Always provide a primary Call to Action (CTA) button to resolve the empty state.

---

## 2. Core Empty States

### 2.1 The New User Dashboard
*   **Trigger:** User finishes onboarding, lands on dashboard, zero expenses logged.
*   **Illustration:** A character looking through a magnifying glass at a piggy bank.
*   **Headline:** "Ready, Set, Track!"
*   **Subtext:** "Your budget is set, but you haven't tracked any expenses yet. Log your first expense to see the magic happen."
*   **CTA Button:** `+ Add Your First Expense` (Triggers FAB action)
*   **Location:** Takes up the space where the "Recent Expenses" list usually sits.

### 2.2 Expense List — No Data for Month
*   **Trigger:** User navigates to a new month (e.g., August 1st) with no data.
*   **Illustration:** A clean desk or a blank notebook.
*   **Headline:** "A Fresh Start"
*   **Subtext:** "No expenses recorded for this month yet. Keep your streak going!"
*   **CTA Button:** `+ Add Expense`

### 2.3 Expense List — No Filter Results
*   **Trigger:** User searches for "Pizza" or filters by "Travel", but no matches exist.
*   **Illustration:** A magnifying glass with a question mark.
*   **Headline:** "No matches found"
*   **Subtext:** "We couldn't find any expenses matching your current filters. Try adjusting them."
*   **CTA Button:** `Clear Filters`

### 2.4 Analytics — No Data
*   **Trigger:** User visits Analytics tab but has zero expenses.
*   **Illustration:** A pie chart with a piece missing, or a sleeping computer.
*   **Headline:** "Nothing to analyze... yet"
*   **Subtext:** "Start tracking your spending, and we'll build beautiful charts to show you where your money goes."
*   **CTA Button:** `Start Tracking` (Navigates to Dashboard/opens FAB)

### 2.5 Reports — No History
*   **Trigger:** User visits Reports tab in their very first month of using the app.
*   **Illustration:** A stack of papers with a lock or a clock.
*   **Headline:** "Check back later"
*   **Subtext:** "Your first monthly report will be ready to download once this month is over."
*   **CTA Button:** None (informational only).

### 2.6 Notifications — Inbox Empty (v1.1)
*   **Trigger:** User opens notification center, no alerts.
*   **Illustration:** A sleeping bell or a zen garden.
*   **Headline:** "All caught up!"
*   **Subtext:** "You have no new alerts. You're doing great with your budget."
*   **CTA Button:** None.

---

## 3. Error States (Technically Empty)

When data fails to load due to network or server issues.

### 3.1 Offline / Network Disconnected
*   **Trigger:** App launches without internet, and local cache is empty.
*   **Illustration:** A disconnected plug or a cloud with a slash.
*   **Headline:** "You're offline"
*   **Subtext:** "Please check your internet connection. SpendWise needs to sync your data."
*   **CTA Button:** `Try Again`

### 3.2 Generic 500 / Crash Boundary
*   **Trigger:** Unhandled exception in a React component.
*   **Illustration:** A slightly broken piggy bank with a band-aid.
*   **Headline:** "Oops! Something snapped."
*   **Subtext:** "We hit a small bump while loading this page. Our team has been notified."
*   **CTA Button:** `Refresh Page`
