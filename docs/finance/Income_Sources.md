# Income Sources
## SpendWise — Student Expense Tracker

While SpendWise is primarily an *expense* tracker, understanding income flow is crucial for net-balance calculations, cash flow analysis, and determining the starting budget.

---

## 1. Context for Students
Unlike salaried professionals with a single, predictable paycheck, students often have fragmented, irregular, or multi-source income.

---

## 2. Standard Income Categories

These categories cover 95% of a typical student's cash inflow.

| Source | Frequency | Description |
| :--- | :--- | :--- |
| **Parents / Guardian Allowance** | Monthly (Usually 1st-5th) | Fixed pocket money or living allowance. |
| **Scholarship / Stipend** | Semesterly / Monthly | Academic grants, PhD stipends, or government aid. |
| **Freelancing** | Irregular | Gig work, design, coding, writing (Upwork, Fiverr, local clients). |
| **Internship** | Monthly (Short-term) | Paid internships (usually 2-6 months duration). |
| **Part-time Job** | Weekly / Monthly | Library assistant, barista, tutoring, campus ambassador. |
| **Cash Gifts** | Occasional | Birthdays, festivals (Diwali, Eid, Christmas), visiting relatives. |
| **Refunds / Reimbursements** | Irregular | Splitwise settlements from friends, cancelled tickets, returned items. |
| **Selling Old Items** | Rare | Selling old textbooks, electronics, or clothes. |
| **Investments / Interest** | Monthly/Quarterly | Bank interest, small returns from mutual funds/stocks (for older students). |

---

## 3. How SpendWise Handles Income

### 3.1 MVP (v1.0) Approach: "The Fixed Allowance"
In v1.0, we abstract "Income" into a simple "Monthly Budget" setting.
*   The user is asked: "What is your monthly allowance/budget?"
*   This single figure acts as the ceiling for their expenses.
*   We do not explicitly track individual income transactions in v1.0 to keep the UX extremely simple.

### 3.2 Future Approach (v2.0): "Net Balance Tracking"
In v2.0, we will introduce a dedicated `+ Add Income` button.
*   Users can log multiple income streams (e.g., ₹5,000 from parents on the 1st, ₹2,000 from freelancing on the 15th).
*   **Formula:** `Current Available Balance = (Rollover from last month) + (Sum of Income this month) - (Sum of Expenses this month)`

---

## 4. UI/UX Rules for Income (When Implemented)
*   **Color coding:** Income is always Green (`#10B981`), Expenses are Red/Black.
*   **Signage:** Always prefix with a `+` sign (e.g., `+ ₹2,000`).
*   **Separation:** Do not mix income and expense categories in the same picker. They require separate flows.
*   **Reimbursement Edge Case:** If a friend pays a user back (e.g., for a split dinner), it should technically be logged as a "Refund" (Income) or a negative expense. *Design decision for v2.0: Treat as Income under "Refunds".*
