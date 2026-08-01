# Sprint Plan
## SpendWise — Student Expense Tracker
**Sprint Length:** 2 weeks | **Total:** 5 Sprints (10 weeks) | **Team:** 2 developers

---

## Sprint 0 — Setup & Foundation
**Dates:** Week 1–2  
**Goal:** Fully functional development environment, Firebase configured, design system in place

### Tasks
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS + design tokens (tokens.css)
- [ ] Setup Firebase project (Auth, Firestore, Functions, Hosting)
- [ ] Implement Firebase Security Rules v1
- [ ] Seed preset categories in Firestore
- [ ] Create Zustand store skeleton (all slices)
- [ ] Create TypeScript types file (firestore.ts)
- [ ] Configure ESLint + Prettier + Husky
- [ ] Setup Vitest + React Testing Library
- [ ] Setup Firebase Emulator Suite for local dev
- [ ] Setup GitHub Actions CI pipeline
- [ ] Implement design system: Button, Input, Card, Skeleton components
- [ ] Create app shell: BottomNav (mobile) + Sidebar (desktop)
- [ ] Create AuthGuard component
- [ ] Deploy skeleton to staging (Firebase Hosting)

**Definition of Done:**
- `npm run dev` starts app successfully
- Login screen renders on localhost:3000
- Firebase emulators run for testing
- CI pipeline passes

---

## Sprint 1 — Authentication & Onboarding
**Dates:** Week 3–4  
**Stories:** US-001, US-002, US-003, US-004  
**Goal:** Complete auth flow + budget setup

### Tasks
- [ ] Build Login page (Google + Email/Password)
- [ ] Implement Google OAuth sign-in flow
- [ ] Implement Email/Password sign-in + registration
- [ ] Implement email verification flow
- [ ] Create `createUserDocument()` on first login
- [ ] Build Onboarding page (budget setup)
- [ ] Implement `completeOnboarding()` with batch write
- [ ] Create Budget document on onboarding complete
- [ ] Implement auth state observer + routing guard
- [ ] Implement logout flow with state cleanup
- [ ] Build Settings > Account page (basic)
- [ ] Unit tests: auth utility functions
- [ ] Unit tests: Zod schemas (budget input)
- [ ] E2E: Google sign-in flow (smoke test)

**Definition of Done:**
- New user can sign up via Google and set budget
- New user can sign up via Email/Password
- Authenticated users auto-redirect to dashboard
- Unauthenticated users redirect to login
- Onboarding only shows once

---

## Sprint 2 — Expense CRUD + Dashboard
**Dates:** Week 5–6  
**Stories:** US-006, US-007, US-008, US-009, US-010, US-011, US-013, US-014, US-020  
**Goal:** Core expense tracking + real-time sync

### Tasks
- [ ] Build Dashboard page with budget hero card
- [ ] Implement budget progress bar with color states
- [ ] Add "Today's Spending" summary card
- [ ] Add "Recent 5 Expenses" section
- [ ] Build Add Expense Bottom Sheet
- [ ] Build AmountInput component (formatted currency)
- [ ] Build CategoryPicker grid component
- [ ] Implement `addExpense()` with optimistic UI
- [ ] Implement real-time listeners (RealtimeManager)
- [ ] Implement Firestore `onSnapshot` for expenses + budget
- [ ] Build Expense List page with date grouping
- [ ] Build ExpenseListItem component (swipe-to-delete mobile)
- [ ] Build Edit Expense Bottom Sheet
- [ ] Implement `updateExpense()` with optimistic UI
- [ ] Implement soft-delete with 5-second undo toast
- [ ] Implement offline persistence (Firestore config)
- [ ] Build ExpenseFAB component
- [ ] Build Toast notification system
- [ ] Implement multi-tab real-time sync (test with 2 tabs)
- [ ] Unit tests: addExpense, updateExpense, deleteExpense utilities
- [ ] Integration tests: expense CRUD with Firebase Emulator
- [ ] E2E: complete add expense flow

**Definition of Done:**
- Add expense in under 5 seconds (measured by Playwright)
- Expense appears on second device/tab within 500ms
- Budget card updates immediately on expense add
- Swipe-to-delete works on mobile
- Offline: add expense queued, syncs on reconnect

---

## Sprint 3 — Analytics + Reports + Notifications
**Dates:** Week 7–8  
**Stories:** US-015, US-016, US-018, US-025  
**Goal:** Meaningful analysis + report generation

### Tasks
- [ ] Build Analytics page
- [ ] Implement DonutChart component (Recharts)
- [ ] Implement SpendingTrendChart (line chart, Recharts)
- [ ] Build CategoryBreakdownList with progress bars
- [ ] Implement Cloud Function `onExpenseWrite` (budget recalculation)
- [ ] Deploy and test Cloud Function with emulator
- [ ] Implement budget `categoryBreakdown` field
- [ ] Build Reports page
- [ ] Implement `generateMonthlyPDF()` with jsPDF
- [ ] PDF includes: cover, summary, donut chart, transaction list
- [ ] Implement CSV export with SheetJS
- [ ] Implement Web Push Notification setup (FCM)
- [ ] Implement budget warning logic (80% + 100%)
- [ ] Build BudgetWarningBanner component
- [ ] Month-on-month basic comparison (previous month data)
- [ ] Unit tests: pdfGenerator, csvExporter
- [ ] Unit tests: budgetUtils, formatCurrency
- [ ] E2E: generate and download PDF

**Definition of Done:**
- Analytics page shows correct donut chart
- Trend line chart shows 31 days of daily data
- PDF generates within 3 seconds
- Budget warnings fire at 80% and 100%
- Cloud Function updates budget on every expense write

---

## Sprint 4 — Filters, Categories, Polish
**Dates:** Week 9–10  
**Stories:** US-012, US-022, US-023, US-019  
**Goal:** Feature completeness + production readiness

### Tasks
- [ ] Implement expense list filters (date range, category)
- [ ] Build MonthPicker component (horizontal scroll/tap)
- [ ] Build filter panel (slide-down from header)
- [ ] Applied filter chips with dismiss
- [ ] Settings > Budget page (update monthly budget)
- [ ] Settings > Categories page (view all categories)
- [ ] Create custom category flow
- [ ] Settings > Notifications page
- [ ] CSV export from Reports page
- [ ] Historical monthly summary (past reports list)
- [ ] Account deletion flow
- [ ] Dark mode: verify all screens
- [ ] Performance audit (Lighthouse > 90)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Full E2E test suite run
- [ ] Fix all P0 and P1 bugs
- [ ] Security review (Firestore rules, input validation)
- [ ] Load testing (simulate 100 concurrent users)
- [ ] Deploy to production (Firebase Hosting)

**Definition of Done:**
- All P0 user stories implemented and tested
- Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- Zero P0 bugs, zero P1 bugs
- All E2E tests passing
- Production deployment live

---

## Sprint 5 — Post-Launch
**Dates:** Weeks 11–14 (ongoing)  
**Goal:** Monitor, fix, iterate based on real user feedback

### Week 11–12: Monitor & Fix
- [ ] Monitor Firebase Analytics for user behavior
- [ ] Monitor error rates (Sentry or Firebase Crashlytics)
- [ ] Address all bug reports from first 500 users
- [ ] Performance optimizations based on real-world data
- [ ] User feedback sessions (5 students)

### Week 13–14: v1.1 Prep
- [ ] Prioritize v1.1 features based on user feedback
- [ ] Design v1.1 features (push notifications improvements, CSV export UX)
- [ ] Begin development of top 3 user-requested features

---

## Velocity Tracking

| Sprint | Planned Points | Completed | Velocity |
|---|---|---|---|
| Sprint 0 | 30 | - | - |
| Sprint 1 | 20 | - | - |
| Sprint 2 | 45 | - | - |
| Sprint 3 | 40 | - | - |
| Sprint 4 | 35 | - | - |

---

## Definition of Done (Global)

A feature is "Done" when:
1. ✅ Code is written and reviewed
2. ✅ Unit tests pass (coverage threshold met)
3. ✅ No TypeScript errors
4. ✅ No lint errors
5. ✅ Works on mobile (iPhone 13 Safari + Pixel 7 Chrome)
6. ✅ Works on desktop (Chrome + Firefox + Safari)
7. ✅ Dark mode works
8. ✅ Offline behavior graceful
9. ✅ Deployed to staging and smoke-tested
10. ✅ PR reviewed and approved
11. ✅ CHANGELOG updated
