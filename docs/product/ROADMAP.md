# Roadmap

## SpendWise — Student Expense Tracker

**Living Document — Updated Quarterly**

---

## Vision Summary

SpendWise begins as the simplest possible student expense tracker and evolves into the definitive financial companion for students throughout their college journey and beyond.

---

## Release 1.0 — "The Foundation"

**Target: Week 8 from kickoff**
**Theme:** Core tracking with beautiful design

### Goals

- First 500 users
- Day-7 retention > 50%
- Zero P0/P1 bugs at launch

### Features

- ✅ Google + Email authentication
- ✅ Monthly budget setup & display
- ✅ Add / Edit / Delete expenses
- ✅ 15 preset categories
- ✅ Dashboard with remaining budget hero
- ✅ Category breakdown donut chart
- ✅ Real-time multi-device sync
- ✅ Monthly expense list with grouping
- ✅ Filter by date range and category
- ✅ Budget warnings at 80% and 100%
- ✅ Monthly PDF report download
- ✅ Basic PWA (installable, offline read)
- ✅ Dark mode support

---

## Release 1.1 — "The Analyst"

**Target: Month 3**
**Theme:** Deeper understanding of spending

### Goals

- 2,000 MAU
- 5 minutes average session time
- Analytics feature usage > 60%

### Features

- 📊 Daily spending trend line chart (full month view)
- 📊 Week-over-week comparison
- 📊 Month-over-month category comparison
- 📤 CSV / Excel export
- 🏷️ Custom category creation (up to 10)
- 🔔 Push notifications (web push)
- 🔍 Expense search (by note/category)
- 📅 Historical month view (past 12 months)
- 💡 Smart insights (rule-based): "Your top spend this month is Food at 42%"
- 📱 Improved PWA install experience + A2HS prompts

---

## Release 1.2 — "The Habit Builder"

**Target: Month 5**
**Theme:** Drive daily engagement + habit formation

### Goals

- 5,000 MAU
- Day-30 retention > 40%
- Average 2.5 expenses logged per user per day

### Features

- 🔥 Spending streaks ("You've tracked every day for 7 days!")
- ⚡ Quick-add widget (home screen shortcut)
- 📋 Recurring expense templates ("Mark as recurring")
- 🎯 Category budget limits (e.g., limit Food to ₹3,000/month)
- 🔔 Daily reminder push notifications (opt-in, configurable time)
- 📊 Year-at-a-glance summary (12-month grid)
- 📊 Day-of-week spending patterns ("You spend most on Saturdays")
- 🏆 Monthly spending report comparison to previous months

---

## Release 2.0 — "The Connected"

**Target: Month 8**
**Theme:** Family features + native mobile apps

### Goals

- 10,000 MAU
- Launch native iOS + Android apps
- First 100 SpendWise Pro subscribers

### Features

- 📱 Native iOS App (React Native or Capacitor)
- 📱 Native Android App
- 👨‍👩‍👧 Family View — parent can optionally view child's monthly summary (with child's permission)
- 🔗 Shareable monthly report link (read-only link for parents)
- 💳 SpendWise Pro launch (₹49/month)
  - Unlimited history
  - Advanced analytics
  - Priority support
  - Data export in all formats
- 🌍 Multi-currency support (USD, EUR, GBP)
- 🤝 Expense splitting (basic — track split expenses with friends)
- 🏦 UPI SMS auto-detect (India — read SMS with permission)

---

## Release 2.1 — "The Intelligence"

**Target: Month 12**
**Theme:** AI-powered insights

### Goals

- 25,000 MAU
- NPS score > 60
- Premium conversion rate > 5%

### Features

- 🤖 AI-powered spending insights (Gemini API integration)
  - "Based on your pattern, you'll overspend by ₹1,200 this month if you continue"
  - "Your coffee spending doubled this month"
  - Personalized saving suggestions
- 📸 Receipt scanning (OCR — capture receipt, auto-fill amount)
- 🎓 Financial literacy tips (student-specific, in-context)
- 📊 Spending benchmark ("You spend 20% less on food than similar students")
- 🔮 Monthly budget prediction based on past behavior
- 🎁 Referral program ("Invite a friend, get 1 month Pro free")

---

## Release 3.0 — "The Graduate"

**Target: Year 2**
**Theme:** Post-graduation transition product

### Goals

- 50,000 MAU
- Launch "SpendWise Graduate" tier
- Strategic university partnerships

### Features

- 💼 SpendWise Graduate mode (for first-job earners)
  - Salary tracking
  - SIP / investment tracking (basic)
  - EMI tracking
  - Tax saving tracking (80C, etc.)
- 🏦 Bank statement import (PDF parsing)
- 📊 Comprehensive financial dashboard
- 🎓 University partnerships (white-label for colleges)
- 🌐 Web3 / UPI payment integration (view transactions)

---

## Long-Term Vision (3–5 Years)

### Platform Ambitions

- **SpendWise for Families** — Parents manage multiple children's allowances
- **SpendWise for Hostels** — Hostel managers track student credit/payments
- **SpendWise Data (B2B)** — Anonymized, aggregated student spending insights sold to brands and researchers
- **SpendWise Financial Literacy** — In-app courses and certifications on personal finance

### Technical Ambitions

- Machine learning models trained on SpendWise's unique student spending dataset
- Native integrations with all major Indian UPI apps
- Open API for third-party integrations

---

## Prioritization Framework

Features are prioritized using **RICE Scoring:**

```
RICE Score = (Reach × Impact × Confidence) / Effort

Reach:      Number of users affected (out of 1,000 MAU)
Impact:     0.25=Minimal, 0.5=Low, 1=Medium, 2=High, 3=Massive
Confidence: 50%=Low, 80%=Medium, 100%=High
Effort:     Person-weeks to ship
```

| Feature (planned)  | Reach | Impact | Confidence | Effort | RICE |
| ------------------ | ----- | ------ | ---------- | ------ | ---- |
| Push Notifications | 800   | 2      | 80%        | 2      | 640  |
| CSV Export         | 400   | 1      | 100%       | 1      | 400  |
| Recurring Expenses | 600   | 1      | 80%        | 2      | 240  |
| Receipt Scanning   | 700   | 2      | 60%        | 6      | 140  |
| Family View        | 300   | 2      | 70%        | 4      | 105  |
| AI Insights        | 900   | 3      | 50%        | 8      | 169  |

---

## What We Will NOT Build (Forever)

To protect our student-focused identity, these features are permanently off-roadmap:

- ❌ Full bank account integration + automatic transaction sync
- ❌ Investment portfolio tracking
- ❌ Credit card management
- ❌ Loan tracking
- ❌ Tax filing assistance
- ❌ Insurance products
- ❌ Advertising or sponsored content within the app
- ❌ Selling user data to third parties (EVER)

---

*Roadmap reviewed and updated quarterly by Product Team. Dates are targets, not commitments.*
