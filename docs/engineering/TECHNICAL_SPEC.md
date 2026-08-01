# Technical Specification
## SpendWise — Student Expense Tracker
**Version:** 1.0 | **Status:** APPROVED

---

## 1. Technology Stack

### 1.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.x (App Router) | React framework, routing, SSR/SSG |
| TypeScript | 5.x | Type safety |
| React | 18.x | UI library |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | 10.x | Animations |
| Zustand | 4.x | Global state management |
| React Query (TanStack) | 5.x | Server state + caching |
| Recharts | 2.x | Data visualization |
| React Hook Form | 7.x | Form state management |
| Zod | 3.x | Schema validation |
| jsPDF | 2.x | PDF generation |
| SheetJS (xlsx) | 0.18 | CSV/Excel export |
| Lucide React | Latest | Icon library |
| date-fns | 3.x | Date utilities |
| clsx | 2.x | Conditional className utility |

### 1.2 Backend / Infrastructure

| Technology | Version | Purpose |
|---|---|---|
| Firebase Auth | 10.x | Authentication (Google + Email) |
| Firestore | 10.x | Primary database + real-time sync |
| Firebase Cloud Functions | Gen 2 | Server-side logic (budget recalculation) |
| Firebase Hosting | Latest | Static site hosting |
| Firebase Analytics | Latest | User behavior analytics |
| Firebase Cloud Messaging | Latest | Push notifications |
| Firebase Storage | Latest | PDF/report storage |

### 1.3 Development Tools

| Tool | Purpose |
|---|---|
| Vitest | Unit + integration testing |
| Playwright | E2E testing |
| ESLint + Prettier | Code quality |
| Husky | Pre-commit hooks |
| GitHub Actions | CI/CD |
| Vercel | Alternative deployment |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js 14 (App Router)                            │   │
│  │  ┌───────────┐ ┌────────────┐ ┌────────────────┐   │   │
│  │  │ Dashboard │ │  Expenses  │ │   Analytics    │   │   │
│  │  │  Screen   │ │   Screen   │ │    Screen      │   │   │
│  │  └───────────┘ └────────────┘ └────────────────┘   │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Zustand Store (Global State)                │  │   │
│  │  │  • auth slice  • expenses slice              │  │   │
│  │  │  • budget slice • ui slice                   │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Firebase Client SDK                         │  │   │
│  │  │  • Auth listener                             │  │   │
│  │  │  • Firestore onSnapshot listeners            │  │   │
│  │  │  • Offline persistence                       │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    TLS 1.3   │   WebSocket (Firestore)
                              │
┌─────────────────────────────────────────────────────────────┐
│                   FIREBASE LAYER                            │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Firebase    │  │  Firestore   │  │  Cloud Functions  │  │
│  │ Auth        │  │  Database    │  │  (Budget calc)   │  │
│  │             │  │              │  │                  │  │
│  │ • Google    │  │ • users      │  │ • onExpenseWrite │  │
│  │ • Email     │  │ • expenses   │  │ • sendAlert      │  │
│  │             │  │ • budgets    │  │ • cleanupDeleted │  │
│  └─────────────┘  │ • categories │  └──────────────────┘  │
│                   │ • reports    │                         │
│                   └──────────────┘                         │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Firebase    │  │ Firebase     │  │ Firebase         │  │
│  │ Hosting     │  │ Analytics    │  │ Storage          │  │
│  │             │  │              │  │ (PDF reports)    │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Application Architecture (Frontend)

### 3.1 Next.js App Router Structure

```
src/app/
├── layout.tsx              # Root layout (providers, fonts, global styles)
├── page.tsx                # Landing / redirect to /dashboard
├── (auth)/                 # Auth route group (no nav)
│   ├── login/
│   │   └── page.tsx
│   └── onboarding/
│       └── page.tsx
├── (app)/                  # Main app route group (with nav)
│   ├── layout.tsx          # App layout (bottom nav, sidebar)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── expenses/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── analytics/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   └── settings/
│       ├── page.tsx
│       ├── budget/
│       │   └── page.tsx
│       ├── categories/
│       │   └── page.tsx
│       └── account/
│           └── page.tsx
└── api/                    # Next.js API routes (minimal)
    └── health/
        └── route.ts
```

### 3.2 State Architecture (Zustand)

```typescript
// Global store slices:

interface AuthSlice {
  user: FirebaseUser | null;
  userDoc: UserDocument | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Actions
  setUser: (user: FirebaseUser | null) => void;
  setUserDoc: (doc: UserDocument) => void;
}

interface ExpensesSlice {
  expenses: ExpenseDocument[];
  isLoading: boolean;
  hasMore: boolean;
  lastVisible: DocumentSnapshot | null;
  // Filters
  activeMonth: string;          // 'YYYY-MM'
  activeCategoryFilter: string | null;
  // Actions
  setExpenses: (expenses: ExpenseDocument[]) => void;
  addExpense: (expense: ExpenseDocument) => void;
  updateExpense: (id: string, data: Partial<ExpenseDocument>) => void;
  removeExpense: (id: string) => void;
  setActiveMonth: (month: string) => void;
}

interface BudgetSlice {
  budget: BudgetDocument | null;
  isLoading: boolean;
  // Actions
  setBudget: (budget: BudgetDocument) => void;
}

interface UISlice {
  isAddExpenseOpen: boolean;
  editingExpenseId: string | null;
  toast: ToastMessage | null;
  // Actions
  openAddExpense: () => void;
  closeAddExpense: () => void;
  setEditingExpense: (id: string | null) => void;
  showToast: (toast: ToastMessage) => void;
}
```

### 3.3 Real-Time Sync Architecture

```typescript
// src/lib/firebase/listeners.ts

// Manages all Firestore onSnapshot listeners
class RealtimeManager {
  private unsubscribers: Map<string, Unsubscribe> = new Map();
  
  // Called after authentication
  startListeners(userId: string) {
    // 1. User document listener
    this.addListener('user', 
      doc(db, 'users', userId),
      (snap) => store.setUserDoc(snap.data())
    );
    
    // 2. Current month budget listener
    this.addListener('budget',
      doc(db, 'budgets', `${userId}_${currentMonth()}`),
      (snap) => store.setBudget(snap.data())
    );
    
    // 3. Current month expenses listener
    this.addListener('expenses',
      query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        where('month', '==', currentMonth()),
        where('isDeleted', '==', false),
        orderBy('date', 'desc'),
        limit(100)
      ),
      (snap) => {
        const expenses = snap.docs.map(d => d.data());
        store.setExpenses(expenses);
      }
    );
  }
  
  stopListeners() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers.clear();
  }
}
```

---

## 4. Cloud Functions Architecture

### 4.1 Function: `onExpenseWrite`

**Trigger:** Firestore write to `expenses/{expenseId}`  
**Purpose:** Recalculate budget aggregations

```typescript
export const onExpenseWrite = onDocumentWritten(
  'expenses/{expenseId}',
  async (event) => {
    const before = event.data?.before.data() as ExpenseDocument | undefined;
    const after  = event.data?.after.data() as ExpenseDocument | undefined;
    
    // Determine the affected userId and month
    const userId = (after ?? before)!.userId;
    const month  = (after ?? before)!.month;
    
    // Recalculate total from scratch (more reliable than increments)
    const snapshot = await db
      .collection('expenses')
      .where('userId', '==', userId)
      .where('month', '==', month)
      .where('isDeleted', '==', false)
      .get();
    
    // Aggregate
    const breakdown: CategoryBreakdown = {};
    const dailySpending = new Array(31).fill(0);
    let totalSpent = 0;
    
    snapshot.docs.forEach(doc => {
      const exp = doc.data() as ExpenseDocument;
      totalSpent += exp.amount;
      
      // Category breakdown
      if (!breakdown[exp.categoryId]) {
        breakdown[exp.categoryId] = { amount: 0, count: 0, percentage: 0 };
      }
      breakdown[exp.categoryId].amount += exp.amount;
      breakdown[exp.categoryId].count += 1;
      
      // Daily spending (day of month from date)
      const dayIndex = new Date(exp.date.toDate()).getDate() - 1;
      dailySpending[dayIndex] += exp.amount;
    });
    
    // Calculate percentages
    Object.keys(breakdown).forEach(catId => {
      breakdown[catId].percentage = totalSpent > 0 
        ? (breakdown[catId].amount / totalSpent) * 100 
        : 0;
    });
    
    // Get budget amount
    const budgetRef = db.doc(`budgets/${userId}_${month}`);
    const budgetSnap = await budgetRef.get();
    const budgetAmount = budgetSnap.data()?.amount ?? 0;
    
    // Update budget document
    await budgetRef.set({
      totalSpent,
      remainingAmount: budgetAmount - totalSpent,
      percentUsed: budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0,
      categoryBreakdown: breakdown,
      dailySpending,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    
    // Check and send alerts
    await checkBudgetAlerts(userId, totalSpent, budgetAmount, budgetSnap.data());
  }
);
```

### 4.2 Function: `checkBudgetAlerts`

```typescript
async function checkBudgetAlerts(
  userId: string,
  totalSpent: number,
  budgetAmount: number,
  budgetData: any
) {
  const percentUsed = (totalSpent / budgetAmount) * 100;
  
  if (percentUsed >= 80 && !budgetData?.warned80Percent) {
    await sendPushNotification(userId, {
      title: '⚠️ Budget Alert',
      body: `You've used 80% of your budget. ₹${budgetAmount - totalSpent} remaining.`
    });
    await budgetRef.update({ warned80Percent: true });
  }
  
  if (percentUsed >= 100 && !budgetData?.warned100Percent) {
    await sendPushNotification(userId, {
      title: '🔴 Budget Exceeded',
      body: `You've exceeded your budget by ₹${totalSpent - budgetAmount}.`
    });
    await budgetRef.update({ warned100Percent: true });
  }
}
```

---

## 5. Authentication Architecture

### 5.1 Auth Flow

```
User opens app
       │
       ▼
Firebase Auth.onAuthStateChanged()
       │
    ┌──┴──┐
    │     │
   Auth  No Auth
    │     │
    │     ▼
    │  Show /login
    │     │
    │  User signs in (Google / Email)
    │     │
    ▼     ▼
Check Firestore users/{uid}
       │
    ┌──┴──┐
    │     │
 Exists  New User
    │     │
    │     ▼
    │  Create user document
    │  → Set onboardingComplete: false
    │     │
    ▼     ▼
onboardingComplete?
       │
    ┌──┴──┐
    │     │
   Yes    No
    │     │
    ▼     ▼
Dashboard  /onboarding
           (set budget)
               │
               ▼
           Dashboard
```

### 5.2 Auth Provider Setup

```typescript
// src/lib/firebase/auth.ts

import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signInWithEmail = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password);

export const createAccount = async (email: string, password: string, displayName: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user);
  return credential;
};
```

---

## 6. Offline Architecture

### 6.1 Firestore Offline Persistence

```typescript
// src/lib/firebase/index.ts
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()  // Multi-tab support
  })
});
```

### 6.2 Optimistic UI Updates

When a user adds an expense:
1. **Immediately:** Update Zustand store (expense appears in list, budget updates visually)
2. **Asynchronously:** Write to Firestore
3. **On success:** Replace optimistic document with server-confirmed document
4. **On failure:** Roll back Zustand state, show error toast

```typescript
// src/lib/expenses/addExpense.ts

export const addExpense = async (data: AddExpenseInput): Promise<void> => {
  // 1. Generate temporary ID for optimistic update
  const tempId = `temp_${Date.now()}`;
  
  // 2. Optimistic UI update
  store.getState().addExpense({ ...data, id: tempId, syncing: true });
  store.getState().updateBudgetOptimistically(data.amount);
  
  try {
    // 3. Firestore write
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // 4. Replace temp with real document
    store.getState().replaceExpense(tempId, docRef.id);
    
  } catch (error) {
    // 5. Rollback
    store.getState().removeExpense(tempId);
    store.getState().rollbackBudget(data.amount);
    throw error;
  }
};
```

---

## 7. PDF Generation Architecture

Reports are generated **entirely client-side** using jsPDF (no server dependency).

```typescript
// src/lib/reports/pdfGenerator.ts

export const generateMonthlyPDF = async (
  month: string,
  expenses: ExpenseDocument[],
  budget: BudgetDocument,
  user: UserDocument
): Promise<Blob> => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  // Page 1: Cover
  pdf.addPage();
  addCoverPage(pdf, { month, user, budget });
  
  // Page 2: Summary + Charts
  const chartCanvas = await generateDonutChart(budget.categoryBreakdown);
  addSummaryPage(pdf, { budget, chartCanvas });
  
  // Page 3+: Transaction List
  addTransactionPages(pdf, expenses);
  
  return pdf.output('blob');
};
```

---

## 8. Performance Architecture

### 8.1 Code Splitting Strategy
- Route-based code splitting (Next.js automatic)
- Dynamic imports for heavy libraries (jsPDF, SheetJS — loaded only on Reports page)
- Chart components lazy-loaded

### 8.2 Image Optimization
- Next.js `<Image>` for all images
- User avatar: load from Google CDN; fallback to initials
- Category icons: inline SVG or emoji (no image loading overhead)

### 8.3 Caching Strategy

| Data | Cache Strategy | TTL |
|---|---|---|
| User document | Firestore offline cache | Persistent |
| Expenses | Firestore offline cache | Persistent |
| Budget document | Firestore offline cache | Persistent |
| PDF reports | IndexedDB | 24 hours |
| Static assets | Service Worker cache | 30 days |

### 8.4 Bundle Size Targets

| Bundle | Target |
|---|---|
| First Load JS | < 100 KB (gzipped) |
| Total Page JS | < 200 KB (gzipped) |
| CSS | < 20 KB (gzipped) |

---

## 9. Security Architecture

### 9.1 Authentication Security
- Firebase handles token management (JWT, auto-refresh)
- Short-lived ID tokens (1 hour); refresh tokens stored in Firebase SDK
- No custom token storage in localStorage

### 9.2 Data Security
- All Firestore reads/writes protected by Security Rules (see DATABASE_SCHEMA.md)
- User can only read/write their own data
- Server-side rule enforcement (cannot be bypassed by client)

### 9.3 Input Validation
- Client-side: Zod schemas validate all form inputs before submission
- Firestore rules: Server-side validation of amount ranges, note length
- XSS prevention: All user content treated as plain text; no HTML rendering

### 9.4 Dependency Security
- Dependabot enabled for automatic security PRs
- npm audit in CI pipeline
- No dependencies with known critical vulnerabilities

---

## 10. Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# App Configuration
NEXT_PUBLIC_APP_URL=https://spendwise.app
NEXT_PUBLIC_APP_ENV=production  # development | staging | production

# Feature Flags
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_PRO_FEATURES=false
```

All secrets validated at startup using Zod:
```typescript
// src/lib/config/env.ts
const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  // ... all other vars
});

export const env = envSchema.parse(process.env);
```

---

*Technical Specification v1.0 — July 2026*
