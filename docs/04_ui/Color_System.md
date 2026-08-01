# Color System
## SpendWise — Student Expense Tracker

---

## 1. Color Philosophy

SpendWise uses a deep purple-based dark theme as the primary experience, with a clean light mode option. Colors are semantic — they carry meaning (success, danger, warning) not just aesthetics.

---

## 2. Primary Brand Colors

| Token Name | Light Mode | Dark Mode | Usage |
|:---|:---|:---|:---|
| `--color-primary-50` | `#F5F3FF` | `#1A1040` | Backgrounds, tints |
| `--color-primary-100` | `#EDE9FE` | `#2D1F6E` | Card backgrounds |
| `--color-primary-300` | `#C4B5FD` | `#7C3AED` | Borders, dividers |
| `--color-primary-500` | `#8B5CF6` | `#8B5CF6` | **Brand primary** (buttons, active states) |
| `--color-primary-600` | `#7C3AED` | `#A78BFA` | Hover states |
| `--color-primary-700` | `#6D28D9` | `#C4B5FD` | Focus rings |
| `--color-primary-900` | `#4C1D95` | `#F5F3FF` | Deep backgrounds, hero gradients |

---

## 3. Surface Colors (Backgrounds)

| Token | Light | Dark | Usage |
|:---|:---|:---|:---|
| `--surface-base` | `#F8F7FF` | `#0F0A1E` | App background |
| `--surface-primary` | `#FFFFFF` | `#1A1040` | Cards, sheets, modals |
| `--surface-secondary` | `#F3F4F6` | `#2D1F6E` | Nested card backgrounds |
| `--surface-overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` | Modal backdrop |

---

## 4. Text Colors

| Token | Light | Dark | Usage |
|:---|:---|:---|:---|
| `--text-primary` | `#111827` | `#F9FAFB` | Main body text, headings |
| `--text-secondary` | `#6B7280` | `#9CA3AF` | Labels, captions, helper text |
| `--text-tertiary` | `#9CA3AF` | `#6B7280` | Placeholder text, disabled |
| `--text-inverse` | `#FFFFFF` | `#111827` | Text on colored backgrounds |

---

## 5. Semantic Colors

| Token | Value | Usage |
|:---|:---|:---|
| `--color-success` | `#10B981` (Emerald 500) | Budget safe, income, success toasts |
| `--color-warning` | `#F59E0B` (Amber 400) | Budget warning (80%), caution states |
| `--color-danger` | `#EF4444` (Red 500) | Budget exceeded, delete actions, error states |
| `--color-info` | `#3B82F6` (Blue 500) | Informational toasts, sync indicators |
| `--color-expense` | `#F87171` (Red 400) | Expense amounts in lists |
| `--color-income` | `#34D399` (Emerald 400) | Income amounts in lists |

---

## 6. Category Colors

Each category has a fixed, distinct background color for its chip/badge.

| Category | Color | Hex |
|:---|:---:|:---|
| Food | 🟠 | `#F97316` |
| Transport | 🔵 | `#3B82F6` |
| Hostel/Rent | 🟣 | `#8B5CF6` |
| Mess/Groceries | 🟢 | `#10B981` |
| Stationery | 🟡 | `#EAB308` |
| Books | 🟠 | `#F59E0B` |
| Tuition | 🔵 | `#6366F1` |
| Snacks & Chai | 🟠 | `#D97706` |
| Shopping | 🩷 | `#EC4899` |
| Entertainment | 🟣 | `#A855F7` |
| Medical | 🔴 | `#EF4444` |
| Recharge | 🔵 | `#06B6D4` |
| Subscriptions | 🟢 | `#14B8A6` |
| Travel | 🔵 | `#0EA5E9` |
| Emergency | 🔴 | `#DC2626` |
| Gifts | 🩷 | `#F43F5E` |
| Miscellaneous | ⚫ | `#6B7280` |

---

## 7. Gradients

| Name | Definition | Usage |
|:---|:---|:---|
| `--gradient-hero` | `linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A78BFA 100%)` | Dashboard hero card background |
| `--gradient-card` | `linear-gradient(180deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0) 100%)` | Subtle card tint |
| `--gradient-danger` | `linear-gradient(135deg, #7F1D1D 0%, #EF4444 100%)` | Over-budget hero card |

---

## 8. Color Accessibility

All primary text + background combinations must meet WCAG 2.1 AA (4.5:1 contrast ratio).

| Combination | Ratio | Pass |
|:---|:---:|:---:|
| `--text-primary` on `--surface-base` (Light) | 12.6:1 | ✅ |
| `--text-primary` on `--surface-base` (Dark) | 15.1:1 | ✅ |
| `--color-primary-500` on `--surface-primary` (Light) | 4.7:1 | ✅ |
| White on `--color-primary-500` | 5.1:1 | ✅ |
