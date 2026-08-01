# Data Privacy
## SpendWise — Student Expense Tracker

---

## 1. Privacy Principles

SpendWise is built on the following privacy-first principles:

1. **Collect only what's needed:** No PII beyond name, email, and self-entered expenses
2. **Users own their data:** Users can export and delete all their data at any time
3. **No data selling:** SpendWise never sells or shares user data with third parties
4. **No ads:** SpendWise v1.0 has no advertising and no advertising tracking
5. **Transparency:** This document and the Privacy Policy explain exactly what data is collected

---

## 2. Data Inventory

### Personal Data Collected

| Data Type | Source | Purpose | Retention |
|:---|:---|:---|:---|
| Email address | Firebase Auth | Login, account recovery | Until account deleted |
| Display name | Google OAuth / User input | Personalization (greeting) | Until account deleted |
| Profile photo URL | Google OAuth | Avatar display | Until account deleted |
| Expense amounts | User-entered | Core app function | Until deleted or account deleted |
| Expense notes | User-entered | Personal context | Until deleted or account deleted |
| Expense categories | User-selected | Analytics | Until deleted or account deleted |
| Expense dates | User-selected | Timeline | Until deleted or account deleted |
| Monthly budget amount | User-entered | Budget tracking | Until account deleted |
| Device theme preference | Auto-detected | UX | localStorage only; not synced |

### Analytics Data (Firebase Analytics, Non-PII)

| Data Type | Purpose |
|:---|:---|
| Event names (expense_added, etc.) | Understand feature usage |
| Session count | Engagement measurement |
| Country/region (aggregated) | Understand audience |
| Device type (mobile/desktop) | Development prioritization |
| App version | Monitor update adoption |

---

## 3. Data Storage

- All expense and budget data is stored in **Firebase Firestore** (Google Cloud, `asia-south1` region)
- Authentication data is managed by **Firebase Authentication** (Google servers)
- **No data is stored on user devices** beyond Firebase SDK cache (used for offline support)
- Firebase Analytics data is stored in **Google Analytics 4** infrastructure

---

## 4. User Rights

### Right to Export
Users can download all their expense data as a CSV from the Reports tab.

### Right to Delete
Users can delete their account from `Settings > Account > Delete Account`.

**Account deletion process:**
1. User confirms deletion with a two-step modal
2. App calls Cloud Function `deleteUserData` (or client-side batch delete in v1.0)
3. All Firestore subcollections are deleted (expenses, budgets, categories)
4. Firebase Auth account is deleted
5. Remaining traces (Firebase Analytics events) are anonymous event data only

### Right to Correct
Users can edit or delete any expense at any time.

---

## 5. Third-Party Services

| Service | Purpose | Data Shared | Privacy Policy |
|:---|:---|:---|:---|
| Firebase (Google) | Auth, Database, Hosting, Analytics | Encrypted user data | [firebase.google.com/support/privacy](https://firebase.google.com/support/privacy) |
| Google Fonts | Typography | IP address, User Agent | [policies.google.com/privacy](https://policies.google.com/privacy) |
| Vercel (if used for hosting) | CDN | IP address | [vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy) |

---

## 6. Minors (< 18)

SpendWise is designed for college students who are typically 18+. The service is not directed at children under 13 (COPPA) or 16 (GDPR). If a minor's account is identified, it will be removed promptly.

---

## 7. Changes to This Policy

SpendWise will notify users of material privacy policy changes via:
1. An in-app banner on the next login
2. An email notification (if we collect email, which we do via Firebase Auth)
