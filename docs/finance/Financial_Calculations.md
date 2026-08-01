# Financial Calculations
## SpendWise — Student Expense Tracker

This document defines the exact mathematical formulas and logic used across the SpendWise app to ensure consistency between the dashboard, analytics, and reports.

---

## 1. Core Budget Formulas

### 1.1 Remaining Budget
The most critical number in the app.
```javascript
// Formula
RemainingBudget = TotalBudgetAmount - TotalExpensesForMonth

// Example
RemainingBudget = 10000 - 6500 = 3500
```
*Note: If expenses exceed budget, this number becomes negative.*

### 1.2 Budget Utilization (Percent Used)
Used for the progress bar and warning thresholds.
```javascript
// Formula
PercentUsed = (TotalExpensesForMonth / TotalBudgetAmount) * 100

// Example
PercentUsed = (6500 / 10000) * 100 = 65.0%

// Edge Case: Budget is 0 (Prevented by UI, but handle in code)
if (TotalBudgetAmount === 0) return 0;
```

---

## 2. Daily & Pace Formulas

### 2.1 Average Daily Spending (Actual)
How much the user has spent per day *so far* this month.
```javascript
// Formula
CurrentDayOfMonth = new Date().getDate(); // e.g., 15th
AvgDailySpend = TotalExpensesForMonth / CurrentDayOfMonth

// Example (on the 15th with 6500 spent)
AvgDailySpend = 6500 / 15 = 433.33
```

### 2.2 Safe Daily Spend (Remaining)
How much the user can spend per day for the rest of the month without going broke.
```javascript
// Formula
DaysInMonth = getDaysInMonth(currentMonth, currentYear);
DaysRemaining = DaysInMonth - CurrentDayOfMonth + 1; // Include today
SafeDailySpend = RemainingBudget / DaysRemaining

// Example (on 15th of 30-day month, 3500 remaining)
SafeDailySpend = 3500 / 16 = 218.75
```
*Insight generated if Actual > Safe:* "You need to slow down your daily spending."

### 2.3 Projected Monthly Spend
Forecasts end-of-month total based on current behavior.
```javascript
// Formula
ProjectedTotal = AvgDailySpend * DaysInMonth

// Example (on 15th, spending 433/day in 30-day month)
ProjectedTotal = 433.33 * 30 = 13000
```
*Insight generated:* "At this rate, you will overspend your budget by ₹3,000."

---

## 3. Analytics & Category Formulas

### 3.1 Category Percentage
Used for the Donut Chart and Category List.
```javascript
// Formula
CategoryPercent = (TotalSpendInCategory / TotalExpensesForMonth) * 100

// Example (2500 spent on Food out of 6500 total)
CategoryPercent = (2500 / 6500) * 100 = 38.46%
```

### 3.2 Month-Over-Month Variance
Used to compare current month spending to last month.
```javascript
// Formula
Variance = TotalCurrentMonth - TotalLastMonth
VariancePercent = ((TotalCurrentMonth - TotalLastMonth) / TotalLastMonth) * 100

// Example (Spent 6500 this month, 5000 last month)
VariancePercent = ((6500 - 5000) / 5000) * 100 = +30.0%
```

---

## 4. Savings & Net Formulas (Future v2.0)

When Income tracking is introduced, these formulas apply.

### 4.1 Net Balance (Cash Flow)
```javascript
NetBalance = TotalIncome - TotalExpenses
```

### 4.2 Savings Rate
```javascript
SavingsRate = ((TotalIncome - TotalExpenses) / TotalIncome) * 100
```

---

## 5. Rounding and Precision Rules
*   **Storage:** Store amounts as exact numbers (floats/decimals allowed, e.g., `150.50`). Do not use floating-point math directly if handling complex accounting, but for a student expense app, standard JS `Number` is sufficient if rounded at display.
*   **Percentages:** Always round to 1 decimal place for UI display (e.g., `38.5%`).
*   **Currency Display:** Always round to 0 decimal places for whole numbers (₹150) and 2 decimal places if fractions exist (₹150.50).
*   **Calculations:** Perform all calculations on raw unrounded numbers, apply rounding *only* at the final UI render step to prevent compounding rounding errors.
