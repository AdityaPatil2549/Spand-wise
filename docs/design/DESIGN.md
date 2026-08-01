# Design System
## SpendWise — Student Expense Tracker
**DESIGN.md** — The Single Source of Truth for All Visual Design Decisions

---

## 1. Design Philosophy

SpendWise's design is built on four pillars:

1. **Clarity Over Complexity** — Every pixel serves the student's primary goal: knowing their financial status
2. **Warmth + Intelligence** — Financial tools should feel warm and supportive, not cold and bureaucratic
3. **Motion with Purpose** — Animations confirm actions, guide attention, and create delight — never for show
4. **Thumb-First Mobile Design** — All primary actions reachable in the bottom 60% of the screen

---

## 2. Color Palette

### 2.1 Primary Brand Colors

```css
/* Core Purple — Brand identity, primary actions */
--color-primary-50:  #f5f3ff;
--color-primary-100: #ede9fe;
--color-primary-200: #ddd6fe;
--color-primary-300: #c4b5fd;
--color-primary-400: #a78bfa;
--color-primary-500: #8b5cf6;   /* PRIMARY — main brand color */
--color-primary-600: #7c3aed;   /* Primary Dark — hover states */
--color-primary-700: #6d28d9;   /* Primary Darker — pressed states */
--color-primary-800: #5b21b6;
--color-primary-900: #4c1d95;
```

### 2.2 Semantic Colors

```css
/* Success — Budget healthy, positive balance */
--color-success-50:  #f0fdf4;
--color-success-400: #4ade80;
--color-success-500: #22c55e;
--color-success-600: #16a34a;

/* Warning — Budget at 80%+ */
--color-warning-50:  #fffbeb;
--color-warning-400: #fbbf24;
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;

/* Danger — Budget exceeded */
--color-danger-50:  #fff1f2;
--color-danger-400: #f87171;
--color-danger-500: #ef4444;
--color-danger-600: #dc2626;

/* Info — Neutral information */
--color-info-500: #3b82f6;
```

### 2.3 Neutral Colors (Dark Mode Aware)

```css
/* Light Mode */
--color-surface-primary:   #ffffff;
--color-surface-secondary: #f9fafb;
--color-surface-tertiary:  #f3f4f6;
--color-surface-elevated:  #ffffff;  /* cards, modals */

--color-text-primary:   #111827;
--color-text-secondary: #6b7280;
--color-text-tertiary:  #9ca3af;
--color-text-inverse:   #ffffff;

--color-border-subtle:  #f3f4f6;
--color-border-default: #e5e7eb;
--color-border-strong:  #d1d5db;

/* Dark Mode */
--color-surface-primary-dark:   #0f0f14;
--color-surface-secondary-dark: #1a1a24;
--color-surface-tertiary-dark:  #252535;
--color-surface-elevated-dark:  #1e1e2e;

--color-text-primary-dark:   #f9fafb;
--color-text-secondary-dark: #9ca3af;
--color-text-tertiary-dark:  #6b7280;

--color-border-subtle-dark:  #252535;
--color-border-default-dark: #374151;
```

### 2.4 Category Colors
Each expense category has a distinct color used in charts and icons:

```css
--cat-food:          #f97316;  /* Orange */
--cat-transport:     #3b82f6;  /* Blue */
--cat-education:     #8b5cf6;  /* Purple */
--cat-entertainment: #ec4899;  /* Pink */
--cat-shopping:      #f59e0b;  /* Amber */
--cat-health:        #10b981;  /* Emerald */
--cat-accommodation: #6366f1;  /* Indigo */
--cat-phone:         #06b6d4;  /* Cyan */
--cat-cafe:          #a16207;  /* Yellow-Brown */
--cat-personal:      #d946ef;  /* Fuchsia */
--cat-gifts:         #e11d48;  /* Rose */
--cat-fitness:       #84cc16;  /* Lime */
--cat-travel:        #14b8a6;  /* Teal */
--cat-utilities:     #64748b;  /* Slate */
--cat-other:         #78716c;  /* Stone */
```

### 2.5 Gradient Tokens

```css
/* Hero gradient — Dashboard card background */
--gradient-hero: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%);

/* Success gradient — Budget healthy state */
--gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);

/* Warning gradient — Budget warning state */
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);

/* Danger gradient — Budget exceeded */
--gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);

/* Subtle card gradient */
--gradient-card: linear-gradient(145deg, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.04) 100%);
```

---

## 3. Typography

### 3.1 Font Families

```css
/* Primary — Display, headings, UI */
--font-primary: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace — Numbers, currency amounts */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Google Fonts Import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

```css
/* Display — Large hero numbers (remaining budget amount) */
--text-display-2xl: clamp(2.5rem, 5vw, 3.5rem);   /* 40–56px */
--text-display-xl:  clamp(2rem, 4vw, 2.5rem);      /* 32–40px */
--text-display-lg:  clamp(1.5rem, 3vw, 2rem);      /* 24–32px */

/* Headings */
--text-h1: 1.875rem;   /* 30px */
--text-h2: 1.5rem;     /* 24px */
--text-h3: 1.25rem;    /* 20px */
--text-h4: 1.125rem;   /* 18px */

/* Body */
--text-body-lg:  1rem;      /* 16px — Primary body text */
--text-body-md:  0.9375rem; /* 15px */
--text-body-sm:  0.875rem;  /* 14px — Secondary info */
--text-body-xs:  0.75rem;   /* 12px — Labels, captions */

/* Line Heights */
--leading-tight:  1.2;
--leading-snug:   1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

/* Font Weights */
--font-regular:   400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-extrabold: 800;

/* Letter Spacing */
--tracking-tight:  -0.02em;  /* Display numbers */
--tracking-normal: 0em;
--tracking-wide:   0.05em;   /* Labels, tags */
--tracking-wider:  0.1em;    /* All-caps labels */
```

### 3.3 Usage Rules

| Element | Font | Weight | Size | Usage |
|---|---|---|---|---|
| Budget Amount (hero) | Mono | 800 | display-xl | Remaining budget number |
| Page Title | Primary | 700 | h2 | Screen titles |
| Section Header | Primary | 600 | h4 | Section labels |
| Expense Amount | Mono | 600 | body-lg | Expense list amounts |
| Expense Category | Primary | 500 | body-sm | Category names in list |
| Expense Note | Primary | 400 | body-sm | Notes/descriptions |
| Chart Labels | Primary | 500 | body-xs | Chart axis labels |
| Timestamp | Primary | 400 | body-xs | "2 hours ago" |

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

```css
--space-0:   0px;
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;
--space-20:  80px;
--space-24:  96px;
```

### 4.2 Border Radius

```css
--radius-sm:   6px;   /* Small buttons, tags, badges */
--radius-md:   12px;  /* Cards, modals, input fields */
--radius-lg:   16px;  /* Large cards, bottom sheets */
--radius-xl:   24px;  /* Feature cards */
--radius-2xl:  32px;  /* Hero cards */
--radius-full: 9999px; /* Pills, FABs, avatars */
```

### 4.3 Layout Grid

```css
/* Mobile (default) */
--layout-max-width: 428px;
--layout-padding:   var(--space-4);  /* 16px */

/* Tablet */
@media (min-width: 640px) {
  --layout-max-width: 640px;
  --layout-padding:   var(--space-6);
}

/* Desktop */
@media (min-width: 1024px) {
  --layout-max-width:      1280px;
  --layout-padding:        var(--space-8);
  --layout-sidebar-width:  280px;
  --layout-content-width:  calc(100% - var(--layout-sidebar-width));
}
```

### 4.4 Z-Index Scale

```css
--z-base:       0;
--z-dropdown:   10;
--z-sticky:     20;
--z-fixed:      30;
--z-modal-bg:   40;
--z-modal:      50;
--z-toast:      60;
--z-tooltip:    70;
```

---

## 5. Shadows & Elevation

```css
/* Elevation system — 5 levels */
--shadow-sm:   0 1px 2px rgba(0,0,0,0.05);
--shadow-md:   0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06);
--shadow-lg:   0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
--shadow-xl:   0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.04);
--shadow-2xl:  0 25px 50px rgba(0,0,0,0.15);

/* Brand shadow — For primary action elements */
--shadow-brand: 0 8px 24px rgba(139,92,246,0.35);

/* Card hover shadow */
--shadow-card-hover: 0 12px 32px rgba(0,0,0,0.12);
```

---

## 6. Motion & Animation

### 6.1 Duration Tokens

```css
--duration-instant:  50ms;
--duration-fast:     150ms;
--duration-normal:   250ms;
--duration-slow:     400ms;
--duration-slower:   600ms;
```

### 6.2 Easing Functions

```css
--ease-default:     cubic-bezier(0.4, 0, 0.2, 1);   /* Standard */
--ease-decelerate:  cubic-bezier(0, 0, 0.2, 1);      /* Elements entering */
--ease-accelerate:  cubic-bezier(0.4, 0, 1, 1);      /* Elements leaving */
--ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1); /* Spring bounce */
--ease-smooth:      cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### 6.3 Standard Transitions

```css
/* All interactive elements */
.interactive {
  transition: all var(--duration-fast) var(--ease-default);
}

/* Cards on hover */
.card-hover {
  transition: transform var(--duration-normal) var(--ease-spring),
              box-shadow var(--duration-normal) var(--ease-default);
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

/* FAB tap ripple */
.fab-tap {
  animation: fabRipple var(--duration-slow) var(--ease-decelerate);
}
```

### 6.4 Keyframe Animations

```css
/* Expense added — success flash */
@keyframes expenseAdded {
  0%   { transform: scale(1); background: var(--color-primary-100); }
  50%  { transform: scale(1.02); }
  100% { transform: scale(1); background: transparent; }
}

/* Budget progress bar fill */
@keyframes budgetFill {
  from { width: 0%; }
  to   { width: var(--budget-percent); }
}

/* Slide up — Bottom sheet */
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

/* Fade in — Page transitions */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Number count up — Dashboard amounts */
@keyframes countUp {
  /* Implemented via JavaScript (GSAP or custom) */
}

/* Notification pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}
```

---

## 7. Icon System

### 7.1 Icon Library
**Primary:** Lucide React (consistent, open-source, clean strokes)  
**Supplementary:** Custom SVG icons for categories and brand

### 7.2 Icon Sizes

```css
--icon-xs:  12px;  /* Badge indicators */
--icon-sm:  16px;  /* Inline text icons */
--icon-md:  20px;  /* List items, buttons */
--icon-lg:  24px;  /* Navigation, headers */
--icon-xl:  32px;  /* Empty states, feature icons */
--icon-2xl: 48px;  /* Illustrations */
```

### 7.3 Category Icons (Emoji + Icon Fallback)

| Category | Emoji | Lucide Icon | Color |
|---|---|---|---|
| Food & Dining | 🍔 | `Utensils` | `--cat-food` |
| Transport | 🚌 | `Bus` | `--cat-transport` |
| Education | 📚 | `BookOpen` | `--cat-education` |
| Entertainment | 🎮 | `Gamepad2` | `--cat-entertainment` |
| Shopping | 🛍️ | `ShoppingBag` | `--cat-shopping` |
| Health | 💊 | `Heart` | `--cat-health` |
| Accommodation | 🏠 | `Home` | `--cat-accommodation` |
| Phone & Internet | 📱 | `Smartphone` | `--cat-phone` |
| Café & Snacks | ☕ | `Coffee` | `--cat-cafe` |
| Personal Care | 💇 | `Sparkles` | `--cat-personal` |
| Gifts | 🎁 | `Gift` | `--cat-gifts` |
| Fitness | 🏋️ | `Dumbbell` | `--cat-fitness` |
| Travel | ✈️ | `Plane` | `--cat-travel` |
| Utilities | 🔧 | `Zap` | `--cat-utilities` |
| Other | 📦 | `MoreHorizontal` | `--cat-other` |

---

## 8. Component Specifications

### 8.1 Expense FAB (Floating Action Button)

```css
.fab {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: var(--gradient-hero);
  box-shadow: var(--shadow-brand);
  position: fixed;
  bottom: calc(72px + var(--space-4)); /* Above nav bar */
  right: var(--space-4);
  z-index: var(--z-fixed);
  transition: all var(--duration-normal) var(--ease-spring);
}

.fab:hover {
  transform: scale(1.08) rotate(45deg);
  box-shadow: 0 12px 32px rgba(139,92,246,0.5);
}

.fab:active {
  transform: scale(0.95);
}
```

### 8.2 Budget Card (Dashboard Hero)

```css
.budget-card {
  background: var(--gradient-hero);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  color: white;
  position: relative;
  overflow: hidden;
}

/* State: Warning (80%+) */
.budget-card--warning {
  background: var(--gradient-warning);
}

/* State: Exceeded (100%+) */
.budget-card--exceeded {
  background: var(--gradient-danger);
}
```

### 8.3 Expense List Item

```css
.expense-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
  transition: all var(--duration-fast) var(--ease-default);
}

.expense-item:hover {
  background: var(--color-surface-secondary);
  border-color: var(--color-border-default);
}

/* Category icon container */
.expense-item__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
```

### 8.4 Bottom Sheet (Expense Entry)

```css
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface-primary);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-6);
  z-index: var(--z-modal);
  animation: slideUp var(--duration-normal) var(--ease-decelerate);
  max-height: 90vh;
  overflow-y: auto;
}
```

---

## 9. Responsive Design Breakpoints

```css
/* Mobile First Approach */
/* xs — Very small phones */
@media (min-width: 360px) { }

/* sm — Normal phones */
@media (min-width: 428px) { }

/* md — Large phones / small tablets */
@media (min-width: 640px) { }

/* lg — Tablets, small laptops */
@media (min-width: 1024px) {
  /* Desktop layout: sidebar + content */
}

/* xl — Standard laptops */
@media (min-width: 1280px) { }

/* 2xl — Large monitors */
@media (min-width: 1536px) { }
```

---

## 10. Accessibility Standards

### 10.1 Color Contrast Requirements (WCAG 2.1 AA)
- Normal text: minimum 4.5:1 contrast ratio
- Large text (18px+ or 14px+ bold): minimum 3:1
- UI components: minimum 3:1

### 10.2 Touch Target Sizes
- Minimum: 44×44px (Apple HIG + WCAG 2.5.5)
- Recommended: 48×48px
- Critical FAB: 60×60px

### 10.3 Focus Indicators

```css
/* Visible focus ring for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### 10.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface-primary:   var(--color-surface-primary-dark);
    --color-surface-secondary: var(--color-surface-secondary-dark);
    --color-surface-tertiary:  var(--color-surface-tertiary-dark);
    --color-text-primary:   var(--color-text-primary-dark);
    --color-text-secondary: var(--color-text-secondary-dark);
    --color-border-default: var(--color-border-default-dark);
    --color-border-subtle:  var(--color-border-subtle-dark);
  }
}

/* Manual override via data attribute */
[data-theme="dark"] { /* same overrides */ }
[data-theme="light"] { /* force light values */ }
```

---

## 12. Design Tokens File (tokens.css)

All tokens are defined in `/src/styles/tokens.css` and imported globally. Component files should **only** use token variables — no hardcoded colors, sizes, or durations.

**Rule:** If you're writing a hex color or pixel value directly in a component, it's wrong. Use a token.

---

*Design System maintained by Design Team. This document is the source of truth. Any deviations require a design review. Last updated: July 2026.*
