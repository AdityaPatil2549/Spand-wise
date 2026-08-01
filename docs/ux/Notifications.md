# Notifications & Alerts
## SpendWise — Student Expense Tracker

Notifications are critical for a budgeting app to keep users engaged and prevent them from overspending. However, overuse leads to uninstalls. SpendWise uses a strict "High Value Only" notification policy.

---

## 1. Notification Channels

1.  **In-App Toasts:** Ephemeral, auto-dismissing (e.g., "Expense added").
2.  **In-App Banners:** Persistent until action taken (e.g., "Budget at 85%").
3.  **Push Notifications (Web/Native):** Delivered via OS, requires opt-in (e.g., "Budget Exceeded").

---

## 2. Notification Triggers & Copy

### 2.1 The Budget Warning System (Core Feature)
The most important notifications in the app.

*   **Trigger 1: 80% Budget Reached**
    *   *Type:* Push Notification + In-App Banner
    *   *Title:* ⚠️ Watch your spending
    *   *Body:* "You've used 80% of your ₹10,000 budget. You have ₹2,000 left for the month."
    *   *Action:* Opens app to Dashboard.
*   **Trigger 2: 95% Budget Reached**
    *   *Type:* Push Notification (High Priority)
    *   *Title:* 🚨 Almost empty!
    *   *Body:* "You only have ₹500 left for the rest of the month. Time to switch to saving mode."
*   **Trigger 3: 100%+ Budget Exceeded**
    *   *Type:* Push Notification + Persistent Red Banner
    *   *Title:* 🛑 Budget Exceeded
    *   *Body:* "You've crossed your monthly budget by ₹450."

### 2.2 Engagement Reminders (Optional, Opt-in)
To build the tracking habit.

*   **Trigger: No expenses logged for 3 days (and it's not the end of month)**
    *   *Type:* Push Notification
    *   *Title:* Forget something? 🤔
    *   *Body:* "You haven't logged any expenses recently. Take 10 seconds to update your tracker."
*   **Trigger: End of the Month (e.g., 30th at 6 PM)**
    *   *Type:* Push Notification
    *   *Title:* 📊 Your Monthly Report is Ready
    *   *Body:* "See how you did this month. Tap to view your breakdown and download the report."

### 2.3 Operational Alerts
*   **Trigger: New Device Login**
    *   *Type:* Email (handled by Firebase Auth)
    *   *Body:* Standard security alert.
*   **Trigger: Goal Achieved (v1.2 Feature)**
    *   *Type:* Push Notification + Confetti UI
    *   *Title:* 🎉 Goal Reached!
    *   *Body:* "You've saved enough for 'New Laptop'. Amazing job!"

---

## 3. Opt-In & Permissions Flow

**Rule:** Never ask for Push Notification permission on the first launch.

### The "Double Opt-In" Strategy
1.  **Soft Prompt:** After the user has logged their 3rd expense, show an in-app modal:
    *   *"Want us to warn you before you run out of money? Enable budget alerts."*
    *   Buttons: `Enable Alerts` | `Maybe Later`
2.  **Hard Prompt:** If they tap "Enable Alerts", trigger the native browser/OS permission dialog.

### Settings Management
*   Users must have granular control in `Settings > Notifications`.
*   Toggles required:
    *   [x] Budget Warnings (80% and 100%)
    *   [ ] Daily tracking reminders
    *   [x] Monthly report ready

---

## 4. Toast Notification Rules (UI/UX)
*   **Duration:** Exactly 3000ms (3 seconds). Except for "Undo" toasts which last 5000ms.
*   **Placement:** Bottom-center on mobile (above the nav bar). Top-right on desktop.
*   **Design:** Must indicate state via color (Green = Success, Red = Error, Blue = Info).
*   **Stacking:** Only show 1 toast at a time. New toasts replace old ones immediately.

**Toast Copy Examples:**
*   ✅ "₹150 added to Food."
*   ✅ "Expense deleted. [UNDO]"
*   ❌ "Error code 404 network failure." (Too technical. Use: "Couldn't save. Check your connection.")
