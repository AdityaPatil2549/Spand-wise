# Testing Strategy & Quality Assurance
## SpendWise — Student Expense Tracker

---

## 1. The "Inverted Testing Pyramid" (Startup Model)

Traditional enterprise software relies heavily on unit tests (the bottom of the pyramid). For an MVP optimizing for speed, we invert the pyramid. We focus heavily on **End-to-End (E2E) testing** of the critical path, and only use unit tests for complex mathematical logic. 

We accept a higher risk of minor UI regressions in exchange for guaranteeing the core "Add Expense" flow never breaks.

---

## 2. Unit Testing (Vitest)

Used strictly for isolated business logic and pure functions. We do NOT unit test React components (too brittle).

**Target Coverage Areas:**
1. Financial Calculations (`src/lib/utils/math.ts`) - Validating percentages, budget rollovers, and IEEE 754 float rounding.
2. Zod Validation Schemas (`src/types/forms.ts`) - Validating edge cases (negative amounts, string lengths).
3. Zustand Store Actions (`src/store/`) - Validating that `addExpenseOptimistic` correctly modifies the state array.

**Execution:**
- Tool: `vitest` (Faster than Jest, native ESM support).
- Trigger: Runs on every pre-commit hook (Husky) and CI PR build.

---

## 3. End-to-End Testing (Playwright)

Playwright simulates a real user clicking through the app in a headless browser (Chromium, WebKit, Firefox).

### 3.1 The Critical Path Test Suite (Must-Pass)
If any of these tests fail, deployment is immediately halted.

**Test 1: The First-Time User Flow**
- Opens `/login`.
- Mocks Firebase Auth login.
- Submits `$10,000` to the Onboarding budget setter.
- Asserts that the Dashboard loads and displays "Remaining: $10,000".

**Test 2: The 3-Second Logger**
- Clicks the FAB (+).
- Types `250`.
- Selects "Food" chip.
- Clicks "Add".
- Asserts that the Dashboard budget decreases to `$9,750`.
- Asserts that the Expense Timeline shows "₹250 - Food".

**Test 3: The Undo Deletion Flow**
- Clicks an expense row.
- Clicks "Delete".
- Asserts Toast appears with "UNDO".
- Clicks "UNDO" within 5 seconds.
- Asserts the expense row returns to the DOM.

### 3.2 E2E Environment
Playwright tests are run against the **Firebase Local Emulator Suite**. We never run E2E tests against the production or staging Firestore databases to avoid data contamination.

---

## 4. Manual QA Matrix (Pre-Release)

Because web apps run on diverse hardware, the final step before tagging a release is manual validation on physical devices.

| Device | Browser | Primary Focus |
|:---|:---|:---|
| iPhone 13 (iOS) | Safari | Bottom-sheet animation smoothness, PWA "Add to Home Screen" prompt. |
| Budget Android (Moto G) | Chrome | First Contentful Paint latency, keypad popup shifting the layout. |
| Desktop (Windows) | Edge | Hover states, tab-navigation accessibility, PDF generation formatting. |

---

## 5. Telemetry & Error Tracking

Post-launch, QA is handled reactively via telemetry.

1. **Sentry / Crashlytics:** Captures unhandled React exceptions and boundary catches.
2. **Alerting Threshold:** If the error rate for `firebaseAddExpense` exceeds 1% of total requests over a 15-minute window, a Slack alert is triggered to the engineering team.
