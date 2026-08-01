# Frontend Architecture
## SpendWise — Student Expense Tracker

---

## 1. The Core Paradigm: App Router + Server Components

SpendWise is built using the Next.js 14 App Router. However, because SpendWise is a highly interactive, authenticated SPA (Single Page Application) functioning as a Thick Client connected directly to Firebase, we face a specific architectural decision regarding Server Components (RSC).

### 1.1 Server Components vs. Client Components
By default, Next.js 14 renders components on the server. Because our data is locked behind Firebase Auth (which relies on client-side IndexedDB for session persistence) and we require real-time `onSnapshot` listeners, **almost all components within the `/app/(app)/*` routes must be Client Components (`"use client"`).**

### 1.2 The "Shell" Pattern
To optimize loading:
1. `layout.tsx` (Server Component): Renders the initial HTML shell, meta tags, and global providers.
2. `page.tsx` (Client Component): Mounts, verifies Firebase Auth state via a context provider, and then attaches real-time Firestore listeners.

---

## 2. Directory Structure Conventions

```text
src/
├── app/                  # Route definitions (Next.js App Router)
├── components/           # UI layer
│   ├── ui/               # Dumb, reusable atoms (Button, Input, Card)
│   ├── layout/           # Shell, Navbar, Bottom Nav
│   ├── expense/          # Domain: Expense Timeline, Expense Form
│   └── dashboard/        # Domain: Hero Card, Charts
├── hooks/                # Custom React Hooks
│   ├── useAuth.ts        # Firebase Auth listener
│   └── useRequireAuth.ts # Route guard logic
├── lib/                  # Business Logic & Infrastructure
│   ├── firebase/         # Firebase initialization & generic helpers
│   ├── expenses/         # CRUD operations for expenses
│   └── utils/            # Math, date formatting, cn()
├── store/                # Zustand global state (Slices)
└── styles/               # Global CSS & Tailwind Tokens
```

---

## 3. Data Flow & Reactivity

SpendWise avoids the "Prop Drilling" anti-pattern by utilizing a hybrid reactivity model.

1. **Local State (`useState`):** Strictly used for transient UI state (e.g., typing in an input field, toggling a dropdown).
2. **Global State (`Zustand`):** Used for domain data (Expenses array, Budget document) and cross-component UI state (e.g., keeping track of which Bottom Sheet is open).
3. **Database Sync (`useEffect`):** The primary data sync runs exactly once when the App Layout mounts. It attaches an `onSnapshot` listener to Firestore. When the DB updates, the listener fires and calls a Zustand action (`setExpenses`), which causes any component subscribed to the store to re-render.

---

## 4. Lazy Loading & Code Splitting

To ensure the initial JS payload remains under 150KB (gzipped):
- The `jsPDF` library (used for exporting reports) is strictly dynamically imported (`next/dynamic`) ONLY when the user navigates to `/app/reports`.
- The `recharts` library is dynamically imported ONLY when the user visits `/app/analytics`.

```typescript
// Example dynamic import in Next.js
import dynamic from 'next/dynamic'
 
const AnalyticsChart = dynamic(() => import('@/components/dashboard/AnalyticsChart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false // Cannot SSR canvas/svg charts easily with client data
})
```
