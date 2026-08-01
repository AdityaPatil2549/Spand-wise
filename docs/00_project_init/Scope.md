# Project Scope
## SpendWise — Student Expense Tracker

This document defines precisely what is included and excluded from each release of SpendWise to prevent scope creep and maintain focus.

---

## 1. Scope Overview

SpendWise v1.0 is a **Progressive Web App (PWA)** for **Indian college students** who receive a **fixed monthly allowance** and want a **simple, real-time** way to track daily expenses and view category-level analysis.

---

## 2. In-Scope for v1.0 (MVP)

### Authentication
- [x] Google Sign-In (OAuth 2.0)
- [x] Email + Password Sign-In
- [x] Persistent sessions (stay logged in)
- [x] Secure Sign-Out

### Expense Management
- [x] Add expense (amount, category, optional note, date)
- [x] Edit existing expense
- [x] Soft-delete expense (undo supported)
- [x] View expense list (current month, paginated)
- [x] Filter expenses by category
- [x] Search expenses by note text

### Budget Management
- [x] Set a single monthly budget (INR)
- [x] View remaining budget (real-time)
- [x] Visual budget progress bar with warning states

### Categories
- [x] 17 preset categories with emoji + color
- [x] Add up to 3 custom categories (MVP limit)

### Analytics
- [x] Donut chart: spending by category
- [x] Daily spending bar chart
- [x] Top insights (rule-based text cards)
- [x] Month selector (navigate to past months)

### Reports
- [x] Download PDF report for any month
- [x] Download CSV data export for any month

### Multi-Device Sync
- [x] Real-time Firestore sync across all logged-in devices

### PWA Features
- [x] Installable on mobile home screen
- [x] Service worker for offline caching of app shell
- [x] Offline-queued expense writes (sync when online)

---

## 3. Out-of-Scope for v1.0 (Planned for Later)

| Feature | Target Version | Reason for Deferral |
|:---|:---|:---|
| Recurring expense automation | v1.2 | Requires Cloud Functions scheduler; adds complexity |
| Savings goals tracker | v1.2 | New data model; UX not yet designed |
| Income tracking (multi-source) | v2.0 | Different product model; adds significant UX complexity |
| Native iOS/Android app | v2.0 | High cost; PWA covers most student needs |
| Bank/UPI account linking | v3.0 | Regulatory complexity (PCI, RBI guidelines) |
| Group expense splitting | v3.0 | Different product problem; out of core scope |
| AI-powered spending advisor | v2.0 | Requires sufficient data volume; needs LLM integration |
| Custom category budgets (envelopes) | v1.1 | Low complexity but deferred for cleaner MVP |
| Multi-currency support | v3.0 | Low demand in target market |
| Data import from other apps | v1.2 | Low priority for new users |

---

## 4. Platform Scope

| Platform | v1.0 Status |
|:---|:---|
| Web (Chrome, Firefox, Safari, Edge) | ✅ In Scope |
| Android (PWA via Chrome) | ✅ In Scope |
| iOS (PWA via Safari) | ✅ In Scope |
| Native Android App | ❌ Out of Scope |
| Native iOS App | ❌ Out of Scope |

---

## 5. Geography & Language Scope

| Dimension | v1.0 Scope |
|:---|:---|
| **Primary Market** | India |
| **Currency** | INR (₹) only |
| **Language** | English only |
| **Locale** | Indian date/number formatting (DD/MM/YYYY, Lakh/Crore system) |
