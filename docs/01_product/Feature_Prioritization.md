# Feature Prioritization
## SpendWise — Student Expense Tracker

Features are prioritized using the **RICE framework**: Reach × Impact × Confidence ÷ Effort.

---

## 1. RICE Scoring Rubric

| Dimension | 1 | 2 | 3 |
|:---|:---|:---|:---|
| **Reach** (users impacted/month) | < 50 | 50–200 | 200+ |
| **Impact** (effect on North Star metric) | Low | Medium | High |
| **Confidence** (certainty of estimates) | 30% | 70% | 100% |
| **Effort** (dev weeks) | 3+ | 1–3 | < 1 |

`RICE Score = (Reach × Impact × Confidence) / Effort`

---

## 2. MVP Feature Prioritization

| # | Feature | Reach | Impact | Confidence | Effort | RICE |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| 1 | Add Expense (core entry flow) | 3 | 3 | 100% | 1 | **9.0** |
| 2 | Google Sign-In | 3 | 3 | 100% | 1 | **9.0** |
| 3 | Dashboard: Budget Status | 3 | 3 | 100% | 1 | **9.0** |
| 4 | Category Selection Grid | 3 | 3 | 100% | 1 | **9.0** |
| 5 | Real-time Sync | 3 | 3 | 100% | 2 | **4.5** |
| 6 | Expense List View | 3 | 2 | 100% | 1 | **6.0** |
| 7 | Edit/Delete Expense | 3 | 2 | 100% | 1 | **6.0** |
| 8 | Monthly Budget Setup | 3 | 3 | 100% | 1 | **9.0** |
| 9 | Analytics: Donut Chart | 3 | 2 | 100% | 2 | **3.0** |
| 10 | PDF Report Download | 2 | 3 | 70% | 2 | **2.1** |
| 11 | CSV Export | 2 | 2 | 100% | 1 | **4.0** |
| 12 | PWA Install Support | 2 | 2 | 70% | 1 | **2.8** |
| 13 | Offline Queuing | 2 | 2 | 70% | 2 | **1.4** |

---

## 3. Post-MVP Prioritization (v1.1+)

| # | Feature | Priority | Reason |
|:---|:---|:---:|:---|
| 1 | Push Notifications (budget warnings) | **P1** | Highest impact on preventing overspend = core value |
| 2 | Dark Mode | **P1** | High demand from students; strong retention signal |
| 3 | Daily Spending Chart | **P1** | Completes analytics; directly improves engagement |
| 4 | Streaks + Badges | **P2** | Gamification directly improves Day-30 retention |
| 5 | Category Budget Limits | **P2** | Power users want granular control |
| 6 | Recurring Expense Automation | **P2** | Reduces manual effort; improves accuracy |
| 7 | Savings Goals | **P3** | Requires new data model; deferred for simplicity |
| 8 | CSV Import | **P3** | Useful for migration; low demand from new users |
| 9 | Income Tracking | **P3** | Changes product model; requires new UX flow |
| 10 | AI Insights | **P4** | Infrastructure-heavy; needs data volume first |

---

## 4. Deprioritized / Won't Do (Explained)

| Feature | Decision | Reason |
|:---|:---|:---|
| Bank Account Linking | Won't Do (v1.x) | Regulatory (RBI), Trust, Complexity |
| Multi-Currency Support | Won't Do (v1.x) | India-first; very low demand |
| Native iOS App | Won't Do (v1.x) | PWA is sufficient; cost too high |
| Social/Friends Features | Won't Do | Different product; Splitwise already exists |
