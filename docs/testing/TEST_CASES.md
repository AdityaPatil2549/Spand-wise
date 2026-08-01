# Test Cases
## SpendWise — Student Expense Tracker

---

## TC-AUTH: Authentication Test Cases

### TC-AUTH-001: Google Sign In — Happy Path
**Priority:** P0  
**Preconditions:** User has a Google account, not previously registered with SpendWise  
**Steps:**
1. Open SpendWise app
2. Tap "Continue with Google"
3. Select Google account in popup
4. Complete OAuth flow

**Expected Results:**
- User is authenticated
- New user document created in Firestore
- User redirected to /onboarding (first time)
- Display name and photo imported from Google

---

### TC-AUTH-002: Google Sign In — Returning User
**Priority:** P0  
**Preconditions:** User has previously signed up and completed onboarding  
**Steps:**
1. Open SpendWise (previously logged out)
2. Tap "Continue with Google"
3. Complete OAuth

**Expected Results:**
- User redirected to /dashboard (not onboarding)
- Existing data loads correctly
- `lastSeen` field updated in Firestore

---

### TC-AUTH-003: Email Registration — Valid Input
**Priority:** P1  
**Steps:**
1. Enter valid email (test@example.com)
2. Enter valid password (min 8 chars: Password1!)
3. Tap "Create Account"

**Expected Results:**
- Account created successfully
- Verification email sent
- User redirected to onboarding

---

### TC-AUTH-004: Email Registration — Duplicate Email
**Steps:**
1. Enter email already registered: existing@test.com
2. Enter any valid password
3. Tap "Create Account"

**Expected Results:**
- Error displayed: "An account with this email already exists. Sign in instead."
- No new account created
- Login link shown

---

### TC-AUTH-005: Email Login — Wrong Password
**Steps:**
1. Enter registered email
2. Enter wrong password
3. Tap "Sign In"

**Expected Results:**
- Error displayed: "Incorrect email or password"
- Account NOT locked (up to 5 attempts)
- After 5 attempts: CAPTCHA appears

---

### TC-AUTH-006: Auto Login — Persistent Session
**Steps:**
1. Sign in successfully
2. Close browser tab
3. Reopen SpendWise URL

**Expected Results:**
- User is automatically logged in
- Dashboard loads without showing login screen

---

### TC-AUTH-007: Logout
**Steps:**
1. Navigate to Settings
2. Tap "Logout"
3. Confirm in dialog

**Expected Results:**
- User redirected to login screen
- Auth token cleared
- Real-time listeners stopped
- Navigation to /dashboard redirects to /login

---

## TC-EXPENSE: Expense CRUD Test Cases

### TC-EXP-001: Add Expense — Minimum Valid Input
**Priority:** P0  
**Preconditions:** User logged in, budget set (₹10,000)  
**Steps:**
1. Tap FAB button
2. Enter amount: 150
3. Tap "Food & Dining" category
4. Tap "Add Expense"

**Expected Results:**
- Bottom sheet closes
- Expense appears at top of list: "₹150 · Food & Dining · Just now"
- Dashboard remaining budget decreases: ₹10,000 → ₹9,850
- Success toast: "₹150 added to Food & Dining"
- Budget progress bar updates

---

### TC-EXP-002: Add Expense — With Note
**Steps:**
1. Tap FAB
2. Enter amount: 450
3. Tap "Food & Dining"
4. Enter note: "Lunch at mess + chai"
5. Tap "Add Expense"

**Expected Results:**
- Expense appears with note as subtitle: "Lunch at mess + chai"

---

### TC-EXP-003: Add Expense — Backdated
**Steps:**
1. Tap FAB
2. Enter amount: 200
3. Tap "Transport"
4. Tap date field (shows today)
5. Select yesterday's date
6. Tap "Add Expense"

**Expected Results:**
- Expense appears under "Yesterday" group in expense list
- NOT under "Today" group

---

### TC-EXP-004: Add Expense — Invalid Amount (Zero)
**Steps:**
1. Tap FAB
2. Enter amount: 0
3. Tap "Food & Dining"
4. Tap "Add Expense"

**Expected Results:**
- "Add Expense" button remains disabled (amount > 0 required)
- OR inline validation error: "Please enter a valid amount greater than 0"

---

### TC-EXP-005: Add Expense — Amount Exceeds Maximum
**Steps:**
1. Enter amount: 1000001

**Expected Results:**
- Validation error: "Amount cannot exceed ₹10,00,000"
- Form not submitted

---

### TC-EXP-006: Add Expense — Note Over 200 Characters
**Steps:**
1. Paste note of 201 characters

**Expected Results:**
- Note field truncates input at 200 characters
- OR: validation error displayed

---

### TC-EXP-007: Edit Expense — Change Amount
**Steps:**
1. Tap on expense "₹150 · Food"
2. Edit sheet opens with ₹150 pre-filled
3. Change amount to ₹180
4. Tap "Save Changes"

**Expected Results:**
- Expense shows ₹180 in list
- Budget recalculates: ₹30 less remaining
- `updatedAt` timestamp refreshed

---

### TC-EXP-008: Edit Expense — Change Category
**Steps:**
1. Tap expense item
2. Change category from "Food" to "Entertainment"
3. Save

**Expected Results:**
- Category icon + color change to Entertainment (pink)
- Category breakdown charts update

---

### TC-EXP-009: Delete Expense — Confirm Delete
**Steps:**
1. Swipe left on expense
2. Tap red "Delete" button
3. (No confirmation dialog — direct delete with undo)

**Expected Results:**
- Expense immediately removed from list
- Budget increases by deleted amount
- Toast appears: "Expense deleted · Undo" (5 seconds)
- After 5 seconds: expense permanently soft-deleted

---

### TC-EXP-010: Delete Expense — Undo Delete
**Steps:**
1. Swipe left and delete expense
2. Tap "Undo" in toast (within 5 seconds)

**Expected Results:**
- Expense reappears in list at same position
- Budget reverts to pre-deletion amount
- `isDeleted` flag remains false in Firestore

---

### TC-EXP-011: Offline — Add Expense
**Steps:**
1. Disable network on device
2. Tap FAB
3. Add expense (₹100, Food)

**Expected Results:**
- Expense appears in list immediately (optimistic UI)
- "Syncing" indicator visible
- Reconnect network
- Within 2 seconds: sync indicator disappears
- Expense visible on other devices

---

## TC-DASHBOARD: Dashboard Test Cases

### TC-DASH-001: Budget Display — Under Budget
**Preconditions:** Budget = ₹10,000, Spent = ₹4,000  
**Expected Results:**
- Shows: "₹6,000 remaining"
- Progress bar: 40% filled
- Progress bar color: brand purple (safe zone)
- No warning displayed

---

### TC-DASH-002: Budget Display — At 80% Warning
**Preconditions:** Budget = ₹10,000, Spent = ₹8,000  
**Expected Results:**
- Shows: "₹2,000 remaining"
- Progress bar: 80% filled, amber color
- Warning banner: "You've used 80% of your budget"
- Budget card changes to amber gradient

---

### TC-DASH-003: Budget Display — Over Budget
**Preconditions:** Budget = ₹10,000, Spent = ₹11,500  
**Expected Results:**
- Shows: "-₹1,500 over budget"
- Progress bar: 100%+ filled, red color
- Alert: "Budget exceeded by ₹1,500"
- Budget card changes to danger red gradient

---

### TC-DASH-004: Real-Time Update on Add
**Preconditions:** Dashboard open, budget shows ₹8,000 remaining  
**Steps:**
1. Open expense entry sheet
2. Add ₹500 expense

**Expected Results:**
- Dashboard updates to ₹7,500 remaining immediately
- No page refresh required
- Budget progress bar animates

---

## TC-SYNC: Real-Time Sync Test Cases

### TC-SYNC-001: Cross-Device Add
**Steps:**
1. Open SpendWise on Phone A (logged in)
2. Open SpendWise on Browser B (logged in, same account)
3. Add ₹200 expense on Phone A

**Expected Results:**
- Within 500ms: ₹200 expense appears on Browser B
- Budget card on Browser B updates
- No manual refresh required

---

### TC-SYNC-002: Cross-Device Edit
**Steps:**
1. Edit expense on Browser B (change ₹200 to ₹350)

**Expected Results:**
- Within 500ms: Amount updates to ₹350 on Phone A

---

### TC-SYNC-003: Offline Queue + Sync
**Steps:**
1. Go offline on Phone A
2. Add 3 expenses while offline
3. Go online

**Expected Results:**
- All 3 expenses appear in Firestore within 3 seconds of reconnect
- Expenses appear on Browser B
- No duplicate entries

---

## TC-REPORTS: Report Generation Test Cases

### TC-REP-001: PDF Generation
**Steps:**
1. Navigate to Reports
2. Select July 2026
3. Tap "Download PDF"

**Expected Results:**
- Loading spinner appears
- PDF generated within 3 seconds
- PDF contains:
  - [ ] SpendWise logo + branding
  - [ ] Month and year
  - [ ] Total spent vs. budget
  - [ ] Category breakdown (pie chart)
  - [ ] Full transaction list with dates
- PDF download dialog appears

---

### TC-REP-002: CSV Export
**Steps:**
1. Navigate to Reports
2. Select month
3. Tap "Export CSV"

**Expected Results:**
- CSV downloads immediately
- Contains columns: Date, Amount, Category, Note, CreatedAt
- All expenses for selected month included
- Amounts correctly formatted

---

## TC-ANALYTICS: Analytics Test Cases

### TC-ANAL-001: Category Breakdown Chart
**Preconditions:** Month has expenses in 5 different categories  
**Expected Results:**
- Donut chart shows 5 colored segments
- Each segment proportional to spending
- Total shown in center
- Category list below shows all 5 with amount + percentage
- Percentages sum to 100%

---

### TC-ANAL-002: Chart Interaction
**Steps:**
1. Tap on "Food" segment in donut chart

**Expected Results:**
- Food segment highlights
- Center shows: "🍔 Food · ₹2,580 · 45%"
- Other segments dim slightly

---

## TC-PERF: Performance Test Cases

### TC-PERF-001: Dashboard Load Time
**Measurement:** Time from navigation to interactive  
**Target:** < 2 seconds on 4G connection  
**Method:** Lighthouse audit, Chrome DevTools

---

### TC-PERF-002: Expense Submission
**Measurement:** Time from "Add Expense" tap to expense appearing in list  
**Target:** Optimistic UI < 100ms, Full sync < 500ms

---

### TC-PERF-003: PDF Generation
**Target:** < 3 seconds for 100-expense month  
**Method:** Performance.now() measurement in Playwright

---

## TC-A11Y: Accessibility Test Cases

### TC-A11Y-001: Screen Reader — Dashboard
**Tool:** NVDA or VoiceOver  
**Expected:**
- Budget amount read correctly: "₹6,000 remaining, 40 percent used"
- Budget card state announced: "Budget at warning level" when amber
- FAB announced as "Add expense button"

### TC-A11Y-002: Keyboard Navigation
**Steps:** Tab through entire dashboard without mouse  
**Expected:**
- All interactive elements reachable via Tab
- Focus indicator visible on all elements
- Enter key activates buttons

### TC-A11Y-003: Color Contrast
**Tool:** axe DevTools browser extension  
**Target:** Zero WCAG AA contrast failures

---

*Test Cases v1.0 — July 2026. Run full test suite before each release.*
