# Project Goals
## SpendWise — Student Expense Tracker

---

## 1. Primary Goals (Must Achieve by v1.0)

### G1 — Frictionless Daily Tracking
**Goal:** A student can log any expense in under 5 seconds, from anywhere, on any device.
**Rationale:** The #1 reason students abandon expense trackers is that entry is too slow or complicated. Speed of logging is the single most important feature metric.
**Measure of Success:** Average expense entry time < 5 seconds (measured in usability testing).

### G2 — Real-Time Multi-Device Sync
**Goal:** Any expense logged on a mobile phone appears instantly on the student's laptop, and vice versa.
**Rationale:** Students switch between devices constantly—phone during commute, laptop while studying. Data must never feel stale or inconsistent.
**Measure of Success:** Sync latency < 1 second on a standard campus Wi-Fi connection.

### G3 — Monthly Budget Awareness
**Goal:** Every student who sets a budget gets a clear, at-a-glance understanding of how much money they have left at any moment.
**Rationale:** The dashboard's primary purpose is to answer one question: "Am I on track?" This must be visually instant—no digging through menus.
**Measure of Success:** Budget status visible without scrolling on the Dashboard for 95%+ of screen sizes.

### G4 — Actionable Monthly Analysis
**Goal:** At the end of each month, a student can review a clear breakdown of where their money went and generate a downloadable report.
**Rationale:** The analytics closes the feedback loop. Without it, tracking is pointless. Without a downloadable report, data is trapped in the app.
**Measure of Success:** PDF/CSV report generation works on all target browsers; Analytics tab load time < 2s.

---

## 2. Secondary Goals (Target v1.1 – v1.2)

### G5 — Habit Formation via Gamification
Encourage consistent logging through streaks, badges, and encouraging micro-copy so it feels rewarding.

### G6 — Financial Literacy Through Education
Embed small insights, tooltips, and the 50/30/20 rule guide to help students understand *why* they should save, not just that they should.

### G7 — Offline Reliability
The app should function on a poor campus internet connection. Expenses logged offline must sync without data loss when connectivity is restored.

---

## 3. Anti-Goals (What We Will NOT Do)

| Anti-Goal | Reason |
|:---|:---|
| Connect to bank accounts (v1.0) | Regulatory complexity, PCI scope, and trust issues for a new app. |
| Support multiple currencies (v1.0) | Adds complexity. Target market is single-country students. |
| Provide financial advice or investment features | Outside MVP scope; requires regulatory licensing. |
| Build a social "splitting" feature | Different product problem (Splitwise already does this well). |
| Build a native iOS/Android app (v1.0) | PWA covers 95% of student use cases with 10% of the effort. |

---

## 4. Goal Hierarchy

```
NORTH STAR: Help students not run out of money before the end of the month.
    │
    ├── G1: Make expense logging instant and painless.
    ├── G2: Keep all devices in sync in real-time.
    ├── G3: Make budget status impossible to miss.
    └── G4: Let students learn from their data each month.
```
