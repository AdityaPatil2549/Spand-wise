# Dark Mode Design
## SpendWise — Student Expense Tracker

---

## 1. Dark Mode Strategy

SpendWise offers **three theme options**: Light, Dark, and System (follows OS preference).

**Default:** Dark mode is the *recommended and primary* design. The app is designed dark-first, then adapted for light mode.

**Rationale:** 
- 75%+ of Gen Z students prefer dark mode
- Students use the app at night (tracking dinner expenses, reviewing day)
- Dark purple palette is the core brand identity

---

## 2. Implementation Approach

SpendWise uses **Tailwind CSS `dark:` variants** combined with a class-based theme toggle (not media-query-only).

```typescript
// src/store/ui.slice.ts
type Theme = 'light' | 'dark' | 'system';

// On theme change:
// 1. Store preference in localStorage
// 2. Apply 'dark' class to <html> element
// 3. Zustand state updates to reflect current theme
```

```tsx
// tailwind.config.ts
module.exports = {
  darkMode: 'class', // Uses .dark class on <html>
  // ...
}
```

---

## 3. Dark Mode Color Tokens

| Token | Light Value | Dark Value |
|:---|:---|:---|
| `bg-surface-base` | `#F8F7FF` | `#0F0A1E` |
| `bg-surface-primary` | `#FFFFFF` | `#1A1040` |
| `bg-surface-secondary` | `#F3F4F6` | `#2D1F6E` |
| `text-primary` | `#111827` | `#F9FAFB` |
| `text-secondary` | `#6B7280` | `#9CA3AF` |
| `border-primary` | `#E5E7EB` | `rgba(139,92,246,0.2)` |

---

## 4. Dark Mode Specific Design Rules

### Budget Hero Card (Dark Mode)
```
Background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)
Text: White (#FFFFFF) for all text on the hero card
Progress bar: rgba(255,255,255,0.3) track, white fill
```

### Cards in Dark Mode
```
Background: #1A1040 with 1px border rgba(139,92,246,0.2)
Box shadow: 0 4px 24px rgba(0,0,0,0.4)
```

### Glassmorphism (Dark Mode Only)
Certain premium cards use a glass effect in dark mode:
```css
background: rgba(139, 92, 246, 0.1);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(139, 92, 246, 0.2);
```

---

## 5. Components That Require Special Dark Mode Treatment

| Component | Dark Mode Adaptation |
|:---|:---|
| Category emoji grid | Dark background cells: `bg-surface-secondary` |
| Progress bar track | `bg-white/20` (not gray) |
| Input fields | `bg-surface-secondary border-border-primary` |
| Toast notifications | Explicit `dark:bg-gray-800 dark:text-white` |
| Charts (Recharts) | Override `stroke` and `fill` colors via props |
| Skeleton screens | `dark:bg-surface-secondary dark:after:from-surface-primary` |

---

## 6. System Theme Handling

```typescript
const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Listen for OS theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (currentTheme === 'system') {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});
```

---

## 7. Theme Persistence

```typescript
// On app init
const savedTheme = localStorage.getItem('spendwise-theme') as Theme ?? 'dark';
applyTheme(savedTheme === 'system' ? getSystemTheme() : savedTheme);
```

Theme preference is stored in `localStorage` only (not Firestore), as it's a device-specific preference.
