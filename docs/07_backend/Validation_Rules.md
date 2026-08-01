# Backend Validation Rules
## SpendWise — Student Expense Tracker

---

## 1. Validation Strategy

SpendWise validates data at two layers:
1. **Client-side (Zod):** Fast feedback, UX formatting.
2. **Backend-side (Firestore Security Rules):** Absolute security, prevents malicious API calls.

Both must enforce the exact same limits.

---

## 2. Core Domain Constraints

| Entity | Field | Constraint | Reason |
|:---|:---|:---|:---|
| Expense | `amount` | `> 0` and `<= 1,000,000` | Prevent 0/negative numbers draining budget; 10L is reasonable student max |
| Expense | `note` | `<= 200 characters` | Prevent database bloat |
| Expense | `categoryId` | String, non-empty | Foreign key integrity |
| Expense | `date` | Timestamp | Required for chronological sorting |
| Budget | `budgetAmount`| `>= 1000` and `<= 1,000,000` | Realistic boundaries |
| Category | `name` | `<= 20 characters` | UI constraint (must fit in chips) |

---

## 3. Firestore Security Rules Implementation

The validation rules are strictly encoded in `firestore.rules`.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isOwner(uid) { return request.auth.uid == uid; }
    
    match /users/{uid}/expenses/{expenseId} {
      allow create, update: if isOwner(uid)
        // 1. Amount validation
        && request.resource.data.amount is number
        && request.resource.data.amount > 0
        && request.resource.data.amount <= 1000000
        
        // 2. Note validation
        && (
          !('note' in request.resource.data) || 
          (request.resource.data.note is string && request.resource.data.note.size() <= 200)
        )
        
        // 3. Category validation
        && request.resource.data.categoryId is string
        && request.resource.data.categoryId.size() > 0
        
        // 4. Date validation
        && request.resource.data.date is timestamp
        
        // 5. Month string format validation (YYYY-MM)
        && request.resource.data.month is string
        && request.resource.data.month.matches('^[0-9]{4}-[0-9]{2}$');
    }
    
    match /users/{uid}/categories/{categoryId} {
      allow create, update: if isOwner(uid)
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0
        && request.resource.data.name.size() <= 20
        && request.resource.data.emoji is string
        && request.resource.data.emoji.size() > 0;
    }
  }
}
```

---

## 4. Derived Data Integrity

Because we denormalize data and pre-aggregate, we must ensure integrity via **Firestore Write Batches**.

If an expense is written, the budget must be updated. This cannot be enforced natively by Firestore Security Rules, which evaluate single documents.

**Mitigation:**
If a client maliciously writes an expense directly to the REST API without updating the budget document, the budget will be out of sync. 
To fix this in v2.0, we would move aggregation to a Cloud Function (`onDocumentCreated`). 
For v1.0, we accept this minor risk as the client code strictly uses batches, and a student hacking their own expense tracker only hurts their own analytics.
