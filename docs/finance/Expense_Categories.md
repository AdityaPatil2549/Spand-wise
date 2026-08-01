# Expense Categories
## SpendWise — Student Expense Tracker

This document defines the standard and custom expense categories tailored for college students.

---

## 1. Core Principles for Categories
*   **Student-Centric:** Categories should reflect actual student life (e.g., "Hostel", "Mess", "Stationery").
*   **Iconography:** Every category must have a distinct, recognizable emoji.
*   **Color Coding:** Each category has a unique hex color for charts and UI elements.
*   **Simplicity:** Keep the default list under 20 items to avoid choice paralysis.

---

## 2. Default Preset Categories

These 17 categories are seeded for every new user.

| Category Name | Emoji | Color (Hex) | Description |
| :--- | :---: | :--- | :--- |
| **Food** | 🍔 | `#F97316` (Orange) | Meals outside, restaurants, fast food |
| **Transport** | 🚌 | `#3B82F6` (Blue) | Bus, auto, cab, metro, train tickets |
| **Hostel / Rent** | 🏠 | `#8B5CF6` (Purple) | Monthly rent, hostel fees |
| **Mess / Groceries**| 🛒 | `#10B981` (Green) | Mess fees, raw groceries, supermarket |
| **Stationery** | 📝 | `#EAB308` (Yellow) | Pens, notebooks, printouts, craft supplies |
| **Books** | 📚 | `#F59E0B` (Amber) | Textbooks, reference books, novels |
| **Tuition / Fees** | 🎓 | `#6366F1` (Indigo) | College fees, coaching, online courses |
| **Snacks & Chai** | ☕ | `#D97706` (Dk Amber)| Daily chai, canteen snacks, quick bites |
| **Shopping** | 🛍️ | `#EC4899` (Pink) | Clothes, shoes, accessories |
| **Entertainment** | 🎮 | `#8B5CF6` (Violet) | Movies, games, concerts, outings |
| **Medical** | 💊 | `#EF4444` (Red) | Medicines, doctor visits, first aid |
| **Recharge / Phone**| 📱 | `#06B6D4` (Cyan) | Mobile recharge, data packs |
| **Subscriptions** | 🔄 | `#14B8A6` (Teal) | Netflix, Spotify, Amazon Prime |
| **Travel** | ✈️ | `#0EA5E9` (Sky) | Flights, inter-city travel, vacations |
| **Emergency** | ⚠️ | `#DC2626` (Red) | Unforeseen urgent expenses |
| **Gifts** | 🎁 | `#F43F5E` (Rose) | Birthdays, farewells, anniversaries |
| **Miscellaneous** | 📦 | `#6B7280` (Gray) | Anything that doesn't fit elsewhere |

---

## 3. Custom Categories

Users can add up to 10 custom categories (Free tier) or Unlimited (Pro tier).

**Constraints:**
*   Name: Max 20 characters
*   Icon: Must be a single emoji
*   Color: Selected from a predefined palette of 12 distinct colors to ensure UI consistency.

---

## 4. Sub-Categories (v2.0 Feature)

In future versions, top-level categories can have sub-categories. For MVP (v1.0), we stick to a flat list for simplicity.

*(Example for v2.0)*
*   **Food**
    *   Restaurants
    *   Swiggy/Zomato
    *   Canteen
*   **Transport**
    *   Auto/Cab
    *   Public Transport
    *   Fuel (for personal vehicle)

---

## 5. UI/UX Considerations for Categories

*   **Grid View:** In the "Add Expense" sheet, display categories in a 4x4 or horizontally scrolling grid.
*   **Recent First:** Sort the category picker by "Most Frequently Used" at the top.
*   **Searchable:** Allow typing to filter categories if the list grows (especially for custom categories).
