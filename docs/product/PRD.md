# Product Requirements Document (PRD)
## SpendWise — Student Expense Tracker
**Version:** 1.0.0  
**Date:** July 2026  
**Author:** Product Team  
**Status:** APPROVED FOR DEVELOPMENT

---

## 1. Executive Summary

SpendWise is a beautifully simple, real-time, multi-device personal expense tracker designed exclusively for students. Unlike bloated financial apps that overwhelm users with complex bank integrations and investment dashboards, SpendWise focuses on one thing done perfectly: helping students understand exactly where their fixed monthly allowance goes — with zero friction, maximum clarity.

**Core Value Proposition:** _"Know your money. Own your month."_

---

## 2. Problem Statement

### 2.1 The Core Problem
Students receive a fixed monthly allowance from family (typically ranging from ₹3,000 to ₹25,000 in India, or equivalent internationally). Despite knowing their budget, the majority consistently run out of money before month-end without understanding why.

### 2.2 Root Causes Identified (via user research)
1. **No tracking habit:** Logging expenses manually feels like a chore
2. **Complexity barrier:** Existing apps (Mint, YNAB, Walnut) are built for salaried adults with bank accounts, investments, and bills — not students
3. **No real-time awareness:** Students only realize they're overspending at month-end
4. **Multi-device gap:** Students switch between phone, laptop, and tablet — existing solutions have poor cross-device sync
5. **Analysis paralysis:** Too many features kill the primary purpose — knowing where money went

### 2.3 Why Existing Solutions Fail Students
- **Mint / Money Manager EX:** Requires bank linking, tax tracking, complex categorization
- **YNAB:** $99/year — too expensive for students; learning curve too steep
- **Walnut / ET Money (India):** SMS parsing only works with bank accounts; UI overloaded
- **Notion / Excel templates:** No mobile optimization; no real-time sync; manual computation

---

## 3. Product Vision

> SpendWise is the expense tracker that feels like a conversation with a smart friend — not a bank statement. Students open it in 2 seconds, add an expense in 5 seconds, and leave knowing exactly what they can still spend. It works on every device they own, syncs instantly, and gives them a clear monthly picture without requiring a finance degree.

---

## 4. Goals & Objectives

### 4.1 Business Goals
- Achieve 10,000 Monthly Active Users (MAU) by end of Q2 2027
- Maintain Day-30 retention above 40%
- Reach 4.5+ star rating on app stores
- Generate premium revenue via SpendWise Pro (₹49/month)

### 4.2 Product Goals
- Time-to-first-expense under 30 seconds after signup
- P95 expense entry time under 5 seconds
- Real-time sync latency under 500ms across devices
- Monthly report generation under 3 seconds
- Zero-confusion onboarding (100% task completion in user tests)

### 4.3 Non-Goals (v1.0)
- Bank account linking / automatic transaction import
- Investment or savings tracking
- Bill reminders / payment scheduling
- Multi-currency support (v2 roadmap)
- AI-powered spending predictions (v2 roadmap)
- Social features / expense splitting (v2 roadmap)

---

## 5. Target Users

### Primary: The Allowance-Dependent Student
- **Age:** 17–24
- **Location:** Tier 1/2 cities in India; international student markets
- **Income:** Fixed monthly allowance ₹3,000–₹25,000 from family
- **Device:** Primary = smartphone; Secondary = laptop for study
- **Pain:** Money disappears mysteriously every month
- **Goal:** Understand and control their spending

### Secondary: The Part-Time Worker Student
- **Age:** 20–26
- **Income:** Mix of allowance + part-time income (₹5,000–₹40,000/month)
- **Behavior:** More conscious spender; wants weekly/monthly analysis

---

## 6. User Stories

See full document: [`USER_STORIES.md`](USER_STORIES.md)

**Summary of Epic User Stories:**

**Epic 1: Onboarding**
- As a new user, I can sign up in under 60 seconds using Google or email, so I can start tracking immediately
- As a new user, I set my monthly budget once during onboarding, so the app knows my spending limit from day one

**Epic 2: Expense Entry**
- As a student, I can add an expense in under 5 taps, so tracking never interrupts my day
- As a student, I can categorize expenses (Food, Transport, Entertainment, etc.), so I know where different amounts go
- As a student, I can add a note to any expense, so I remember what "₹450" was for
- As a student, I can edit or delete any expense I've entered, so I can correct mistakes

**Epic 3: Budget & Overview**
- As a student, I can see my remaining budget for the month at a glance, so I always know my financial state
- As a student, I see a visual breakdown of spending by category, so I identify problem areas instantly
- As a student, I get a warning when I reach 80% of my budget, so I can slow down spending

**Epic 4: Multi-Device Sync**
- As a student who uses both phone and laptop, I see the same data on all devices instantly, so I never see stale information

**Epic 5: Reports & Export**
- As a student, I can download my monthly expenses as a PDF or CSV, so I can show it to parents or review it later
- As a student, I can see a historical overview of past months, so I track whether my habits improve

**Epic 6: Analysis**
- As a student, I can see a category-wise pie chart of my spending, so I immediately understand where money went
- As a student, I can see daily, weekly, and monthly spending trends, so I identify peak spending days

---

## 7. Feature Requirements

### 7.1 Core Features (MVP — v1.0)

#### F-001: Authentication
**Priority:** P0 (Must Have)  
**Description:** Users can authenticate via Google OAuth or Email/Password  
**Acceptance Criteria:**
- [ ] Google OAuth login works on mobile and desktop
- [ ] Email/password login with email verification
- [ ] Persistent auth state (stays logged in across sessions)
- [ ] Secure logout from any device

#### F-002: Monthly Budget Setup
**Priority:** P0 (Must Have)  
**Description:** User sets their monthly budget once; app tracks against it  
**Acceptance Criteria:**
- [ ] First-time onboarding prompts budget setup
- [ ] Budget can be changed any time in Settings
- [ ] Budget is per-month (resets each month or user can carry over)
- [ ] Visual indicator shows budget consumed (progress bar)

#### F-003: Expense Entry
**Priority:** P0 (Must Have)  
**Description:** Quick, frictionless expense logging  
**Acceptance Criteria:**
- [ ] Amount entry (number pad, currency formatted)
- [ ] Category selection (15 preset categories + custom)
- [ ] Optional note/description field
- [ ] Date picker (defaults to today, can be backdated)
- [ ] Submission completes in under 3 seconds end-to-end
- [ ] Optimistic UI update before server confirmation

#### F-004: Expense List
**Priority:** P0 (Must Have)  
**Description:** Chronological list of all expenses with filtering  
**Acceptance Criteria:**
- [ ] Grouped by date (Today, Yesterday, This Week, etc.)
- [ ] Each entry shows: amount, category icon, description, time
- [ ] Swipe-to-delete on mobile
- [ ] Tap to edit any entry
- [ ] Filter by date range (day / week / month / custom)
- [ ] Filter by category

#### F-005: Dashboard / Overview
**Priority:** P0 (Must Have)  
**Description:** Single-screen command center showing financial status  
**Acceptance Criteria:**
- [ ] Total spent this month (large, prominent)
- [ ] Remaining budget (with color coding: green → orange → red)
- [ ] Mini category breakdown chart (donut chart)
- [ ] Today's spend summary
- [ ] Recent 5 transactions
- [ ] Budget progress bar with percentage

#### F-006: Category Analysis
**Priority:** P1 (Should Have)  
**Description:** Visual breakdown of spending by category  
**Acceptance Criteria:**
- [ ] Donut / Pie chart of category distribution
- [ ] List view below chart with amount + percentage per category
- [ ] Tap category to see all transactions in that category
- [ ] Compare current month vs. last month per category

#### F-007: Real-Time Multi-Device Sync
**Priority:** P0 (Must Have)  
**Description:** Firestore real-time listeners ensure instant sync  
**Acceptance Criteria:**
- [ ] Any expense added on Device A appears on Device B within 500ms
- [ ] Works across phone + browser simultaneously
- [ ] Handles offline gracefully (queue locally, sync on reconnect)
- [ ] Conflict resolution: last-write-wins with timestamp

#### F-008: Monthly Report Generation
**Priority:** P1 (Should Have)  
**Description:** Generate and download detailed monthly expense report  
**Acceptance Criteria:**
- [ ] PDF report with: cover page, category breakdown, daily spending chart, full transaction list
- [ ] CSV export with all raw data
- [ ] Reports available for any past month
- [ ] Report generated client-side (no server dependency for basic PDF)

#### F-009: Budget Alerts
**Priority:** P1 (Should Have)  
**Description:** Proactive notifications when approaching budget limits  
**Acceptance Criteria:**
- [ ] In-app warning at 80% budget consumed
- [ ] In-app alert at 100% budget consumed
- [ ] Push notification (web push) at 80% and 100%
- [ ] Toast notification on expense entry if budget exceeded

#### F-010: Expense Categories
**Priority:** P0 (Must Have)  
**Description:** Pre-defined and custom categories for expense classification  
**Default Categories:**
1. 🍔 Food & Dining
2. 🚌 Transport
3. 📚 Education & Books
4. 🎮 Entertainment
5. 🛍️ Shopping
6. 💊 Health & Medical
7. 🏠 Accommodation
8. 📱 Phone & Internet
9. ☕ Café & Snacks
10. 💇 Personal Care
11. 🎁 Gifts & Donations
12. 🏋️ Fitness
13. ✈️ Travel
14. 🔧 Utilities
15. 📦 Other

**Acceptance Criteria:**
- [ ] All 15 default categories displayed with emoji + color
- [ ] User can add up to 10 custom categories
- [ ] Custom categories persist across devices
- [ ] Category cannot be deleted if transactions exist (soft archive)

### 7.2 Enhanced Features (v1.1 — Post-Launch)

#### F-011: Spending Trends
- Line chart showing daily spend over the month
- Weekly comparison (This week vs. last week)

#### F-012: Smart Insights
- "You spent 40% more on Food this month vs. last month"
- "Your highest spending day was Saturday"
- "Your biggest single expense was ₹1,200 on Shopping"

#### F-013: Historical View
- Month-by-month summary grid
- Trend arrows (improving / worsening)
- Year-over-year comparison

#### F-014: Recurring Expenses
- Mark an expense as "recurring" (weekly/monthly)
- App pre-logs it or reminds user

#### F-015: Dark Mode
- System-based auto dark/light mode
- Manual override in settings

---

## 8. Non-Functional Requirements

### 8.1 Performance
| Metric | Target |
|---|---|
| App initial load (cold start) | < 2 seconds |
| Expense entry submission | < 500ms (optimistic UI) |
| Real-time sync latency | < 500ms (P95) |
| Dashboard render time | < 300ms |
| Report generation (PDF) | < 3 seconds |
| API response time (P95) | < 200ms |
| Lighthouse Performance Score | > 90 |

### 8.2 Reliability
| Metric | Target |
|---|---|
| Service uptime | 99.9% (Firebase SLA) |
| Data durability | 99.999999% (Firestore) |
| Offline operation | Full read access; queued writes |

### 8.3 Security
- All data encrypted in transit (TLS 1.3)
- All data encrypted at rest (Firestore default AES-256)
- No plaintext sensitive data in logs
- OWASP Top 10 compliance
- Rate limiting: 100 req/min per user

### 8.4 Usability
- WCAG 2.1 AA compliance
- Supports screen readers (ARIA labels on all interactive elements)
- Minimum tap target size: 44×44px
- System font scaling support (up to 200%)

### 8.5 Compatibility
| Platform | Support |
|---|---|
| iOS Safari | 15+ |
| Android Chrome | 90+ |
| Desktop Chrome | 90+ |
| Desktop Firefox | 90+ |
| Desktop Safari | 15+ |
| Desktop Edge | 90+ |

---

## 9. Constraints & Assumptions

### Constraints
- **Budget:** Zero infrastructure cost for MVP (Firebase Spark tier free limits)
- **Timeline:** 8-week development sprints for MVP
- **Team:** 1–2 developers for MVP phase
- **No backend infrastructure:** Firebase handles all backend needs

### Assumptions
- Users have consistent internet access (students on campus WiFi/data)
- Primary currency is Indian Rupee (₹) for v1; multi-currency in v2
- Users are comfortable with Google Sign-In
- Monthly budget is set manually (no bank integration)

---

## 10. Success Metrics

| Metric | 30-day Target | 90-day Target |
|---|---|---|
| Registered users | 500 | 5,000 |
| Daily Active Users | 100 | 1,500 |
| Retention (Day 7) | 60% | 65% |
| Retention (Day 30) | 35% | 42% |
| Avg. expenses per user/day | 2.5 | 3.0 |
| App Store Rating | - | 4.5 |
| NPS Score | - | 50+ |
| P95 Load Time | < 2s | < 1.5s |
| Support Tickets/1000 users | < 5 | < 3 |

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Firebase free tier limits hit | Medium | High | Monitor usage; upgrade plan when needed |
| Low Day-7 retention | Medium | High | Smooth onboarding; push notification reminders |
| Offline sync conflicts | Low | Medium | Last-write-wins with conflict log |
| Data privacy concerns | Low | Very High | Clear privacy policy; no data selling; GDPR compliance |
| App Store rejection | Low | High | Follow all guidelines; WCAG compliance |
| Competitor cloning features | High | Medium | Focus on student-specific UX differentiation |

---

## 12. Dependencies

| Dependency | Type | Provider |
|---|---|---|
| Authentication | External | Firebase Auth |
| Database + Real-time | External | Firestore |
| Hosting | External | Firebase Hosting / Vercel |
| Push Notifications | External | Firebase Cloud Messaging |
| Analytics | External | Firebase Analytics |
| PDF Generation | Library | jsPDF |
| CSV Export | Library | SheetJS |
| Charts | Library | Recharts |
| UI Framework | Library | Next.js 14 |

---

## 13. Timeline Overview

| Phase | Duration | Key Deliverable |
|---|---|---|
| Design & Prototyping | Week 1–2 | Figma designs, component library |
| Foundation Setup | Week 2–3 | Next.js project, Firebase config, auth |
| Core Features | Week 3–6 | Expense CRUD, dashboard, sync |
| Reports & Analysis | Week 6–7 | Charts, PDF export, insights |
| Testing & QA | Week 7–8 | Full test suite, bug fixes |
| Launch | Week 8 | Production deployment |

---

*Document maintained by Product Team. Last updated: July 2026.*
