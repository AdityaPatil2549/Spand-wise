# User Flow Diagrams
## SpendWise — Student Expense Tracker

---

## Flow 1: New User Registration & Onboarding

```
[App Launch]
      │
      ▼
[Check Auth State] ─── Not Authenticated ──→ [Login Screen]
      │                                             │
  Authenticated                              ┌──────┴──────┐
      │                                      │             │
      ▼                                [Google     [Email/Password]
[Check onboardingComplete]              OAuth]            │
      │                                      │      ┌──────┴──────┐
  ┌───┴───┐                           [Firebase   [Validate      ]
  │       │                           Auth Flow]  [Form Input    ]
 true   false                               │             │
  │       │                           [Create User  Document]
  ▼       ▼                                 │
[Dashboard] [Onboarding Screen]             ▼
            │                        [Send Verification
            │                         Email (email only)]
            ▼                               │
    [Enter Monthly Budget]                  ▼
    [₹ Amount Input]               [Redirect to Onboarding]
            │
    [Validation: amount > 0]
            │
    [Tap "Let's Track!"]
            │
    [Batch Write: Update user.onboardingComplete = true
                  Create budget document]
            │
            ▼
    [Redirect to Dashboard]
```

---

## Flow 2: Add Expense (Primary User Flow)

```
[User on any screen (Dashboard/Expenses/Analytics)]
      │
      ▼
[Tap FAB (+) Button]
      │
      ▼
[Bottom Sheet Slides Up]
[Amount Input auto-focused]
[Numeric keyboard appears]
      │
      ▼
[User Types Amount: 150]
      │
      ▼
[User Taps Category]
[Category grid shows all 15+ categories]
      │
      ▼
[Category Selected: "Food & Dining"]
[Category highlighted with color]
      │
      ┌─────────┴─────────┐
   Optional            Optional
[Enter Note]       [Change Date]
[Free text field]  [Date picker]
      │                   │
      └─────────┬─────────┘
                │
                ▼
      ["Add Expense" CTA enabled]
      [Shows "Add Expense (₹150)"]
                │
                ▼
         [Tap CTA Button]
                │
      ┌─────────┴─────────┐
      │                   │
[Optimistic UI]      [Firestore Write]
[Expense added       [expenses collection]
 to Zustand store]          │
[Budget decremented]        ▼
      │               [Cloud Function]
      │               [Budget Recalculation]
      │                    │
      ▼                    ▼
[Bottom Sheet Closes]  [Budget Document Updated]
[Expense in List]      [Real-time listener fires]
[Toast: "₹150 added"]  [All devices update]
```

---

## Flow 3: Delete Expense with Undo

```
[Expense List Screen]
      │
      ▼
[User Swipes Left on Expense Row]
      │
      ▼
[Red "Delete" Button Reveals]
      │
      ▼
[User Taps "Delete"]
      │
      ▼
[Optimistic Remove from UI]
[Budget reverts immediately]
      │
      ▼
[Toast Appears (5 seconds)]
["Expense deleted · Undo"]
      │
  ┌───┴───┐
  │       │
[Undo   [No Action]
Tapped]  within 5s
  │           │
  ▼           ▼
[Expense  [Firestore Write]
Restored] [isDeleted: true]
[Budget   [deletedAt: timestamp]
Reverts]  [Cloud Function]
  │       [Budget Recalculated]
  ▼
[Toast: "Undo successful"]
```

---

## Flow 4: View Monthly Analytics

```
[User Taps Analytics Tab]
      │
      ▼
[Analytics Screen Loads]
[Data from Zustand Store / Budget Document]
      │
      ▼
[Donut Chart Renders]
[Category data from budget.categoryBreakdown]
      │
      ▼
[User Taps Category in Chart]
      │
      ▼
[Category Highlighted]
[Center shows: "🍔 Food · ₹2,580 · 45%"]
      │
      ▼
[User Scrolls Down]
      │
      ▼
[Category Breakdown List]
[Progress bars per category]
      │
      ▼
[Daily Trend Chart]
[31-day line chart from budget.dailySpending]
      │
      ▼
[Insights Cards]
["Your top spend: Food at 45%"]
["You spend most on Saturdays"]
```

---

## Flow 5: Generate & Download PDF Report

```
[User Taps Reports Tab]
      │
      ▼
[Reports Screen]
[Month selector (defaults to current month)]
      │
      ▼
[User Selects Month (or keeps current)]
      │
      ▼
[Taps "Download PDF"]
      │
      ▼
[Loading State]
["Generating your report..."]
[Progress indicator]
      │
      ▼
[getReportData() — Firestore fetch]
[Fetches all expenses + budget for month]
      │
      ▼
[generateMonthlyPDF() — jsPDF]
[Client-side PDF generation:]
[  Page 1: Cover + Summary]
[  Page 2: Category Chart]
[  Page 3+: Transaction List]
      │
      ▼
[PDF Ready (< 3 seconds)]
      │
[Desktop]             [Mobile]
    │                     │
[Browser download     [Share Sheet]
 dialog]              [Share to WhatsApp/
    │                  Email/Save to Files]
    ▼                     ▼
[PDF Downloaded]     [PDF Shared/Saved]
[Toast: "Report downloaded!"]
```

---

## Flow 6: Real-Time Sync (Multi-Device)

```
[Device A: Phone]              [Device B: Laptop Browser]
      │                                   │
      │  [Both logged into same account]  │
      │  [Firestore onSnapshot active]    │
      │                                   │
[User adds ₹200 expense]                 │
      │                                   │
[Optimistic UI: list updates]            │
[Firestore write: expenses collection]   │
      │                                   │
      ▼                                   │
[Firestore document created]             │
      │                                   │
      │ ←── Firestore sends push ────────→│
      │       (WebSocket/SSE)             │
      │                                   ▼
      │                    [onSnapshot fires on Device B]
      │                    [Expense appears in list]
      │                    [Budget card updates]
      │
[Cloud Function triggers]
[Budget document recalculated]
      │
      │ ←── Both devices receive budget update
      │
[Both show updated remaining budget]
```

---

## Flow 7: Offline Experience

```
[Device goes offline]
      │
      ▼
[SyncIndicator shows "Offline"]
[App banner: "Working offline"]
      │
      ▼
[User adds expense while offline]
      │
      ▼
[Firestore SDK queues write locally]
[Optimistic UI shows expense]
[Budget updates locally]
["Pending sync" indicator on item]
      │
      ▼
[Device reconnects]
      │
      ▼
[Firestore SDK detects connectivity]
[Sends queued writes to server]
      │
      ▼
[Server confirms writes]
[onSnapshot fires for all devices]
["Synced" - pending indicator removed]
[SyncIndicator: "Online" / disappears]
```

---

## Flow 8: Budget Warning Flow

```
[User adds expense]
      │
      ▼
[Cloud Function recalculates budget]
      │
      ▼
[percentUsed calculated: 82%]
      │
[Check: percentUsed >= 80 AND !warned80Percent]
      │              │
    True           False
      │              │
      ▼         [No action]
[Update budget: warned80Percent = true]
[Send FCM push notification]
      │
      ▼
[Device receives FCM push]
      │
      ▼
[Push Notification displayed:]
["⚠️ Budget Alert"]
["You've used 80% of your budget."]
["₹2,000 remaining."]
      │
[User taps notification]
      │
      ▼
[App opens to Dashboard]
[Budget card shows amber warning state]
[Warning banner: "85% of budget used"]
```

---

## Flow 9: Settings — Change Monthly Budget

```
[Settings Tab → Budget]
      │
      ▼
[Budget Settings Screen]
[Shows current budget: ₹10,000]
[Shows current month spent: ₹7,500]
      │
      ▼
[User edits amount: 12,000]
      │
      ▼
[Validation: amount > 0]
      │
      ▼
[Taps "Save Budget"]
      │
      ▼
[Firestore: updateBudgetAmount()]
[budget.amount = 12,000]
[budget.remainingAmount = 12,000 - 7,500 = 4,500]
[budget.percentUsed = 62.5%]
[user.monthlyBudget = 12,000]
[budget.warned80Percent = false (reset alerts)]
      │
      ▼
[Real-time listener fires]
[Dashboard budget card updates immediately]
[Progress bar animates to 62.5%]
      │
      ▼
[Toast: "Budget updated to ₹12,000"]
[Navigate back to dashboard or stay on settings]
```

---

*User Flow Diagrams v1.0 — July 2026. Update when significant user journey changes are made.*
