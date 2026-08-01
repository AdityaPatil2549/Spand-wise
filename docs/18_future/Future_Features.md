# Future Features (Post-MVP Roadmap)
## SpendWise — Student Expense Tracker

---

## v1.1 — Engagement & Retention (Q3 2026)

### Streaks
- Daily tracking streak counter
- 7-day, 14-day, 30-day milestones with celebrations
- Streak displayed on dashboard header
- Push notification if streak is at risk (11 PM reminder)

### Smart Insights (Enhanced)
- Pace indicator: "At this rate, you'll run out by Day 28"
- Best/worst spending day analysis
- Month-over-month comparison: "You spent 15% more than last month"
- Category alert: "Snacks is up 40% vs. last month"

### Push Notifications
- Budget alert at 80% spending
- Budget exceeded notification
- Daily logging reminder (configurable time)
- End-of-month summary push

### UI Improvements
- Daily spending bar chart on Analytics
- Category emoji selector for custom categories
- Expense search with suggestions
- Sort expenses by amount / date / category

---

## v1.2 — Smart Features (Q4 2026)

### Recurring Expenses
- Mark any expense as recurring (weekly/monthly)
- Auto-add recurring expenses at configured intervals
- Reminders for expected recurring expenses

### Financial Goals
- Set a savings goal (e.g., "Save ₹2,000 this month")
- Dashboard shows goal progress alongside budget
- Goal celebration on achievement

### Split Expense Helper
- Simple 2-person split calculator
- "My share: ₹150" auto-fills the expense amount
- No social/shared account features; just a calculator

### Smart Category Suggestions
- After logging 20+ expenses, suggest category based on note text
- "Lunch at Dominos" → auto-suggest 🍔 Food
- Local ML model (no API calls)

---

## v2.0 — Multi-Income & Advanced Analytics (Q1 2027)

### Income Tracking
- Log income alongside expenses
- Income types: Allowance, Part-time job, Scholarship, Gift
- Net savings = Income - Expenses (displayed on dashboard)
- Monthly P&L view

### Advanced Analytics
- 3-month and 6-month trend charts
- Projection: "If you continue at this pace, you'll have ₹X at end of month"
- Category deep-dive with daily breakdown per category
- Comparative analysis: "Your food spend is 35% vs. 22% for similar users"

### Data Export
- Full data export (all months, all categories) as XLSX
- Sharing: Generate a share link for a month's summary (read-only view)

---

## v3.0 — Platform Expansion (2027+)

### Native Mobile Apps
- React Native app using shared business logic
- iOS App Store + Google Play Store
- Native widgets (iOS Home Screen, Android Today widget)
- Better haptics, native notifications

### Multi-Currency
- Support INR, USD, EUR, GBP
- Currency conversion for travel expenses
- Base currency setting in user profile

### Family/Group Budgets
- Shared budget with partner or roommate
- Each member sees combined spending
- Split expense tracking with real credit/debit to each member

---

## Permanently Out of Scope

These features will NOT be added to SpendWise (by design):

| Feature | Reason |
|:---|:---|
| Bank account linking / auto-import | Privacy concerns; regulatory complexity; complexity explosion |
| Investment tracking | Different domain; Groww/Zerodha do it better |
| Bill splitting (Splitwise-style) | Different domain; Splitwise does it better |
| Business expense management | Not the target audience |
| Multi-user accounts for sharing | Complexity; privacy concerns |
