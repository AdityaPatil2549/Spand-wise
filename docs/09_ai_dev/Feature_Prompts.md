# Feature Prompts
## SpendWise — AI Development Prompt Library

Use these prompts for feature implementation with AI coding assistants.

---

## FP-001: Add Expense Bottom Sheet

```
Implement the "Add Expense" bottom sheet for SpendWise.

Context:
- Component location: src/components/expense/AddExpenseSheet.tsx
- This is a Framer Motion bottom sheet that slides up from bottom when isOpen=true
- Uses the UISlice from Zustand: isAddExpenseOpen, closeAddExpense
- On submit, calls addExpense() from src/lib/expenses/addExpense.ts
- Shows a success toast on completion: "₹{amount} added to {categoryName}"
- Uses optimistic UI: updates the store immediately, then writes to Firestore

Required UI elements:
1. Drag handle at top
2. Amount input (large, auto-focused, ₹ prefix, numeric keyboard)
3. Category grid (4 columns, 17 preset categories + custom ones from store)
4. Date picker row (defaults to today, shows friendly format)
5. Note input (optional text)
6. "Add Expense" button (disabled when amount=0, shows amount in label)

Constraints:
- All Tailwind classes must use tokens from src/styles/tokens.css
- TypeScript strict mode — all props and return types explicit
- Follow AGENTS.md naming conventions
- No hardcoded colors; use category.color via inline style for the selected category highlight
```

---

## FP-002: Dashboard Budget Hero Card

```
Create the BudgetCard component for the SpendWise dashboard.

Location: src/components/budget/BudgetCard.tsx

Props: { budget: BudgetDocument | null; isLoading: boolean; }

Display requirements:
1. When isLoading=true: Show skeleton (use the Skeleton component from src/components/ui/)
2. When budget=null: Show "Set up your budget" CTA
3. When budget exists: Show full card with:
   - "This Month" label + current month name (e.g., "July 2026")
   - Remaining budget amount (large, bold, JetBrains Mono font)
   - "₹{spent} of ₹{budget} used" subtext
   - BudgetProgressBar component (status: 'safe' | 'warning' | 'danger' based on percentage)
   - Status chip ("On Track ✅" / "Watch it ⚠️" / "Exceeded 🛑")

Styling: 
- Background: var(--gradient-hero) in dark mode, clean white card in light mode
- Dark mode text: always white
- Glassmorphism variant in dark mode
- Fully responsive (p-4 mobile, p-6 desktop)
```

---

## FP-003: Analytics Donut Chart

```
Implement the CategoryDonutChart component using Recharts.

Location: src/components/analytics/CategoryDonutChart.tsx

Props: { categoryBreakdown: BudgetDocument['categoryBreakdown']; totalSpent: number; }

Requirements:
1. Use Recharts PieChart with innerRadius to create a donut effect
2. Center text shows totalSpent formatted as ₹ (Indian number format)
3. Each slice color = category.color from the data
4. Animate on mount (Recharts has built-in animation)
5. On slice click/tap: call onCategorySelect(categoryId) prop
6. Below the chart: sorted list of categories with:
   - Emoji + Name
   - Amount (right-aligned, bold)
   - Percent (small, secondary color)
   - Horizontal progress bar (width = category percent of total)
7. No data state: Show "No expenses this month" centered in the donut

Import Recharts with dynamic import (no SSR):
const { PieChart, Pie, Cell, Tooltip } = await import('recharts');
```

---

## FP-004: Expense List with Swipe-to-Delete

```
Implement the ExpenseList component for the /app/expenses page.

Location: src/components/expense/ExpenseList.tsx

Data source: useExpensesStore() from Zustand (real-time from Firestore listener)

Features to implement:
1. Group expenses by date (e.g., "Today", "Yesterday", "20 Jul")
2. Each group shows a date header + list of ExpenseListItem components
3. Each ExpenseListItem:
   - Left: Category emoji in a colored circle (category color at 20% opacity)
   - Middle: Note (or "categoryName" if no note) + formatted date
   - Right: Amount (−₹150, in red/expense color)
   - Tap anywhere: opens EditExpenseSheet with expense data
   - Swipe left (on mobile): reveals Delete button (red, Trash2 icon)
4. Implement infinite scroll: show 100 items, "Load more" on scroll to bottom
5. Empty state: use EmptyState component with "No expenses yet" copy
6. Filter bar above list: category chips (horizontal scroll, tap to filter)
7. Search bar: text input that filters by note text

Performance: Virtualize the list using a simple windowed approach if >50 items.
```
