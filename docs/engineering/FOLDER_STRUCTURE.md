# Folder Structure
## SpendWise — Student Expense Tracker

---

## Complete Project Directory

```
spendwise/
│
├── 📁 .github/
│   ├── workflows/
│   │   ├── ci.yml                  # Run tests + lint on every PR
│   │   ├── deploy-staging.yml      # Deploy to staging on main push
│   │   └── deploy-production.yml   # Deploy to production on release tag
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── 📁 docs/                        # All documentation
│   ├── product/                    # Product documents
│   ├── design/                     # Design documents
│   ├── engineering/                # Engineering documents
│   ├── dev/                        # Development documents
│   ├── production/                 # Production documents
│   └── testing/                    # Testing documents
│
├── 📁 e2e/                         # Playwright E2E tests
│   ├── fixtures/
│   │   └── auth.fixture.ts
│   ├── pages/
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   └── ExpensesPage.ts
│   ├── tests/
│   │   ├── auth.spec.ts
│   │   ├── add-expense.spec.ts
│   │   ├── dashboard.spec.ts
│   │   └── reports.spec.ts
│   └── playwright.config.ts
│
├── 📁 functions/                   # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts                # Exports all functions
│   │   ├── expenses/
│   │   │   └── onExpenseWrite.ts   # Budget recalculation trigger
│   │   ├── budgets/
│   │   │   └── monthlyReset.ts     # Scheduled monthly budget reset
│   │   ├── notifications/
│   │   │   ├── sendAlert.ts        # Push notification sender
│   │   │   └── templates.ts        # Notification message templates
│   │   └── utils/
│   │       ├── firebase.ts         # Admin SDK init
│   │       └── rateLimiter.ts
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 public/                      # Static assets
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── favicon.ico
│   ├── manifest.json               # PWA manifest
│   ├── robots.txt
│   └── sitemap.xml
│
├── 📁 src/                         # Main application source
│   │
│   ├── 📁 app/                     # Next.js App Router
│   │   ├── layout.tsx              # Root layout (fonts, providers, metadata)
│   │   ├── page.tsx                # Root redirect page
│   │   ├── globals.css             # Global Tailwind directives
│   │   ├── not-found.tsx           # 404 page
│   │   ├── error.tsx               # Global error boundary
│   │   ├── loading.tsx             # Global loading state
│   │   │
│   │   ├── 📁 (auth)/              # Route group — no app nav
│   │   │   ├── layout.tsx          # Auth layout (centered, gradient bg)
│   │   │   ├── login/
│   │   │   │   ├── page.tsx        # Login page (Google + Email)
│   │   │   │   └── loading.tsx
│   │   │   └── onboarding/
│   │   │       ├── page.tsx        # Budget setup (first-time)
│   │   │       └── loading.tsx
│   │   │
│   │   └── 📁 (app)/               # Route group — with app nav
│   │       ├── layout.tsx          # App shell (bottom nav mobile, sidebar desktop)
│   │       ├── dashboard/
│   │       │   ├── page.tsx        # Main dashboard
│   │       │   └── loading.tsx
│   │       ├── expenses/
│   │       │   ├── page.tsx        # Expense list + filters
│   │       │   ├── loading.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx    # Expense detail / edit
│   │       ├── analytics/
│   │       │   ├── page.tsx        # Charts + insights
│   │       │   └── loading.tsx
│   │       ├── reports/
│   │       │   ├── page.tsx        # Report generation + history
│   │       │   └── loading.tsx
│   │       └── settings/
│   │           ├── page.tsx        # Settings overview
│   │           ├── budget/
│   │           │   └── page.tsx    # Budget amount setting
│   │           ├── categories/
│   │           │   └── page.tsx    # Category management
│   │           ├── notifications/
│   │           │   └── page.tsx    # Notification preferences
│   │           └── account/
│   │               └── page.tsx    # Account info + delete
│   │
│   ├── 📁 components/              # Reusable React components
│   │   │
│   │   ├── 📁 ui/                  # Primitive UI components (design system)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Divider.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts            # Barrel export
│   │   │
│   │   ├── 📁 expense/
│   │   │   ├── AddExpenseSheet.tsx     # Bottom sheet — add expense
│   │   │   ├── EditExpenseSheet.tsx    # Bottom sheet — edit expense
│   │   │   ├── ExpenseListItem.tsx     # Single expense row
│   │   │   ├── ExpenseList.tsx         # Grouped list of expenses
│   │   │   ├── ExpenseDateGroup.tsx    # "Today", "Yesterday" header
│   │   │   ├── CategoryPicker.tsx      # Category selection grid
│   │   │   ├── AmountInput.tsx         # Formatted currency input
│   │   │   ├── DatePicker.tsx          # Date selection for backdating
│   │   │   └── ExpenseFAB.tsx          # Floating action button
│   │   │
│   │   ├── 📁 budget/
│   │   │   ├── BudgetCard.tsx          # Dashboard hero budget card
│   │   │   ├── BudgetProgressBar.tsx   # Visual budget progress
│   │   │   ├── BudgetSetup.tsx         # Onboarding budget input
│   │   │   └── BudgetWarningBanner.tsx # 80%/100% warning
│   │   │
│   │   ├── 📁 analytics/
│   │   │   ├── DonutChart.tsx          # Category breakdown donut
│   │   │   ├── SpendingTrendChart.tsx  # Daily spending line chart
│   │   │   ├── CategoryBreakdownList.tsx # Category list with bars
│   │   │   ├── MonthComparison.tsx     # Month-over-month compare
│   │   │   └── InsightCard.tsx         # AI/rule-based insight card
│   │   │
│   │   ├── 📁 layout/
│   │   │   ├── AppShell.tsx            # Outer app container
│   │   │   ├── BottomNav.tsx           # Mobile bottom navigation
│   │   │   ├── Sidebar.tsx             # Desktop sidebar navigation
│   │   │   ├── TopBar.tsx              # Mobile header with title
│   │   │   └── PageTransition.tsx      # Animate between routes
│   │   │
│   │   └── 📁 shared/
│   │       ├── AuthGuard.tsx           # Redirect to login if not auth
│   │       ├── ErrorBoundary.tsx       # Catch render errors
│   │       ├── SyncIndicator.tsx       # Online/offline indicator
│   │       └── MonthPicker.tsx         # Month selector component
│   │
│   ├── 📁 lib/                     # Business logic + Firebase helpers
│   │   │
│   │   ├── 📁 firebase/
│   │   │   ├── index.ts            # Firebase app initialization
│   │   │   ├── auth.ts             # Auth helper functions
│   │   │   ├── firestore.ts        # Firestore db instance + helpers
│   │   │   ├── storage.ts          # Firebase Storage helpers
│   │   │   ├── messaging.ts        # FCM push notification helpers
│   │   │   └── listeners.ts        # RealtimeManager class
│   │   │
│   │   ├── 📁 expenses/
│   │   │   ├── addExpense.ts       # Add expense with optimistic UI
│   │   │   ├── updateExpense.ts    # Update expense
│   │   │   ├── deleteExpense.ts    # Soft-delete expense
│   │   │   ├── getExpenses.ts      # Fetch expense queries
│   │   │   └── schemas.ts          # Zod validation schemas
│   │   │
│   │   ├── 📁 budget/
│   │   │   ├── getBudget.ts
│   │   │   ├── updateBudget.ts
│   │   │   └── budgetUtils.ts      # Percentage, remaining calc
│   │   │
│   │   ├── 📁 categories/
│   │   │   ├── getCategories.ts
│   │   │   ├── createCategory.ts
│   │   │   ├── updateCategory.ts
│   │   │   └── presets.ts          # Preset category data
│   │   │
│   │   ├── 📁 reports/
│   │   │   ├── pdfGenerator.ts     # jsPDF monthly report
│   │   │   ├── csvExporter.ts      # SheetJS CSV export
│   │   │   └── reportUtils.ts      # Report data preparation
│   │   │
│   │   └── 📁 utils/
│   │       ├── format.ts           # formatCurrency, formatDate, etc.
│   │       ├── date.ts             # date-fns helpers
│   │       ├── device.ts           # getDeviceId()
│   │       ├── errors.ts           # Firebase error → user message map
│   │       └── cn.ts               # clsx + twMerge utility
│   │
│   ├── 📁 store/                   # Zustand global state
│   │   ├── index.ts                # Combined store
│   │   ├── auth.slice.ts
│   │   ├── expenses.slice.ts
│   │   ├── budget.slice.ts
│   │   └── ui.slice.ts
│   │
│   ├── 📁 hooks/                   # Custom React hooks
│   │   ├── useAuth.ts              # Auth state + helpers
│   │   ├── useExpenses.ts          # Expense list + CRUD
│   │   ├── useBudget.ts            # Budget state + calculations
│   │   ├── useCategories.ts        # Category data
│   │   ├── useToast.ts             # Toast notifications
│   │   ├── useOnlineStatus.ts      # Online/offline detection
│   │   └── useMonthPicker.ts       # Month navigation
│   │
│   ├── 📁 types/                   # TypeScript type definitions
│   │   ├── firestore.ts            # Firestore document interfaces
│   │   ├── forms.ts                # Form input/output types
│   │   ├── ui.ts                   # Component prop types
│   │   └── index.ts                # Barrel re-export
│   │
│   ├── 📁 styles/
│   │   ├── tokens.css              # Design tokens
│   │   └── animations.css          # Keyframe animations
│   │
│   └── 📁 config/
│       ├── env.ts                  # Validated env vars (Zod)
│       ├── constants.ts            # App-wide constants
│       └── site.ts                 # Site metadata (SEO)
│
├── .env.example                    # Template env file (committed)
├── .env.local                      # Local secrets (gitignored)
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── AGENTS.md                       # AI agent rules (this project)
├── CHANGELOG.md
├── firebase.json                   # Firebase hosting + functions config
├── firestore.indexes.json          # Firestore composite indexes
├── firestore.rules                 # Firestore security rules
├── next.config.js
├── package.json
├── playwright.config.ts
├── README.md
├── storage.rules                   # Firebase Storage security rules
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## Key Files Explained

| File | Purpose |
|---|---|
| `src/app/layout.tsx` | Sets up fonts, providers (Zustand, Firebase), global meta |
| `src/lib/firebase/listeners.ts` | Manages all Firestore real-time subscriptions |
| `src/store/index.ts` | Single Zustand store combining all slices |
| `src/types/firestore.ts` | Single source of truth for all Firestore document shapes |
| `src/styles/tokens.css` | ALL design tokens — color, spacing, typography |
| `AGENTS.md` | Rules for AI agents and developers |
| `firestore.rules` | Security rules protecting all user data |
| `functions/src/index.ts` | All Cloud Function exports |

---

*Folder structure reflects MVP architecture. Subject to review before v2.*
