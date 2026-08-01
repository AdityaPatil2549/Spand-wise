# Database Seed Data
## SpendWise — Student Expense Tracker

Seed data is used for development, testing, and onboarding new users with sensible defaults.

---

## 1. Preset Categories (Static Config — Not Firestore)

Stored in `src/config/categories.ts`. These are seeded into Zustand on app init; they never need to be written to Firestore for each user.

```typescript
// src/config/categories.ts
export const PRESET_CATEGORIES: CategoryConfig[] = [
  { id: 'food',           name: 'Food',             emoji: '🍔', color: '#F97316', isPreset: true },
  { id: 'transport',      name: 'Transport',         emoji: '🚌', color: '#3B82F6', isPreset: true },
  { id: 'hostel',         name: 'Hostel / Rent',     emoji: '🏠', color: '#8B5CF6', isPreset: true },
  { id: 'mess',           name: 'Mess / Groceries',  emoji: '🛒', color: '#10B981', isPreset: true },
  { id: 'stationery',     name: 'Stationery',        emoji: '📝', color: '#EAB308', isPreset: true },
  { id: 'books',          name: 'Books',             emoji: '📚', color: '#F59E0B', isPreset: true },
  { id: 'tuition',        name: 'Tuition / Fees',    emoji: '🎓', color: '#6366F1', isPreset: true },
  { id: 'snacks',         name: 'Snacks & Chai',     emoji: '☕', color: '#D97706', isPreset: true },
  { id: 'shopping',       name: 'Shopping',          emoji: '🛍️', color: '#EC4899', isPreset: true },
  { id: 'entertainment',  name: 'Entertainment',     emoji: '🎮', color: '#A855F7', isPreset: true },
  { id: 'medical',        name: 'Medical',           emoji: '💊', color: '#EF4444', isPreset: true },
  { id: 'recharge',       name: 'Recharge / Phone',  emoji: '📱', color: '#06B6D4', isPreset: true },
  { id: 'subscriptions',  name: 'Subscriptions',     emoji: '🔄', color: '#14B8A6', isPreset: true },
  { id: 'travel',         name: 'Travel',            emoji: '✈️', color: '#0EA5E9', isPreset: true },
  { id: 'emergency',      name: 'Emergency',         emoji: '⚠️', color: '#DC2626', isPreset: true },
  { id: 'gifts',          name: 'Gifts',             emoji: '🎁', color: '#F43F5E', isPreset: true },
  { id: 'misc',           name: 'Miscellaneous',     emoji: '📦', color: '#6B7280', isPreset: true },
];
```

---

## 2. Demo / Test User Data

For local development and testing, seed a test user with realistic data using the Firebase Emulator.

### Test User
```typescript
const TEST_USER = {
  uid: 'test-user-001',
  email: 'rahul.student@college.edu',
  displayName: 'Rahul Sharma',
  onboardingComplete: true,
  defaultBudget: 10000,
  currency: 'INR',
  theme: 'dark',
  createdAt: Timestamp.fromDate(new Date('2026-07-01'))
};
```

### Test Budget (July 2026)
```typescript
const TEST_BUDGET = {
  month: '2026-07',
  userId: 'test-user-001',
  budgetAmount: 10000,
  totalSpent: 6540,
  remainingAmount: 3460,
  categoryBreakdown: {
    food: { name: 'Food', emoji: '🍔', total: 2400, count: 18, color: '#F97316' },
    transport: { name: 'Transport', emoji: '🚌', total: 1200, count: 22, color: '#3B82F6' },
    snacks: { name: 'Snacks & Chai', emoji: '☕', total: 900, count: 30, color: '#D97706' },
    entertainment: { name: 'Entertainment', emoji: '🎮', total: 1500, count: 3, color: '#A855F7' },
    recharge: { name: 'Recharge', emoji: '📱', total: 299, count: 1, color: '#06B6D4' },
    misc: { name: 'Miscellaneous', emoji: '📦', total: 241, count: 4, color: '#6B7280' },
  },
  dailySpending: [420, 0, 320, 150, 0, 580, 900, 200, 0, 120, 350, 0, 480, 200, 150, 270, 0, 400, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};
```

### Test Expenses (Sample)
```typescript
const TEST_EXPENSES = [
  { id: 'exp-001', amount: 150, categoryId: 'food', categoryName: 'Food', note: 'Lunch at canteen', date: '2026-07-20' },
  { id: 'exp-002', amount: 299, categoryId: 'recharge', categoryName: 'Recharge', note: 'Jio recharge', date: '2026-07-19' },
  { id: 'exp-003', amount: 500, categoryId: 'entertainment', categoryName: 'Entertainment', note: 'Movie ticket', date: '2026-07-18' },
  { id: 'exp-004', amount: 45, categoryId: 'snacks', categoryName: 'Snacks & Chai', note: 'Chai + biscuits', date: '2026-07-20' },
  { id: 'exp-005', amount: 120, categoryId: 'transport', categoryName: 'Transport', note: 'Auto to college', date: '2026-07-20' },
];
```

---

## 3. Seeding Script

```typescript
// scripts/seed.ts — Run against Firebase Emulator only
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';

// NEVER run against production. Use FIRESTORE_EMULATOR_HOST env var.
const seedDatabase = async () => {
  const db = getFirestore();
  // Write test user, budget, and expenses...
};
```

Run with: `ts-node scripts/seed.ts` (with emulator running)
