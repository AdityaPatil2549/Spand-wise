# Financial Goals & Savings Strategies
## SpendWise — Student Expense Tracker

While SpendWise is an expense tracker, the ultimate purpose of tracking expenses for many students is to save money for specific goals.

---

## 1. Common Student Financial Goals

Goals are usually short-to-medium term (3 months to 2 years) and highly tangible.

| Goal Type | Example Target | Typical Duration | Priority |
| :--- | :--- | :--- | :--- |
| **Tech Upgrades** | Laptop, iPad, Phone | 6 - 12 months | High |
| **Travel / Trips** | Goa trip with friends | 3 - 6 months | Medium |
| **Emergency Fund** | ₹5,000 liquid cash | 1 - 3 months | High (Advisable) |
| **Concert/Event Tickets** | Sunburn, ComicCon | 1 - 4 months | Low |
| **Online Courses** | Coursera, Udemy certs | 1 - 2 months | High (Career) |
| **Vehicle Downpayment** | Used scooty / bike | 12 - 18 months | Medium |
| **Post-Grad Prep** | GRE/GMAT fees | 6 - 12 months | High |

---

## 2. Goal Tracking Mechanics (v1.2 Feature)

A "Goal" in SpendWise requires its own data structure and UX flow.

### 2.1 The Data Model
```typescript
interface Goal {
  id: string;
  userId: string;
  name: string;             // e.g., "New Laptop"
  targetAmount: number;     // e.g., 80000
  currentSaved: number;     // e.g., 25000
  targetDate: Timestamp;    // e.g., Dec 31, 2026
  icon: string;             // emoji 💻
  createdAt: Timestamp;
}
```

### 2.2 Financial Calculations for Goals
To make goals actionable, SpendWise calculates exactly what the student needs to do:

*   **Remaining Amount:** `Target Amount - Current Saved`
*   **Months Remaining:** `Target Date - Current Date` (in months)
*   **Required Monthly Saving:** `Remaining Amount / Months Remaining`

*Example:* Laptop (₹80k). Saved (₹20k). Target: 10 months away.
Required Monthly = (80k - 20k) / 10 = ₹6,000/month.

### 2.3 Integration with Budget
If a user sets a goal requiring ₹6,000/month, the app automatically carves this out of their monthly allowance.
*   Allowance: ₹15,000
*   Goal allocation: ₹6,000
*   *Safe to spend limit:* ₹9,000

---

## 3. Savings Strategies (In-App Education)

SpendWise will surface these strategies as "Insights" or tooltips to help students reach their goals.

### 3.1 The "Pay Yourself First" Strategy
**Concept:** Instead of saving whatever is left at the end of the month (which is usually nothing), move the savings amount out of the primary account on Day 1.
**App Action:** On the 1st of the month, show a prompt: *"Transfer ₹2,000 to your savings account now to stay on track for your Goa trip."*

### 3.2 The "No-Spend Day" Challenge
**Concept:** Pick 1 or 2 days a week where you spend exactly ₹0 (beyond prepaid mess/hostel).
**App Action:** Gamify this. Award a badge for every successful No-Spend Day.

### 3.3 The "Latte Factor" / Small Leaks Analysis
**Concept:** Small, frequent expenses drain the budget faster than large, rare ones.
**App Action:** AI Insight: *"You spent ₹1,200 on Chai & Snacks this month across 30 transactions. Cutting this by half saves you ₹600."*

### 3.4 The 48-Hour Rule
**Concept:** For any non-essential purchase over ₹1,000, wait 48 hours before buying to curb impulse spending.
**App Action:** Provide a "Wishlist" feature where users can park items they want to buy and track the 48-hour cooldown timer.
