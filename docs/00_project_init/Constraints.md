# Constraints
## SpendWise — Student Expense Tracker

This document defines the hard constraints—technical, business, legal, and resource—that shape what SpendWise can and cannot do.

---

## 1. Technical Constraints

| Constraint | Impact |
|:---|:---|
| **Firebase Spark Free Tier Limits:** 1 GiB storage, 50k reads/day, 20k writes/day, 20k deletes/day. | All Firestore data models must be read-efficient. Aggregates must be pre-computed. Queries must never download unnecessary documents. |
| **No server-side compute (Spark tier):** Cloud Functions require the Blaze (pay-as-you-go) plan. | All business logic for MVP must be client-side. Background jobs (recurring expenses) are deferred to v1.2 when billing is activated. |
| **Next.js 14 requires Node.js ≥ 18.17:** | Deployment environment must meet this requirement. |
| **PWA limitations on iOS Safari:** Service Workers have storage limits (~50 MB) and push notifications are not fully supported on all iOS versions. | Offline mode is "best effort" on iOS. Push notifications may only work on iOS 16.4+ in specific contexts. |
| **Client-side PDF generation:** Large expense lists (>200 items) may cause browser slowdowns. | PDF generation must be limited to one month at a time; complex layouts must be simplified. |

---

## 2. Business Constraints

| Constraint | Impact |
|:---|:---|
| **Zero Budget (Bootstrapped):** No paid infrastructure, no paid APIs, no marketing budget. | Must stay on free tiers. All third-party integrations must offer generous free plans. |
| **Solo Developer:** One developer with limited hours per week. | Scope must be tightly controlled. The MVP must be achievable in 4–6 sprints. |
| **No Legal Entity Yet:** Cannot process real payments or store regulated financial data. | No bank linking, no payment processing, no PII beyond name and email. |

---

## 3. Legal & Compliance Constraints

| Constraint | Impact |
|:---|:---|
| **GDPR / IT Act (India):** Must provide a clear privacy policy; users must be able to delete all their data. | "Account Deletion" feature (full Firestore data wipe) is mandatory, not optional. |
| **No Financial Advice License:** Cannot tell users what stocks to buy, where to invest, or provide personalized financial advice. | All "insights" must be observational (descriptive) not prescriptive (advisory). |
| **COPPA (India: IT Rules for Minors):** Some college students may be under 18. | Must display a clear "for users 13+" notice; cannot collect data from users who indicate they are under 13. |

---

## 4. Design Constraints

| Constraint | Impact |
|:---|:---|
| **Must work on low-end Android phones** (e.g., 1.5 GHz processor, 2 GB RAM). | No heavy animations or compute-intensive operations on the main thread. Lazy loading is mandatory. |
| **Must work on 320px minimum screen width.** | All layouts must be tested at 320px (e.g., older iPhones). No fixed-width elements that overflow. |
| **Tailwind CSS with Custom Design Tokens:** All styling must use tokens from `tokens.css`. | Hardcoded hex values are forbidden in component files. |
