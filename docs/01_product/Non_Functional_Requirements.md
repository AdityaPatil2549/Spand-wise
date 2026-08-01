# Non-Functional Requirements
## SpendWise — Student Expense Tracker

Non-functional requirements (NFRs) define the quality attributes of the system—HOW it performs, not what it does.

---

## 1. Performance

| ID | Requirement | Measurement |
|:---|:---|:---|
| NFR-P01 | The Dashboard must load and display data within 2 seconds on a 4G mobile connection. | Lighthouse TTI < 2000ms |
| NFR-P02 | Adding an expense must feel instant (< 100ms UI response, optimistic update). | Chrome DevTools frame time |
| NFR-P03 | Real-time sync propagation must complete in < 1 second on Wi-Fi. | Manual test: stopwatch on two devices |
| NFR-P04 | PDF generation must complete within 5 seconds for months with up to 200 expenses. | Performance test |
| NFR-P05 | The app must achieve a Lighthouse Performance score > 80. | CI Lighthouse audit |
| NFR-P06 | Largest Contentful Paint (LCP) must be < 2.5 seconds. | Core Web Vitals report |

---

## 2. Scalability

| ID | Requirement |
|:---|:---|
| NFR-S01 | The Firestore data model must stay within Firebase Spark free tier limits for up to 500 monthly active users (< 50,000 reads/day total). |
| NFR-S02 | Single-user data volume must be manageable: max ~365 expense documents/year × 5 years = ~1,825 documents. This must never cause a query timeout. |
| NFR-S03 | All list queries must be paginated (max 100 items per query) to prevent overloading the client. |

---

## 3. Reliability

| ID | Requirement |
|:---|:---|
| NFR-R01 | The app must have a target uptime of 99.5%, leveraging Firebase Hosting's CDN and Firestore's global infrastructure. |
| NFR-R02 | No expense data must be lost due to network interruptions. All offline writes must be successfully synced. |
| NFR-R03 | The app must implement React Error Boundaries to prevent a single component crash from taking down the entire application. |
| NFR-R04 | All async operations must have timeout handling. Firestore reads must timeout after 10 seconds with a user-visible error. |

---

## 4. Security

| ID | Requirement |
|:---|:---|
| NFR-SEC01 | All Firestore documents must be protected by security rules that enforce userId ownership. No user can read or write another user's data. |
| NFR-SEC02 | All data must be transmitted over HTTPS exclusively. |
| NFR-SEC03 | Authentication tokens must be stored securely by the Firebase SDK (not in localStorage directly). |
| NFR-SEC04 | No user PII (email, name) must be logged to any external logging service. |
| NFR-SEC05 | All user inputs must be sanitized server-side via Firestore security rules. |

---

## 5. Usability

| ID | Requirement |
|:---|:---|
| NFR-U01 | The expense entry flow must be completable in under 5 seconds (measured in usability tests with 5 participants). |
| NFR-U02 | All interactive elements must meet the 44×44px minimum touch target size. |
| NFR-U03 | The app must be fully operable via keyboard alone. |
| NFR-U04 | The app must achieve a Lighthouse Accessibility score > 90. |

---

## 6. Compatibility

| ID | Requirement |
|:---|:---|
| NFR-C01 | The app must function correctly on the latest 2 major versions of Chrome, Firefox, and Safari. |
| NFR-C02 | The app must be fully functional on screens with a minimum width of 320px. |
| NFR-C03 | All PWA features must work on Android 8+ (Chrome) and iOS 16.4+ (Safari). |

---

## 7. Maintainability

| ID | Requirement |
|:---|:---|
| NFR-M01 | Code coverage for utility functions and Zustand slices must be > 80%. |
| NFR-M02 | All functions must have explicit TypeScript types; no `any` types without justification. |
| NFR-M03 | The codebase must pass ESLint checks with zero errors. |
| NFR-M04 | The app must support feature flags to enable/disable features without a deployment. |
