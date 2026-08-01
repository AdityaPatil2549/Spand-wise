# Spacing System
## SpendWise — Student Expense Tracker

---

## 1. Base Unit

**Base unit: 4px**. All spacing values are multiples of 4px for visual harmony and predictability.

SpendWise uses Tailwind CSS's default spacing scale, which is built on 4px increments. No custom spacing values should be defined outside of this scale unless absolutely necessary.

---

## 2. Spacing Scale Reference

| Tailwind Token | Size (px) | Size (rem) | Usage |
|:---|:---|:---|:---|
| `space-0` | 0px | 0rem | No spacing |
| `space-1` | 4px | 0.25rem | Micro gaps (icon-to-label, inline elements) |
| `space-2` | 8px | 0.5rem | Small gaps within components |
| `space-3` | 12px | 0.75rem | Tight component padding |
| `space-4` | 16px | 1rem | **Standard component padding (mobile)** |
| `space-5` | 20px | 1.25rem | Medium gaps between related elements |
| `space-6` | 24px | 1.5rem | **Standard card padding** |
| `space-8` | 32px | 2rem | Large section gaps |
| `space-10` | 40px | 2.5rem | Major section separations |
| `space-12` | 48px | 3rem | Hero section padding |
| `space-16` | 64px | 4rem | Extra-large separations |
| `space-20` | 80px | 5rem | Bottom nav bar height buffer |
| `space-24` | 96px | 6rem | FAB area clearance |

---

## 3. Component Spacing Standards

### Cards
```
padding: p-4 (16px) on mobile
         p-6 (24px) on tablet/desktop
border-radius: rounded-2xl (16px)
gap between cards: gap-3 (12px)
```

### Expense List Items
```
padding: py-3 px-4 (12px vertical, 16px horizontal)
gap between items: gap-2 (8px) or divider line
```

### Bottom Sheet
```
padding (content): px-4 pt-2 pb-8 (last item needs safe area buffer)
gap between form sections: gap-4 (16px)
```

### Form Inputs
```
padding: py-3 px-4 (12px vertical, 16px horizontal)
gap between label and input: gap-1.5 (6px)
gap between input fields: gap-4 (16px)
```

### Bottom Navigation Bar
```
height: 60px (+ iOS safe area inset)
padding: px-2 py-2
icon size: 24px
gap (icon to label): gap-1 (4px)
```

### FAB (Floating Action Button)
```
size: w-14 h-14 (56px × 56px)
position: fixed bottom-20 right-4 (above nav bar, right-aligned)
icon size: 28px
shadow: shadow-xl + shadow-primary-500/50
```

---

## 4. Safe Area Insets (Mobile)

On iPhone with notch/home indicator, additional padding is required.

```css
/* Bottom of app content (above home indicator) */
padding-bottom: max(env(safe-area-inset-bottom), 1rem);

/* Apply to bottom nav bar and FAB container */
```

---

## 5. Page Layout Grid

```
Max Content Width: 640px (centered on desktop)
Side Padding (mobile): px-4 (16px each side)
Side Padding (desktop): px-6 (24px each side) within 640px container
```

The app is designed mobile-first. Desktop mode centers the content column at max 640px, making it look like a phone app on a computer — which is intentional and appropriate for this demographic.
