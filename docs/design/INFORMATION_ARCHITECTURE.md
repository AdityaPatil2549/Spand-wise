# Information Architecture
## SpendWise — Student Expense Tracker

---

## 1. Site Map

```
SpendWise App
│
├── /login                          [Unauthenticated]
│   └── Sign In / Sign Up
│
├── /onboarding                     [Post-registration, first-time only]
│   └── Budget Setup
│
└── / (Authenticated)
    ├── /dashboard                  [TAB 1: Home]
    │   ├── Budget Hero Card
    │   ├── Today's Summary
    │   ├── Category Mini-Chart
    │   └── Recent Expenses (5)
    │
    ├── /expenses                   [TAB 2: Expenses]
    │   ├── Month Picker
    │   ├── Filter Panel
    │   │   ├── Date Range Filter
    │   │   └── Category Filter
    │   ├── Expense List (grouped by date)
    │   └── /expenses/[id]          [Expense Detail/Edit]
    │       └── Edit Expense Sheet
    │
    ├── /analytics                  [TAB 3: Analytics]
    │   ├── Month Picker
    │   ├── Category Donut Chart
    │   ├── Category Breakdown List
    │   ├── Daily Trend Line Chart
    │   └── Insights Cards
    │
    ├── /reports                    [TAB 4: Reports]
    │   ├── Generate Report (current month)
    │   ├── PDF Download
    │   ├── CSV Export
    │   └── Past Reports List
    │       └── /reports/[month]    [Historical Report View]
    │
    └── /settings                   [TAB 5: Settings]
        ├── /settings/budget        [Budget Settings]
        │   └── Monthly Budget Editor
        ├── /settings/categories    [Category Settings]
        │   ├── Preset Categories (view only)
        │   ├── Custom Categories (edit/delete)
        │   └── Add Custom Category
        ├── /settings/notifications [Notification Settings]
        │   ├── Budget Warning Toggle
        │   └── Warning Threshold Slider
        ├── /settings/appearance    [Appearance]
        │   └── Theme Toggle (System/Light/Dark)
        └── /settings/account       [Account]
            ├── Profile Information
            ├── Export All Data
            └── Delete Account
```

---

## 2. Navigation Hierarchy

### 2.1 Primary Navigation (Always Visible)
Bottom tab bar on mobile, left sidebar on desktop:
- Dashboard (Home icon)
- Expenses (List icon)
- Analytics (Chart icon)
- Reports (Document icon)
- Settings (Gear icon)

### 2.2 Secondary Navigation (Context-Specific)
- Month picker (Expenses + Analytics + Reports pages)
- Filter panel (Expenses page)
- Back button (Settings sub-pages, Expense detail)

### 2.3 Global Actions (Always Available)
- Add Expense FAB (Dashboard + Expenses + Analytics)
- User avatar (top-right) → Quick account menu

---

## 3. Content Hierarchy

### Dashboard Screen Priority
1. **P1 — Remaining Budget** (largest element, hero card)
2. **P2 — Today's Spending** (secondary card)
3. **P3 — Category Breakdown** (mini chart)
4. **P4 — Recent Expenses** (list preview)

### Expense List Screen Priority
1. **P1 — Expense Items** (the main content)
2. **P2 — Date Group Headers** (organizational)
3. **P3 — Month Total** (summary)
4. **P4 — Filter State** (active filters as chips)

### Analytics Screen Priority
1. **P1 — Category Donut Chart** (visual answer to "where did it go?")
2. **P2 — Category List** (quantitative detail)
3. **P3 — Daily Trend** (pattern insight)
4. **P4 — Insights Cards** (actionable analysis)

---

## 4. User Mental Models

### How Students Think About Their Money

**Model 1: "How much do I have left?"**
→ Answered by: Dashboard → Budget hero card

**Model 2: "What did I spend on?"**
→ Answered by: Analytics → Donut chart

**Model 3: "What did I spend recently?"**
→ Answered by: Expenses → Chronological list

**Model 4: "How does this month compare to last?"**
→ Answered by: Analytics → Month comparison (v1.1)

**Model 5: "Can I show my parents what I spent?"**
→ Answered by: Reports → PDF download

### Mental Model Alignment
SpendWise's navigation is designed to match these mental models exactly. The tab order mirrors the frequency of each question: "How much left?" (daily) → "What did I spend?" (daily) → "Analysis" (weekly) → "Reports" (monthly) → "Settings" (rare).

---

## 5. Content Taxonomy

### Expense Categories
**Tier 1 (Most Used by Students):**
- Food & Dining
- Transport
- Entertainment
- Café & Snacks

**Tier 2 (Regular Use):**
- Education & Books
- Shopping
- Phone & Internet
- Personal Care

**Tier 3 (Occasional):**
- Health & Medical
- Accommodation
- Fitness
- Gifts & Donations
- Travel
- Utilities
- Other

**Custom Categories:**
- User-created (up to 10)
- Appear after all presets in picker

### Date Grouping in Expense List
```
Today
Yesterday
[Day Name] (within last 7 days: "Monday", "Tuesday")
[Full Date] (older: "July 12")
```

### Month Navigation
- Current month: "July 2026" (highlighted)
- Past months accessible via back arrow or dropdown
- Future months not accessible (no future expenses)
- Maximum history: all available data (no limit)

---

## 6. Search & Discoverability

### Global Search (v1.1)
Search icon in Expenses page header → search by:
- Expense note/description (full-text)
- Category name
- Amount (exact match)

### Filters (v1.0)
Expense list filter panel:
```
Date Range:
  ○ Today
  ○ This Week
  ○ This Month (default)
  ○ Custom (date picker)

Category:
  ☑ Food & Dining
  ☑ Transport
  ☑ [All 15+ categories]
  [Apply] [Clear]
```

---

## 7. Onboarding Information Architecture

### New User Journey
```
Landing / Login
    ↓
Google OAuth / Email Registration
    ↓
Create User Document (automatic)
    ↓
Onboarding: "Set Your Monthly Budget"
    ↓
Dashboard (populated with budget, zero expenses)
    ↓
[First Expense Prompt / Tutorial Tooltip]
    ↓
Normal App Usage
```

### First-Run Tooltips (Contextual, v1.1)
- First session: highlight FAB with "Tap here to add your first expense"
- After first expense: "Great! Your budget updated. Tap Analytics to see your breakdown"

---

*Information Architecture v1.0 — July 2026*
