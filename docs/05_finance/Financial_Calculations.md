# Financial Mathematical Calculations
## SpendWise — Student Expense Tracker

---

## 1. The Budget Engine Math

The core of SpendWise is calculating how much money a student has left for the month, and deriving insights from that number.

### 1.1 Base Budget Calculation
**Formula:**
`Remaining Amount = Total Monthly Allowance - Sum(Valid Expenses)`

**Logic:**
```typescript
const calculateRemaining = (allowance: number, expenses: Expense[]) => {
  // Filter out deleted expenses and expenses not in current month
  const validExpenses = expenses.filter(e => !e.isDeleted);
  
  // Sum amounts
  const totalSpent = validExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  return allowance - totalSpent;
};
```

### 1.2 "Safe to Spend Today" Calculation (Pace Indicator)
To prevent students from blowing their budget in the first 2 weeks, we calculate a daily pacing limit.

**Formula:**
`Safe Daily Limit = Remaining Amount / Remaining Days in Month`

**Logic:**
```typescript
import { getDaysInMonth, getDate } from 'date-fns';

const calculateSafeDailySpend = (remainingAmount: number, currentDate: Date = new Date()) => {
  if (remainingAmount <= 0) return 0;
  
  const totalDays = getDaysInMonth(currentDate);
  const currentDay = getDate(currentDate);
  const remainingDays = (totalDays - currentDay) + 1; // +1 includes today
  
  return remainingAmount / remainingDays;
};
```
*UI Example:* "You can safely spend ₹350 today to stay on track."

---

## 2. Percentage Formatting & Alerts

We calculate the exact percentage of the budget consumed to trigger UI color changes.

### 2.1 Consumption Percentage
**Formula:**
`Percentage Used = (Total Spent / Monthly Allowance) * 100`

### 2.2 Alert Thresholds (State Machine)
- `percentageUsed < 80%` -> **State: SAFE** (Green/Purple UI)
- `percentageUsed >= 80% && percentageUsed < 100%` -> **State: WARNING** (Amber UI). Triggers in-app warning banner.
- `percentageUsed >= 100%` -> **State: CRITICAL** (Red UI).

---

## 3. Currency Floating Point Mitigation

JavaScript represents all numbers as double-precision 64-bit floats (IEEE 754). This leads to rounding errors (e.g., `0.1 + 0.2 = 0.30000000000000004`).

### 3.1 Mitigation Strategy (v1.0)
For MVP, since we track Indian Rupees (₹) mostly as whole integers or maximum 2 decimal places, we round the final results rather than converting everything to pennies/paise internally (which is standard for banking apps but overkill here).

**Rounding Function:**
```typescript
const roundCurrency = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};
```
Every UI display of a calculated value must pass through `roundCurrency`.

---

## 4. Category Aggregation

For the Analytics Donut Chart, expenses must be grouped and summed by category.

**Algorithm:**
```typescript
const aggregateByCategory = (expenses: Expense[]) => {
  const map = new Map<string, number>();
  
  expenses.filter(e => !e.isDeleted).forEach(e => {
    const current = map.get(e.categoryId) || 0;
    map.set(e.categoryId, current + e.amount);
  });
  
  // Convert to array for Recharts
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
};
```
