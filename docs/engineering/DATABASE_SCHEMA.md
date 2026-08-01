# Database Schema & Entity-Relationship Diagram
## SpendWise — Student Expense Tracker

---

## 1. Database Selection Rationale

**Selected:** Firebase Firestore (NoSQL, Document-based)

**Why Firestore over SQL:**
| Reason | Detail |
|---|---|
| Real-time sync | Native `onSnapshot()` listeners — perfect for multi-device requirement |
| Offline support | Built-in offline persistence with automatic sync |
| Auth integration | Seamless with Firebase Auth (same SDK) |
| Schema flexibility | Easy to evolve schema without migrations |
| Cost | Free tier covers MVP phase (1GB storage, 50K reads/day) |
| Scalability | Auto-scaling to millions of users |

**Trade-offs acknowledged:**
- No complex relational queries (JOIN operations)
- Less powerful aggregations than SQL
- Cost scales with reads (mitigated by efficient query design)

---

## 2. Collections Structure

```
Firestore Root
│
├── users/{userId}                          # User profiles & settings
│   ├── profile (document)
│   └── settings (sub-collection)
│       └── preferences (document)
│
├── expenses/{expenseId}                    # All expenses (user-scoped via userId field)
│
├── categories/{categoryId}                # User-defined custom categories
│
├── budgets/{userId}                        # Monthly budget configurations
│   └── {YYYY-MM} (sub-documents)
│
└── reports/{reportId}                      # Generated report metadata
```

---

## 3. Collection Schemas

### 3.1 `users` Collection

**Document ID:** Firebase Auth UID (e.g., `abc123xyz`)

```typescript
interface UserDocument {
  // Identity
  uid:          string;           // Firebase Auth UID (= document ID)
  email:        string;           // User's email
  displayName:  string;           // "Priya Sharma"
  photoURL:     string | null;    // Google profile photo URL
  provider:     'google' | 'email'; // Auth provider used

  // Onboarding
  onboardingComplete: boolean;    // Has user completed budget setup?
  
  // Settings
  monthlyBudget:  number;         // Current monthly budget amount (₹)
  currency:       string;         // 'INR' (v1), extensible for multi-currency
  currencySymbol: string;         // '₹'
  
  // Preferences
  theme:           'system' | 'light' | 'dark';
  notificationsEnabled: boolean;
  budgetWarningAt: number;        // Percentage (default: 80)
  
  // Metadata
  createdAt:  Timestamp;
  updatedAt:  Timestamp;
  lastSeen:   Timestamp;
  
  // Feature flags
  isPro:           boolean;       // SpendWise Pro subscriber
  proExpiresAt:    Timestamp | null;
}
```

**Firestore Security Rules:**
```
allow read, write: if request.auth.uid == userId;
```

---

### 3.2 `expenses` Collection

**Document ID:** Auto-generated Firestore ID

```typescript
interface ExpenseDocument {
  // Identity
  id:      string;    // Firestore auto-ID (= document ID)
  userId:  string;    // Firebase Auth UID (for security rules)
  
  // Core Data
  amount:      number;    // ₹150.00 (store as float, display formatted)
  categoryId:  string;    // References categories collection or preset ID
  categoryName: string;   // Denormalized for fast display (avoid joins)
  categoryEmoji: string;  // '🍔' — denormalized
  categoryColor: string;  // '#f97316' — denormalized
  note:        string;    // Optional description — max 200 chars
  
  // Temporal
  date:      Timestamp;   // The date the expense OCCURRED (user-selected)
  month:     string;      // 'YYYY-MM' format for monthly grouping queries
  year:      number;      // YYYY for annual queries
  dayOfWeek: number;      // 0=Sunday, 6=Saturday (for day-of-week analysis)
  
  // Metadata
  createdAt:  Timestamp;  // When the record was created
  updatedAt:  Timestamp;  // When last edited
  
  // Sync metadata
  deviceId:   string;     // Device that created this expense
  isDeleted:  boolean;    // Soft delete flag (default: false)
  deletedAt:  Timestamp | null;
}
```

**Firestore Security Rules:**
```
allow read, write: if request.auth.uid == resource.data.userId;
allow create: if request.auth.uid == request.resource.data.userId;
```

**Indexes Required:**
```
expenses: [userId, month, date DESC]          // Monthly expense list
expenses: [userId, month, categoryId, date DESC]  // Category filter
expenses: [userId, date DESC]                 // Full history
```

---

### 3.3 `categories` Collection

**Document ID:** Auto-generated (for custom) or preset slug (e.g., `food-dining`)

```typescript
interface CategoryDocument {
  // Identity
  id:        string;    // 'food-dining' or Firestore auto-ID
  userId:    string;    // 'SYSTEM' for preset categories; Auth UID for custom
  
  // Display
  name:      string;    // 'Food & Dining'
  emoji:     string;    // '🍔'
  color:     string;    // '#f97316'
  
  // Behavior
  isPreset:  boolean;   // True for system defaults; false for user-created
  isActive:  boolean;   // False = soft-archived (still shows in old expenses)
  
  // Sort Order
  sortOrder: number;    // 1–15 for presets; 100+ for custom
  
  // Stats (denormalized for performance)
  totalExpenses: number;    // Count of expenses in this category
  totalAmount:   number;    // Sum of all amounts in this category (current month)
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Preset Categories (seed data):**
```typescript
const PRESET_CATEGORIES: CategoryDocument[] = [
  { id: 'food-dining',     name: 'Food & Dining',   emoji: '🍔', color: '#f97316', sortOrder: 1 },
  { id: 'transport',       name: 'Transport',        emoji: '🚌', color: '#3b82f6', sortOrder: 2 },
  { id: 'education',       name: 'Education & Books',emoji: '📚', color: '#8b5cf6', sortOrder: 3 },
  { id: 'entertainment',   name: 'Entertainment',    emoji: '🎮', color: '#ec4899', sortOrder: 4 },
  { id: 'shopping',        name: 'Shopping',         emoji: '🛍️', color: '#f59e0b', sortOrder: 5 },
  { id: 'health',          name: 'Health & Medical', emoji: '💊', color: '#10b981', sortOrder: 6 },
  { id: 'accommodation',   name: 'Accommodation',    emoji: '🏠', color: '#6366f1', sortOrder: 7 },
  { id: 'phone-internet',  name: 'Phone & Internet', emoji: '📱', color: '#06b6d4', sortOrder: 8 },
  { id: 'cafe-snacks',     name: 'Café & Snacks',    emoji: '☕', color: '#a16207', sortOrder: 9 },
  { id: 'personal-care',   name: 'Personal Care',    emoji: '💇', color: '#d946ef', sortOrder: 10 },
  { id: 'gifts',           name: 'Gifts & Donations',emoji: '🎁', color: '#e11d48', sortOrder: 11 },
  { id: 'fitness',         name: 'Fitness',          emoji: '🏋️', color: '#84cc16', sortOrder: 12 },
  { id: 'travel',          name: 'Travel',           emoji: '✈️', color: '#14b8a6', sortOrder: 13 },
  { id: 'utilities',       name: 'Utilities',        emoji: '🔧', color: '#64748b', sortOrder: 14 },
  { id: 'other',           name: 'Other',            emoji: '📦', color: '#78716c', sortOrder: 15 },
];
```

---

### 3.4 `budgets` Collection

**Document ID:** `{userId}_{YYYY-MM}` (e.g., `abc123_2026-07`)

```typescript
interface BudgetDocument {
  // Identity
  id:      string;    // '{userId}_{YYYY-MM}'
  userId:  string;    // Firebase Auth UID
  month:   string;    // 'YYYY-MM'
  year:    number;    // 2026
  
  // Budget Config
  amount:  number;    // Budget for this specific month (₹)
  
  // Computed Rollup (updated by Cloud Function on each expense write)
  totalSpent:    number;    // Sum of all expenses this month
  remainingAmount: number;  // amount - totalSpent
  percentUsed:   number;    // (totalSpent / amount) * 100
  
  // Per-Category Breakdown (denormalized for fast dashboard)
  categoryBreakdown: {
    [categoryId: string]: {
      amount: number;
      count:  number;
      percentage: number;
    }
  };
  
  // Daily Spending (for trend chart — array of 31 values)
  dailySpending: number[];  // Index 0 = day 1, Index 30 = day 31
  
  // Alert States
  warned80Percent:  boolean;  // Prevents duplicate alerts
  warned100Percent: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.5 `reports` Collection (Metadata Only)

Reports are generated client-side; this collection stores metadata and caches.

```typescript
interface ReportDocument {
  id:      string;
  userId:  string;
  month:   string;    // 'YYYY-MM'
  
  // Cache
  pdfUrl:  string | null;  // Firebase Storage URL if pre-generated
  csvUrl:  string | null;
  
  // Summary (cached for report list page)
  totalSpent:  number;
  budget:      number;
  topCategory: string;
  
  // Metadata
  generatedAt: Timestamp;
  createdAt:   Timestamp;
}
```

---

## 4. Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FIRESTORE ERD                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────────┐
│   users      │         │   budgets            │
│  ──────────  │  1..1   │  ──────────────────  │
│  uid (PK)    │─────────│  id (userId+month)  │
│  email       │         │  userId (FK)         │
│  displayName │         │  month               │
│  monthlyBudget│         │  amount              │
│  currency    │         │  totalSpent          │
│  theme       │         │  categoryBreakdown   │
│  isPro       │         │  dailySpending[]     │
└──────────────┘         └──────────────────────┘
       │                           │
       │ 1..N                      │ 1..N
       │                           │
       ▼                           ▼
┌──────────────────────┐   ┌──────────────────────┐
│   expenses           │   │   reports            │
│  ──────────────────  │   │  ──────────────────  │
│  id (PK)             │   │  id (PK)             │
│  userId (FK)         │   │  userId (FK)         │
│  amount              │   │  month               │
│  categoryId (FK)─────┼───│  totalSpent          │
│  categoryName        │   │  pdfUrl              │
│  note                │   └──────────────────────┘
│  date                │
│  month               │
│  isDeleted           │
└──────────────────────┘
       │
       │ N..1
       │
       ▼
┌──────────────────────┐
│   categories         │
│  ──────────────────  │
│  id (PK)             │
│  userId (SYSTEM/UID) │
│  name                │
│  emoji               │
│  color               │
│  isPreset            │
│  isActive            │
└──────────────────────┘
```

---

## 5. Denormalization Strategy

To avoid expensive reads and support real-time performance, we **denormalize** the following:

| Data | Stored In | Why |
|---|---|---|
| `categoryName`, `categoryEmoji`, `categoryColor` | Each expense document | Avoid reading category collection on every expense render |
| `totalSpent`, `categoryBreakdown`, `dailySpending` | Budget document | Dashboard reads 1 document instead of aggregating 200+ expenses |
| User's `monthlyBudget` | User document | Avoid reading budget document for every session start |

### Update Strategy
When an expense is added/edited/deleted:
1. **Optimistic UI:** Update local state immediately (React state)
2. **Firestore write:** Create/update expense document
3. **Cloud Function trigger:** `onWrite` Cloud Function recalculates the budget document's `totalSpent`, `categoryBreakdown`, and `dailySpending` array
4. **Real-time listener:** Budget document listener fires on all client devices, updating UI

---

## 6. Query Patterns

### 6.1 Dashboard Load
```typescript
// 1. User document (budget + settings)
db.doc(`users/${userId}`)

// 2. Current month budget (totalSpent, categoryBreakdown)
db.doc(`budgets/${userId}_${currentMonth}`)

// 3. Last 5 expenses (recent activity)
db.collection('expenses')
  .where('userId', '==', userId)
  .where('isDeleted', '==', false)
  .orderBy('date', 'desc')
  .limit(5)
```

### 6.2 Monthly Expense List
```typescript
db.collection('expenses')
  .where('userId', '==', userId)
  .where('month', '==', '2026-07')
  .where('isDeleted', '==', false)
  .orderBy('date', 'desc')
```

### 6.3 Category Filter
```typescript
db.collection('expenses')
  .where('userId', '==', userId)
  .where('month', '==', '2026-07')
  .where('categoryId', '==', 'food-dining')
  .where('isDeleted', '==', false)
  .orderBy('date', 'desc')
```

### 6.4 Add Expense (Transaction)
```typescript
// Atomic: write expense + update budget stats
await runTransaction(db, async (transaction) => {
  transaction.set(expenseRef, expenseData);
  transaction.update(budgetRef, {
    totalSpent: increment(amount),
    remainingAmount: increment(-amount),
    [`categoryBreakdown.${categoryId}.amount`]: increment(amount),
    [`categoryBreakdown.${categoryId}.count`]: increment(1),
    [`dailySpending.${dayOfMonth - 1}`]: increment(amount),
    updatedAt: serverTimestamp()
  });
});
```

---

## 7. Indexes (Firestore Composite)

```
# Required composite indexes:
Collection: expenses
Fields: userId ASC, month ASC, date DESC, isDeleted ASC

Collection: expenses
Fields: userId ASC, month ASC, categoryId ASC, date DESC, isDeleted ASC

Collection: expenses
Fields: userId ASC, date DESC, isDeleted ASC

Collection: budgets
Fields: userId ASC, month DESC
```

---

## 8. Data Validation Rules (Firestore Security Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuth() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isValidAmount() {
      return request.resource.data.amount > 0 && 
             request.resource.data.amount <= 1000000;
    }
    
    function isValidNote() {
      return !('note' in request.resource.data) || 
             request.resource.data.note.size() <= 200;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuth() && isOwner(userId);
      allow write: if isAuth() && isOwner(userId);
    }
    
    // Expenses collection
    match /expenses/{expenseId} {
      allow read: if isAuth() && isOwner(resource.data.userId);
      allow create: if isAuth() && 
                       isOwner(request.resource.data.userId) && 
                       isValidAmount() && 
                       isValidNote();
      allow update: if isAuth() && 
                       isOwner(resource.data.userId) && 
                       isValidAmount() &&
                       isValidNote();
      allow delete: if false; // Soft delete only — never hard delete
    }
    
    // Categories collection
    match /categories/{categoryId} {
      // Anyone can read preset categories
      allow read: if isAuth() && 
                     (resource.data.userId == 'SYSTEM' || 
                      isOwner(resource.data.userId));
      allow write: if isAuth() && isOwner(request.resource.data.userId);
    }
    
    // Budgets collection
    match /budgets/{budgetId} {
      allow read: if isAuth() && isOwner(resource.data.userId);
      allow write: if isAuth() && isOwner(request.resource.data.userId);
    }
    
    // Reports collection
    match /reports/{reportId} {
      allow read: if isAuth() && isOwner(resource.data.userId);
      allow write: if isAuth() && isOwner(request.resource.data.userId);
    }
  }
}
```

---

## 9. Data Migration Strategy

For future schema changes:
1. All documents include a `schemaVersion` field (not shown above for clarity, but should be added)
2. Migrations run as Cloud Functions triggered on app version deploy
3. Migration status tracked in a `_migrations` collection
4. Backwards compatibility maintained for 2 major versions

---

## 10. Storage Estimates (Firebase Free Tier Planning)

| Metric | Estimate | Free Tier Limit |
|---|---|---|
| Avg expenses/user/month | 90 | - |
| Avg expense document size | ~500 bytes | - |
| 1,000 MAU storage | ~45 MB | 1 GB ✅ |
| Daily reads per active user | ~150 | - |
| 1,000 MAU daily reads | ~150,000 | 50,000/day ⚠️ |

> **Note:** At 1,000 MAU, Firestore read limits may be approached. Optimize with:
> 1. Aggressive caching of budget document (single read, update via realtime listener)
> 2. Pagination (20 expenses per page vs. loading all)
> 3. Move to Blaze plan (~$30-50/month at 1,000 MAU scale)

---

*Database Schema v1.0. Schema changes require documentation update and security rule review.*
