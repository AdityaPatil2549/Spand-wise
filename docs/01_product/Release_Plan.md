# Release Plan
## SpendWise — Student Expense Tracker

---

## 1. Release Philosophy

SpendWise follows a **continuous delivery** model with periodic named releases. Each release is:
- Independently deployable
- Backward compatible with existing user data
- Announced to users via in-app notification
- Tagged in git with a semantic version (e.g., `v1.0.0`)

---

## 2. Release Schedule

### v1.0.0 — "Launchpad" (MVP)
**Target Date:** Week 8 (8 weeks from project start)
**Theme:** Core tracking that actually works.

**Included:**
- Full authentication flow (Google + Email)
- Expense add/edit/delete
- Monthly budget setup
- Dashboard with budget progress
- Category analytics (donut chart)
- PDF + CSV export
- Multi-device real-time sync
- PWA install support

**Quality Gates:**
- All P0/P1 bugs resolved
- Lighthouse Performance > 80
- Manual UAT completed by 3 test users
- Firebase security rules reviewed

---

### v1.1.0 — "Engage"
**Target Date:** 4 weeks after v1.0 launch
**Theme:** Retention and personalization.

**Included:**
- Push notification system (budget warnings, reminders)
- Gamification: streaks, 3 milestone badges
- Daily spending line chart in Analytics
- Custom categories (up to 10 total)
- Category-level budget limits
- Dark mode toggle (if not in v1.0)
- Expense search and advanced filtering

---

### v1.2.0 — "Automate"
**Target Date:** 8 weeks after v1.1 launch
**Theme:** Automation and goal-setting.

**Included:**
- Recurring expense templates + auto-logging
- Savings goals tracker with progress visualization
- Monthly data import from CSV
- Wishlist / 48-hour cooldown feature
- Round-up micro-savings "Virtual Jar"

---

### v2.0.0 — "Insights"
**Target Date:** Q2 of Year 2
**Theme:** Smart insights and income tracking.

**Included:**
- Income tracking (multi-source)
- Net balance (income vs. expense)
- Cash flow chart
- AI-powered spending insights
- Anonymous peer benchmarking
- Google Drive auto-backup integration
- Native Android PWA optimizations

---

## 3. Hotfix / Patch Policy

- **Patch (x.x.X):** Bug fixes only. No new features. Can be deployed at any time.
- **Minor (x.X.0):** New features that are backward compatible. Require QA sign-off.
- **Major (X.0.0):** Breaking changes, major UX overhauls, or significant data model changes. Require staged rollout and migration plan.

---

## 4. Release Communication Checklist

For each minor/major release:
- [ ] Update `CHANGELOG.md` with all changes
- [ ] Bump version in `package.json`
- [ ] Tag git commit: `git tag -a vX.Y.Z -m "Release notes"`
- [ ] Deploy to Firebase Hosting (production)
- [ ] Send in-app "What's New" notification to all users
- [ ] Post update on student community channels (WhatsApp groups, Discord)
