# Error States
## SpendWise — Student Expense Tracker

Error states occur when something goes wrong. They must be clear, recoverable, and non-alarming.

---

## 1. Error State Design Principles

1. **Always explain what happened** in plain English.
2. **Always offer a recovery action** — a button, a suggestion, or a link.
3. **Never use technical jargon** (no error codes visible to users, no stack traces).
4. **Match the severity to the tone:** Minor errors get inline messages. Critical failures get dedicated error screens.
5. **Log errors silently** to Firebase Crashlytics so we can fix them.

---

## 2. Form Validation Errors (Inline)

These appear immediately below the field that has the error.

| Error Scenario | Error Message |
|:---|:---|
| Amount is 0 or empty | "Please enter an amount greater than ₹0" |
| Amount exceeds ₹1,000,000 | "Amount cannot exceed ₹10,00,000" |
| Amount contains invalid characters | "Please enter a valid number" |
| No category selected (form submit) | A gentle pulse animation highlights the category grid + "Please select a category" toast |
| Email invalid format (auth) | "Please enter a valid email address" |
| Password too short (signup) | "Password must be at least 8 characters" |
| Passwords don't match (signup) | "Passwords do not match" |

---

## 3. Firebase / Network Errors (Toast)

Displayed as error-style toast notifications (red background, ❌ icon).

| Error Scenario | User-Facing Message |
|:---|:---|
| `auth/user-not-found` | "No account found with this email. Did you mean to sign up?" |
| `auth/wrong-password` | "Incorrect password. Please try again." |
| `auth/too-many-requests` | "Too many failed attempts. Please try again in a few minutes." |
| `auth/network-request-failed` | "Connection problem. Please check your internet." |
| `permission-denied` (Firestore) | "You don't have permission to do that." |
| `unavailable` (Firestore offline) | "Can't reach the server. Your data will sync when you're back online." |
| Generic / Unknown | "Something went wrong. Please try again." |

---

## 4. Full-Page Error States

### 4.1 Network/Server Error Page
**Trigger:** The entire app fails to load critical data (e.g., the budget document throws an error).

| Element | Content |
|:---|:---|
| Illustration | 🔌 Disconnected plug SVG |
| Headline | "Something went wrong" |
| Subtext | "We couldn't load your data. Please check your connection and try again." |
| CTA Button | "Retry" (re-fetches data) |
| Secondary | "Go to Dashboard" (navigates home, may show stale cached data) |

### 4.2 React Error Boundary (Component Crash)
**Trigger:** An unhandled JavaScript exception inside a component tree.

| Element | Content |
|:---|:---|
| Illustration | 🐛 or 💀 Friendly broken piggy bank SVG |
| Headline | "Oops! We hit a snag." |
| Subtext | "This section crashed unexpectedly. Our team has been notified. Please refresh the page." |
| CTA Button | "Refresh Page" (`window.location.reload()`) |

### 4.3 404 Not Found
**Trigger:** User navigates to a non-existent URL.

| Element | Content |
|:---|:---|
| Illustration | 🔍 Empty piggy bank |
| Headline | "Page not found" |
| Subtext | "This page doesn't exist. You may have followed a broken link." |
| CTA Button | "Go to Dashboard" |

---

## 5. Error Logging Rules

- Log all caught errors to Firebase Crashlytics.
- Log the error type and context, but **never** log the user's expense data or amounts.
- Log the user's UID (hashed) for debugging purposes only.
