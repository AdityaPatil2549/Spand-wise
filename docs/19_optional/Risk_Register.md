# Risk Register
## SpendWise — Student Expense Tracker

---

## 1. Risk Assessment Matrix

**Probability:** 1 (Low) — 5 (High)
**Impact:** 1 (Low) — 5 (High)
**Risk Score:** Probability × Impact

| Score | Severity |
|:---|:---|
| 1–4 | 🟢 Low — Monitor only |
| 5–9 | 🟡 Medium — Mitigation plan required |
| 10–16 | 🔴 High — Active mitigation required |
| 17–25 | 🚨 Critical — Must resolve before launch |

---

## 2. Technical Risks

| ID | Risk | Prob | Impact | Score | Status | Mitigation |
|:---|:---|:---:|:---:|:---:|:---|:---|
| TR-01 | Firebase Spark free tier limits exceeded as users grow | 3 | 4 | 12 🔴 | Monitoring | Set up billing alerts; optimize reads; have Firebase Blaze upgrade plan ready |
| TR-02 | Google Auth outage makes login impossible | 1 | 5 | 5 🟡 | Monitor | Ensure email/password auth as fallback; add status page link |
| TR-03 | Next.js major version breaking change | 2 | 3 | 6 🟡 | Active | Pin to specific minor version; test upgrades on a branch |
| TR-04 | Offline data sync conflict (two devices write simultaneously) | 2 | 4 | 8 🟡 | Design | Firestore's last-write-wins model; document as known limitation |
| TR-05 | PDF generation crashes on large expense lists | 3 | 3 | 9 🟡 | Design | Limit PDF to one month; pagination in PDF if needed |

---

## 3. Product Risks

| ID | Risk | Prob | Impact | Score | Status | Mitigation |
|:---|:---|:---:|:---:|:---:|:---|:---|
| PR-01 | Users find the app "too simple" and churn | 3 | 4 | 12 🔴 | Monitor | Post-MVP user interviews; v1.1 engagement features (streaks, badges) |
| PR-02 | Manual logging is abandoned after Day 3 | 4 | 5 | 20 🚨 | Active | Make logging < 5 seconds; push reminders in v1.1; streak feature |
| PR-03 | Students won't trust a new financial app | 3 | 4 | 12 🔴 | Active | Open-source code; clear privacy policy; no ads ever; Google Auth |
| PR-04 | Core value (real-time sync) is not perceived as valuable | 2 | 3 | 6 🟡 | Monitor | Ensure sync is visually demonstrated in onboarding |

---

## 4. Business Risks

| ID | Risk | Prob | Impact | Score | Status | Mitigation |
|:---|:---|:---:|:---:|:---:|:---|:---|
| BR-01 | A major competitor (e.g., Paytm, Jar) launches a similar simple student tracker | 3 | 3 | 9 🟡 | Monitor | Build brand loyalty early; focus on design and UX superiority |
| BR-02 | Solo developer burnout / lack of time | 3 | 4 | 12 🔴 | Active | Keep scope tight (MVP only); defer features aggressively |
| BR-03 | App goes viral → Firebase Spark limit hit in one day | 2 | 3 | 6 🟡 | Planned | Have Blaze upgrade decision ready; billing alert at $1 |

---

## 5. Risk Review Cadence

- **Monthly:** Review all Medium and High risks, update status
- **On each release:** Review Technical Risks TR-01 through TR-05
- **Quarterly:** Full risk register review; add new risks, close resolved ones
