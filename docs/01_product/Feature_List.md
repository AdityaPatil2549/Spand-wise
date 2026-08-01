# Feature List
## SpendWise — Student Expense Tracker

A complete, prioritized list of all features across all planned versions.

---

## Version 1.0 (MVP) Features

### Authentication & Accounts
- F001: Sign up with Google OAuth
- F002: Sign up with Email + Password
- F003: Sign in with Google OAuth
- F004: Sign in with Email + Password
- F005: Persistent login session (remember me)
- F006: Secure sign out
- F007: Password reset via email
- F008: Account deletion (GDPR compliance)

### Onboarding
- F009: First-run budget setup wizard (1 step)
- F010: Quick-pick budget amount chips (₹5k, ₹8k, ₹10k, ₹15k)

### Expense Entry
- F011: Add expense — amount input (numeric keypad auto-open)
- F012: Add expense — category selection (emoji grid)
- F013: Add expense — optional text note
- F014: Add expense — date picker (defaults to today)
- F015: Edit existing expense (all fields)
- F016: Soft-delete expense with undo toast (5-second window)
- F017: Optimistic UI updates (instant feedback)

### Expense List
- F018: View current month's expenses (chronological, latest first)
- F019: Navigate to previous months
- F020: Filter expenses by category
- F021: Search expenses by note text
- F022: Infinite scroll / load more pagination (100 per page)
- F023: Swipe-to-delete gesture (mobile)

### Budget Management
- F024: Set global monthly budget amount
- F025: Change budget mid-month
- F026: Budget progress bar with color states (green/amber/red)
- F027: Real-time remaining budget display
- F028: Budget reset on 1st of each month (automatic)

### Categories
- F029: 17 preset categories (emoji + color)
- F030: Add up to 3 custom categories (MVP limit)
- F031: Sort category picker by most-used-first

### Dashboard
- F032: "Remaining Budget" hero card
- F033: Budget utilization percentage
- F034: Budget progress bar with warning colors
- F035: Projected overspend warning
- F036: Recent expenses list (last 5 items)
- F037: Quick-add expense button (FAB)

### Analytics
- F038: Category breakdown donut chart
- F039: Category list with percent and amount
- F040: Month selector for historical view
- F041: Rule-based insight text cards (3–5 cards)
- F042: "Fast burn rate" warning card

### Reports & Export
- F043: Generate PDF monthly report
- F044: Export CSV for any selected month

### Multi-Device Sync
- F045: Real-time Firestore sync across all devices
- F046: Offline expense queuing (logs offline, syncs on reconnect)
- F047: Offline indicator banner

### PWA
- F048: Web App Manifest (installable)
- F049: Service Worker (app shell caching)
- F050: Add to Home Screen prompt

---

## Version 1.1 Features

- F051: Push notification — budget at 80%
- F052: Push notification — budget exceeded
- F053: Push notification — daily reminder (opt-in)
- F054: Push notification — monthly report ready
- F055: Tracking streak (consecutive days)
- F056: 5 milestone badges (First Expense, Under Budget, etc.)
- F057: Daily spending bar chart
- F058: Up to 10 custom categories
- F059: Category-level budget limits
- F060: Dark mode toggle
- F061: In-app "What's New" notification

## Version 1.2 Features

- F062: Recurring expense templates
- F063: Auto-log recurring expenses (Cloud Function)
- F064: Savings goals tracker
- F065: CSV import from other apps
- F066: Wishlist / 48-hour cooldown
- F067: Round-up micro-savings jar
- F068: Savings goal progress visualization

## Version 2.0 Features

- F069: Income tracking (multi-source)
- F070: Net balance dashboard
- F071: Cash flow chart
- F072: AI spending insights
- F073: Anonymous peer benchmarking
- F074: Google Drive auto-backup
- F075: Two-factor authentication
