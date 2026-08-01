# Student Financial Workflow
## SpendWise — Student Expense Tracker

---

## 1. The Student Monthly Financial Cycle

Understanding the student's financial month is critical to designing SpendWise's logic correctly.

```
Day 1           Day 3-5         Day 10-20       Day 25-30       Day 30/31
  │               │               │               │               │
  ▼               ▼               ▼               ▼               ▼
Budget Set    Allowance        Active           Scarcity        Month
(App)         Received         Spending         Phase           End
              (Bank/Cash)      Phase                           Report
```

### Phase 1: Budget Initialization (Day 1)
- App resets the monthly budget document automatically.
- User may need to manually adjust if allowance changed this month.
- Previous month's report becomes available.

### Phase 2: Allowance Receipt (Day 3–5)
- Student receives cash or bank transfer from parents.
- This is the moment of maximum financial optimism ("I have money!").
- The app should remind the student of their budget if they haven't logged expenses yet: *"New month! Your budget is ₹10,000. Let's track it well."*

### Phase 3: Active Spending (Day 5–20)
- High-frequency expense logging.
- Mix of essential (mess, transport) and discretionary (shopping, eating out) spending.
- App sends 80% budget warning when threshold is crossed.

### Phase 4: Scarcity Management (Day 20–28)
- Budget is running low; student becomes more careful.
- App calculates "Safe Daily Spend" to stretch remaining budget to month-end.
- This is the most stressful phase — app copy should be supportive, not alarming.

### Phase 5: Month Close (Day 28–31)
- Final accounting of the month.
- App generates the analytics summary (under/over budget).
- Student downloads PDF report (to show parents or for personal review).
- Celebratory state if under budget; constructive review if over budget.

---

## 2. Key Student Financial Behaviors

| Behavior | SpendWise Response |
|:---|:---|
| **Forgets to log for 3+ days** | Push notification reminder |
| **Logs multiple small purchases** | Groups same-category same-day items visually ("3 Food expenses today") |
| **Makes a big impulse purchase** | Immediate overspend warning on dashboard |
| **Asks parents for more money mid-month** | No app judgment; user can manually increase budget mid-month |
| **Receives cash gift (birthday)** | v2.0: Log as "Income - Gift"; v1.0: User simply raises their budget |
| **Splits expenses with friends** | No Splitwise functionality in v1.0; user logs their own share only |

---

## 3. The Zero-Day Problem

Many students forget to log expenses and then try to backfill a week's worth of transactions from memory. This data is unreliable.

**SpendWise Response:**
- Allow backdating of expenses (date picker defaults to today but supports past dates).
- Do NOT allow future-dated expenses beyond today's date for regular expenses (to prevent confusion).
- Do NOT penalize or flag backdated entries; treat them as legitimate.
- The analytics may be slightly inaccurate for backdated entries (the "daily spending trend" is filled in retroactively), but this is acceptable.
