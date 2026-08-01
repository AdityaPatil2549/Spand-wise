# Dependency List
## SpendWise — Student Expense Tracker

---

## 1. Core Framework
- **`next`** (^14.0.0): The React framework (App Router).
- **`react`** (^18.2.0): UI library.
- **`react-dom`** (^18.2.0): DOM bindings.

## 2. Backend & Data
- **`firebase`** (^10.0.0): Client SDK for Auth and Firestore.
- **`zustand`** (^4.4.0): Lightweight global state management for caching Firebase data locally.

## 3. Styling & UI
- **`tailwindcss`** (^3.3.0): Utility-first CSS framework.
- **`framer-motion`** (^10.16.0): Complex animations and gesture handling (bottom sheets).
- **`lucide-react`** (^0.290.0): Icon library.
- **`clsx`** & **`tailwind-merge`**: Utility functions for dynamic class names.
- **`recharts`** (^2.10.0): For rendering the Analytics pie/bar charts.

## 4. Utility & Validation
- **`zod`** (^3.22.0): TypeScript-first schema declaration and validation.
- **`date-fns`** (^3.0.0): Lightweight date formatting and manipulation.

## 5. Build Tools & DevDependencies
- **`typescript`**: Static typing.
- **`eslint`** & **`eslint-config-next`**: Linting.
- **`prettier`**: Code formatting.
- **`playwright`**: End-to-end testing.
- **`jest`**: Unit testing.

---

## Rationale for Dependencies
- **Why not Redux?** Too much boilerplate. Zustand provides the exact slice pattern we need with minimal overhead.
- **Why not Chart.js?** Recharts is built specifically for React, offering declarative composition that matches our UI component architecture.
- **Why not Moment.js?** Deprecated and too large. `date-fns` allows importing only the specific functions needed (tree-shaking).
