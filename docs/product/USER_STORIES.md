# User Stories
## SpendWise — Student Expense Tracker

---

## Story Format
```
As a [user type],
I want to [action],
So that [outcome/value].

Acceptance Criteria:
- Given [context]
  When [action]
  Then [expected result]
```

---

## Epic 1: Authentication & Onboarding

### US-001: New User Sign Up (Google)
**Priority:** P0 | **Story Points:** 3 | **Sprint:** 1

As a new student user,  
I want to sign up using my Google account in one tap,  
So that I don't have to fill a registration form and can start tracking immediately.

**Acceptance Criteria:**
- Given I open the app for the first time  
  When I tap "Continue with Google"  
  Then I am authenticated and redirected to the budget setup screen in under 5 seconds

- Given my Google login is successful  
  When my account is created  
  Then my display name and profile photo from Google are automatically imported

- Given I have previously signed in  
  When I open the app  
  Then I am automatically logged in without seeing the login screen

---

### US-002: New User Sign Up (Email/Password)
**Priority:** P1 | **Story Points:** 5 | **Sprint:** 1

As a new student user who doesn't want to use Google,  
I want to sign up with my email and a password,  
So that I have an alternative authentication method.

**Acceptance Criteria:**
- Given I enter a valid email and password (min 8 chars)  
  When I tap "Create Account"  
  Then a verification email is sent and I see a confirmation screen

- Given I try to sign up with a weak password (< 8 chars)  
  When I tap "Create Account"  
  Then I see an inline error "Password must be at least 8 characters" without page reload

- Given I try to register with an already-registered email  
  When I tap "Create Account"  
  Then I see "Account already exists. Try signing in." with a login link

---

### US-003: Budget Setup (Onboarding)
**Priority:** P0 | **Story Points:** 3 | **Sprint:** 1

As a newly registered user,  
I want to set my monthly budget during onboarding,  
So that the app knows my limit and can track my remaining balance from day one.

**Acceptance Criteria:**
- Given I have just created my account  
  When I land on the dashboard for the first time  
  Then I see a fullscreen "Set Your Monthly Budget" modal before accessing any features

- Given I enter ₹8,000 as my budget  
  When I tap "Save Budget"  
  Then I land on the dashboard showing ₹8,000 remaining with a 0% used indicator

- Given I have set my budget  
  When a new calendar month begins  
  Then my spent amount resets to ₹0 and budget resets to my set amount

---

### US-004: Logout
**Priority:** P1 | **Story Points:** 1 | **Sprint:** 1

As a logged-in user,  
I want to log out of my account,  
So that my data is secure when I share a device.

**Acceptance Criteria:**
- Given I am logged in  
  When I tap "Logout" in Settings  
  Then I see a confirmation dialog "Are you sure you want to logout?"

- Given I confirm logout  
  When the action completes  
  Then I am redirected to the login screen and my auth token is cleared

---

### US-005: Account Deletion
**Priority:** P2 | **Story Points:** 3 | **Sprint:** 4

As a user who wants to stop using SpendWise,  
I want to delete my account and all data,  
So that my financial data is completely removed from the system.

**Acceptance Criteria:**
- Given I go to Settings > Account  
  When I tap "Delete Account"  
  Then I see a warning modal explaining all data will be permanently deleted

- Given I type "DELETE" to confirm and submit  
  When deletion completes  
  Then all my expenses, settings, and profile data are deleted from Firestore

---

## Epic 2: Expense Management

### US-006: Add Expense (Core Flow)
**Priority:** P0 | **Story Points:** 5 | **Sprint:** 2

As a student,  
I want to add an expense quickly with just an amount and category,  
So that I can log spending in under 5 seconds without interrupting my day.

**Acceptance Criteria:**
- Given I tap the "+" FAB button on the dashboard  
  When the expense entry sheet slides up  
  Then the amount input is auto-focused and the number keyboard appears

- Given I enter ₹150 and select "Food & Dining"  
  When I tap "Add Expense"  
  Then the expense appears in the list immediately (optimistic UI) and "₹150" is deducted from remaining budget

- Given the expense is saved successfully  
  When I view the expense list  
  Then I see "₹150 — Food & Dining — Just now" at the top

- Given I enter an invalid amount (letters, negative, zero)  
  When I attempt to submit  
  Then I see an inline validation error "Please enter a valid amount"

---

### US-007: Add Expense with Note
**Priority:** P0 | **Story Points:** 2 | **Sprint:** 2

As a student,  
I want to add a note/description to an expense,  
So that I remember what "₹450" was for weeks later.

**Acceptance Criteria:**
- Given the expense entry sheet is open  
  When I tap the "Note (optional)" field and type "Lunch at mess + chai"  
  Then the note is saved with the expense

- Given I view my expense list  
  When there are expenses with notes  
  Then each note appears as a subtitle below the category name

---

### US-008: Backdate an Expense
**Priority:** P1 | **Story Points:** 3 | **Sprint:** 2

As a student who forgot to log an expense yesterday,  
I want to add an expense with a different date,  
So that my records remain accurate.

**Acceptance Criteria:**
- Given the expense entry sheet is open  
  When I tap the date field (shows today's date by default)  
  Then a calendar picker appears limited to the current month

- Given I select yesterday's date  
  When I submit the expense  
  Then the expense appears under yesterday's date group in the expense list

---

### US-009: Edit Expense
**Priority:** P1 | **Story Points:** 3 | **Sprint:** 2

As a student who entered the wrong amount,  
I want to edit an existing expense,  
So that my records are accurate.

**Acceptance Criteria:**
- Given I see an expense in my list  
  When I tap on it  
  Then a bottom sheet opens with the current amount, category, note, and date pre-filled

- Given I change the amount from ₹150 to ₹180  
  When I tap "Save Changes"  
  Then the expense updates in real-time on all devices and the budget recalculates

---

### US-010: Delete Expense
**Priority:** P1 | **Story Points:** 2 | **Sprint:** 2

As a student who logged a duplicate expense,  
I want to delete an expense,  
So that my totals remain accurate.

**Acceptance Criteria:**
- Given I am on mobile  
  When I swipe left on an expense  
  Then a red "Delete" button appears

- Given I tap "Delete"  
  When I see the confirmation prompt  
  Then I can confirm or cancel the deletion

- Given I confirm deletion  
  When the expense is removed  
  Then budget updates immediately and a toast shows "Expense deleted" with an "Undo" option for 5 seconds

---

### US-011: View Expense History
**Priority:** P0 | **Story Points:** 3 | **Sprint:** 2

As a student,  
I want to see all my past expenses in a clean chronological list,  
So that I can review what I've spent.

**Acceptance Criteria:**
- Given I navigate to the Expenses tab  
  When the list loads  
  Then expenses are grouped by date (Today, Yesterday, [Date], etc.)

- Given the current month has 50+ expenses  
  When I scroll down  
  Then older entries load progressively (pagination — 20 per page)

---

### US-012: Filter Expenses
**Priority:** P1 | **Story Points:** 5 | **Sprint:** 3

As a student,  
I want to filter my expenses by date range or category,  
So that I can find specific spending patterns.

**Acceptance Criteria:**
- Given I tap the filter icon  
  When I select "This Week"  
  Then only expenses from Monday to today are shown

- Given I select the "Food & Dining" category filter  
  When the filter applies  
  Then only food expenses are shown with a total at the top

- Given I have multiple filters active  
  When I tap "Clear Filters"  
  Then all expenses for the current month return

---

## Epic 3: Dashboard & Budget Overview

### US-013: View Remaining Budget
**Priority:** P0 | **Story Points:** 2 | **Sprint:** 2

As a student,  
I want to see my remaining budget prominently on the home screen,  
So that I always know my financial state at a glance.

**Acceptance Criteria:**
- Given I open the dashboard  
  When the page loads  
  Then I see "₹X remaining" in a large, prominent card above all other content

- Given I have spent 79% of my budget  
  When I view the dashboard  
  Then the progress bar is green (safe zone)

- Given I have spent 80%–99% of my budget  
  When I view the dashboard  
  Then the progress bar turns orange and a warning appears "You've used 85% of your budget"

- Given I have spent 100%+ of my budget  
  When I view the dashboard  
  Then the indicator turns red and shows "Budget exceeded by ₹X"

---

### US-014: Today's Spending Summary
**Priority:** P1 | **Story Points:** 2 | **Sprint:** 2

As a student,  
I want to see how much I've spent today at a glance,  
So that I can make decisions about the rest of the day.

**Acceptance Criteria:**
- Given I open the dashboard  
  When I haven't spent anything today  
  Then I see "₹0 spent today" with a motivational message

- Given I've spent ₹450 today  
  When I view the dashboard  
  Then I see "₹450 spent today" in the summary card

---

## Epic 4: Analytics & Insights

### US-015: Category Spending Breakdown
**Priority:** P1 | **Story Points:** 5 | **Sprint:** 3

As a student,  
I want to see a visual breakdown of spending by category,  
So that I immediately understand which areas consume most of my budget.

**Acceptance Criteria:**
- Given I navigate to the Analytics tab  
  When expenses exist for the current month  
  Then I see a donut chart with all categories and their proportions

- Given I tap a category slice in the chart  
  When it's selected  
  Then the category is highlighted and its amount + percentage appears in the center

- Given I see the category list below the chart  
  When categories are listed  
  Then they are sorted by amount (highest first) with: category icon, name, amount, and % of total

---

### US-016: Monthly Spending Trend
**Priority:** P1 | **Story Points:** 5 | **Sprint:** 3

As a student,  
I want to see a line chart of my daily spending over the month,  
So that I can identify high-spending days and patterns.

**Acceptance Criteria:**
- Given I have expenses across multiple days this month  
  When I view the Analytics tab  
  Then I see a line chart with dates on X-axis and spend amount on Y-axis

- Given I tap a specific day on the chart  
  When it's selected  
  Then a tooltip shows the total spent on that day

---

### US-017: Month-over-Month Comparison
**Priority:** P2 | **Story Points:** 5 | **Sprint:** 4

As a student,  
I want to compare this month's spending to last month's,  
So that I can see if I'm improving my financial habits.

**Acceptance Criteria:**
- Given I have spending data for at least 2 months  
  When I view Analytics  
  Then I see "vs. Last Month" arrows next to each category (↑ more / ↓ less / = same)

---

## Epic 5: Reports & Export

### US-018: Generate Monthly PDF Report
**Priority:** P1 | **Story Points:** 8 | **Sprint:** 3

As a student,  
I want to download a monthly expense report as a PDF,  
So that I can share it with my parents or keep for records.

**Acceptance Criteria:**
- Given I navigate to Reports  
  When I select a month and tap "Download PDF"  
  Then a PDF is generated client-side within 3 seconds

- Given the PDF is generated  
  When I open it  
  Then it contains: SpendWise branding, month/year, total spent vs. budget, category breakdown pie chart, full transaction list sorted by date

- Given I want to share it  
  When I tap the share button  
  Then I can share via WhatsApp, email, or save to device

---

### US-019: Export CSV
**Priority:** P2 | **Story Points:** 3 | **Sprint:** 4

As a student who wants raw data,  
I want to export my expenses as a CSV file,  
So that I can analyze them in Excel or Google Sheets.

**Acceptance Criteria:**
- Given I navigate to Reports  
  When I tap "Export CSV"  
  Then a CSV file downloads with columns: Date, Amount, Category, Note, CreatedAt

---

## Epic 6: Multi-Device & Sync

### US-020: Real-Time Sync Across Devices
**Priority:** P0 | **Story Points:** 5 | **Sprint:** 2

As a student who uses both my phone and laptop,  
I want expenses I add on my phone to appear on my laptop immediately,  
So that I never see stale data regardless of which device I use.

**Acceptance Criteria:**
- Given I am logged into SpendWise on both my phone and a browser tab on my laptop  
  When I add a ₹200 expense on my phone  
  Then within 500ms, the expense appears on my laptop tab without refreshing

- Given I edit an expense amount on my laptop  
  When I save the change  
  Then the updated amount appears on my phone within 500ms

---

### US-021: Offline Support
**Priority:** P1 | **Story Points:** 8 | **Sprint:** 3

As a student in an area with poor connectivity,  
I want to add expenses even when offline,  
So that I don't lose track of spending just because I have no signal.

**Acceptance Criteria:**
- Given my device is offline  
  When I add an expense  
  Then it appears immediately in the list with a "syncing..." indicator

- Given my connection is restored  
  When the app detects connectivity  
  Then all pending expenses sync to Firebase and the "syncing..." indicator disappears

- Given I view expenses while offline  
  When I scroll through the list  
  Then all previously synced expenses are available (Firestore offline cache)

---

## Epic 7: Settings & Customization

### US-022: Change Monthly Budget
**Priority:** P1 | **Story Points:** 2 | **Sprint:** 2

As a student whose family changed my allowance,  
I want to update my monthly budget,  
So that tracking reflects my new financial reality.

**Acceptance Criteria:**
- Given I navigate to Settings > Budget  
  When I enter a new amount and save  
  Then the remaining budget on the dashboard recalculates immediately

---

### US-023: Manage Custom Categories
**Priority:** P2 | **Story Points:** 5 | **Sprint:** 4

As a student with unique spending categories,  
I want to create custom expense categories,  
So that I can track items not in the default list.

**Acceptance Criteria:**
- Given I navigate to Settings > Categories  
  When I tap "+ Add Category"  
  Then I can enter a name, pick an emoji, and select a color

- Given I have created a custom category  
  When I add a new expense  
  Then my custom category appears in the category list

---

### US-024: Theme Toggle (Dark/Light Mode)
**Priority:** P3 | **Story Points:** 3 | **Sprint:** 5

As a student who uses my phone at night,  
I want a dark mode option,  
So that the app doesn't strain my eyes in low-light conditions.

**Acceptance Criteria:**
- Given I navigate to Settings > Appearance  
  When I toggle "Dark Mode"  
  Then the entire app switches to a dark color scheme immediately

---

## Epic 8: Notifications

### US-025: Budget Warning Notification
**Priority:** P1 | **Story Points:** 5 | **Sprint:** 3

As a student,  
I want to receive a notification when I've used 80% of my monthly budget,  
So that I can consciously slow down spending before going over.

**Acceptance Criteria:**
- Given I have enabled notifications in settings  
  When my cumulative spending reaches 80% of my budget  
  Then I receive an in-app toast and (if permission granted) a push notification

- Given I've already received the 80% warning  
  When I reach 100%  
  Then I receive a separate "Budget exceeded" notification (not a repeat of the 80% one)

---

*Total Stories: 25 | Story Points: ~100 | Estimated Sprints: 5 (2-week sprints)*
