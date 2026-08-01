# User Journey Map
## SpendWise — Student Expense Tracker

This document maps the complete lifecycle of a user's relationship with SpendWise, from initial awareness through long-term retention.

---

## 1. Journey Stage 1: Awareness

**"I've heard about this from a friend"**

| Touchpoint | User Action | User Emotion | SpendWise Action |
|:---|:---|:---|:---|
| WhatsApp group | Friend shares the app link | Curious, skeptical | Link leads to landing page with clear value prop |
| Landing page | User reads the headline | Intrigued | "Track your allowance. Never run out of money again." |
| Landing page | User sees the app screenshot | Impressed by design | Modern, dark, clean UI screenshot |
| Landing page | User reads testimonials | Building trust | "3 real student testimonials" |

**Friction Points:** User bounces if landing page loads slowly or looks generic.

---

## 2. Journey Stage 2: Acquisition

**"Let me try it"**

| Touchpoint | User Action | User Emotion | SpendWise Action |
|:---|:---|:---|:---|
| Login screen | User taps "Continue with Google" | Slightly nervous (privacy) | Show lock icon + "We never see your transactions" reassurance |
| Google OAuth | User selects account | Neutral | Firebase Auth handles securely |
| Onboarding | User sees "What's your monthly budget?" | Engaged, getting real | Large input, friendly copy, quick-pick chips |
| Budget set | User taps "Let's Go!" | Excited | Confetti micro-animation; land on dashboard |

**Goal:** Complete this stage in < 60 seconds.

---

## 3. Journey Stage 3: Activation (The "Aha!" Moment)

**"Oh, this actually works"**

| Touchpoint | User Action | User Emotion | SpendWise Action |
|:---|:---|:---|:---|
| Dashboard | User sees their budget for the first time | "This looks real" | Beautiful budget card, no empty state anxiety |
| FAB | User taps "+" for first expense | Nervous (will it work?) | Large, obvious button |
| Add Expense | User types ₹150, taps Food, saves | Surprised at speed | "₹150 added to Food" toast. Haptics. |
| Dashboard update | User sees budget drop by ₹150 instantly | Delighted | "IT ACTUALLY WORKS" — The Aha! moment. |

**The Aha! Moment:** The first successful expense that instantly updates the dashboard. This is the single most important event in the user lifecycle.

---

## 4. Journey Stage 4: Engagement (First Week)

**"I'm actually using this every day"**

| Event | SpendWise Action |
|:---|:---|
| Day 2: User logs in | Streak counter shows 🔥 2 |
| Day 3: User nears 50% budget | Mid-month pacing card appears on dashboard |
| Day 5: User logs 10th expense | "Early Logger" badge toast appears |
| Day 7: 7-day streak | "Weekly Warrior" badge + encouraging copy |

---

## 5. Journey Stage 5: Retention (Month 1 End)

**"I want to see my monthly report"**

| Event | SpendWise Action |
|:---|:---|
| End of month notification | "Your July report is ready 📊" push notification |
| User opens analytics | Beautiful donut chart, "You stayed under budget! 🎉" |
| User downloads PDF | Professional PDF; user shares with parents |
| Parent reaction | Parent is impressed; gives praise → emotional reward for student |
| Start of new month | Budget auto-resets; user is primed to start again |

---

## 6. Journey Stage 6: Advocacy

**"I told my roommate about this"**

Trigger for advocacy: A user who has finished a month under budget, received parental praise after sharing the PDF, and hit a 30-day streak.

| Advocacy Action | How SpendWise Enables It |
|:---|:---|
| Shows app to roommate | Beautiful dark UI is visually impressive; easy to demo |
| Shares app link in WhatsApp | Share link from settings; easy referral |
| Recommends in college groups | "Try SpendWise" message in budget management forums |
