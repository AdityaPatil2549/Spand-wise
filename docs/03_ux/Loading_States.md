# Loading States
## SpendWise — Student Expense Tracker

Loading states bridge the gap between a user action and the system response, providing visual feedback that prevents confusion and perceived freezing.

---

## 1. Loading State Philosophy

- **Always show progress:** No blank screens, ever.
- **Use skeletons over spinners for content:** Skeleton screens are less jarring and set layout expectations.
- **Use spinners for actions:** Button spinners for form submissions; inline spinners for quick lookups.
- **Keep it short:** If loading takes > 3 seconds, something is architecturally wrong. Loading states are a band-aid, not a solution.

---

## 2. Skeleton Screens

Skeleton screens are animated placeholder layouts that match the shape of the real content.

### 2.1 Dashboard Skeleton
```
[━━━━━━━━━━━━━━━━━━━━━━] ← Greeting skeleton (140px wide, 24px high)
[████████████████████████████] ← Budget Hero Card skeleton (full width, 160px high)
[▓▓▓▓▓▓] [▓▓▓▓▓▓] [▓▓▓▓▓▓] ← 3 stat mini-cards skeleton
━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ← Divider
[●] [━━━━━━━━] [━━━] ← 5 expense item skeletons
[●] [━━━━━━━━] [━━━]
[●] [━━━━━━━━] [━━━]
```

Animation: Shimmer effect (gradient sweeping from left to right, 1.5s loop).

### 2.2 Expense List Skeleton
- 8 expense item skeletons
- Each: circular category avatar placeholder + two line stubs + amount stub

### 2.3 Analytics Skeleton
- Circular ring placeholder (donut chart)
- 4 category list item skeletons below

---

## 3. Spinner States

Used for action-triggered loading, not content loading.

| Trigger | Location | Spinner Type |
|:---|:---|:---|
| "Add Expense" button tapped | Inside the button, replaces text | 18px spinner, white color |
| "Download PDF" tapped | Inside the button | 18px spinner + "Generating..." text |
| "Save Changes" in Edit sheet | Inside the button | 18px spinner |
| Sign In button | Inside the button | 18px spinner |
| Expense deletion | Small spinner on the expense row | 14px inline spinner |

---

## 4. Optimistic Loading (Instant UI)

For expense additions and deletions, we skip the loading state entirely by using optimistic updates.

**Flow:**
1. User taps "Add Expense".
2. App immediately closes the sheet and adds the expense to the list (locally, without waiting for Firestore).
3. Budget card updates immediately with the new amount.
4. In the background, the Firestore write completes.
5. If the write fails, the optimistic update is rolled back and an error toast appears.

**This means the user experiences ZERO loading time for the most common action.**

---

## 5. Transition Loading (Page Navigation)

For navigating between tabs or pages:
- No full-page loading screen for tab switches (data is pre-fetched or cached).
- For month selection (Analytics), show a subtle opacity pulse (0.5s) while data loads.
- Never block navigation; always show something immediately.

---

## 6. Timing Guidelines

| Operation | Expected Duration | Loading Treatment |
|:---|:---|:---|
| Tab navigation | < 100ms | Instant, no loader |
| Dashboard first load | 500ms–1.5s | Skeleton screen |
| Add expense (optimistic) | < 50ms (UI) | No loader (instant) |
| Expense list (month change) | 200ms–1s | Skeleton screen |
| Analytics chart | 300ms–1.5s | Chart placeholder ring |
| PDF generation | 1–5s | Button spinner + "Generating..." |
| Sign in | 500ms–2s | Button spinner |
