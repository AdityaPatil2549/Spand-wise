# Iconography
## SpendWise — Student Expense Tracker

---

## 1. Icon Library

**Primary Library: Lucide React**
- Package: `lucide-react`
- Rationale: Clean, consistent, MIT-licensed, designed specifically for React/Next.js. Excellent tree-shaking (only imports icons used).
- Style: Outlined (2px stroke), rounded line caps, 24x24 grid.

**Supplementary: Emoji (for Categories)**
- Category icons are standard Unicode emoji, not SVG icons.
- Rationale: Universally recognized by students; no library dependency; instantly understandable cross-culturally.

---

## 2. Icon Usage Rules

1. **Size Standardization:**
   - Navigation icons: 24px × 24px
   - Category grid icons (emoji): 28px (font-size)
   - Inline/label icons: 16px × 16px
   - FAB icon: 28px × 28px
   - Toast/alert icons: 18px × 18px

2. **Color Rules:**
   - Navigation icons (inactive): `--text-secondary`
   - Navigation icons (active): `--color-primary-500`
   - Danger icons (delete, alert): `--color-danger`
   - Success icons: `--color-success`
   - Category emoji: No color override (native color)

3. **Accessibility:**
   - All icons that perform an action (not decorative) MUST have an `aria-label`.
   - Decorative icons MUST have `aria-hidden="true"`.

---

## 3. Icon Mapping (UI Elements)

| UI Element | Lucide Icon | aria-label |
|:---|:---|:---|
| Dashboard / Home | `Home` | "Dashboard" |
| Expense List | `List` | "Expenses" |
| Analytics | `BarChart2` | "Analytics" |
| Reports | `FileText` | "Reports" |
| Settings | `Settings` | "Settings" |
| Add Expense (FAB) | `Plus` | "Add new expense" |
| Search | `Search` | "Search expenses" |
| Filter | `Filter` | "Filter by category" |
| Edit | `Pencil` | "Edit expense" |
| Delete | `Trash2` | "Delete expense" |
| Download | `Download` | "Download report" |
| Calendar / Date | `Calendar` | "Select date" |
| Note / Description | `FileText` | "Add note" |
| Notification Bell | `Bell` | "Notifications" |
| Sign Out | `LogOut` | "Sign out" |
| Back | `ChevronLeft` | "Go back" |
| Close / Dismiss | `X` | "Close" |
| Warning | `AlertTriangle` | "Warning" |
| Success | `CheckCircle` | "Success" |
| Offline | `WifiOff` | "Offline — limited functionality" |
| Streak / Fire | `Flame` | "Day streak" |
| Sync / Real-time | `RefreshCw` | "Syncing" |

---

## 4. Category Emoji Reference

| Category | Emoji | Unicode |
|:---|:---:|:---|
| Food | 🍔 | U+1F354 |
| Transport | 🚌 | U+1F68C |
| Hostel/Rent | 🏠 | U+1F3E0 |
| Mess/Groceries | 🛒 | U+1F6D2 |
| Stationery | 📝 | U+1F4DD |
| Books | 📚 | U+1F4DA |
| Tuition | 🎓 | U+1F393 |
| Snacks & Chai | ☕ | U+2615 |
| Shopping | 🛍️ | U+1F6CD |
| Entertainment | 🎮 | U+1F3AE |
| Medical | 💊 | U+1F48A |
| Recharge | 📱 | U+1F4F1 |
| Subscriptions | 🔄 | U+1F504 |
| Travel | ✈️ | U+2708 |
| Emergency | ⚠️ | U+26A0 |
| Gifts | 🎁 | U+1F381 |
| Miscellaneous | 📦 | U+1F4E6 |
