# CHANGELOG
## SpendWise — Student Expense Tracker

All notable changes to SpendWise will be documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Planned for v1.1
- Push notifications (web push via FCM)
- CSV / Excel export
- Custom category creation
- Expense search
- Daily spending trend chart
- Month-over-month comparison

---

## [1.0.0] — 2026-07-21 (Initial Release)

### 🎉 Initial Launch

**SpendWise is live!** The first version of the simplest expense tracker for students.

### Added
- **Authentication**
  - Google OAuth sign-in (1-tap login)
  - Email/password sign-in and registration
  - Email verification for new email accounts
  - Persistent auth session across sessions

- **Onboarding**
  - First-time budget setup modal
  - Quick-pick budget amounts (₹3K, ₹5K, ₹8K, ₹10K)
  - Budget auto-resets at start of each new month

- **Expense Management**
  - Add expense with amount, category, note, and date
  - 15 preset categories with emoji icons
  - Optional expense note (up to 200 characters)
  - Backdate expenses within current month
  - Edit any expense (amount, category, note, date)
  - Soft-delete with 5-second undo toast
  - Swipe-to-delete on mobile

- **Dashboard**
  - Remaining budget hero card (count-up animation)
  - Dynamic color states: safe (purple) → warning (amber) → exceeded (red)
  - Budget progress bar with percentage
  - Today's spending summary
  - Mini category donut chart
  - 5 most recent expenses

- **Expense List**
  - Chronological list grouped by date
  - Date groups: Today, Yesterday, [Day Name], [Full Date]
  - Infinite scroll with 20-item pagination
  - Filter by: Today / This Week / This Month
  - Filter by category

- **Analytics**
  - Category breakdown donut chart
  - Category list with amount and percentage
  - Interactive chart (tap to highlight category)

- **Reports**
  - Monthly PDF report generation (client-side, jsPDF)
  - PDF includes: branding, summary, category chart, full transaction list
  - Download or share PDF via native share sheet

- **Real-Time Multi-Device Sync**
  - Firestore `onSnapshot` real-time listeners
  - < 500ms sync latency on stable connection
  - Offline support (Firestore local persistence)
  - Optimistic UI for all expense operations

- **Budget Alerts**
  - In-app warning banner at 80% budget used
  - In-app alert at 100% budget (over budget)
  - Dynamic dashboard card color changes

- **Settings**
  - Update monthly budget amount
  - View preset categories
  - Dark mode (system auto / manual override)
  - Account profile view
  - Logout

- **Design**
  - Purple brand gradient design system
  - Responsive (mobile-first, desktop sidebar)
  - Smooth animations (Framer Motion)
  - Dark mode support
  - WCAG 2.1 AA accessibility compliance

### Technical
- Next.js 14 (App Router) with TypeScript
- Firebase Auth + Firestore + Cloud Functions
- Zustand global state management
- Firebase Cloud Functions for budget recalculation
- jsPDF for client-side PDF generation
- Vitest unit tests + Playwright E2E tests

---

## Release Format Reference

```
## [MAJOR.MINOR.PATCH] — YYYY-MM-DD

### Added       — New features
### Changed     — Changes in existing functionality
### Deprecated  — Features to be removed in future
### Removed     — Features removed
### Fixed       — Bug fixes
### Security    — Security vulnerability fixes
### Performance — Performance improvements
```

---

*SpendWise Changelog — maintained by the development team.*
