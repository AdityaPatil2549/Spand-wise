# Recurring Expenses
## SpendWise — Student Expense Tracker

Recurring expenses are predictable, automated, or highly regular costs. Tracking these is critical because they represent "fixed burn rate"—money that is essentially gone before the month even begins.

---

## 1. Common Student Recurring Expenses

| Expense Type | Typical Frequency | Estimated Cost (INR) | Category Mapping |
| :--- | :--- | :--- | :--- |
| **Netflix / Prime / Hotstar** | Monthly | ₹149 - ₹499 | Subscriptions |
| **Spotify / Apple Music** | Monthly | ₹59 - ₹119 (Student) | Subscriptions |
| **Mobile Recharge** | Monthly / 84 Days | ₹299 - ₹719 | Recharge / Phone |
| **Gym / Fitness** | Monthly / Quarterly | ₹1,000 - ₹2,500 | Health / Fitness |
| **Hostel / PG Rent** | Monthly | ₹5,000 - ₹15,000 | Hostel / Rent |
| **Mess / Tiffin Service** | Monthly | ₹2,500 - ₹4,000 | Mess / Groceries |
| **Wi-Fi / Broadband** | Monthly | ₹500 - ₹1,000 | Subscriptions / Utilities |
| **Electricity Bill** | Monthly | ₹300 - ₹1,500 | Utilities |
| **Cloud Storage (iCloud, Google)** | Monthly | ₹75 - ₹210 | Subscriptions |
| **Software (Adobe CC, GitHub Pro)**| Monthly / Yearly | ₹1,500+ | Education / Tools |

---

## 2. The "Fixed vs. Variable" Concept

Educating students on fixed vs. variable costs is a core value-add of SpendWise.

*   **Fixed Costs (Recurring):** Rent, Netflix, Gym, Wi-Fi. (Hard to change quickly).
*   **Variable Costs:** Eating out, shopping, travel. (Easy to cut back on when the budget is tight).

### Display Strategy
In the Analytics tab, group recurring expenses into a "Fixed Costs" bucket.
*   *Insight:* "₹4,500 (45%) of your ₹10,000 budget is already locked into fixed recurring expenses."

---

## 3. Implementation Logic (v1.2 Feature)

Tracking recurring expenses requires specific backend logic to automate logging.

### 3.1 Data Model Additions
When marking an expense as recurring, we store a cron-like schedule:
```typescript
interface RecurringExpenseTemplate {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  note: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextRunDate: Timestamp;
  isActive: boolean;
}
```

### 3.2 Automation Rules
*   **The Cron Job:** A daily Firebase Cloud Function runs at 00:01 IST.
*   It checks the `RecurringExpenseTemplate` collection for any templates where `nextRunDate <= TODAY`.
*   If found, it generates a new standard `ExpenseDocument`, deducting from the current month's budget.
*   It updates the template's `nextRunDate` based on the frequency (e.g., adding 1 month).

### 3.3 User Experience
*   **Creation:** When adding a normal expense, provide a toggle: `[ ] Mark as recurring`.
*   **Management:** Provide a "Subscriptions & Recurring" view in Settings to pause, edit, or delete these automated tasks.
*   **Notification:** Send a push notification when an automated expense is logged: *"₹149 logged for Netflix subscription."*

---

## 4. Smart Detection (Future AI Feature)

Instead of manual toggles, the app can auto-detect recurring expenses.
*   *Logic:* If the app sees exactly "₹149" logged under "Subscriptions" for 3 consecutive months on roughly the same date, prompt the user:
*   *Prompt:* "It looks like you pay ₹149 for a subscription every month. Do you want SpendWise to log this automatically?"
