# Database Architecture & Schema Design
## SpendWise — Student Expense Tracker

---

## 1. NoSQL Architecture Strategy
SpendWise uses Google Cloud Firestore. As a NoSQL document database, our schema design must optimize for **Reads** over **Writes**. Data is heavily denormalized to ensure that the client can fetch the Dashboard state with a single query, rather than performing SQL-like JOINs.

---

## 2. Collection Topology
Data is sharded by User ID to guarantee strict multi-tenant isolation via Security Rules.

```text
/users/{uid}                    (User Profile)
  ├── /budgets/{month_id}       (Pre-aggregated budget totals)
  ├── /expenses/{expense_id}    (Individual transactions)
  └── /categories/{category_id} (Custom/Preset categories)
```

---

## 3. Document Schemas (TypeScript Interfaces)

### 3.1 User Profile Document
**Path:** `/users/{uid}`
```typescript
interface UserDocument {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  lastActive: Timestamp; // Updated on session start
}
```

### 3.2 Budget Document (The Aggregation Target)
**Path:** `/users/{uid}/budgets/{YYYY-MM}`
*Why:* Pre-aggregating `totalSpent` here means the dashboard loads instantly (1 document read) instead of querying and summing 100+ expenses every time the app opens.

```typescript
interface BudgetDocument {
  id: string;              // e.g., "2026-07"
  budgetAmount: number;    // User's defined allowance
  totalSpent: number;      // System-calculated sum of all non-deleted expenses
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.3 Expense Document
**Path:** `/users/{uid}/expenses/{expense_id}`
```typescript
interface ExpenseDocument {
  id: string;              // Firestore auto-id
  amount: number;
  categoryId: string;      // Foreign key to categories collection
  note: string | null;
  date: Timestamp;         // The exact time the expense occurred
  month: string;           // Derived field "YYYY-MM" for easy querying
  isDeleted: boolean;      // Soft-delete flag
  createdAt: Timestamp;
}
```

### 3.4 Category Document
**Path:** `/users/{uid}/categories/{category_id}`
*Note:* In MVP, these are prepopulated. In v1.1, users can edit them.
```typescript
interface CategoryDocument {
  id: string;
  name: string;
  emoji: string;
  color: string;           // hex code
  isDefault: boolean;      // true if system-generated
  createdAt: Timestamp;
}
```

---

## 4. The Atomic Write Problem (The "Batch" Rule)

In a relational database (SQL), calculating the budget is a fast `SUM()` query. In Firestore, querying and summing 1000 expenses on the client is slow and expensive. Therefore, we use the `BudgetDocument` to store a running total.

**The Risk:** If a network failure occurs after saving an `Expense` but before updating the `Budget`, the total will permanently fall out of sync.

**The Solution:** All expense creations, edits, and deletions MUST use a Firestore `writeBatch`.

```typescript
// Architectural Requirement for any DB write:
const batch = writeBatch(db);
batch.set(expenseRef, expenseData);
batch.update(budgetRef, {
  totalSpent: increment(expenseData.amount)
});
await batch.commit(); // Succeeds entirely, or fails entirely.
```

---

## 5. Security Rules

Because the client writes directly to the database, strict validation must occur at the Firestore level to prevent tampering.

```javascript
// firestore.rules snippet
match /users/{uid}/budgets/{monthId} {
  allow read: if request.auth.uid == uid;
  allow write: if request.auth.uid == uid 
    && request.resource.data.budgetAmount >= 0;
}
```
