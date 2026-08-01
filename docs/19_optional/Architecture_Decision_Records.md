# Architecture Decision Records (ADR)
## SpendWise — Student Expense Tracker

ADRs document significant architectural decisions, including the context, decision, and consequences. This helps future developers understand *why* the architecture is what it is.

---

## ADR-001: Use Firebase Instead of Custom Backend

**Date:** July 2026
**Status:** Accepted

**Context:**
The app requires real-time multi-device data sync, user authentication, and a database. Building a custom backend (Node.js/Express + PostgreSQL) would require server hosting costs, auth implementation, and significantly more development time.

**Decision:**
Use Firebase (Firestore + Authentication + Hosting) as the complete backend.

**Consequences:**
- ✅ Zero server costs on Spark free tier
- ✅ Real-time sync built-in via onSnapshot
- ✅ Google OAuth out of the box
- ✅ No backend code to write or maintain
- ❌ Vendor lock-in to Google Firebase
- ❌ Limited querying capabilities vs. SQL
- ❌ Pre-aggregation pattern required for analytics (adds complexity)
- ❌ Scaling to millions of users would require significant restructuring

---

## ADR-002: Pre-Aggregate Analytics Data

**Date:** July 2026
**Status:** Accepted

**Context:**
Firestore charges per-read. Calculating category breakdowns from 200 raw expense documents costs 200 reads per analytics page load. With 100 users × 10 analytics views/month = 200,000 reads/month just for analytics. This could exhaust the Spark free tier.

**Decision:**
Maintain a `BudgetDocument` per user per month that stores pre-aggregated data (`categoryBreakdown`, `totalSpent`, `dailySpending[]`). This is updated atomically on every expense write using Firestore batch operations.

**Consequences:**
- ✅ Analytics reads require exactly 1 Firestore read (the BudgetDocument)
- ✅ Dashboard data loads instantly (pre-computed)
- ❌ Write complexity: Every expense add/edit/delete must update TWO documents atomically
- ❌ Budget document can become stale if a batch write fails (mitigated by atomic batch)
- ❌ If we add new analytics dimensions later, we need a migration to backfill the budget docs

---

## ADR-003: Client-Side PDF Generation

**Date:** July 2026
**Status:** Accepted

**Context:**
PDF report generation can be done either server-side (Cloud Function + Puppeteer) or client-side (jsPDF + html2canvas). Server-side requires Cloud Functions (Blaze plan), a Puppeteer runtime, and more infrastructure.

**Decision:**
Generate PDFs client-side using `jsPDF` and `html2canvas`.

**Consequences:**
- ✅ No server-side cost or complexity
- ✅ Can render rendered charts into the PDF
- ❌ PDF quality is limited by jsPDF's capabilities (no advanced typography)
- ❌ Large expense lists (> 500 items) may cause browser slowdowns
- ❌ Not suitable for server-triggered scheduled reports (v2.0 concern)

---

## ADR-004: Zustand over Redux

**Date:** July 2026
**Status:** Accepted

**Context:**
Global state management is needed for: auth state, expense list, budget data, and UI state (modal open/close, theme, toasts). Options: Redux Toolkit, Zustand, Jotai, or React Context.

**Decision:**
Use Zustand.

**Consequences:**
- ✅ Minimal boilerplate (10x less than Redux)
- ✅ No Provider component required
- ✅ TypeScript-first
- ✅ Built-in devtools support
- ✅ Tiny bundle size (~1.2kB)
- ❌ Less structured than Redux (more "freestyle" state management)
- ❌ No built-in time-travel debugging (Redux DevTools)
- ❌ No ecosystem of middleware (not needed at this scale)

---

## ADR-005: Mobile-First PWA over Native App

**Date:** July 2026
**Status:** Accepted

**Context:**
Native iOS and Android apps provide better performance and UX, but require: two separate codebases, App Store/Play Store submission and approval, native development expertise, and ongoing platform-specific maintenance.

**Decision:**
Build a PWA (Progressive Web App) using Next.js and deploy to Firebase Hosting.

**Consequences:**
- ✅ Single codebase for all platforms
- ✅ Zero App Store approval process
- ✅ Instant updates (no app store review wait)
- ✅ Free hosting on Firebase Hosting CDN
- ❌ Limited native device access (no background notifications on all iOS versions)
- ❌ PWA install prompt is less visible than App Store
- ❌ Some students may perceive it as "less official" than a native app
