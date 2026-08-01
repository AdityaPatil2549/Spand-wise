# Known Limitations & Trade-offs
## SpendWise — Student Expense Tracker

---

## 1. Architectural Trade-offs

### 1.1 Thick Client / No Custom Backend
- **Decision:** All business logic (like aggregating expenses into a budget total) runs on the client or via Firestore atomic batches, rather than a dedicated Node.js server.
- **Benefit:** Zero server maintenance costs, incredibly fast local performance, full offline support.
- **Limitation:** If a user somehow bypasses the client UI and uses the REST API maliciously, they could theoretically write an expense without updating their budget total (though security rules prevent them from modifying *other* users' data).

### 1.2 No Server-Side Rendering (SSR)
- **Decision:** The app is a statically exported SPA (Single Page Application) relying on client-side fetching from Firebase.
- **Benefit:** Can be hosted on Firebase Hosting for free with global CDN caching.
- **Limitation:** SEO is minimal (though not important for an authenticated tracker), and the initial JS bundle must load before the app becomes fully interactive.

---

## 2. Feature Limitations (MVP)

### 2.1 Single Currency
- **Limitation:** The app assumes a single currency (₹ INR) globally.
- **Impact:** Students studying abroad or dealing with multiple currencies cannot track them accurately without mental math.
- **Workaround:** Enter the localized amount in INR.

### 2.2 Pre-defined Categories Only
- **Limitation:** Users cannot create their own custom categories in v1.0.
- **Impact:** Some specific expenses (e.g., "Genshin Impact Top-up") must be lumped into broader categories like "Entertainment".
- **Reasoning:** Keeps the UI simple, prevents analysis paralysis, and simplifies the pie charts.

### 2.3 Strict Monthly Reset
- **Limitation:** Budgets are strictly calendar-month bound (1st to 30th/31st).
- **Impact:** If a student receives their allowance on the 15th of every month, the tracking cycle will misalign with their cash flow.
- **Future Fix:** v2.0 will introduce custom budget cycle start dates.

---

## 3. Technical Limitations

### 3.1 Pagination
- **Limitation:** The current expense list fetches up to the last 100 expenses per month without pagination.
- **Impact:** A student logging 500 expenses a month might experience slight UI lag on the list view.
- **Context:** 100 expenses is ~3 per day, which covers 95% of use cases.

### 3.2 Offline Conflict Resolution
- **Limitation:** If a user edits the *same* expense on their phone (offline) and their laptop (online), the last write to reach the server wins.
- **Context:** Standard Firebase behavior. Complex CRDT (Conflict-free Replicated Data Type) resolution is overkill for a personal expense tracker.
