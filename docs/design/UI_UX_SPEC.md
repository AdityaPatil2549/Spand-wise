# UI/UX Specification
## SpendWise — Student Expense Tracker

---

## 1. UX Philosophy

### Core UX Principles
1. **Zero to Value in 30 Seconds** — A new user must experience real value (seeing their budget) within 30 seconds of first open
2. **Thumb-First Design** — All primary actions reachable with one thumb in the bottom 60% of the screen
3. **Glanceable Information** — The most important data (remaining budget) is always immediately visible without scrolling
4. **Forgiveness by Default** — Every destructive action is reversible (undo delete for 5 seconds, soft deletes)
5. **Confidence Through Feedback** — Every interaction has immediate visual feedback — no silent actions

---

## 2. Navigation Architecture

### Mobile Navigation (Bottom Tab Bar)
```
[🏠 Home] [📋 Expenses] [📊 Analytics] [📄 Reports] [⚙️ Settings]
```
- **Home (Dashboard)** — Budget overview + today's summary + recent transactions
- **Expenses** — Full expense list with filters
- **Analytics** — Charts and category analysis
- **Reports** — Monthly report generation
- **Settings** — Budget, categories, account

### Desktop Navigation (Left Sidebar)
```
┌──────────────────┐
│  🟣 SpendWise    │  ← Logo
├──────────────────┤
│  🏠 Dashboard    │
│  📋 Expenses     │
│  📊 Analytics    │
│  📄 Reports      │
│  ⚙️ Settings     │
├──────────────────┤
│  👤 [Avatar]     │  ← User profile at bottom
│  Priya Sharma    │
└──────────────────┘
```

### FAB (Floating Action Button)
- Present on all primary screens (not settings/login)
- Fixed position: bottom-right, above bottom nav
- Opens expense entry bottom sheet
- **Icon:** `+` (transitions to `×` when sheet is open)

---

## 3. Screen Specifications

### 3.1 Login Screen

**Layout:**
```
┌────────────────────────────┐
│                            │
│  [Illustration: Student    │
│   with coins floating]     │
│                            │
│  Know your money.          │
│  Own your month.           │
│                            │
│  ┌────────────────────┐    │
│  │  G  Continue with  │    │
│  │      Google        │    │
│  └────────────────────┘    │
│                            │
│  ─────── or ────────       │
│                            │
│  Email Address             │
│  [____________________]    │
│                            │
│  Password                  │
│  [____________________] 👁 │
│                            │
│  [   Sign In   ]           │
│                            │
│  Don't have an account?    │
│  [Create Account]          │
│                            │
└────────────────────────────┘
```

**UX Details:**
- Background: deep purple gradient (brand gradient)
- Google button: white card with Google logo, subtle shadow
- Social login always appears first (fastest path)
- Email/password below divider (progressive disclosure)
- Password field: show/hide toggle
- Form validation: inline, on blur (not on submit)
- Keyboard: email type for email field
- Auto-focus: Google button highlighted by default on desktop

---

### 3.2 Onboarding Screen (Budget Setup)

**Layout:**
```
┌────────────────────────────┐
│                            │
│  Hi, Priya! 👋             │
│                            │
│  Let's set your monthly    │
│  budget to get started.    │
│                            │
│  What's your monthly       │
│  allowance?                │
│                            │
│  ₹  [10,000          ]     │
│     (large number input)   │
│                            │
│  Quick pick:               │
│  [₹3K] [₹5K] [₹8K] [₹10K] │
│                            │
│  You can change this       │
│  anytime in Settings.      │
│                            │
│  ┌────────────────────┐    │
│  │   Let's Track! →   │    │
│  └────────────────────┘    │
│                            │
└────────────────────────────┘
```

**UX Details:**
- Only one task: enter budget
- No skip option (budget is required for the app to function)
- Quick-pick buttons pre-populate common amounts
- Large number input with currency prefix
- Numeric keyboard opens automatically
- CTA button disabled until amount > 0
- Friendly, warm copy ("Hi, [name]!")

---

### 3.3 Dashboard Screen

**Layout (Mobile):**
```
┌────────────────────────────────┐
│  July 2026          🔔  👤    │
├────────────────────────────────┤
│ ┌──────────────────────────┐   │
│ │ Remaining Budget         │   │
│ │ ₹4,250                   │   │ ← Hero card (brand gradient bg)
│ │ ████████░░░░ 57% used    │   │
│ │ ₹5,750 of ₹10,000        │   │
│ └──────────────────────────┘   │
│                                │
│  Today's Spending              │
│  ┌──────────────────────────┐  │
│  │ ₹450  spent today        │  │
│  │ 3 transactions           │  │
│  └──────────────────────────┘  │
│                                │
│  Spending by Category          │
│  ┌──────────────────────────┐  │
│  │  [Donut chart - mini]    │  │
│  │  🍔 Food     45%         │  │
│  │  🚌 Transport 22%        │  │
│  │  🎮 Entertainment 18%    │  │
│  │  View All →              │  │
│  └──────────────────────────┘  │
│                                │
│  Recent Expenses               │
│  ┌──────────────────────────┐  │
│  │ 🍔 Dinner at mess  ₹150  │  │
│  │ 🚌 Auto fare       ₹80   │  │
│  │ ☕ Chai + snacks   ₹60   │  │
│  │ View All Expenses →      │  │
│  └──────────────────────────┘  │
│                                │
│ [🏠]  [📋]  [📊]  [📄]  [⚙️]  │ ← Bottom nav
│              ⊕ (FAB above nav) │
└────────────────────────────────┘
```

**Dashboard UX Details:**
- Budget card: animated count-up on load (0 → ₹4,250)
- Budget card color changes dynamically: 
  - 0–79%: Brand purple gradient
  - 80–99%: Warning amber gradient
  - 100%+: Danger red gradient
- Progress bar: animates from 0% to current % on load
- Mini category chart: interactive (tap to see full analytics)
- Recent 5 expenses — "View All" links to Expenses tab
- Pull-to-refresh refreshes budget and recent expenses

---

### 3.4 Add Expense Bottom Sheet

**Layout:**
```
┌────────────────────────────────┐
│ ┃   (drag handle)              │ ← Drag to dismiss
│                                │
│  Add Expense                   │
│                                │
│  ₹ [  1 5 0  ]                 │ ← Large amount display
│     (formatted as user types)  │
│                                │
│  Category                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │ 🍔 │ │ 🚌 │ │ 📚 │ │ 🎮 │  │ ← Horizontal scroll
│  │Food│ │Trn.│ │Edu │ │Ent │  │
│  └────┘ └────┘ └────┘ └────┘  │
│                                │
│  Note (optional)               │
│  [Dinner at mess + chai  ]     │
│                                │
│  Date                          │
│  [📅 Today, July 21    ▼]      │
│                                │
│  ┌────────────────────────┐    │
│  │  + Add Expense (₹150)  │    │ ← CTA shows amount
│  └────────────────────────┘    │
└────────────────────────────────┘
```

**Add Expense UX Details:**
- Sheet slides up with spring animation
- Amount field auto-focused, numeric keyboard opens
- Amount formatted as user types (₹1,500 not 1500)
- Category grid scrolls horizontally; selected category is highlighted
- Note field optional — appears collapsed, expands on tap
- Date defaults to today; tap to change (calendar picker, current month only)
- CTA button disabled until amount > 0 AND category selected
- On submit: sheet slides down, expense appears in list, toast "₹150 added!"
- Optimistic UI: expense appears immediately before Firestore confirms

**Keyboard Behavior:**
- Numeric keyboard for amount
- Text keyboard for note
- Dismiss keyboard: tap outside amount/note fields
- Return key on note field: submit form (if valid)

---

### 3.5 Expense List Screen

**Layout:**
```
┌────────────────────────────────┐
│  Expenses          🔍  🔽Filter│ ← Search + filter
├────────────────────────────────┤
│  [July 2026      ◄ July ►]    │ ← Month picker
│                                │
│  ─── Today ───────────────     │
│  🍔 Dinner at mess     ₹150    │
│      Food · 8:30 PM            │
│  🍔 Chai + snacks      ₹60     │
│      Food · 6:00 PM            │
│                                │
│  ─── Yesterday ───────────     │
│  🚌 Auto to college    ₹80     │
│      Transport · 9:00 AM       │
│  📱 Jio recharge       ₹200    │
│      Phone · 11:00 AM          │
│                                │
│  ─── July 19 ──────────        │
│  🎮 Movie tickets      ₹350    │
│      Entertainment · 7:00 PM   │
│                                │
│  ─── Total this month ─        │
│  ₹840 · 5 transactions         │
│                                │
│ [🏠]  [📋]  [📊]  [📄]  [⚙️]  │
│              ⊕                 │
└────────────────────────────────┘
```

**Expense List UX Details:**
- Swipe left to delete (reveals red delete button)
- Tap to edit (opens edit bottom sheet)
- Infinite scroll with 20-item pagination
- Sticky date headers as you scroll
- Filter panel: slide-down from filter icon
  - Date range: Today / This Week / This Month / Custom
  - Category: multi-select grid
  - Applied filters shown as dismissible chips
- Month picker: swipe left/right or tap arrows
- Total shown at bottom of list
- Empty state: illustration + "Add your first expense!" CTA

---

### 3.6 Analytics Screen

**Layout:**
```
┌────────────────────────────────┐
│  Analytics        [July 2026▼] │
├────────────────────────────────┤
│                                │
│  Spending Breakdown            │
│  ┌──────────────────────────┐  │
│  │     [Donut Chart]        │  │
│  │     ₹5,750 total         │  │ ← Center shows total
│  └──────────────────────────┘  │
│                                │
│  🍔 Food & Dining              │
│  ████████████░░  ₹2,580  45%  │
│  🚌 Transport                  │
│  ██████░░░░░░░   ₹1,265  22%  │
│  🎮 Entertainment              │
│  █████░░░░░░░░   ₹1,035  18%  │
│  📚 Education                  │
│  ██░░░░░░░░░░░   ₹460    8%   │
│  [Show All Categories]         │
│                                │
│  Daily Spending Trend          │
│  ┌──────────────────────────┐  │
│  │  [Line chart - 31 days]  │  │
│  └──────────────────────────┘  │
│                                │
│  💡 Insights                   │
│  ┌──────────────────────────┐  │
│  │ 🍔 Food is your biggest   │  │
│  │ expense — ₹2,580 (45%)   │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ 📅 You spend most on     │  │
│  │ Saturdays                │  │
│  └──────────────────────────┘  │
│                                │
│ [🏠]  [📋]  [📊]  [📄]  [⚙️]  │
└────────────────────────────────┘
```

---

### 3.7 Reports Screen

**Layout:**
```
┌────────────────────────────────┐
│  Reports                       │
├────────────────────────────────┤
│                                │
│  Generate Report               │
│  ┌──────────────────────────┐  │
│  │  Select Month            │  │
│  │  [July 2026          ▼]  │  │
│  │                          │  │
│  │  [📄 Download PDF]       │  │
│  │  [📊 Export CSV]         │  │
│  └──────────────────────────┘  │
│                                │
│  Past Reports                  │
│  ┌──────────────────────────┐  │
│  │ July 2026    ₹5,750     │  │
│  │ ↓ 12% vs June  [View]   │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ June 2026    ₹6,520     │  │
│  │ ↑ 8% vs May    [View]   │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ May 2026     ₹6,050     │  │
│  │                [View]   │  │
│  └──────────────────────────┘  │
│                                │
└────────────────────────────────┘
```

---

## 4. Interaction Patterns

### 4.1 Optimistic UI Pattern
- All expense CRUD shows immediate UI update
- "Syncing" indicator appears briefly
- Error state: revert change + show error toast
- Never show loading spinners for add/edit/delete (too slow-feeling)

### 4.2 Swipe Gestures (Mobile)
- Swipe left on expense: reveal delete button
- Swipe right on expense: reveal edit button (alternative to tap)
- Swipe down on bottom sheet: dismiss
- Horizontal swipe on month in expense list: navigate months

### 4.3 Toast Notifications
```
Position: Bottom center (above nav bar)
Duration: 3 seconds
Types:
- Success (green): "Expense added! ₹150"
- Error (red): "Couldn't save. Try again."
- Warning (amber): "Budget at 85%!"
- Info (blue): "Syncing..."

Undo toast (5s): "Expense deleted — Undo"
```

### 4.4 Empty States
Each screen has a custom empty state:
- **Dashboard (no expenses):** Illustration + "Add your first expense below!"
- **Expense list (no results):** "No expenses found for this filter"
- **Analytics (no data):** "Start tracking to see your spending patterns"
- **Reports (no history):** "Your first monthly report will appear here after July ends"

### 4.5 Loading States
- **Initial dashboard load:** Skeleton screens (budget card skeleton + list skeletons)
- **Adding expense:** FAB shows spinner, then success animation
- **Generating PDF:** Full-screen progress indicator with percentage
- **Infinite scroll:** Spinner at bottom of list

---

## 5. Desktop-Specific UX

On desktop (1024px+):
- Left sidebar navigation (280px fixed)
- Content area is full remaining width
- No FAB — instead, "Add Expense" button in top-right of header
- Add expense opens as a centered modal (not bottom sheet)
- Expense list is a proper table with sortable columns
- Charts are larger and more detailed
- Two-column layout for analytics (chart left, insights right)

---

## 6. Accessibility UX

### Navigation
- Full keyboard navigation support (Tab, Enter, Escape, Arrow keys)
- Skip to main content link at top of page
- Logical tab order matching visual order

### Screen Reader Support
- All buttons have descriptive aria-labels
- Charts have aria descriptions with data summary
- Dynamic content changes announced via `aria-live="polite"`
- Bottom sheet: `role="dialog"`, focus trapped while open

### Color Independence
- Budget status never communicated by color alone
  - ✅ "85% used" text + amber color + ⚠️ icon
  - ❌ Just turning card orange with no text

### Motion Preferences
- All animations disabled when `prefers-reduced-motion: reduce` is set
- Content still appears, just without animation

---

## 7. Micro-Interactions Catalog

| Interaction | Behavior |
|---|---|
| FAB hover (desktop) | Scale 1.08 + rotate 45° (+ icon becomes ×) |
| FAB tap (mobile) | Haptic feedback + ripple + sheet slides up |
| Category selection | Selected tile scales up + border glow |
| Budget card load | Amount counts up from 0 to value (600ms) |
| Progress bar | Fills from 0% to current % with spring easing |
| Expense added | Row flashes purple then settles |
| Expense deleted | Row slides left + collapses height + undo toast |
| Budget warning | Card color transitions smoothly (no flash) |
| Navigation tab change | Active icon scales up + color changes + slide transition |
| Chart tap | Tooltip scales up with spring bounce |
| Settings toggle | Smooth thumb slide animation |

---

*UI/UX Specification v1.0 — July 2026. All designs reference DESIGN.md for tokens.*
