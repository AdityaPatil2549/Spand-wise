# Accessibility (A11y) Requirements
## SpendWise — Student Expense Tracker

SpendWise must be usable by all students, including those with visual, motor, or cognitive impairments. We target WCAG 2.1 Level AA compliance.

---

## 1. Visual Accessibility

### 1.1 Color Contrast
*   **Rule:** All text must have a minimum contrast ratio of 4.5:1 against its background.
*   **Large Text:** Text larger than 18pt (or 14pt bold) needs a 3.0:1 ratio.
*   **Brand Colors:** Ensure the primary purple (`#8B5CF6`) is used with white text to meet contrast requirements.
*   **Validation:** Use axe DevTools or Figma contrast checkers before shipping any UI.

### 1.2 Color Independence
*   **Rule:** Never use color alone to convey meaning.
*   *Application:* When the budget is exceeded, the card turns red, BUT it must also say "Budget Exceeded" and show a ⚠️ warning icon.
*   *Application:* Chart segments must have corresponding text labels (Category + Amount + Percent), not just color-coded legends.

### 1.3 Dark Mode
*   **Requirement:** The app must fully support a dark theme.
*   **Why:** Reduces eye strain (especially important for students using the app late at night) and helps users with light sensitivity.

---

## 2. Motor Accessibility

### 2.1 Touch Targets
*   **Rule:** All interactive elements (buttons, links, FAB) must have a minimum touch target size of 44x44 CSS pixels.
*   *Application:* The category picker grid items must have sufficient padding. Even if the visual icon is small, the invisible clickable area must be at least 44x44px.

### 2.2 Keyboard Navigation
*   **Requirement:** The entire app must be navigable using only a keyboard (Tab, Shift+Tab, Enter, Space, Arrows).
*   **Focus Ring:** Never use `outline: none` without providing a custom, highly visible focus state (e.g., a 2px solid ring matching the primary brand color).
*   **Focus Traps:** When the "Add Expense" bottom sheet or a modal opens, keyboard focus must be trapped inside it until dismissed.

---

## 3. Cognitive Accessibility

### 3.1 Clear Copywriting
*   **Rule:** Use plain, simple language. Avoid financial jargon.
*   *Good:* "Money left this month"
*   *Bad:* "Remaining Liquid Allocation"

### 3.2 Error Prevention and Recovery
*   **Rule:** Prevent errors before they happen, and make them easy to fix.
*   *Application:* Disable the "Add Expense" button until a valid amount (>0) is entered.
*   *Application:* Use the "Undo" toast (5 seconds) for deletions instead of a friction-heavy confirmation dialog, providing a safety net for accidental taps.

---

## 4. Screen Reader Support (ARIA)

### 4.1 Meaningful Labels
*   **Rule:** All icons that perform an action MUST have an `aria-label`.
*   *Application:* The FAB `+` button must have `aria-label="Add new expense"`.
*   *Application:* The swipe-to-delete trash icon must have `aria-label="Delete this expense"`.

### 4.2 Dynamic Updates
*   **Rule:** Use `aria-live` regions to announce changes that happen without a page reload.
*   *Application:* When an expense is added and the list updates optimistically, an `aria-live="polite"` region should announce "Expense of ₹150 added to Food".
*   *Application:* Form validation errors must be announced immediately.

### 4.3 Semantic HTML
*   **Rule:** Use native HTML elements (`<button>`, `<nav>`, `<main>`, `<header>`) instead of `<div>` with click handlers whenever possible. Native elements bring built-in accessibility features for free.
