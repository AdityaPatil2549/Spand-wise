# Acceptance Criteria
## SpendWise — Student Expense Tracker

All acceptance criteria follow the **Gherkin** format: **Given** [context] **When** [action] **Then** [expected outcome].

---

## AC-001: Add Expense — Happy Path
**Feature:** F011–F014 — Add Expense

**Scenario 1: Valid expense is saved correctly**
- **Given** a logged-in user is on the Dashboard
- **When** they tap the FAB, enter ₹150, select "Food", and tap "Add Expense"
- **Then** the bottom sheet closes, a success toast appears reading "₹150 added to Food", and the Dashboard budget card reflects ₹150 less than before

**Scenario 2: Amount zero is prevented**
- **Given** a logged-in user has opened the Add Expense sheet
- **When** the amount field contains 0 or is empty
- **Then** the "Add Expense" button is disabled and an error message "Amount must be greater than ₹0" is visible

**Scenario 3: Future date is allowed**
- **Given** a user opens the Add Expense date picker
- **When** they select a date 2 days in the future
- **Then** the expense is saved with that future date; no error is shown

**Scenario 4: Past month date**
- **Given** a user opens the Add Expense sheet
- **When** they select a date from the previous month
- **Then** the expense is saved and appears in the previous month's expense list, not the current month's list

---

## AC-002: Budget Progress Bar States
**Feature:** F026 — Budget Progress Bar

**Scenario 1: Green (Safe)**
- **Given** a user has spent less than 80% of their budget
- **When** the Dashboard loads
- **Then** the progress bar is displayed in the "safe" color (green/brand-purple) with no warning

**Scenario 2: Amber Warning (80%)**
- **Given** a user's spending crosses 80% of their budget
- **Then** the progress bar color immediately changes to amber (#F59E0B) and a warning banner appears: "You've used 80% of your budget"

**Scenario 3: Red Alert (100%+)**
- **Given** a user's total expenses exceed their budget amount
- **Then** the progress bar is fully red (#EF4444), the remaining balance shows a negative number (e.g., "-₹500"), and the card pulsates with a red glow

---

## AC-003: Soft Delete with Undo
**Feature:** F016 — Soft-Delete Expense

**Scenario 1: Delete is applied and reversible**
- **Given** a user is viewing their expense list
- **When** they swipe left and tap "Delete" on an expense
- **Then** the expense disappears from the list, the budget is restored by that amount, and an "Expense deleted. UNDO" toast appears for exactly 5 seconds

**Scenario 2: Undo within window**
- **Given** a delete toast is showing
- **When** the user taps "UNDO" within 5 seconds
- **Then** the expense reappears in the list at the same position and the budget is deducted again

**Scenario 3: Undo timeout**
- **Given** a delete toast is showing
- **When** 5 seconds pass without the user tapping "UNDO"
- **Then** the toast disappears; the expense remains soft-deleted (isDeleted: true)

---

## AC-004: PDF Report Generation
**Feature:** F043 — PDF Report

**Scenario 1: PDF contains correct data**
- **Given** a user requests a PDF for July 2026
- **When** the PDF is generated
- **Then** it contains: (1) total budget and total spent, (2) a list of all non-deleted expenses for July 2026, (3) the correct category breakdown, and (4) SpendWise branding

**Scenario 2: Empty month**
- **Given** a user requests a PDF for a month with no expenses
- **When** they tap "Download PDF"
- **Then** an error toast appears: "No expenses to generate a report for this month"

---

## AC-005: Real-time Sync
**Feature:** F045 — Real-time Sync

**Scenario 1: Expense appears on second device instantly**
- **Given** a user is logged in on both their phone and laptop
- **When** they add an expense on their phone
- **Then** within 2 seconds, the same expense appears on the laptop's expense list without any manual refresh

---

## AC-006: Authentication
**Feature:** F001–F007

**Scenario 1: Google sign-in creates account**
- **Given** a new user opens the app for the first time
- **When** they tap "Continue with Google" and complete the OAuth flow
- **Then** a new Firebase Auth user is created, a User document is written in Firestore, and the app redirects to the onboarding screen

**Scenario 2: Subsequent sign-in restores session**
- **Given** a returning user has a valid session
- **When** they open the app
- **Then** they are taken directly to the Dashboard without seeing the login screen
