# Responsive Design
## SpendWise — Student Expense Tracker

---

## 1. Breakpoint Strategy

SpendWise is **mobile-first**. All styles start at the smallest breakpoint and add complexity for larger screens.

| Breakpoint | Min Width | Tailwind Prefix | Target Device |
|:---|:---|:---|:---|
| **Mobile** (default) | 0px | (none) | Phones, small screens |
| **Tablet** | 640px (`sm:`) | `sm:` | Tablets, large phones |
| **Desktop** | 1024px (`lg:`) | `lg:` | Laptops, desktops |

---

## 2. Layout Behavior by Breakpoint

### Mobile (< 640px)
- Full-width layout (100vw)
- Bottom tab navigation (fixed, 60px + safe area)
- FAB: `bottom-20 right-4`
- Padding: `px-4` (16px sides)
- Cards: Single column, full-width
- Add Expense: Bottom sheet (slides from bottom)
- Category picker: 4-column grid

### Tablet (640px – 1023px)
- Content centered, max 600px wide
- Same bottom navigation (no change)
- Slightly more generous padding: `px-6`
- Cards: Same single column (no change)

### Desktop (≥ 1024px)
- Content centered in a 640px max-width column (phone-in-browser feel)
- Bottom tab navigation becomes a **left sidebar** (60px wide, icons only OR 200px wide with labels)
- FAB remains, positioned within the 640px column
- Add Expense: Opens as a centered modal dialog instead of bottom sheet
- Analytics: Charts have more breathing room within the 640px column

---

## 3. Component-Level Responsive Behavior

### Budget Hero Card
```tsx
// Mobile
<div className="p-4 rounded-2xl">
  <p className="text-3xl font-extrabold">₹3,500</p>
</div>

// Desktop (no structural change, same layout in centered column)
<div className="p-6 rounded-2xl">
  <p className="text-4xl font-extrabold">₹3,500</p>
</div>
```

### Quick Stats Row
```tsx
// Mobile: 3 equal columns
<div className="grid grid-cols-3 gap-2">

// Desktop: Same (3 columns is always right)
<div className="grid grid-cols-3 gap-4">
```

### Category Grid
```tsx
// Mobile: 4 columns
<div className="grid grid-cols-4 gap-2">

// Tablet+: 5 columns (fits more without crowding)
<div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
```

---

## 4. Typography Scaling

| Element | Mobile | Desktop |
|:---|:---|:---|
| Hero Amount | `text-3xl` (30px) | `text-4xl` (36px) |
| Screen Heading | `text-xl` (20px) | `text-2xl` (24px) |
| Body | `text-base` (16px) | `text-base` (16px) |
| Caption | `text-xs` (12px) | `text-sm` (14px) |

---

## 5. Testing Matrix

All major screens must be tested at these widths before release:

| Width | Device Simulation |
|:---|:---|
| 320px | iPhone SE (2016), small Androids |
| 375px | iPhone 14 Mini |
| 390px | iPhone 14 |
| 414px | iPhone 14 Plus |
| 430px | iPhone 14 Pro Max |
| 640px | Tablet portrait / Large phone |
| 1280px | Laptop / Desktop |
