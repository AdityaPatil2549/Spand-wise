# Glossary
## SpendWise — Student Expense Tracker

This document defines all domain-specific, technical, and product-specific terms used across SpendWise documentation and codebase.

---

## A

**Acceptance Criteria:** Specific, verifiable conditions that a feature must meet to be considered complete. Written in "Given-When-Then" format.

**Activation:** The moment a new user completes onboarding AND logs their first expense. A user is "activated" when they experience the core value of the app.

**Aggregation / Pre-Aggregation:** The process of computing and storing summary statistics (e.g., total spent per category) in a separate Firestore document (`budget/{month}`), rather than calculating them live from raw data on each read. Critical for Firestore read efficiency.

**Allowance:** The fixed monthly sum of money a student receives from their family or scholarship. The primary input for budget creation.

---

## B

**Budget Document:** A Firestore document (one per user per month) that stores the monthly budget amount, total spent, and a pre-aggregated category breakdown. Path: `users/{uid}/budgets/{YYYY-MM}`.

**Budget Utilization %:** `(Total Expenses / Total Budget) × 100`. The percentage of the monthly budget consumed.

**Burn Rate:** How quickly a user is spending their budget. A "fast burn rate" means the user is on track to exceed their budget before month-end.

---

## C

**Category:** A user-facing label for classifying an expense (e.g., "Food 🍔", "Transport 🚌"). Has an emoji, a color, and an ID.

**Cloud Function:** Serverless backend logic hosted on Firebase, triggered by Firestore document changes, HTTP calls, or scheduled tasks. Used for pre-aggregation and automation.

**Conventional Commit:** A standard git commit message format: `type(scope): description` (e.g., `feat(expenses): add category picker`).

**CWV (Core Web Vitals):** Google's performance metrics: LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), FID/INP (Interactivity). Targets define our performance standards.

---

## E

**Envelope Budgeting:** A budgeting method where money is allocated to specific categories ("envelopes") at the start of the month. Category-level budget limits in SpendWise v1.1.

**Expense Document:** A single Firestore record representing one expense. Path: `users/{uid}/expenses/{expenseId}`.

---

## F

**FAB (Floating Action Button):** The primary "+" button for adding expenses. Always visible on Dashboard and Expense List tabs.

**Firestore:** Google Firebase's NoSQL, real-time document database. The primary data store for SpendWise.

---

## I

**isDeleted:** A boolean field on an Expense Document. When `true`, the expense is considered deleted (soft delete). It is excluded from queries but not physically removed. Can be restored.

---

## M

**Month Key:** A string identifier in the format `YYYY-MM` (e.g., `2026-07`) used as the document ID for budget aggregates.

**MVP (Minimum Viable Product):** The smallest set of features that delivers core value to users and allows us to learn. Defined in `docs/01_product/MVP.md`.

---

## O

**Onboarding:** The first-run experience for a new user, consisting of Sign-In → Budget Setup → Dashboard.

**Optimistic UI:** A UX technique where the app assumes a write operation (e.g., add expense) will succeed and updates the UI immediately, before the server confirms. Rolled back on failure.

---

## P

**PWA (Progressive Web App):** A web app built with Service Workers and a Web App Manifest, making it installable on a user's home screen with near-native performance.

**pLDDT:** Not applicable. (This is a biology term; excluded from this glossary).

---

## S

**Soft Delete:** Setting `isDeleted: true` on a document instead of physically removing it from Firestore. Allows for an "Undo" feature and data recovery.

**Spark Plan:** Firebase's free pricing tier. Has specific daily limits on reads, writes, and stored data. SpendWise v1.0 targets the Spark plan exclusively.

**Streak:** A gamification metric tracking the number of consecutive days a user has logged at least one expense.

---

## U

**UID (User ID):** The unique identifier assigned by Firebase Authentication to each user account (e.g., `7f3jXkL9...`). Used as the root key for all user data in Firestore.

---

## Z

**Zustand:** A lightweight React state management library used for global client state (auth status, expense list, UI flags) in SpendWise.

**Zero-Based Budgeting:** A budgeting method where every rupee of income is assigned a purpose (expenses + savings = total income), leaving zero unallocated.
