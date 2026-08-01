# Screen Specifications
## SpendWise — Student Expense Tracker

Detailed specifications for each major screen, defining required elements, behaviors, and states.

---

## SPEC-020: Dashboard

### Layout
- **Header:** Greeting text ("Good morning, Rahul 👋") + notification bell icon
- **Hero Card:** Full-width card (rounded-2xl, glassmorphism effect)
  - Row 1: "This Month's Budget" label + Month name (right-aligned)
  - Row 2: Remaining amount (large, bold, 36px)
  - Row 3: "₹{spent} spent of ₹{budget}" subtext
  - Row 4: Progress bar (full width, rounded, animated fill)
  - Row 5: Budget status chip ("On Track ✅" / "Caution ⚠️" / "Over Budget 🛑")
- **Quick Stats Row:** 3 stat mini-cards (Spent Today, Avg Daily, Days Left)
- **Insight Card:** Single card with contextual insight (rule-based). Dismissable.
- **Recent Expenses:** Label "Recent Expenses" + "See All" link + list of 5 most recent expenses
- **FAB:** Position: `fixed bottom-20 right-4`. Size: 56×56px. Icon: `+`. Color: `--color-primary`.

### States
| State | Display |
|:---|:---|
| New user, no budget set | Redirect to onboarding |
| Budget set, no expenses | Show "0 spent" dashboard + Add First Expense empty state for recent list |
| Normal | Full dashboard as above |
| Budget exceeded | Hero card turns red; balance shows negative; pulsing red ring |
| Loading | Skeleton screens for all cards |
| Offline | Offline banner at top; shows cached data |

---

## SPEC-021: Add Expense Bottom Sheet

### Trigger
Opens via FAB or any "Add Expense" button. Slides up from bottom.

### Layout
- **Sheet Handle** (top center, decorative)
- **Title:** "Add Expense"
- **Amount Input:**
  - Full-width, centered, 48px font size
  - Prefix: "₹" symbol (non-editable)
  - Placeholder: "0"
  - Type: `number`, `inputmode="decimal"`
  - Auto-focuses and opens numeric keyboard on mount
- **Category Section:**
  - Label: "Category"
  - Grid: 4 columns, 4 rows (scrollable if needed)
  - Each cell: emoji (28px) + label (10px), tap selects with highlight ring
  - Selected state: background color = category color (20% opacity) + border
- **Date Row:**
  - Icon: 📅
  - Default: "Today" (formatted as "Mon, 21 Jul")
  - Tap: opens native date picker
- **Note Row:**
  - Icon: 📝
  - Placeholder: "Add a note (optional)"
  - Tap: opens keyboard for text input
- **CTA Button:**
  - Label: "Add Expense" (with amount shown: "Add Expense · ₹150")
  - Disabled state: when amount is 0 or empty
  - Color: `--color-primary`
  - Full width, 52px height, rounded-xl

### Validation
- Amount must be > 0 and ≤ 1,000,000
- Category must be selected (highlighted)
- Note is always optional

---

## SPEC-022: Expense List Item

### Layout (Single Row)
```
[Category Emoji (24px)] [Note/Default Label] [Date string]
                        [Category Name]      [Amount (bold, negative color)]
```

### Interaction
- **Tap:** Opens Edit Expense sheet
- **Long Press (Mobile):** Shows context menu (Edit / Delete)
- **Swipe Left (Mobile):** Reveals red Delete button

### Amount Formatting
- Always prefixed with `₹` and a minus sign (e.g., `−₹150`)
- Negative/expense color: `--color-expense` (red tone)
- For income entries (v2.0): `+₹500`, positive color: `--color-income` (green)
