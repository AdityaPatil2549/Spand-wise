# Edge Cases
## SpendWise — Student Expense Tracker

---

## 1. Authentication Edge Cases

### EC-AUTH-001: Auth Token Expiry Mid-Session
**Scenario:** User's Firebase auth token expires (after 1 hour) while actively using the app  
**Expected Behavior:** Firebase SDK automatically refreshes token silently. User experiences no interruption.  
**Failure Case:** If refresh fails (network down), user sees "Session expired. Please sign in again." toast and is redirected to login.

### EC-AUTH-002: Same Account on 5+ Devices Simultaneously
**Scenario:** User is logged in on phone, tablet, laptop, desktop, and college computer  
**Expected Behavior:** All 5 devices receive real-time updates. No session limit imposed.  
**Concern:** Heavy Firestore reads. Mitigated by listener optimization (single document listeners, not collection scans).

### EC-AUTH-003: Google Account Email Changed
**Scenario:** User changes their Google account email after linking to SpendWise  
**Expected Behavior:** Firebase Auth handles this transparently. Display email in app may not update.  
**Action Required:** Show email from Firebase Auth (always current), not cached Firestore value.

### EC-AUTH-004: Network Failure During Login
**Scenario:** Network drops between clicking "Sign in" and completing OAuth  
**Expected Behavior:** Firebase returns `auth/network-request-failed`. Show toast "No internet connection. Please try again."  
**DO NOT:** Show generic "Something went wrong" — be specific.

---

## 2. Expense Entry Edge Cases

### EC-EXP-001: Add Expense at Midnight (Month Boundary)
**Scenario:** User adds expense at 11:59 PM on July 31 and another at 12:01 AM on August 1  
**Expected Behavior:** 11:59 PM expense → July records; 12:01 AM expense → August records  
**Implementation:** Use client-side `new Date()` for the timestamp; `month` field derived from this date  
**Risk:** If client timezone is incorrect, month assignment will be wrong  
**Mitigation:** Store timezone in user document; display dates in user's local timezone

### EC-EXP-002: Backdating to Previous Month
**Scenario:** User tries to backdate an expense to June when current month is July  
**Expected Behavior:** Date picker should be limited to current month only (MVP)  
**Rationale:** Prevents complex multi-month budget impact calculations  
**Future:** v2 will allow cross-month backdating

### EC-EXP-003: Very Large Expense Amount
**Scenario:** User enters ₹9,99,999 (just under maximum)  
**Expected Behavior:** Accepted, display formatted correctly (₹9,99,999)  
**Scenario:** User enters ₹10,00,001 (above maximum)  
**Expected Behavior:** Rejected with validation error. Max is ₹10,00,000.

### EC-EXP-004: Amount with Decimal (₹150.50)
**Scenario:** User enters ₹150.50 (half-rupee)  
**Expected Behavior:** Accept and display ₹150.50  
**Storage:** Store as float (150.5)  
**Display:** Round to 2 decimal places only when non-zero (₹150.50 shown, ₹150 shown not ₹150.00)

### EC-EXP-005: Paste Very Long Note
**Scenario:** User pastes 500-character text into note field  
**Expected Behavior:** Note field accepts up to 200 characters; silently truncates at character 200  
**OR:** Show character counter "150/200" and prevent typing after 200

### EC-EXP-006: Add 200+ Expenses in One Month
**Scenario:** Power user logs 300 expenses in July  
**Expected Behavior:** All 300 load correctly (pagination: 20 per page, load more on scroll)  
**Performance Impact:** Budget document's `dailySpending` array handles this correctly (just increments). Category breakdown handles many categories.  
**Concern:** If >100 expenses in single Firestore query, performance degrades. Ensure `limit(100)` with pagination is in place.

### EC-EXP-007: Duplicate Expense (Same Amount + Category + Note within 5 seconds)
**Scenario:** User accidentally taps "Add Expense" twice in quick succession  
**Expected Behavior:** Both expenses are created (no de-duplication — users may intentionally add same expense twice, e.g., two bus fares)  
**Protection:** FAB/button is disabled for 500ms after submission to prevent accidental double-tap

### EC-EXP-008: Network Failure During Expense Add
**Scenario:** Network fails after user taps "Add Expense" but before Firestore write completes  
**Expected Behavior (with offline persistence):**  
1. Expense appears in local UI (optimistic)  
2. Stored in Firestore's pending queue  
3. When network restores: syncs automatically  
**No data loss scenario.**

### EC-EXP-009: Concurrent Edit (Same Expense from Two Devices)
**Scenario:** User edits the same expense on Phone (changes amount to ₹200) and Browser (changes note) simultaneously  
**Expected Behavior:** Last write wins (Firestore server timestamp). One change will overwrite the other.  
**Mitigation:** Show a "Conflict" indicator if update timestamp differs from expected (v2 feature)

---

## 3. Budget Edge Cases

### EC-BUDGET-001: Budget Set to Zero
**Scenario:** User somehow sets budget to ₹0  
**Expected Behavior:** Prevented by validation (budget must be > 0). If reached programmatically, show "Please set a budget" prompt.

### EC-BUDGET-002: Total Spend Exceeds Budget by Large Margin (5×)
**Scenario:** User has budget ₹5,000 and spends ₹25,000  
**Expected Behavior:**  
- Shows "-₹20,000 over budget" (not just a percentage)  
- Progress bar shows 500% fill (capped visually at 100%, but text shows actual overrun)  
- Budget card stays red (danger state)

### EC-BUDGET-003: Mid-Month Budget Change
**Scenario:** User changes budget from ₹8,000 to ₹12,000 on July 15th after spending ₹5,000  
**Expected Behavior:**  
- New budget: ₹12,000  
- Already spent: ₹5,000 (unchanged)  
- Remaining: ₹7,000  
- Progress: 41.7% (recalculated immediately)  
- 80%/100% warnings reset (new budget triggers fresh threshold calculations)

### EC-BUDGET-004: Month Transition at Midnight
**Scenario:** July 31 → August 1 transition  
**Expected Behavior:**  
- Monthly reset Cloud Function (scheduled for 00:01 IST) creates new August budget document  
- Dashboard immediately shows ₹0 spent, full budget remaining  
- July expenses remain accessible in History/Reports  
**Risk:** Cloud Function may be delayed by up to 5 minutes. Handle gracefully: if current month budget document doesn't exist yet, create it on first user access.

### EC-BUDGET-005: Budget Warning Already Sent, Expense Deleted
**Scenario:** User hits 80% → gets warning → deletes expenses → falls below 80% → adds more → hits 80% again  
**Expected Behavior:** Second 80% warning should fire again  
**Implementation:** When expenses bring total below 80%, reset `warned80Percent: false` on the budget document so the warning can fire again next time 80% is reached.

---

## 4. Sync & Offline Edge Cases

### EC-SYNC-001: Very Slow Connection (2G/Edge)
**Scenario:** User on 2G network adds expense  
**Expected Behavior:** Optimistic UI shows expense immediately. Sync takes 3–10 seconds. "Syncing..." indicator visible. No timeout.

### EC-SYNC-002: App Open During Network Transition (WiFi → Mobile Data)
**Scenario:** User switches from WiFi to mobile data while app is open  
**Expected Behavior:** Firebase SDK reconnects automatically. Real-time listeners resume. No manual action needed.

### EC-SYNC-003: Firestore Offline Cache Full
**Scenario:** User's device storage is nearly full; Firestore cache cannot write  
**Expected Behavior:** Firebase may disable offline persistence silently. Operations require network. Handle by catching `FirebaseError` with code `storage-exhausted`.

### EC-SYNC-004: Long Offline Period (1 Week)
**Scenario:** User is offline for 7 days (camp, no internet), then reconnects  
**Expected Behavior:**  
- All locally-cached expenses and data remain readable  
- Any offline-queued writes sync on reconnect  
- Month may have changed (July → August): new budget document created on first online access  
- Old cached data for July still accessible

---

## 5. Multi-Device Edge Cases

### EC-MULTI-001: Logout on One Device, App Open on Another
**Scenario:** User logs out on laptop; phone still has app open  
**Expected Behavior:** Firebase Auth token on phone eventually expires (within 1 hour). App detects expired token and redirects to login.  
**Note:** Phone doesn't logout immediately unless Firebase Admin SDK revokes tokens (we won't do this in v1).

### EC-MULTI-002: Account Deleted, Second Device Still Open
**Scenario:** User deletes account on laptop; phone app still open  
**Expected Behavior:** When phone makes next Firestore request, security rules deny (user deleted). App should detect `permission-denied` and redirect to login.

---

## 6. Data Edge Cases

### EC-DATA-001: No Expenses in Month (Empty State)
**Scenario:** User opens app on the 1st of a new month  
**Expected Behavior:**  
- Dashboard shows "₹10,000 remaining" (full budget)  
- Progress bar: 0%  
- "No expenses yet" empty state in expense list  
- Analytics shows "No data for this month yet"  
- No chart rendered (not empty chart)

### EC-DATA-002: Single Expense in Month
**Scenario:** User has exactly 1 expense  
**Expected Behavior:** Donut chart shows 100% for one category (full circle, one color). Daily chart shows single spike.

### EC-DATA-003: All Expenses Same Category
**Scenario:** 20 expenses, all "Food & Dining"  
**Expected Behavior:** Donut chart shows 100% food (solid circle). Category list shows only one entry at 100%.

### EC-DATA-004: Custom Category Deleted After Use
**Scenario:** User created "Gym Membership" category, added 5 expenses, then deletes the category  
**Expected Behavior:** Category is soft-archived (isActive: false). Old expenses still show "Gym Membership" category (data preserved). Category no longer available for new expenses.  
**Implementation:** Expenses store denormalized `categoryName` — old expenses retain their data even if category archived.

---

## 7. PDF Report Edge Cases

### EC-PDF-001: Month With 0 Expenses
**Scenario:** Generate report for a month with no expenses  
**Expected Behavior:** PDF generated with "No expenses recorded for [Month Year]" instead of empty tables. Not an error.

### EC-PDF-002: Month With 200+ Expenses
**Scenario:** Generate report for a month with 300 expenses  
**Expected Behavior:** PDF paginates transaction list across multiple pages. No truncation.  
**Performance:** Should still complete within 5 seconds (not 3).

### EC-PDF-003: Very Long Expense Notes
**Scenario:** Note contains 200 characters  
**Expected Behavior:** Note wraps within PDF table cell. Does not overflow table.

### EC-PDF-004: Special Characters in Notes
**Scenario:** Note contains: ₹, &, <, >, "quotes", 'apostrophes'  
**Expected Behavior:** All characters render correctly in PDF. No HTML entities visible (₹ not &rupee;).

---

## 8. Performance Edge Cases

### EC-PERF-001: Dashboard Load with 500 Expenses in Month
**Scenario:** Power user has 500 expenses this month  
**Expected Behavior:** Dashboard loads in under 3 seconds (not 2 as normal) because budget document holds pre-computed aggregates. Expense list paginates.

### EC-PERF-002: Simultaneous Add from 3 Devices
**Scenario:** Same user adds expense on phone, browser tab 1, and browser tab 2 simultaneously  
**Expected Behavior:** All 3 expenses created. Budget document updated by Cloud Function using recalculation (not increment) to avoid race conditions. Final totalSpent = sum of all expenses.

---

*Edge Cases v1.0 — July 2026. Review and update as new edge cases are discovered in production.*
