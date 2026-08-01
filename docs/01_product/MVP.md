# MVP (Minimum Viable Product) Specification
## SpendWise — Student Expense Tracker
**Version:** 1.0.0-MVP
**Author:** SpendWise Product Team

---

## 1. Executive Summary
The MVP of SpendWise is ruthlessly focused on solving the primary friction point for college students: **the cognitive load and time required to log a daily expense.** Traditional apps require 10-15 seconds and 5+ taps to log an expense. The SpendWise MVP guarantees a sub-3-second, 3-tap experience. All secondary features (advanced analytics, multi-currency, custom categories) are excluded from the MVP to preserve development velocity and UX simplicity.

---

## 2. Core Value Proposition (CVP)
**"Track your daily college spends in 3 seconds. See your remaining budget instantly. No bank linking required."**

### 2.1 Psychological Anchoring
Students experience "budget anxiety" midway through the month. The MVP anchors on a highly visible, instantly updating "Remaining Budget" hero card. By employing color psychology (Purple -> Amber -> Red), the app provides ambient financial awareness without requiring the user to read charts.

---

## 3. In-Scope MVP Features (Exhaustive Definition)

### 3.1 Feature 1: The 3-Second Logger
*The critical path of the application. Must be flawless.*
- **UI Trigger:** A floating action button (FAB) accessible from any screen.
- **Component:** A bottom sheet (Drawer) that animates upwards to avoid context switching.
- **Input Flow:** 
  1. Auto-focus on the amount numeric input. Opens the native OS decimal keyboard instantly (`inputmode="decimal"`).
  2. One-tap category selection via horizontal scrolling chips (15 preset categories with emojis).
  3. Optional text note (max 200 characters).
  4. Submit.
- **Edge Cases Handled:**
  - Zero or negative amount -> Disabled submit button.
  - Exceeding 10,00,000 INR -> Zod validation error ("Amount too large").
  - Offline state -> Queue write in Firestore locally, update UI instantly (Optimistic UI), sync when online.

### 3.2 Feature 2: Dynamic Budget Engine
*The mathematical core of SpendWise.*
- **Definition:** User inputs a fixed monthly allowance (e.g., ₹15,000).
- **Calculation:** `Remaining Budget = Monthly Allowance - Sum(Non-Deleted Expenses for Current Month)`.
- **UI States:**
  - `Safe (>20% remaining)`: Vibrant Purple gradient (`bg-brand-primary`).
  - `Warning (1% - 20% remaining)`: Amber gradient with pulse animation on initial load.
  - `Critical / Over (<0% remaining)`: Crimson Red gradient.
- **Data Architecture:** Pre-aggregated budget totals stored in `users/{uid}/budgets/{YYYY-MM}`. Updated atomically using Firestore `writeBatch` when expenses are added/edited/deleted.

### 3.3 Feature 3: Expense Timeline
*Chronological ledger of transactions.*
- **Grouping:** Expenses visually grouped by day (Today, Yesterday, [Date]).
- **Interactions:** Tap to expand for details (Note, Exact time).
- **Mutations:** 
  - Edit: Opens the bottom sheet pre-filled.
  - Delete: Soft-delete (sets `isDeleted: true`). Triggers a 5-second "Undo" toast.

### 3.4 Feature 4: Basic Analytics & Export
- **Visuals:** Recharts-powered Donut Chart showing % spend by category.
- **Export:** Client-side PDF generation using `jsPDF`. Generates a branded, formatted table of all expenses for the current month.

### 3.5 Feature 5: Frictionless Auth
- **Provider:** Google OAuth 2.0 (Firebase Auth).
- **Fallback:** Email/Password (with required email verification).
- **Session:** Persistent across app reloads via IndexedDB caching.

---

## 4. Explicitly Out-of-Scope (Deferred to Post-MVP)

To prevent scope creep, the following heavily requested features are explicitly banned from the MVP release:

| Feature | Deferral Justification | Priority for v1.1 |
|:---|:---|:---|
| **Custom Categories** | Requires UI for color/emoji picking, DB schema changes, and complex validation. | High |
| **Multi-Currency** | Requires live exchange rate API, complex DB storage (base vs local currency), and floating-point math risks. | Low |
| **Income Tracking** | MVP assumes a single fixed monthly allowance. Income tracking turns the app into a full ledger (P&L), complicating the UI. | Medium |
| **Receipt Scanning (OCR)** | High engineering effort, unpredictable latency, requires external APIs (e.g., Google Cloud Vision). | Very Low |
| **Bank Sync (Plaid)** | Plaid integration is expensive, introduces massive security/privacy overhead, and ruins the manual tracking thesis. | Never |
| **Recurring Expenses** | Requires cron jobs/Cloud Functions to evaluate dates and auto-charge. | High |

---

## 5. Technical Boundaries & Constraints

### 5.1 Performance Budgets
- **First Contentful Paint (FCP):** < 1.2s on 4G connection.
- **Time to Interactive (TTI):** < 2.0s on mid-tier Android (Moto G series benchmark).
- **Bundle Size:** Initial JS payload must remain under 150KB (gzipped). Heavy libraries (like `jsPDF`) MUST be lazily loaded only when the user clicks "Export".

### 5.2 Storage & Infrastructure Limits (Firebase Spark Tier)
- **Reads:** Max 50,000 per day.
- **Writes:** Max 20,000 per day.
- **Mitigation:** Aggressive client-side caching (Zustand) and offline persistence to minimize unnecessary `getDocs` calls on component re-mounts.

---

## 6. MVP Success Criteria (Launch + 30 Days)

1. **Stability:** Less than 1% crash rate (measured via Firebase Crashlytics if native, or manual bug reports for web).
2. **Engagement:** Users who log their first expense log an average of >1.5 expenses per day over the first week.
3. **Retention:** Day 7 (D7) retention rate > 25% (Standard for utility apps).
4. **Latency:** 95th percentile (p95) expense logging time (from FAB click to toast appearance) < 400ms.

---
*Document Status: FINAL*  
*Approved by: AI Product Architect*
