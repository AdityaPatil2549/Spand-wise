# API Specification
## SpendWise — Student Expense Tracker
**Version:** 1.0 | **Architecture:** Firebase SDK (not REST)

---

## Overview

SpendWise uses the **Firebase SDK** for all client-server communication, not a traditional REST API. All data operations go through:
- `firebase/auth` — Authentication operations
- `firebase/firestore` — CRUD operations + real-time subscriptions
- `firebase/functions` — Cloud Functions (invoked via HTTP or triggered internally)
- `firebase/storage` — File uploads (PDF reports)
- `firebase/messaging` — Push notifications

This document specifies all operations as client-side SDK calls and Cloud Function endpoints.

---

## 1. Authentication Operations

### 1.1 Google Sign In
```typescript
// Operation: SIGN_IN_GOOGLE
// File: src/lib/firebase/auth.ts

const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  return signInWithPopup(auth, provider);
};

// Response: UserCredential
// Error codes:
// auth/popup-closed-by-user — User closed the popup
// auth/popup-blocked — Browser blocked popup
// auth/network-request-failed — No internet
```

### 1.2 Email/Password Sign In
```typescript
// Operation: SIGN_IN_EMAIL
const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Error codes:
// auth/user-not-found
// auth/wrong-password
// auth/user-disabled
// auth/too-many-requests — Rate limited after 5 failures
```

### 1.3 Create Account
```typescript
// Operation: CREATE_ACCOUNT
const createAccount = async (
  email: string, 
  password: string,
  displayName: string
): Promise<UserCredential> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user);
  await createUserDocument(credential.user);
  return credential;
};

// Error codes:
// auth/email-already-in-use
// auth/weak-password — Less than 6 chars
// auth/invalid-email
```

### 1.4 Sign Out
```typescript
// Operation: SIGN_OUT
const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
  // Also: clear local Zustand state, stop Firestore listeners
};
```

### 1.5 Auth State Observer
```typescript
// Operation: OBSERVE_AUTH_STATE
// Called once at app initialization
onAuthStateChanged(auth, (user: FirebaseUser | null) => {
  if (user) {
    store.setUser(user);
    realtimeManager.startListeners(user.uid);
  } else {
    store.clearUser();
    realtimeManager.stopListeners();
  }
});
```

---

## 2. User Operations

### 2.1 Get User Document
```typescript
// Operation: GET_USER
// Triggered by: Real-time listener (not manual fetch)

const userListener = onSnapshot(
  doc(db, 'users', userId),
  (snap: DocumentSnapshot) => {
    if (snap.exists()) {
      store.setUserDoc(snap.data() as UserDocument);
    }
  }
);

// Returns: UserDocument (see DATABASE_SCHEMA.md)
```

### 2.2 Create User Document (on first login)
```typescript
// Operation: CREATE_USER_DOCUMENT
const createUserDocument = async (user: FirebaseUser): Promise<void> => {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? null,
      provider: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
      onboardingComplete: false,
      monthlyBudget: 0,
      currency: 'INR',
      currencySymbol: '₹',
      theme: 'system',
      notificationsEnabled: false,
      budgetWarningAt: 80,
      isPro: false,
      proExpiresAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    });
  } else {
    // Update lastSeen on returning user
    await updateDoc(userRef, { lastSeen: serverTimestamp() });
  }
};
```

### 2.3 Update User Settings
```typescript
// Operation: UPDATE_USER_SETTINGS
const updateUserSettings = async (
  userId: string,
  settings: Partial<UserDocument>
): Promise<void> => {
  const allowedFields = ['monthlyBudget', 'theme', 'notificationsEnabled', 'budgetWarningAt'];
  const sanitized = pick(settings, allowedFields);
  
  await updateDoc(doc(db, 'users', userId), {
    ...sanitized,
    updatedAt: serverTimestamp(),
  });
};

// Input validation (Zod):
const UpdateSettingsSchema = z.object({
  monthlyBudget: z.number().min(0).max(10000000).optional(),
  theme: z.enum(['system', 'light', 'dark']).optional(),
  notificationsEnabled: z.boolean().optional(),
  budgetWarningAt: z.number().min(50).max(99).optional(),
});
```

### 2.4 Complete Onboarding
```typescript
// Operation: COMPLETE_ONBOARDING
const completeOnboarding = async (userId: string, monthlyBudget: number): Promise<void> => {
  const month = format(new Date(), 'yyyy-MM');
  
  // Batch write: update user + create budget document
  const batch = writeBatch(db);
  
  batch.update(doc(db, 'users', userId), {
    monthlyBudget,
    onboardingComplete: true,
    updatedAt: serverTimestamp(),
  });
  
  batch.set(doc(db, 'budgets', `${userId}_${month}`), {
    id: `${userId}_${month}`,
    userId,
    month,
    year: new Date().getFullYear(),
    amount: monthlyBudget,
    totalSpent: 0,
    remainingAmount: monthlyBudget,
    percentUsed: 0,
    categoryBreakdown: {},
    dailySpending: new Array(31).fill(0),
    warned80Percent: false,
    warned100Percent: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  await batch.commit();
};
```

---

## 3. Expense Operations

### 3.1 Add Expense
```typescript
// Operation: ADD_EXPENSE
// Input validation (Zod):
const AddExpenseSchema = z.object({
  amount:        z.number().positive().max(1000000),
  categoryId:    z.string().min(1),
  categoryName:  z.string().min(1).max(50),
  categoryEmoji: z.string().min(1),
  categoryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  note:          z.string().max(200).optional().default(''),
  date:          z.date(),
});

type AddExpenseInput = z.infer<typeof AddExpenseSchema>;

const addExpense = async (userId: string, input: AddExpenseInput): Promise<string> => {
  const validated = AddExpenseSchema.parse(input);
  const month = format(validated.date, 'yyyy-MM');
  const year = validated.date.getFullYear();
  const dayOfWeek = validated.date.getDay();
  
  const docRef = await addDoc(collection(db, 'expenses'), {
    userId,
    ...validated,
    date: Timestamp.fromDate(validated.date),
    month,
    year,
    dayOfWeek,
    isDeleted: false,
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deviceId: getDeviceId(),
  });
  
  return docRef.id;
  // NOTE: Budget recalculation is triggered automatically by Cloud Function
};

// Error codes:
// permission-denied — User not authenticated
// invalid-argument — Amount exceeds max
// unavailable — Network error (queued for offline sync)
```

### 3.2 Update Expense
```typescript
// Operation: UPDATE_EXPENSE
const UpdateExpenseSchema = z.object({
  amount:        z.number().positive().max(1000000).optional(),
  categoryId:    z.string().min(1).optional(),
  categoryName:  z.string().max(50).optional(),
  categoryEmoji: z.string().optional(),
  categoryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  note:          z.string().max(200).optional(),
  date:          z.date().optional(),
});

const updateExpense = async (
  userId: string,
  expenseId: string,
  updates: z.infer<typeof UpdateExpenseSchema>
): Promise<void> => {
  const validated = UpdateExpenseSchema.parse(updates);
  const expenseRef = doc(db, 'expenses', expenseId);
  
  // Verify ownership before update
  const snap = await getDoc(expenseRef);
  if (!snap.exists() || snap.data()?.userId !== userId) {
    throw new Error('permission-denied');
  }
  
  const updateData: Record<string, any> = {
    ...validated,
    updatedAt: serverTimestamp(),
  };
  
  if (validated.date) {
    updateData.date = Timestamp.fromDate(validated.date);
    updateData.month = format(validated.date, 'yyyy-MM');
    updateData.year = validated.date.getFullYear();
    updateData.dayOfWeek = validated.date.getDay();
  }
  
  await updateDoc(expenseRef, updateData);
};
```

### 3.3 Delete Expense (Soft Delete)
```typescript
// Operation: DELETE_EXPENSE (soft delete)
const deleteExpense = async (userId: string, expenseId: string): Promise<void> => {
  const expenseRef = doc(db, 'expenses', expenseId);
  
  // Verify ownership
  const snap = await getDoc(expenseRef);
  if (!snap.exists() || snap.data()?.userId !== userId) {
    throw new Error('permission-denied');
  }
  
  await updateDoc(expenseRef, {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Cloud Function recalculates budget
};
```

### 3.4 Get Monthly Expenses (Real-Time)
```typescript
// Operation: OBSERVE_MONTHLY_EXPENSES
const observeMonthlyExpenses = (
  userId: string,
  month: string,  // 'YYYY-MM'
  callback: (expenses: ExpenseDocument[]) => void,
  options?: { categoryId?: string }
): Unsubscribe => {
  let q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    where('month', '==', month),
    where('isDeleted', '==', false),
    orderBy('date', 'desc'),
    limit(200)
  );
  
  if (options?.categoryId) {
    q = query(q, where('categoryId', '==', options.categoryId));
  }
  
  return onSnapshot(q, (snap) => {
    const expenses = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as ExpenseDocument[];
    callback(expenses);
  });
};
```

### 3.5 Get Expense by ID
```typescript
// Operation: GET_EXPENSE
const getExpense = async (userId: string, expenseId: string): Promise<ExpenseDocument | null> => {
  const snap = await getDoc(doc(db, 'expenses', expenseId));
  if (!snap.exists() || snap.data()?.userId !== userId) return null;
  return { id: snap.id, ...snap.data() } as ExpenseDocument;
};
```

---

## 4. Budget Operations

### 4.1 Observe Budget (Real-Time)
```typescript
// Operation: OBSERVE_BUDGET
const observeBudget = (
  userId: string,
  month: string,
  callback: (budget: BudgetDocument | null) => void
): Unsubscribe => {
  return onSnapshot(
    doc(db, 'budgets', `${userId}_${month}`),
    (snap) => {
      callback(snap.exists() ? snap.data() as BudgetDocument : null);
    }
  );
};
```

### 4.2 Update Monthly Budget Amount
```typescript
// Operation: UPDATE_BUDGET_AMOUNT
const updateBudgetAmount = async (
  userId: string,
  month: string,
  newAmount: number
): Promise<void> => {
  if (newAmount <= 0 || newAmount > 10000000) {
    throw new Error('invalid-argument: amount must be between 1 and 10,000,000');
  }
  
  const budgetRef = doc(db, 'budgets', `${userId}_${month}`);
  const snap = await getDoc(budgetRef);
  
  const currentSpent = snap.data()?.totalSpent ?? 0;
  
  await updateDoc(budgetRef, {
    amount: newAmount,
    remainingAmount: newAmount - currentSpent,
    percentUsed: (currentSpent / newAmount) * 100,
    warned80Percent: false,  // Reset alerts when budget changes
    warned100Percent: false,
    updatedAt: serverTimestamp(),
  });
  
  // Also update user's default monthly budget
  await updateDoc(doc(db, 'users', userId), {
    monthlyBudget: newAmount,
    updatedAt: serverTimestamp(),
  });
};
```

---

## 5. Category Operations

### 5.1 Get All Categories (User + Presets)
```typescript
// Operation: GET_CATEGORIES
const getCategories = async (userId: string): Promise<CategoryDocument[]> => {
  const [presetSnap, customSnap] = await Promise.all([
    getDocs(query(
      collection(db, 'categories'),
      where('userId', '==', 'SYSTEM'),
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc')
    )),
    getDocs(query(
      collection(db, 'categories'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc')
    ))
  ]);
  
  return [
    ...presetSnap.docs.map(d => ({ id: d.id, ...d.data() }) as CategoryDocument),
    ...customSnap.docs.map(d => ({ id: d.id, ...d.data() }) as CategoryDocument),
  ];
};
```

### 5.2 Create Custom Category
```typescript
// Operation: CREATE_CATEGORY
const CreateCategorySchema = z.object({
  name:      z.string().min(1).max(50),
  emoji:     z.string().min(1).max(10),
  color:     z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

const createCategory = async (
  userId: string,
  input: z.infer<typeof CreateCategorySchema>
): Promise<string> => {
  // Check custom category limit (10 max)
  const existing = await getDocs(query(
    collection(db, 'categories'),
    where('userId', '==', userId),
    where('isActive', '==', true)
  ));
  
  if (existing.size >= 10) {
    throw new Error('limit-exceeded: Maximum 10 custom categories');
  }
  
  const validated = CreateCategorySchema.parse(input);
  const docRef = await addDoc(collection(db, 'categories'), {
    ...validated,
    userId,
    isPreset: false,
    isActive: true,
    sortOrder: 100 + existing.size,
    totalExpenses: 0,
    totalAmount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return docRef.id;
};
```

---

## 6. Report Operations

### 6.1 Generate Monthly Report Data
```typescript
// Operation: GET_REPORT_DATA
// Reports are generated client-side; this fetches the raw data

const getReportData = async (userId: string, month: string): Promise<ReportData> => {
  const [expensesSnap, budgetSnap] = await Promise.all([
    getDocs(query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('month', '==', month),
      where('isDeleted', '==', false),
      orderBy('date', 'asc')
    )),
    getDoc(doc(db, 'budgets', `${userId}_${month}`))
  ]);
  
  return {
    month,
    expenses: expensesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ExpenseDocument[],
    budget: budgetSnap.data() as BudgetDocument,
  };
};
```

---

## 7. Cloud Function HTTP Endpoints

These are invoked server-side (not by client directly):

### 7.1 `POST /functions/scheduledMonthlyReset`
**Trigger:** Cloud Scheduler — First day of each month, 00:01 AM IST

**Action:** Creates new budget documents for all users based on their `monthlyBudget` setting

```typescript
export const scheduledMonthlyReset = onSchedule('1 0 1 * *', async () => {
  const newMonth = format(new Date(), 'yyyy-MM');
  const usersSnap = await db.collection('users').get();
  
  const batch = db.batch();
  usersSnap.docs.forEach(userDoc => {
    const user = userDoc.data();
    const budgetRef = db.doc(`budgets/${user.uid}_${newMonth}`);
    batch.set(budgetRef, {
      id: `${user.uid}_${newMonth}`,
      userId: user.uid,
      month: newMonth,
      year: new Date().getFullYear(),
      amount: user.monthlyBudget,
      totalSpent: 0,
      remainingAmount: user.monthlyBudget,
      percentUsed: 0,
      categoryBreakdown: {},
      dailySpending: new Array(31).fill(0),
      warned80Percent: false,
      warned100Percent: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });
  
  await batch.commit();
});
```

---

## 8. Error Handling Reference

| Error Code | Meaning | Client Response |
|---|---|---|
| `permission-denied` | User not authenticated or accessing wrong data | Redirect to login |
| `not-found` | Document doesn't exist | Show empty state |
| `already-exists` | Duplicate creation attempt | Ignore or notify |
| `resource-exhausted` | Rate limit hit | Retry with exponential backoff |
| `invalid-argument` | Input validation failed | Show inline form error |
| `unavailable` | Network offline | Queue operation; show offline indicator |
| `internal` | Firebase internal error | Show generic error toast |
| `deadline-exceeded` | Operation timed out | Retry |
| `limit-exceeded` | Custom limit (categories) | Show specific message |

---

## 9. Rate Limiting

Implemented in Cloud Functions for callable functions:

```typescript
// 100 requests per minute per user
const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (context) => context.auth?.uid ?? context.rawRequest.ip
});
```

---

*API Specification v1.0 — July 2026*
