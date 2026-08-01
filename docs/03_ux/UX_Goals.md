# UX Goals
## SpendWise — Student Expense Tracker

---

## 1. North Star UX Goal

> **Make tracking daily expenses so fast, simple, and satisfying that a college student does it habitually — without feeling like it's work.**

---

## 2. Primary UX Goals

### UXG-01: Speed of Entry (< 5 Seconds)
The add expense flow from FAB tap to toast confirmation must be completable in under 5 seconds.
- This is the single most important UX metric.
- Design decision: Numeric keyboard opens automatically. No unnecessary steps. Category is the only required tap beyond the amount.

### UXG-02: Zero Learning Curve (First Impression = Last)
A new user must be able to add their first expense without any tutorial, tooltip, or onboarding guide about the expense flow.
- The UI must be self-explanatory.
- Leverage familiar patterns (bottom sheets, grid pickers, progress bars).

### UXG-03: Instant Feedback (Optimistic UI)
Every user action must produce immediate visual feedback. There must be no "lag" between an action and its visible result.
- Expense additions are reflected in the budget card *before* the server confirms.
- Feedback is multi-sensory: visual (toast + list update) + haptic (mobile vibration).

### UXG-04: Clear Budget State at a Glance
The dashboard must answer "Am I okay?" within 2 seconds of opening, without the user needing to tap, scroll, or think.
- The budget card is the hero element.
- Color alone (green/amber/red) communicates status before numbers are read.

### UXG-05: Emotionally Positive Experience
SpendWise should feel like a supportive coach, not a stern accountant.
- Use encouraging, friendly copy ("You're doing great!" not "Warning: 80% consumed").
- Celebrate small wins (streaks, under-budget months) with confetti and praise.
- Never shame users for overspending; instead, offer constructive suggestions.

---

## 3. Secondary UX Goals

| Goal | Description |
|:---|:---|
| **UXG-06: Accessibility** | WCAG 2.1 AA compliance. All users, including those with visual or motor impairments, must be able to use core features. |
| **UXG-07: Consistency** | Every screen uses the same interaction patterns, color system, and component library. No surprises. |
| **UXG-08: Graceful Degradation** | On poor connectivity or when offline, the app must remain functional (queue writes, show cached data) rather than crashing or showing blank screens. |
| **UXG-09: Delight** | Small micro-animations, category emojis, and personality-filled copy should make users smile. |
| **UXG-10: Respect User Attention** | No unnecessary modals, confirmation dialogs, or permission requests. Every interruption must earn its place. |

---

## 4. UX Anti-Goals

- **Do NOT** add a tutorial or interactive tour on first launch. The UI must be self-evident.
- **Do NOT** require confirmation dialogs for expense additions (use undo instead).
- **Do NOT** show more than 1 prompt per session for optional features (notifications, rating, etc.).
- **Do NOT** auto-play sounds. Haptic feedback only.
- **Do NOT** force users through multiple steps to reach core actions.
