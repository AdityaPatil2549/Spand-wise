# Typography System
## SpendWise — Student Expense Tracker

---

## 1. Font Selection

### Primary Font: Inter
- **Source:** Google Fonts (`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap`)
- **Rationale:** Industry-standard UI font. Excellent legibility at small sizes. Works brilliantly for numbers. Free.
- **Usage:** All UI text — headings, body, labels, buttons.

### Monospace Font: JetBrains Mono
- **Source:** Google Fonts (`family=JetBrains+Mono:wght@500`)
- **Usage:** Currency amounts (₹150.00), expense IDs, timestamps in reports.
- **Rationale:** Monospace ensures digits align perfectly in tables and charts; improves scannability of financial data.

---

## 2. Type Scale

All sizes use `rem` units. Base: `1rem = 16px`.

| Token | Size | Weight | Line Height | Usage |
|:---|:---|:---|:---|:---|
| `--text-xs` | 0.75rem (12px) | 400 | 1.4 | Captions, timestamps, tags |
| `--text-sm` | 0.875rem (14px) | 400 | 1.5 | Labels, input helper text, secondary info |
| `--text-base` | 1rem (16px) | 400 | 1.6 | Body text, list items |
| `--text-lg` | 1.125rem (18px) | 500 | 1.5 | Section headings, card titles |
| `--text-xl` | 1.25rem (20px) | 600 | 1.4 | Tab labels, modal titles |
| `--text-2xl` | 1.5rem (24px) | 700 | 1.3 | Screen headings |
| `--text-3xl` | 1.875rem (30px) | 700 | 1.2 | Dashboard remaining budget |
| `--text-4xl` | 2.25rem (36px) | 800 | 1.1 | Hero amounts, onboarding headline |

---

## 3. Font Weight Guide

| Weight | Tailwind Class | Usage |
|:---|:---|:---|
| 400 (Regular) | `font-normal` | Body text, descriptions |
| 500 (Medium) | `font-medium` | Labels, small buttons, secondary info |
| 600 (Semibold) | `font-semibold` | Category names, card subtitles |
| 700 (Bold) | `font-bold` | Headings, primary amounts |
| 800 (ExtraBold) | `font-extrabold` | Hero amount, "Remaining Budget" number |

---

## 4. Amount Display Rules

Currency amounts follow special formatting rules for maximum scannability.

| Amount | Display | Font |
|:---|:---|:---|
| ₹10,000 (whole rupees) | `₹10,000` | JetBrains Mono, Bold |
| ₹150.50 (with paise) | `₹150.50` | JetBrains Mono, Bold |
| ₹1,00,000 (lakh) | `₹1,00,000` | JetBrains Mono, Bold |
| −₹150 (expense) | `−₹150` | JetBrains Mono, color: `--color-expense` |
| +₹2,000 (income) | `+₹2,000` | JetBrains Mono, color: `--color-income` |

**Indian Number Formatting:**
```javascript
// Correct: ₹1,00,000 (Indian lakh system)
// Incorrect: ₹100,000 (Western million system)
const formatted = amount.toLocaleString('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});
```

---

## 5. Responsive Typography

| Breakpoint | Base Font Size | Heading Adjustment |
|:---|:---|:---|
| Mobile (< 640px) | 16px | Scale = 1.0x |
| Tablet (640px – 1024px) | 16px | Scale = 1.0x |
| Desktop (> 1024px) | 16px | `--text-4xl` increases to 2.5rem |

Typography does not change dramatically between breakpoints — the layout reflows, not the type scale.
