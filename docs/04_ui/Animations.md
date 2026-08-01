# Animation & Motion System
## SpendWise — Student Expense Tracker

---

## 1. Animation Philosophy

- **Purpose over decoration:** Every animation must serve a function (guide attention, communicate state change, provide feedback).
- **Subtlety:** Animations should be noticed when absent, not when present.
- **Performance:** Never animate expensive properties (layout, paint). Stick to `transform` and `opacity` for 60fps animations.
- **Respect Preferences:** Check `prefers-reduced-motion` and disable non-essential animations for users who need it.

---

## 2. Core Animation Library: Framer Motion

All complex animations use **Framer Motion** (`framer-motion`).

```tsx
// Standard entry animation for new list items
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
```

Simple hover/focus effects use Tailwind CSS transitions.

---

## 3. Animation Catalog

### 3.1 Page & Screen Transitions

| Transition | Motion | Duration | Easing |
|:---|:---|:---|:---|
| Tab switch | No animation (instant) | 0ms | N/A |
| Bottom sheet open | `y: 100% → 0%` | 250ms | `easeOut` |
| Bottom sheet close | `y: 0% → 100%` | 200ms | `easeIn` |
| Modal open | `opacity: 0 → 1, scale: 0.95 → 1` | 200ms | `easeOut` |
| Toast appear | `y: 20px → 0px, opacity: 0 → 1` | 200ms | `easeOut` |
| Toast dismiss | `y: 0 → -20px, opacity: 1 → 0` | 150ms | `easeIn` |

### 3.2 Data & Content

| Animation | Motion | Trigger |
|:---|:---|:---|
| Budget progress bar fill | `width: 0% → {value}%` | On mount / value change |
| Skeleton shimmer | Gradient sweep left → right | While loading |
| Expense item enter | `opacity: 0, x: -12px → opacity: 1, x: 0` | New item added to list |
| Expense item exit | `opacity: 1, x: 0 → opacity: 0, x: 12px` | Item deleted |
| Donut chart draw | SVG stroke-dashoffset animation | On mount |

### 3.3 Interaction Feedback

| Interaction | Animation |
|:---|:---|
| Button press | `scale: 1 → 0.97` (transform, 100ms) |
| FAB tap | `scale: 1 → 0.92, shadow spreads` (150ms) |
| Category chip select | Background color fade in (200ms) |
| Swipe reveal (delete) | Follows finger, snaps at threshold |

### 3.4 Celebration Animations

| Event | Animation |
|:---|:---|
| Month ended under budget | Confetti burst (react-confetti, 3 seconds) |
| Badge earned | Badge bounces in from below (`y: 40px → 0`) |
| 7-day streak | Fire icon pulses + glows |
| First expense ever | Subtle radial light burst behind the expense item |

---

## 4. Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**In Framer Motion:**
```tsx
const prefersReducedMotion = useReducedMotion();
const transition = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.25, ease: 'easeOut' };
```

---

## 5. Haptic Feedback (Mobile)

Use the Vibration API for key actions on Android:

```javascript
// Success (expense added)
navigator.vibrate([10]); // 10ms light tap

// Warning (budget exceeded notification)
navigator.vibrate([50, 30, 50]); // two taps

// Error
navigator.vibrate([100]); // 100ms medium buzz
```

Always check `'vibrate' in navigator` before calling.
