# UI Prompts
## SpendWise — AI Development Prompt Library

Screen-by-screen UI generation prompts.

---

## UI-001: Login Screen

```
Design the SpendWise login screen (src/app/(auth)/login/page.tsx).

Visual Style:
- Dark background: var(--surface-base) (#0F0A1E)
- Center-aligned content, vertically centered
- SpendWise logo at top (text logo: "SpendWise" in gradient purple text, 32px bold)
- Tagline: "Track your money. Own your future." in secondary text color

Primary CTA:
- "Continue with Google" button (full-width, 52px height, white bg, Google icon, dark text)
- OR divider (---, "or", ---)
- Email input field
- Password input field  
- "Sign In" button (full-width, bg-primary-500)
- "Forgot password?" text link (right-aligned, small)

Bottom:
- "New here? Create Account" text with "Create Account" as a clickable link

Privacy note at very bottom:
- "🔒 Your data is private and encrypted" in xs text, secondary color

Animations:
- Fade in entire form on mount (Framer Motion, opacity 0→1, y: 20px→0, 400ms)
- Button press: scale 0.97 on active

Do NOT use any hardcoded colors. Reference the design tokens only.
```

---

## UI-002: Dashboard Screen

```
Design the SpendWise dashboard (src/app/(app)/dashboard/page.tsx).

Layout (mobile-first, max-width: 640px centered):
1. Top bar: Greeting + Notification Bell icon (right)
2. BudgetCard (full-width, glassmorphism in dark mode)
3. Quick Stats Row: 3 equal mini-cards:
   - "Today" with today's total spent
   - "Avg/Day" with average daily spend this month
   - "Days Left" countdown to month end
4. [If budget > 80%]: Show BudgetWarningBanner (amber, with advice text)
5. Insights Section: "Smart Insights" header + 1 InsightCard (rule-based)
6. Recent Expenses: "Recent Expenses" header + "See All" link (right) + list of last 5 expenses
7. Empty state for recent: IllustrationWithCTA component

Spacing: p-4 between sections on mobile, p-6 on tablet+
Animations: Each section fades in with staggered delay (50ms apart) using Framer Motion
```

---

## UI-003: Onboarding Screen

```
Design the SpendWise onboarding budget setup screen.
Location: src/app/(auth)/onboarding/page.tsx

This is a single-step onboarding screen. Clean, focused, no distractions.

Visual:
- Full screen, centered, dark background
- SpendWise logo mark (small, top)
- Progress indicator: "Step 1 of 1" (or just skip this for simplicity)
- Large headline: "What's your monthly allowance?" (text-2xl, bold, white)
- Subtext: "This helps us warn you before you run out of money." (text-sm, secondary)

Budget Input:
- Large centered display showing "₹ [amount]"
- "₹" prefix is static, the number is editable
- Amount displayed in a very large font (text-4xl, JetBrains Mono)
- Tap to open a number input or increment/decrement

Quick Pick Chips (horizontal row):
- ₹5,000 | ₹8,000 | ₹10,000 | ₹15,000 | ₹20,000
- Tapping a chip fills the amount
- Selected chip has purple border/bg

CTA: "Let's Start Tracking →" button (full-width, primary color)
- Disabled when amount = 0
- Shows loading spinner on submit

Bottom note: "You can change this anytime in Settings."
```

---

## UI-004: Analytics Screen

```
Design the SpendWise analytics screen.
Location: src/app/(app)/analytics/page.tsx

Header:
- "Analytics" title
- Month selector (current month shown, tap opens MonthPicker modal)

Content (scrollable):
1. Summary Row: "₹{spent} spent this month" large text, "of ₹{budget}" secondary

2. Donut Chart Section:
   - CategoryDonutChart component (full width, 240px height)
   - Center text: "₹{totalSpent}"

3. Category Breakdown List:
   - Title: "Where your money went"
   - Each row: emoji circle + name + amount + percent bar

4. Insights Section:
   - Title: "Smart Insights"
   - 2-4 InsightCard components (scrollable horizontal or vertical stack)

5. Spending Trend (v1.1): Placeholder card with "Coming soon" if not yet implemented

Responsive behavior: On desktop, chart and category list are side-by-side (grid-cols-2)
Empty state: "Start tracking expenses to unlock analytics." with illustration
```
