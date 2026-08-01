# Screen Map
## SpendWise — Student Expense Tracker

A complete inventory of every screen in the app, with its purpose and key components.

---

## 1. Unauthenticated Screens

### SCR-001: Landing Page (`/`)
**Purpose:** Convert visitors to registered users.
**Key Components:** App logo, tagline, hero screenshot, Google Sign-In button, Email/Password form, privacy policy link.

### SCR-002: Login Screen (`/login`)
**Purpose:** Authenticate returning users.
**Key Components:** SpendWise logo, "Continue with Google" button, "Sign in with Email" toggle, email/password inputs, "Forgot Password" link, "New user? Sign up" link.

### SCR-003: Sign Up Screen (`/signup`)
**Purpose:** Register new users with email/password.
**Key Components:** Name, email, password, confirm password, terms agreement, submit button.

### SCR-004: Forgot Password (`/forgot-password`)
**Purpose:** Allow password reset.
**Key Components:** Email input, "Send Reset Link" button, confirmation message.

---

## 2. Onboarding Screens

### SCR-010: Budget Setup (`/onboarding`)
**Purpose:** Capture the user's monthly allowance to initialize the budget.
**Key Components:** Friendly headline, monthly amount input (auto-focused), quick-pick chips (₹5k, ₹8k, ₹10k, ₹15k), "Let's Go!" CTA.

---

## 3. App Screens (Authenticated)

### SCR-020: Dashboard (`/app/dashboard`)
**Purpose:** The "home base" — shows budget health and recent activity.
**Key Components:**
- Greeting header with user's name
- Budget Hero Card (Total Budget, Spent, Remaining, Progress Bar)
- Budget warning banner (if applicable)
- "Recent Expenses" list (last 5 items)
- Rule-based insight card
- FAB (Add Expense)

### SCR-021: Expense List (`/app/expenses`)
**Purpose:** Full chronological list with search and filter.
**Key Components:**
- Month selector header
- Search bar
- Category filter chips (horizontal scroll)
- Expense items (swipe-to-delete)
- Load More / Infinite scroll trigger
- FAB (Add Expense)
- Empty state (if no expenses for month)

### SCR-022: Analytics (`/app/analytics`)
**Purpose:** Visual spending breakdown and insights.
**Key Components:**
- Month selector header
- Donut chart (spending by category)
- Category breakdown list (with percent bars)
- AI insight cards (3–5 cards)
- Daily spending bar chart (v1.1)

### SCR-023: Reports (`/app/reports`)
**Purpose:** Generate and download reports.
**Key Components:**
- Month selector
- Report preview card (total, top category, expenses count)
- "Download PDF" button
- "Export CSV" button
- History of downloaded reports (local)

### SCR-024: Settings Home (`/app/settings`)
**Purpose:** App configuration hub.
**Key Components:**
- User profile card (name, email, avatar)
- Settings sections: Account, Budget, Categories, Appearance, Notifications, About, Logout

---

## 4. Overlay Screens (Modals / Bottom Sheets)

### SCR-030: Add Expense Sheet
**Components:** Amount input (auto-focused, large), category grid (4 columns), note input, date picker, Add Expense button

### SCR-031: Edit Expense Sheet
**Components:** Same as Add, pre-filled, with "Save Changes" and "Delete Expense" buttons

### SCR-032: Category Picker Expanded
**Components:** Search input, full grid of all categories, Add Custom Category button

### SCR-033: Month Picker Modal
**Components:** Year selector, month grid (12 months), confirm button

---

## 5. Settings Sub-Screens

| Screen | Route | Purpose |
|:---|:---|:---|
| Account Details | `/settings/account` | View/change name, email, password; Delete Account |
| Monthly Budget | `/settings/budget` | Change budget amount, view history |
| Custom Categories | `/settings/categories` | Add, edit, delete custom categories |
| Appearance | `/settings/appearance` | Light/Dark/System theme toggle |
| Notifications | `/settings/notifications` | Per-type notification toggles |
| About | `/settings/about` | App version, Privacy Policy, Terms of Service, Licenses |
