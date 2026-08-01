# Authorization & Firestore Security Rules
## SpendWise — Student Expense Tracker

---

## 1. Authorization Model

SpendWise uses **Firestore Security Rules** for all authorization. There is no separate backend authorization layer in v1.0 (since we have no custom backend server).

**Core Principle:** Every user can only read and write their own data. No cross-user access is possible.

---

## 2. Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(uid) {
      return request.auth.uid == uid;
    }
    
    function isValidAmount(amount) {
      return amount is number && amount > 0 && amount <= 1000000;
    }
    
    function isValidNote(note) {
      return note is string && note.size() <= 200;
    }

    // USER DOCUMENTS
    match /users/{uid} {
      allow read: if isSignedIn() && isOwner(uid);
      allow create: if isSignedIn() && isOwner(uid);
      allow update: if isSignedIn() && isOwner(uid)
                    && !('uid' in request.resource.data.diff(resource.data).affectedKeys()); // uid is immutable
      allow delete: if false; // Never delete user document directly; use Cloud Function
      
      // EXPENSE SUBCOLLECTION
      match /expenses/{expenseId} {
        allow read: if isSignedIn() && isOwner(uid);
        allow create: if isSignedIn() && isOwner(uid)
                      && request.resource.data.userId == uid
                      && isValidAmount(request.resource.data.amount)
                      && request.resource.data.categoryId is string
                      && isValidNote(request.resource.data.note);
        allow update: if isSignedIn() && isOwner(uid)
                      && request.resource.data.userId == uid
                      && isValidAmount(request.resource.data.amount)
                      && !('createdAt' in request.resource.data.diff(resource.data).affectedKeys()); // immutable
        allow delete: if false; // Use soft delete (isDeleted: true)
      }
      
      // BUDGET SUBCOLLECTION
      match /budgets/{month} {
        allow read: if isSignedIn() && isOwner(uid);
        allow write: if isSignedIn() && isOwner(uid)
                     && request.resource.data.userId == uid;
      }
      
      // CATEGORIES SUBCOLLECTION
      match /categories/{categoryId} {
        allow read: if isSignedIn() && isOwner(uid);
        allow create: if isSignedIn() && isOwner(uid)
                      && request.resource.data.name.size() <= 20
                      && request.resource.data.isPreset == false;
        allow update: if isSignedIn() && isOwner(uid);
        allow delete: if isSignedIn() && isOwner(uid);
      }
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 3. Authorization Rules Summary

| Resource | Create | Read | Update | Delete |
|:---|:---:|:---:|:---:|:---:|
| User document | ✅ (own) | ✅ (own) | ✅ (own, uid immutable) | ❌ |
| Expense document | ✅ (own, validated) | ✅ (own) | ✅ (own, createdAt immutable) | ❌ (soft delete) |
| Budget document | ✅ (own) | ✅ (own) | ✅ (own) | ❌ |
| Category document | ✅ (own, validated) | ✅ (own) | ✅ (own) | ✅ (own) |

---

## 4. Client-Side Authorization Guards

Security Rules are the enforcement layer, but the app also applies client-side guards for a good UX (not security):

```typescript
// src/hooks/useExpenses.ts
const addExpense = async (input: AddExpenseInput) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be authenticated to add expenses');
  // ... proceed with write
};
```
