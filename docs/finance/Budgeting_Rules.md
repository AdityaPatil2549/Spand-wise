# Budgeting Rules
## SpendWise — Student Expense Tracker

This document outlines the standard budgeting templates, constraints, and logic used within the SpendWise app.

---

## 1. Budget Architecture

SpendWise uses a **Zero-Based Budgeting** approach modified for students, focusing on a primary "Monthly Allowance".

### The Core Equation
`Total Allowance = Sum of all expected expenses + Savings`

---

## 2. Sample Student Budget Profiles

These profiles can be used for onboarding templates or AI-driven suggestions.

### Profile A: The Hostel Student (₹10,000/month)
*   **Food / Mess:** ₹3,500 (35%)
*   **Transport:** ₹1,000 (10%)
*   **Snacks / Chai:** ₹1,000 (10%)
*   **Stationery / Books:** ₹1,000 (10%)
*   **Recharge / Subscriptions:** ₹500 (5%)
*   **Entertainment / Shopping:** ₹1,500 (15%)
*   **Emergency:** ₹500 (5%)
*   **Savings:** ₹1,000 (10%)

### Profile B: The Day Scholar (₹6,000/month)
*   **Food (Canteen):** ₹2,000 (33%)
*   **Transport (Daily commute):** ₹2,000 (33%)
*   **Recharge / Subscriptions:** ₹500 (8%)
*   **Entertainment / Shopping:** ₹1,000 (17%)
*   **Savings:** ₹500 (8%)

---

## 3. Application Rules for Budgets

### 3.1 Global Monthly Budget
*   Every user MUST set a global monthly budget.
*   Default timeframe: 1st of the month to the last day of the month.
*   Budget resets automatically at 00:00 on the 1st of every month.
*   Rollover (v2.0): Option to roll over remaining budget to the next month.

### 3.2 Category-Level Budgets (Feature: Envelope Budgeting)
Users can optionally set limits on specific categories.
*   *Example:* Max ₹1,500 on Swiggy/Zomato (Food category).
*   If a category budget is exceeded, a specific micro-alert is triggered, independent of the global budget alert.

### 3.3 The 50/30/20 Rule (Educational Suggestion)
The app occasionally prompts users with the standard 50/30/20 rule to educate them:
*   **50% Needs:** Rent, Groceries, Transport, Bills
*   **30% Wants:** Entertainment, Shopping, Eating Out
*   **20% Savings:** Emergency fund, long-term goals

---

## 4. Warning Thresholds

The app monitors the burn rate of the budget and triggers warnings.

| Threshold | Visual Indicator | Notification Type | Actionable Advice (AI/Rule based) |
| :--- | :--- | :--- | :--- |
| **< 50%** | Green / Purple (Safe) | None | "You're on track." |
| **80%** | Amber / Orange | In-App Banner + Push | "You've spent 80%. Slow down on [Top Category]." |
| **95%** | Red | Urgent Push | "Almost out of budget! Only ₹[X] left." |
| **100%+** | Dark Red / Flashing | In-App Alert | "Budget exceeded. Need to dip into savings or ask for an advance." |

### 4.1 Pace Warnings (Smart Alerts)
If a user spends 50% of their budget by the 5th of the month, the standard 80% threshold is too late.
*   **Rule:** If `(Days Passed / Total Days in Month) < (Percentage Spent - 20%)`, trigger a "Fast Burn" warning.
*   *Example:* Day 5/30 (16% of month). Spent 40% of budget. 16 < (40-20). Trigger warning.
