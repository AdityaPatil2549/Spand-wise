# Backend Architecture (Thick Client Model)
## SpendWise — Student Expense Tracker

---

## 1. Paradigm: Backend-as-a-Service (BaaS)

SpendWise does not have a traditional backend server (e.g., Express.js, Django, or Spring Boot). The Next.js frontend communicates directly with Google Cloud infrastructure via the Firebase Client SDK.

This is known as the **Thick Client Architecture**. 

### 1.1 Why No Custom Backend?
- **Cost:** Firebase free tier is generous. Running a custom Node.js server requires 24/7 compute.
- **Latency:** Direct client-to-DB connections are faster than hopping through a proxy API.
- **Offline Support:** Firebase Web SDK inherently handles local caching and offline mutations. Rebuilding this on a custom REST API is prohibitively complex for an MVP.

---

## 2. Security Boundary

In a traditional app, the server validates inputs before hitting the database. In a BaaS app, the client writes directly to the database. Therefore, the **Firestore Security Rules** act as our backend validation layer.

```text
[Client App] --> (Direct Write Request) --> [Google Network Edge] --> [Firestore Security Rules] --> [Database]
```

### 2.1 The 3 Pillars of Backend Security
1. **Authentication:** Enforced by Firebase Auth. Only requests with valid JWTs pass.
2. **Authorization (Ownership):** Enforced by rule: `if request.auth.uid == resource.data.userId`.
3. **Validation (Schema/Limits):** Enforced by rule: `if request.resource.data.amount > 0 && request.resource.data.amount <= 1000000`.

---

## 3. Atomic State Management (Backend Level)

Because SpendWise aggregates total spend into a single `Budget` document for quick dashboard loading, we must enforce ACID (Atomicity, Consistency, Isolation, Durability) properties on writes.

Since we have no custom backend server to execute a SQL transaction, we use **Firestore Batched Writes** in the client code.

### 3.1 The Consistency Protocol
Whenever an Expense is modified, the following operations must happen atomically:
1. Write the new Expense document.
2. Increment/Decrement the `totalSpent` field on the corresponding Budget document.

If the client loses internet connection midway through these operations, the Firebase SDK queues the *entire batch* locally and executes it simultaneously when connectivity is restored, preventing data drift.

---

## 4. Cloud Functions (Escape Hatch)

While v1.0 relies entirely on the client, Cloud Functions are reserved for operations that cannot be safely or efficiently executed on the device.

**Deferred to v1.2:**
- `onMonthlyReset`: A scheduled cron job that auto-creates the next month's `BudgetDocument` at 12:00 AM on the 1st of the month. (In v1.0, this is handled dynamically on the client when they first log in during a new month).
- `onAccountDelete`: A trigger that wipes all sub-collections when a user deletes their Auth profile (GDPR compliance).
