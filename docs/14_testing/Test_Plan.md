# Test Plan
## SpendWise — Student Expense Tracker

---

## 1. Overview

The SpendWise Test Plan defines the scope, approach, and resources required for ensuring the quality of the v1.0 release. Given that this is a student project optimized for speed and simplicity, the testing strategy focuses on high-ROI (Return on Investment) testing rather than 100% coverage.

---

## 2. Scope of Testing

### In Scope
- **Core Business Logic:** Budget calculations, aggregation, filtering (Unit Tests).
- **Data Integrity:** Firestore Security Rules validation (Unit/Integration Tests).
- **Critical User Flows:** Adding/Editing expenses, Auth (E2E Tests).
- **Responsive UI:** Visual verification on mobile dimensions (Manual/E2E).
- **Offline Capabilities:** App behavior when network is disconnected (Manual).

### Out of Scope
- Load / Stress testing (handled by Firebase infrastructure).
- Comprehensive visual regression testing (too high maintenance for MVP).
- Complete branch/line unit test coverage for pure UI components.

---

## 3. Testing Levels

| Level | Tool | Coverage Target | Focus |
|:---|:---|:---|:---|
| **Unit Tests** | Jest | 80% (lib/utils) | Complex logic (calculations, formatting) |
| **Integration** | Jest + Firebase Emulator | Critical Paths | Firestore rules, Batch writes, Store |
| **E2E Tests** | Playwright | 4 CUJs | Full user flows in browser |
| **Manual QA** | Human | N/A | Edge cases, offline mode, animations |

---

## 4. Test Environment

- **Local Dev:** `npm run test` (Jest) runs against mocked data or the local Firebase Emulator.
- **CI Pipeline (GitHub Actions):** 
  - Runs on every Pull Request to `main`.
  - Executes unit tests.
  - Deploys Firebase Emulator, runs Security Rules tests.
  - Fails the build if tests fail.

---

## 5. Defect Management

Bugs discovered during testing are tracked as GitHub Issues.

**Severity Levels:**
- **P0 (Blocker):** Data loss, unable to log in, unable to add expense. Must fix immediately.
- **P1 (Critical):** Core feature broken but workaround exists (e.g., CSV export fails). Fix in current sprint.
- **P2 (Major):** UI glitch impacting usability (keyboard blocks input). Fix before release.
- **P3 (Minor):** Cosmetic issue, minor layout shift. Fix when time permits.

---

## 6. QA Checklist (Pre-Release)

Before tagging a v1.0 release, the following manual checks must pass:
- [ ] Sign in with a new Google Account.
- [ ] Set budget and verify dashboard layout.
- [ ] Add 3 expenses in different categories.
- [ ] Disconnect WiFi -> Add an expense -> Reconnect WiFi -> Verify sync.
- [ ] Edit an expense and verify budget recalculates.
- [ ] Switch device to Dark Mode, verify colors are readable.
- [ ] Open on actual physical mobile device (iOS Safari or Chrome Android).
- [ ] Add to Home Screen (PWA install) and launch from icon.
