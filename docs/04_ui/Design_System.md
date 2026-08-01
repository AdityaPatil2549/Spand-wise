# Comprehensive Design System & Tokens
## SpendWise — Student Expense Tracker

---

## 1. Core Principles
- **Vibrant yet Clean:** Rely on a strong primary color (Electric Violet) while keeping backgrounds neutral and surfaces layered.
- **Glassmorphism Hints:** Use subtle translucency for bottom sheets and overlays to maintain contextual awareness.
- **Touch Targets First:** Minimum interactive area is 44x44px. All buttons and chips respect this bounding box.

---

## 2. Color Palette (HSL & HEX)
All colors must be converted to HSL variables in `src/styles/tokens.css` for Next.js/Tailwind integration to support smooth dark mode transitions.

### 2.1 Brand Primary (Electric Violet)
Used for primary actions, the remaining budget hero state, and active navigation states.
- **50:** `#f5f3ff` (hsl(260, 100%, 98%))
- **100:** `#ede9fe` (hsl(261, 80%, 95%))
- **300:** `#c4b5fd` (hsl(260, 96%, 85%))
- **500 (Base):** `#8b5cf6` (hsl(258, 90%, 66%))
- **700:** `#6d28d9` (hsl(263, 70%, 50%))
- **900:** `#4c1d95` (hsl(264, 67%, 35%))

### 2.2 Semantic Colors
Used specifically for financial states and system feedback.
- **Success (Green):** `#10b981` (hsl(160, 84%, 39%)) — Used for income (future), toast success.
- **Warning (Amber):** `#f59e0b` (hsl(38, 92%, 50%)) — Used when budget is 80%+ consumed.
- **Critical (Red):** `#ef4444` (hsl(0, 84%, 60%)) — Used when budget is exceeded, destructive actions (Delete Expense).

### 2.3 Surface & Backgrounds (Light Mode)
- **Background:** `#f8fafc` (Slate 50) — Base app background.
- **Surface Primary:** `#ffffff` (White) — Cards, bottom sheets.
- **Surface Secondary:** `#f1f5f9` (Slate 100) — Hover states, disabled inputs.

### 2.4 Surface & Backgrounds (Dark Mode)
- **Background:** `#0f172a` (Slate 900) — Base app background.
- **Surface Primary:** `#1e293b` (Slate 800) — Cards, bottom sheets.
- **Surface Secondary:** `#334155` (Slate 700) — Hover states, borders.

---

## 3. Typography Scale (Inter)
We use Google's `Inter` font for maximum legibility of numbers. The configuration is mathematically scaled.

| Token | Size (rem) | Size (px) | Line Height | Weight | Usage |
|:---|:---|:---|:---|:---|:---|
| `text-xs` | 0.75rem | 12px | 1rem | 400 | Timestamps, microcopy |
| `text-sm` | 0.875rem | 14px | 1.25rem | 400 | Secondary text, category names |
| `text-base` | 1rem | 16px | 1.5rem | 400/500 | Body text, input fields |
| `text-lg` | 1.125rem | 18px | 1.75rem | 600 | Card titles, list headers |
| `text-2xl` | 1.5rem | 24px | 2rem | 700 | Dashboard main numbers |
| `text-4xl` | 2.25rem | 36px | 2.5rem | 800 | Expense input hero number |

---

## 4. Elevation & Shadows (Z-Index Scale)

### 4.1 Z-Index Architecture
- `z-0`: Base page content
- `z-10`: Sticky headers / Date sticky group headers
- `z-20`: Bottom Navigation Bar
- `z-30`: Floating Action Button (FAB)
- `z-40`: Bottom Sheet Overlay / Backdrop
- `z-50`: Bottom Sheet Container / Modals
- `z-100`: Toast Notifications

### 4.2 Box Shadows
- **Shadow-Sm:** `0 1px 2px 0 rgb(0 0 0 / 0.05)` — Interactive cards resting state.
- **Shadow-Md:** `0 4px 6px -1px rgb(0 0 0 / 0.1)` — Raised cards, active states.
- **Shadow-Lg:** `0 10px 15px -3px rgb(0 0 0 / 0.1)` — Bottom sheet container, modals.
- **Shadow-FAB:** `0 8px 16px -4px hsl(258, 90%, 66% / 0.4)` — Purple glow for the primary FAB.

---

## 5. Spacing System (8px Grid)
All padding and margins strictly follow the Tailwind 4px multiplier, optimized for an 8px base rhythm.
- `2` (8px): Inside small components (chip padding).
- `4` (16px): Standard container padding (mobile edge padding).
- `6` (24px): Section gaps, large component internal padding.
- `8` (32px): Major layout breaks (e.g., between Hero card and Expense list).

---

## 6. Animation Physics (Framer Motion)
Animations must feel responsive, not sluggish. 

### 6.1 Bottom Sheet Slide-Up
- **Type:** Spring
- **Stiffness:** 300
- **Damping:** 30
- **Mass:** 0.8
*Result:* Fast slide up with a barely perceptible bounce at the top to feel "alive".

### 6.2 FAB Tap State
- **WhileTap:** `scale: 0.92`
- **Transition:** `duration: 0.1`

### 6.3 Hero Number Count-Up (Budget)
- When dashboard loads, the remaining budget must count up from ₹0 to the actual value over `0.8` seconds using an `easeOut` tween.

---
*Document Status: FINAL*
