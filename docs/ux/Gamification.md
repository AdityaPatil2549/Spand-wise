# Gamification
## SpendWise — Student Expense Tracker

Gamification applies game-design elements in non-game contexts to improve user engagement. For SpendWise, the goal is to make tracking expenses and saving money feel rewarding rather than like a chore.

---

## 1. Streaks

Streaks encourage daily app opens and consistent tracking.

*   **The Tracking Streak:**
    *   *Mechanism:* Increases by 1 for every consecutive day the user logs an expense OR explicitly confirms "No expenses today".
    *   *Visual:* A 🔥 fire icon with a number in the header (e.g., "🔥 12").
    *   *Rewards:*
        *   7-Day Streak: "Consistent Tracker" badge.
        *   30-Day Streak: "Budget Master" badge + confetti animation.
    *   *Loss:* If a day is missed (and not backdated within 24 hours), the streak resets to 0. Use a "Streak Freeze" (can be bought with virtual points or given once a month) to save it.

---

## 2. Badges and Achievements

Badges serve as status symbols and historical markers of financial discipline.

| Badge Name | Trigger Condition | Visual |
| :--- | :--- | :--- |
| **First Step** | Log your very first expense | 🪙 Bronze Coin |
| **Weekly Warrior** | Track expenses 7 days in a row | ⚔️ Crossed Swords |
| **Under Budget** | Finish a month with at least 10% budget remaining | 🏆 Gold Trophy |
| **Zero-Spend Hero** | Have 4 "No-Spend Days" in a single month | 🦸‍♂️ Cape |
| **Category King** | Stay under budget in your highest-spend category | 👑 Crown |
| **Night Owl** | Log an expense between 12 AM and 4 AM | 🦉 Owl |
| **Early Bird** | Log an expense before 8 AM | 🌅 Sunrise |

---

## 3. The "Savings Leaderboard" (Anonymous Benchmarking)

Students are competitive and influenced by peers.

*   **Mechanism:** Compare a user's saving rate or top categories to "Students like you" (anonymized, aggregated data).
*   **Implementation (Insights Card):**
    *   "You spend 20% less on Food than the average college student. Great job!"
    *   "You're in the Top 10% of savers this month!"
*   **Privacy:** Ensure all benchmarking data is completely stripped of PII and highly aggregated.

---

## 4. Challenges & Quests

Short-term, opt-in challenges to break bad habits.

*   **The Challenge:** "No Junk Food Week"
    *   *Goal:* Spend ₹0 in the "Snacks & Chai" category for 7 days.
    *   *Reward:* Exclusive badge + "Virtual ₹500 saved".
*   **The Challenge:** "Save ₹1,000 this week"
    *   *Goal:* Keep total spending under [Weekly Budget - ₹1000].

---

## 5. UI Micro-Interactions (The "Juice")

Gamification isn't just about points; it's about how the app *feels*.

*   **Adding an Expense:** When the FAB is tapped and an expense saved, use a satisfying haptic "pop" and a brief, delightful animation (e.g., the coin drops into a slot).
*   **Staying Under Budget:** If the user checks the app on the 25th of the month and is safely under budget, the budget progress bar can have a subtle, sparkling particle effect.
*   **Confetti:** Use full-screen confetti sparingly, only for major achievements (e.g., finishing the month under budget, hitting a 30-day streak).
