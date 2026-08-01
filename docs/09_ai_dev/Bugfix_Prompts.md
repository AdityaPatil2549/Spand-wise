# Bugfix Prompts
## SpendWise — AI Development Prompt Library

Standard prompts for debugging and fixing issues.

---

## BF-001: Generic Bug Report Template

```
I found a bug in SpendWise. Please help me fix it.

BUG DESCRIPTION:
[Describe what is happening]

EXPECTED BEHAVIOR:
[Describe what should happen]

STEPS TO REPRODUCE:
1. [Step 1]
2. [Step 2]
3. [Step 3]

ERROR MESSAGE (if any):
[Paste the exact error message or console output]

AFFECTED FILES (if known):
[List files you suspect are involved]

CONSTRAINTS:
- Do not modify files unrelated to this bug
- Follow all patterns in AGENTS.md
- Add a test case to prevent regression if this is a logic error
```

---

## BF-002: Firestore Data Not Updating

```
The expense list or budget data is not updating in real-time after an add/edit/delete operation.

Please investigate the following areas in order:
1. Check src/lib/firebase/listeners.ts — Is the onSnapshot listener set up correctly? Is it being returned and cleaned up in useEffect?
2. Check src/store/expenses.slice.ts — Is setExpenses being called with the correct data after snapshot fires?
3. Check the Zustand store initialization in src/store/index.ts — Are slices properly combined?
4. Check the affected component — Is it using the correct selector from the store (not stale closure)?
5. Check the Firestore query — Does the isDeleted==false filter correctly exclude soft-deleted items?

Provide a fix that addresses the root cause without changing the overall architecture.
```

---

## BF-003: Budget Calculation Mismatch

```
The dashboard shows an incorrect "remaining budget" or "total spent" amount. The number shown is different from the sum of actual expenses.

Debugging checklist:
1. Check src/lib/expenses/addExpense.ts — Is the writeBatch updating BOTH the expense AND the budget document atomically?
2. Check the budget increment/decrement math — Is it using increment() from Firestore (not a client-side sum)?
3. Check for edit operations: src/lib/expenses/updateExpense.ts — Is it computing the DELTA (new - old) correctly and adjusting the budget by the delta?
4. Check for delete operations: Is the amount being ADDED BACK to the budget on soft delete?
5. Check for the edge case where budgetDocument doesn't exist yet — Is initBudget called before any write?

Fix the calculation so the budget aggregate is always exactly equal to the sum of non-deleted expenses for the month.
```

---

## BF-004: Authentication Loop / Redirect Issue

```
Users are getting stuck in a redirect loop between /login and /app/dashboard, OR users are being sent to /login even when they have a valid session.

Please investigate:
1. Check src/middleware.ts — Is the auth check correct? Is it reading the session cookie properly?
2. Check src/hooks/useAuth.ts — Is onAuthStateChanged firing correctly? Is the Zustand store being updated?
3. Check the protected layout (src/app/(app)/layout.tsx) — Is it checking auth state from Zustand or re-fetching?
4. Check for timing issues: Is there a race condition between the auth state resolving and the route protection triggering?

The fix should:
- Show a loading screen while auth state is resolving (not redirect immediately)
- Only redirect to /login if auth.currentUser is definitively null (not just undefined/loading)
```

---

## BF-005: PDF Generation Failure

```
The PDF download is either not working, producing a blank PDF, or crashing the browser tab.

Investigation steps:
1. Check src/lib/reports/generatePDF.ts — Is it importing jsPDF as a dynamic import (to avoid SSR errors)?
2. Check if charts are being captured — If using html2canvas to capture the donut chart, is the canvas element available when the function runs?
3. Check the expense data being passed — Is it the correct month's data? Is it filtered for isDeleted==false?
4. Check for memory issues — For months with > 200 expenses, is the PDF content being paginated?
5. Check the download trigger — Is it using a Blob URL + anchor click, or the jsPDF .save() method?

Provide a fix that ensures the PDF:
- Always contains the correct month's data
- Handles empty months with a friendly "no expenses" message
- Downloads successfully on both mobile (Share Sheet) and desktop
```
