# Firestore Indexing Strategy
## SpendWise — Student Expense Tracker

---

## 1. Indexing Principles

Firestore automatically indexes every single field in a document. However, complex queries (using multiple `where` clauses, or combining `where` and `orderBy`) require **Composite Indexes**.

SpendWise optimizes for read performance by relying on composite indexes for all primary list views.

---

## 2. Required Composite Indexes

These indexes must be defined in `firestore.indexes.json` and deployed via Firebase CLI before the app can execute its queries.

### 2.1 The Dashboard / Expense List Query
**Query:** Get all non-deleted expenses for a specific month, ordered by date descending.
```typescript
query(
  collection(db, `users/${uid}/expenses`),
  where('month', '==', '2026-07'),
  where('isDeleted', '==', false),
  orderBy('date', 'desc')
)
```

**Required Index:**
| Collection | Field 1 | Field 2 | Field 3 |
|:---|:---|:---|:---|
| `expenses` | `month` (ASC) | `isDeleted` (ASC) | `date` (DESC) |

---

### 2.2 Category-Filtered Expense List
**Query:** Get all non-deleted expenses for a specific month and specific category, ordered by date.
```typescript
query(
  collection(db, `users/${uid}/expenses`),
  where('month', '==', '2026-07'),
  where('isDeleted', '==', false),
  where('categoryId', '==', 'food'),
  orderBy('date', 'desc')
)
```

**Required Index:**
| Collection | Field 1 | Field 2 | Field 3 | Field 4 |
|:---|:---|:---|:---|:---|
| `expenses` | `month` (ASC) | `isDeleted` (ASC) | `categoryId` (ASC) | `date` (DESC) |

---

## 3. The firestore.indexes.json File

```json
{
  "indexes": [
    {
      "collectionGroup": "expenses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "month", "order": "ASCENDING" },
        { "fieldPath": "isDeleted", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "expenses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "month", "order": "ASCENDING" },
        { "fieldPath": "isDeleted", "order": "ASCENDING" },
        { "fieldPath": "categoryId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 4. Single-Field Index Exemptions

To save storage costs on the Spark plan, we could disable indexing on fields we never query by (like `note`). However, for v1.0, the storage savings are negligible (kilobytes), so we leave default single-field indexing enabled.
