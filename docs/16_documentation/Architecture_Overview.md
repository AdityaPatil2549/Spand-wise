# Architecture Overview
## SpendWise — Student Expense Tracker

---

## 1. System Context

SpendWise is a Progressive Web App (PWA) built for mobile-first usage. It acts as a thick client, containing most of the business logic, and communicates directly with Firebase (BaaS) for authentication and data persistence. There is no custom backend server (like Node.js or Python).

```text
+-------------------+       +---------------------+
|                   |       |                     |
|  User's Device    |       |   Google Cloud      |
|  (Mobile Browser) +------>|   (Firebase)        |
|                   |       |                     |
+-------------------+       +---------------------+
      Next.js PWA                Auth + Firestore
```

---

## 2. The Tech Stack

### Frontend Layer
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS Variables (Tokens)
- **State Management:** Zustand (Client state), React Context (Auth state)
- **Icons:** Lucide React
- **Animations:** Framer Motion

### Backend Layer (Firebase BaaS)
- **Database:** Cloud Firestore (NoSQL, real-time sync, offline persistence)
- **Authentication:** Firebase Auth (Google OAuth)
- **Hosting:** Firebase Hosting (for static assets and CDN)

---

## 3. Data Architecture (Thick Client Pattern)

Unlike traditional apps where a backend server validates and computes data, SpendWise uses the "Thick Client + Smart Database" pattern:

1. **Client Logic:** The React frontend calculates remaining budgets, formats data, and constructs database queries.
2. **Direct Database Writes:** The frontend writes directly to Firestore using the Firebase Web SDK.
3. **Atomic Operations:** To maintain integrity between an individual Expense and the Monthly Budget summary, the client uses **Firestore Write Batches**.
4. **Security Enforcement:** Because clients write directly to the DB, security is enforced via **Firestore Security Rules**. These rules validate schema, limits, and ownership on Google's servers before accepting the write.

---

## 4. State Management Flow

1. **Firebase Listener:** `onSnapshot` listens to the user's `expenses` collection.
2. **Store Update:** When data changes locally or remotely, the listener pushes the new array to the Zustand store.
3. **UI Reactivity:** React components subscribe to the Zustand store and re-render automatically.
4. **Optimistic UI:** When adding an expense, the client immediately updates the local state while the Firebase SDK handles the network request in the background.

---

## 5. Deployment Architecture

```text
GitHub Repository -> (Push to main) -> GitHub Actions
                                            |
                                            v
                                     Next.js Build (Static Export)
                                            |
                                            v
                                     Firebase CLI Deploy
                                            |
                                            v
                                     Firebase Hosting Edge CDN -> User
```
Because SpendWise uses Firebase for its backend, the Next.js app is compiled as a static site (SPA mode) and served globally via Firebase's CDN, ensuring near-instant load times.
