# Success Metrics & KPI Tracking Specification
## SpendWise — Student Expense Tracker

---

## 1. Measurement Philosophy
SpendWise relies on data-driven decision making. We implement the **AARRR Pirate Metrics** framework (Acquisition, Activation, Retention, Referral, Revenue) to track user lifecycles. 

All telemetry is collected anonymously via Firebase Analytics. No financial amounts or personal notes are EVER logged to analytics.

---

## 2. The North Star Metric (NSM)
**Weekly Logged Expenses per Active User (WLE)**
*Definition:* The average number of expenses successfully saved by users who opened the app at least once in a 7-day period.

*Why this matters:* A tracker is only useful if it becomes a habit. Opening the app (DAU/MAU) is a vanity metric; actively logging expenses proves the app's core value proposition is working.
*Target:* **> 5 WLE** (Approximates to tracking nearly every weekday).

---

## 3. AARRR Metrics Breakdown

### 3.1 Acquisition (How do users find us?)
| Metric | Definition | Tool/Source | Target |
|:---|:---|:---|:---|
| **Organic Traffic** | Visitors to landing page from Google search. | Google Search Console | > 1,000/mo |
| **Store Conversion Rate** | App Store / Play Store page views to install. | App Store Connect | > 25% |
| **Sign-up Conversion** | Users who land on `/login` and successfully complete OAuth. | Firebase Analytics | > 75% |

### 3.2 Activation (Do users experience the "Aha!" moment?)
*Aha! Moment definition:* A user who successfully sets their monthly budget AND logs their first expense within 10 minutes of account creation.

| Metric | Definition | Event Name | Target |
|:---|:---|:---|:---|
| **Budget Setup Rate** | % of new users who complete `/onboarding`. | `tutorial_complete` | > 90% |
| **First-Log Rate** | % of onboarded users who log >= 1 expense in Session 1. | `first_expense_logged` | > 80% |
| **Time-to-Value (TTV)** | Average seconds from OAuth success to first expense logged. | Custom metric | < 120s |

### 3.3 Retention (Do users come back?)
| Metric | Definition | Event Name | Target |
|:---|:---|:---|:---|
| **D1 Retention** | Users returning 24 hours after install. | `session_start` | > 40% |
| **D7 Retention** | Users returning 7 days after install. | `session_start` | > 25% |
| **D30 Retention** | Users returning 30 days after install. | `session_start` | > 15% |
| **Churn Rate** | Users inactive for > 14 consecutive days. | N/A (Derived) | < 10%/week |

### 3.4 Referral (Do users tell others?)
| Metric | Definition | Event Name | Target |
|:---|:---|:---|:---|
| **PDF Shares** | Number of times the "Export/Share PDF" button is clicked. | `share_pdf_clicked` | > 0.5 per MAU |
| **K-Factor** | Viral growth rate (Requires custom referral links). | Custom | > 0.1 |

### 3.5 Revenue (Post-MVP Phase 2)
| Metric | Definition | Target |
|:---|:---|:---|
| **Free-to-Paid CVR** | % of active users upgrading to Pro. | > 2% |
| **ARPU** | Average Revenue Per User. | ₹0.98 |

---

## 4. Firebase Analytics Event Taxonomy

To ensure clean data, all tracked events must conform strictly to this taxonomy.

### 4.1 System Events (Auto-collected)
- `session_start`
- `screen_view` (Handled via Next.js router integration)
- `user_engagement`

### 4.2 Custom Application Events

| Event Name | Parameters | When to Trigger |
|:---|:---|:---|
| `login_success` | `method: 'google' | 'email'` | Upon successful Firebase Auth login. |
| `budget_set` | `amount_tier: '0-5k' | '5k-10k' | '10k+'` | Upon completing the onboarding screen. |
| `expense_logged` | `category: string`, `has_note: boolean` | When `addExpense` resolves successfully. *(CRITICAL: NEVER log the monetary amount).* |
| `expense_deleted` | `was_undone: boolean` | When an expense is deleted (or undo is clicked). |
| `theme_toggled` | `mode: 'light' | 'dark'` | When the user manually overrides the system theme. |
| `pdf_exported` | `none` | When the jsPDF generation completes successfully. |
| `error_boundary_hit` | `error_name: string` | When the React Error Boundary catches an unhandled exception. |

---

## 5. Engineering Performance Metrics
Business metrics mean nothing if the app is slow.

| Metric | Target | Monitoring Tool |
|:---|:---|:---|
| **LCP (Largest Contentful Paint)** | < 2.5s | Vercel Analytics / Lighthouse |
| **FID (First Input Delay)** | < 100ms | Vercel Analytics / Lighthouse |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Vercel Analytics / Lighthouse |
| **Firestore Write Latency** | < 500ms | Firebase Performance Monitoring |

---
*End of Document. Data schema frozen for v1.0.*
