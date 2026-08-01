# Assumptions
## SpendWise — Student Expense Tracker

This document lists all assumptions made when designing and building SpendWise. Documenting assumptions prevents misalignment and helps identify risks early.

---

## 1. User Assumptions

| # | Assumption | Risk if Wrong |
|:---|:---|:---|
| A1 | Users are college students aged 18–25 in India. | Design and copy may not resonate with older/international users. |
| A2 | Users receive a monthly fixed allowance from family or scholarship. | The core budgeting model breaks down for users with highly irregular income. |
| A3 | Users have a smartphone (Android or iOS) with Chrome or Safari. | PWA features may not work correctly on older or non-standard browsers. |
| A4 | Users have basic digital literacy (can use social login, type amounts). | Onboarding may need to be simpler or provide more guidance. |
| A5 | Users primarily operate in India (INR currency). | Multi-currency requirements would require significant rework. |
| A6 | Users are willing to log expenses manually (no bank auto-import). | If users want automation, manual logging creates friction and churn. |

---

## 2. Technical Assumptions

| # | Assumption | Risk if Wrong |
|:---|:---|:---|
| T1 | Firebase Spark (free tier) can support up to 500 active users with < 50,000 Firestore reads/day total. | Cost spikes if user activity exceeds free tier limits; billing must be set up before growth. |
| T2 | Next.js 14 with App Router is stable for production use. | Breaking changes in Next.js could require patches; we pin to a specific minor version. |
| T3 | Firestore's offline persistence handles poor campus Wi-Fi gracefully. | Data loss or sync conflicts may occur on very unreliable networks. |
| T4 | Google Identity Platform is reliable and accessible in India. | If Google Auth is blocked or slow, users cannot log in. |
| T5 | Client-side PDF generation with jsPDF is sufficient quality for sharing with parents. | For more complex reports, server-side PDF generation may be needed. |

---

## 3. Business Assumptions

| # | Assumption | Risk if Wrong |
|:---|:---|:---|
| B1 | Word-of-mouth referrals from college students will be the primary growth channel. | Paid acquisition may be needed if organic growth is slow. |
| B2 | Students will tolerate a PWA and do not require a native app to engage daily. | Native app may need to be prioritized sooner than planned. |
| B3 | Firebase Spark tier is free and will remain free for the foreseeable future. | Google could change pricing; costs could materialize unexpectedly. |
| B4 | Privacy is important to students; they won't trust a financial app they didn't hear about from a friend. | Trust-building will require testimonials, a clear privacy policy, and open-source code. |

---

## 4. Product Assumptions

| # | Assumption | Risk if Wrong |
|:---|:---|:---|
| P1 | A dark mode is important to this demographic (students use phones late at night). | If users don't care, time spent on dark mode is wasted. |
| P2 | The 17 preset categories cover 90%+ of a student's expenses. | Users need more categories than expected; MVP limit of 3 custom is too low. |
| P3 | Month is the natural planning and reporting period for students (mirrors allowance cycle). | Some students get weekly allowances; weekly budgets may be needed in v1.1. |
