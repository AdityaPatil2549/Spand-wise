# Navigation Architecture
## SpendWise — Student Expense Tracker

---

## 1. Navigation Philosophy

SpendWise uses a **bottom tab navigation** pattern for authenticated users. This is the universally understood pattern for mobile-first apps and requires zero learning.

**Principles:**
- Maximum 5 tabs (cognitive load limit)
- The most important action (Add Expense) is always reachable via the FAB, not a tab
- Tab labels use both icon AND text to maximize comprehension
- Active tab is clearly distinguished via color

---

## 2. Tab Structure

| Tab # | Icon | Label | Route | Purpose |
|:---|:---:|:---|:---|:---|
| 1 | 🏠 | Home | `/app/dashboard` | Budget overview and recent activity |
| 2 | 📋 | Expenses | `/app/expenses` | Full expense list with search and filter |
| 3 | 📊 | Analytics | `/app/analytics` | Charts and spending insights |
| 4 | 📄 | Reports | `/app/reports` | PDF/CSV download |
| 5 | ⚙️ | Settings | `/app/settings` | Account, budget, theme, preferences |

**FAB:** The `+` floating action button sits centered above the bottom tab bar and opens the Add Expense bottom sheet from any tab.

---

## 3. Route Map

```
/ (root)
├── /login                          → Login screen (unauthenticated)
├── /onboarding                     → Budget setup wizard (first-time users)
└── /app (authenticated layout)
    ├── /dashboard                  → Home tab
    ├── /expenses                   → Expense list tab
    │   └── /expenses/[id]          → Expense detail/edit (modal or slide-up)
    ├── /analytics                  → Analytics tab
    │   └── /analytics?month=2026-07 → Month-specific view
    ├── /reports                    → Reports tab
    └── /settings                   → Settings tab
        ├── /settings/account       → Account details, delete account
        ├── /settings/budget        → Modify monthly budget
        ├── /settings/categories    → Manage custom categories
        ├── /settings/appearance    → Theme toggle (light/dark)
        └── /settings/notifications → Notification preferences
```

---

## 4. Navigation Transitions

| Transition Type | Animation |
|:---|:---|
| Tab switch | Instant (no animation, matches native behavior) |
| Bottom sheet open (Add/Edit) | Slide up from bottom, 250ms ease-out |
| Bottom sheet close | Slide down, 200ms ease-in |
| Modal/Overlay open | Fade in, 200ms |
| Page push (e.g., Settings sub-pages) | Slide left, 250ms ease-out |
| Page pop (back) | Slide right, 200ms ease-in |

---

## 5. Entry Points for Key Actions

| Action | Entry Points |
|:---|:---|
| Add Expense | FAB (all tabs), Dashboard quick-add button |
| View Budget | Dashboard (always visible), Settings > Budget |
| Generate Report | Reports tab, Analytics tab (secondary CTA) |
| Change Budget | Settings > Budget, Onboarding |
| Sign Out | Settings > Account |

---

## 6. Unauthenticated Navigation Rules

- ANY access to `/app/*` routes redirects to `/login`
- After login, redirect to `/app/dashboard` (or `/onboarding` for new users)
- Accessing `/login` while already authenticated redirects to `/app/dashboard`
