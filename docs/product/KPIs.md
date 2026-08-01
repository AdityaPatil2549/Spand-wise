# KPIs — Success Metrics
## SpendWise — Student Expense Tracker

---

## 1. North Star Metric

**Primary:** Monthly Active Users (MAU) who log at least 2 expenses per week

This metric captures:
- Real user retention (not just sign-ups)
- Active value creation (tracking behavior)
- Product-market fit (users returning regularly)

---

## 2. Acquisition Metrics

| KPI | Description | 30-Day Target | 90-Day Target | 180-Day Target |
|---|---|---|---|---|
| New Registrations | Users who complete signup | 200 | 2,000 | 10,000 |
| Organic Signups | From word-of-mouth / SEO | 100 | 1,000 | 6,000 |
| Time to First Expense | After account creation | < 5 min (median) | < 3 min | < 2 min |
| Onboarding Completion Rate | % who set budget after signup | > 80% | > 85% | > 90% |

---

## 3. Engagement Metrics

| KPI | Description | 30-Day Target | 90-Day Target |
|---|---|---|---|
| Daily Active Users (DAU) | Users opening app each day | 100 | 1,500 |
| DAU/MAU Ratio | Stickiness | > 25% | > 30% |
| Avg. Expenses/User/Day | How often users log | > 2.0 | > 2.5 |
| Sessions Per User/Week | App opens | > 5 | > 6 |
| Avg. Session Duration | Time in app | > 90 seconds | > 2 min |
| Feature Adoption: Analytics | % MAU using Analytics tab | > 40% | > 55% |
| Feature Adoption: Reports | % MAU downloading report | > 20% (monthly) | > 30% |
| Feature Adoption: Charts | % clicking category in donut | > 30% | > 40% |

---

## 4. Retention Metrics

| KPI | Description | Target |
|---|---|---|
| Day-1 Retention | % returning day after signup | > 60% |
| Day-7 Retention | % active 7 days after signup | > 45% |
| Day-30 Retention | % active 30 days after signup | > 35% |
| Day-90 Retention | % active 90 days after signup | > 25% |
| Monthly Churn Rate | % MAU not returning next month | < 25% |
| Resurrection Rate | Churned users who return | > 10% |

---

## 5. Product Quality Metrics

| KPI | Description | Target |
|---|---|---|
| App Load Time (P95) | Time to interactive on 4G | < 2 seconds |
| Expense Entry Time (P95) | FAB tap to expense in list | < 5 seconds |
| Sync Latency (P95) | Device A to Device B | < 500ms |
| PDF Generation (P95) | Request to download ready | < 3 seconds |
| Crash Rate | Sessions with unhandled error | < 0.5% |
| Firebase Error Rate | Failed Firestore operations | < 0.1% |
| Lighthouse Score (Perf) | Google Lighthouse performance | > 90 |
| Lighthouse Score (A11y) | Accessibility score | > 95 |
| Uptime | Service availability | > 99.9% |

---

## 6. User Satisfaction Metrics

| KPI | Description | Target |
|---|---|---|
| App Store Rating | iOS + Android average | > 4.5 ⭐ |
| NPS Score | Net Promoter Score | > 50 |
| Support Tickets / 1000 MAU | Volume of user issues | < 5 |
| Response Time (Support) | Time to first response | < 24 hours |
| 5-Star Reviews / Total | Proportion of top ratings | > 70% |

---

## 7. Business Metrics (v1.1+)

| KPI | Description | 6-Month Target |
|---|---|---|
| Pro Conversion Rate | Free → Pro (₹49/month) | > 3% |
| Monthly Recurring Revenue (MRR) | Pro subscribers × ₹49 | ₹7,350 |
| Customer Acquisition Cost (CAC) | Cost to acquire 1 MAU | < ₹20 |
| Lifetime Value (LTV) | Average revenue per user | > ₹200 |
| LTV/CAC Ratio | Efficiency | > 3× |
| Infrastructure Cost / MAU | Firebase + hosting | < ₹5/MAU |

---

## 8. Leading Indicators (Early Warning Signals)

These signal whether we're on track before 30-day numbers arrive:

| Signal | Good Sign | Bad Sign |
|---|---|---|
| Day-1 expense logged | > 70% of new users | < 50% |
| 3+ expenses in first week | > 50% | < 30% |
| Analytics tab opened (first week) | > 40% | < 20% |
| FAB tapped (within first session) | > 80% | < 60% |
| Onboarding time | < 90 seconds median | > 3 minutes |

---

## 9. Anti-Metrics (What We Must NOT Optimize For)

These metrics look good but create bad incentives:

| Anti-Metric | Why We Avoid It |
|---|---|
| Total Downloads | Downloads without engagement are meaningless |
| Sessions per day (inflated by errors) | Refresh loops inflate sessions |
| Time in app (if from confusion) | Confusion = long session = bad product |
| Notification open rate (from nagging) | Over-notifying destroys trust |

---

## 10. Measurement Tools

| Tool | What It Measures |
|---|---|
| Firebase Analytics | User events, retention cohorts, funnels |
| Firebase Crashlytics | Crash rates, error tracking |
| Firebase Performance Monitoring | Load times, network latency |
| Lighthouse (in CI) | Performance + accessibility scores |
| UptimeRobot | Service availability |
| Manual NPS Survey | User satisfaction (monthly, email-based) |
| App Store Reviews | Qualitative satisfaction |

---

## 11. KPI Review Cadence

| Review Type | Frequency | Participants |
|---|---|---|
| Daily KPI Check | Daily | Founding team |
| Weekly Product Review | Weekly | Product + Dev |
| Monthly KPI Report | Monthly | All stakeholders |
| Quarterly OKR Review | Quarterly | Leadership |

---

*KPIs defined July 2026. Targets reviewed and updated quarterly based on actual performance.*
