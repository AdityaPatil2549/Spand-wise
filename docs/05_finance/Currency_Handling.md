# Currency Handling
## SpendWise — Student Expense Tracker

---

## 1. v1.0 Scope: INR Only

SpendWise v1.0 is **India-exclusive** and supports **INR (Indian Rupee, ₹) only**.

No multi-currency conversion is required. All amounts are stored as raw numbers (treated as paisa/rupees without distinction at the storage level; display is always in ₹).

---

## 2. INR-Specific Formatting Rules

### Indian Number System (Lakh/Crore)
India uses a different number grouping system than the West (Western: 1,000,000 = one million; India: 10,00,000 = ten lakh).

SpendWise must use the **Indian number formatting system**:

```javascript
// ✅ CORRECT — Indian number system
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,  // No paise for whole amounts
  }).format(amount);
};

// Examples:
// formatCurrency(1000) → "₹1,000"
// formatCurrency(10000) → "₹10,000"
// formatCurrency(100000) → "₹1,00,000" (one lakh)
// formatCurrency(10000000) → "₹1,00,00,000" (one crore)

// ❌ INCORRECT
amount.toLocaleString('en-US', { style: 'currency', currency: 'INR' });
// This would produce: ₹1,000,000 (wrong grouping)
```

### Handling Paise (Sub-Rupee Amounts)
```javascript
// If the amount has decimal places, show 2 decimal places
const formatCurrencyFull = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// formatCurrencyFull(150) → "₹150"
// formatCurrencyFull(150.50) → "₹150.50"
```

---

## 3. Amount Storage Rules

- **Store as a number (float):** Amounts are stored as JavaScript `number` type in Firestore.
- **No string storage:** Never store amounts as strings (e.g., "₹150"). Always store raw numbers (150).
- **Maximum precision:** 2 decimal places (paise). No amounts below 0.01.
- **Maximum value:** 1,000,000 (₹10 lakh). Validated both client-side and in Firestore security rules.
- **Minimum value:** 0.01. Validated to prevent ₹0 expenses.

---

## 4. Amount Input UX Rules

- Input field type: `number` with `inputmode="decimal"` for proper mobile keyboard.
- The `₹` symbol is displayed as a non-editable prefix, NOT typed by the user.
- Decimal input: Allowed (e.g., user can type `150.50` for ₹150.50).
- Comma input: Prevented at the input level (user types raw numbers, commas are displayed).
- Pasting: Sanitize pasted values to remove non-numeric characters (e.g., pasting "₹1,500" should result in `1500`).

---

## 5. Future: Multi-Currency (v3.0)

When international expansion is considered, the following architecture changes are required:
- Add a `currency` field to the User document (default: `INR`).
- Add a `currency` field to every Expense document.
- Use a currency conversion API (e.g., ExchangeRate-API free tier) for cross-currency analytics.
- Store all amounts in the user's **base currency**; no cross-currency conversion in v1.0/v2.0.
