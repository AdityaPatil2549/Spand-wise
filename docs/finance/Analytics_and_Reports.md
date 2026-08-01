# Analytics and Reports Requirements
## SpendWise — Student Expense Tracker

This document details the specific views, dashboards, and exportable reports the app must support.

---

## 1. Analytics Dashboards (In-App)

The Analytics tab provides interactive, visual insights into the user's spending data.

### 1.1 Category Breakdown (The "Where" View)
*   **Visual:** Donut Chart (center shows total spent).
*   **Data Structure:** Aggregated sum of expenses grouped by `categoryId`.
*   **List View:** Below the chart, a list of all categories sorted by amount descending. Each item shows an inline horizontal progress bar relative to the highest category.
*   **Interaction:** Tapping a chart segment highlights it and filters the list.

### 1.2 Daily Spending Trend (The "When" View)
*   **Visual:** Line Chart or Bar Chart. X-axis = Days (1-31), Y-axis = Amount spent.
*   **Data Structure:** Array of 31 integers representing total spent on each day of the month.
*   **Overlay (Optional):** A dotted line showing the "Safe Daily Average" limit.
*   **Insight:** Highlights spending spikes (e.g., weekends).

### 1.3 Month-over-Month Comparison (The "Trend" View)
*   **Visual:** Grouped Bar Chart (Current Month vs Previous Month).
*   **Data Structure:** Top 3 categories compared across two consecutive months.
*   **Insight:** "You spent 20% less on Food this month compared to last month."

---

## 2. Rule-Based AI Insights

The app generates dynamic text cards based on calculation thresholds to guide the user.

| Trigger Condition | Generated Insight Text |
| :--- | :--- |
| Single category > 40% of budget | "🍔 Food is consuming almost half your budget. Keep an eye on it!" |
| Most spending occurs on weekends | "📅 You spend 70% of your money on weekends. Try planning ahead to save." |
| Current pace exceeds budget | "⚠️ At this rate, you will run out of money 5 days before the month ends." |
| No-spend day detected | "🔥 Awesome! You didn't spend anything yesterday. That's a 1-day streak!" |
| Month ends under budget | "🎉 Congratulations! You saved ₹[X] this month. Consider putting it in a savings account." |

---

## 3. Exportable Reports

Students need to export data to share with parents (for accountability/reimbursement) or for their own records.

### 3.1 Monthly PDF Summary Report
A highly polished, branded PDF generated client-side.

**Structure:**
1.  **Header:** SpendWise Logo, "Expense Report for [Month Year]", User Name.
2.  **Executive Summary:**
    *   Total Budget: ₹X
    *   Total Spent: ₹Y
    *   Remaining/Saved: ₹Z
3.  **Visuals:** Rendered image of the Category Donut Chart.
4.  **Top Categories Table:** Category name, Amount, % of total.
5.  **Transaction Log:** Chronological table of every transaction.
    *   Columns: Date, Description (Note), Category, Amount.

### 3.2 Raw Data Export (CSV)
For power users who want to use Excel/Google Sheets.

**Structure:**
*   Standard comma-separated values.
*   **Headers:** `Date, Time, Amount(INR), Category, Note, Status(Active/Deleted)`
*   **Formatting:** Dates in ISO format (YYYY-MM-DD), Amounts as raw numbers (no currency symbols).

---

## 4. Technical Implementation Notes for Analytics

*   **Avoid Heavy Client-Side Math:** Do not download 500 raw expense documents just to calculate the category breakdown on the client.
*   **Pre-Aggregation:** Use the `budget` document to store pre-aggregated data (e.g., `categoryBreakdown` map, `dailySpending` array). Cloud Functions update these aggregates whenever an expense is written.
*   **Chart Library:** Use lightweight, accessible libraries like `Recharts` or `Chart.js`.
*   **PDF Library:** Use `jspdf` combined with `html2canvas` to capture DOM elements (like charts) into the PDF.
