# Launch Day Checklist (T-Minus 24 Hours)
## SpendWise — Student Expense Tracker

---

## 1. Executive Protocol
Launch day is high-risk. This document acts as the immutable checklist that the engineering and product leads must sign off on before shifting production traffic to v1.0.0.

---

## 2. Pre-Launch (T-24 Hours)

### 2.1 Database & Security
- [ ] **Firestore Rules:** Deploy hardened rules. Verify `allow read, write: if true;` (test mode) is COMPLETELY removed.
- [ ] **Indexes:** Manually trigger the creation of all required Composite Indexes in the Firebase Console (e.g., querying expenses by `month` AND `date` descending).
- [ ] **Backups:** Enable automated Google Cloud Storage backups for Firestore.

### 2.2 Infrastructure
- [ ] **Vercel Domains:** Map `spendwise.app` to the production Vercel project. Verify SSL provisioning (Let's Encrypt).
- [ ] **Environment Variables:** Verify Vercel production environment contains production Firebase keys, NOT the staging/dev keys.
- [ ] **OAuth Scopes:** Ensure Google Cloud Console OAuth consent screen is set to "Production" and not "Testing" (otherwise users see a frightening "Unverified App" warning).

### 2.3 Analytics & Monitoring
- [ ] **Firebase Analytics:** Open the DebugView in Firebase to verify production events are logging correctly.
- [ ] **Sentry/Crashlytics:** Induce a manual error (`throw new Error('Test')`) on the production URL to verify alerts route to the engineering Slack channel.

---

## 3. Go-Live (T-0 Hours)

1. Remove the password protection/maintenance page from Vercel settings.
2. Engineering Lead posts to Slack/Discord: `🚀 SPENDWISE IS LIVE`.
3. Marketing sends the "We are live" email blast to the waitlist (Max 500 emails/batch to prevent spam filtering).

---

## 4. Post-Launch Monitoring (T+1 to T+6 Hours)

During the first 6 hours, the engineering team is on "Active Monitoring" duty. No new code is written during this window.

### 4.1 Dashboard Refresh Protocol (Every 15 Minutes)
- **Vercel Usage:** Monitor Edge function executions and bandwidth to detect DDoS or infinite loops.
- **Firebase Usage:** Monitor Firestore reads/writes. If writes spike exponentially, immediately halt the app (Vercel Rollback) to prevent billing runaway caused by a rogue `useEffect` loop.
- **Sentry:** Monitor for unhandled promise rejections.

### 4.2 Rollback Criteria
The decision to revert to the maintenance page will be executed if ANY of the following occur:
1. Critical Security Breach (Users can read other users' budgets).
2. Data Corruption (Budget calculation logic is permanently saving incorrect totals to the database).
3. Auth Outage (Users cannot log in for > 15 minutes).

Minor UI bugs (e.g., misaligned text, wrong color) DO NOT warrant a rollback. They will be patched in v1.0.1 via hotfix branch.
