# Functional Requirements
## SpendWise — Student Expense Tracker

Functional requirements define what the system must **do**. Each requirement is tagged with a unique ID (FR-XXX) for traceability.

---

## 1. Authentication & Sessions

| ID | Requirement |
|:---|:---|
| FR-001 | The system MUST allow users to register and sign in using a Google account via OAuth 2.0. |
| FR-002 | The system MUST allow users to register and sign in using an email address and password. |
| FR-003 | The system MUST maintain a persistent login session so users do not need to sign in on every visit. |
| FR-004 | The system MUST provide a "Forgot Password" flow that sends a reset link to the user's registered email. |
| FR-005 | The system MUST provide a "Sign Out" action that clears the session from the current device only. |
| FR-006 | The system MUST allow users to permanently delete their account and all associated data. |
| FR-007 | The system MUST redirect unauthenticated users to the Login page for any protected route. |

---

## 2. Expense Management

| ID | Requirement |
|:---|:---|
| FR-010 | The system MUST allow a logged-in user to add an expense with: Amount (required), Category (required), Note (optional), Date (defaults to today). |
| FR-011 | The system MUST prevent adding an expense with an amount of ₹0 or less. |
| FR-012 | The system MUST prevent adding an expense with an amount greater than ₹1,000,000. |
| FR-013 | The system MUST allow a user to edit any existing (non-deleted) expense. |
| FR-014 | The system MUST perform a soft delete (set `isDeleted: true`) instead of a permanent deletion. |
| FR-015 | The system MUST provide an "Undo" action for 5 seconds after a delete operation. |
| FR-016 | The system MUST update the monthly budget aggregate atomically when an expense is added, edited, or deleted. |
| FR-017 | The system MUST show expenses sorted by date descending (newest first) by default. |

---

## 3. Budget Management

| ID | Requirement |
|:---|:---|
| FR-020 | The system MUST require a user to set a monthly budget during first-time onboarding. |
| FR-021 | The system MUST allow a user to change their monthly budget at any time during the month. |
| FR-022 | The system MUST automatically create a new, empty budget document on the 1st of each new month. |
| FR-023 | The system MUST display the remaining budget (Total Budget − Total Spent) on the dashboard in real-time. |
| FR-024 | The system MUST change the budget progress bar color at 80% (amber) and 100%+ (red) utilization. |

---

## 4. Analytics & Reports

| ID | Requirement |
|:---|:---|
| FR-030 | The system MUST display a donut chart showing spending broken down by category for the selected month. |
| FR-031 | The system MUST allow the user to navigate between months in the Analytics view. |
| FR-032 | The system MUST display at least 3 automatically generated text-based insight cards per month. |
| FR-033 | The system MUST allow a user to download a PDF summary report for any month they have data for. |
| FR-034 | The system MUST allow a user to download a CSV export of expenses for any selected month. |

---

## 5. Categories

| ID | Requirement |
|:---|:---|
| FR-040 | The system MUST provide 17 preset expense categories, each with an emoji and a unique color. |
| FR-041 | The system MUST allow users to create up to 3 custom categories in v1.0. |
| FR-042 | The system MUST sort the category picker by most-frequently-used categories first. |

---

## 6. Real-time Sync & Offline

| ID | Requirement |
|:---|:---|
| FR-050 | The system MUST synchronize data changes across all logged-in devices of the same user within 2 seconds under normal network conditions. |
| FR-051 | The system MUST queue expense writes when the device is offline and commit them automatically when connectivity is restored. |
| FR-052 | The system MUST display an offline indicator when no internet connection is detected. |
