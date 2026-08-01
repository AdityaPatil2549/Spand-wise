# Event Tracking
## SpendWise — Student Expense Tracker

---

## 1. Analytics Strategy

SpendWise uses **Firebase Analytics** (GA4) for event tracking. All events are GDPR-compliant and contain NO PII (no amounts, notes, or user-identifiable data in event parameters).

---

## 2. Core Events

### Authentication Events

| Event Name | Trigger | Parameters |
|:---|:---|:---|
| `sign_up` | User creates new account | `{ method: 'google' \| 'email' }` |
| `login` | User signs in | `{ method: 'google' \| 'email' }` |
| `onboarding_complete` | User sets first budget | `{}` |
| `logout` | User signs out | `{}` |

### Expense Events

| Event Name | Trigger | Parameters |
|:---|:---|:---|
| `expense_added` | Expense successfully saved | `{ category_id: string }` |
| `expense_edited` | Expense updated | `{ category_id: string }` |
| `expense_deleted` | Expense soft-deleted | `{}` |
| `expense_undo` | UNDO tapped within 5s | `{}` |

**Note:** Amount values are NEVER logged as event parameters. Only category IDs are tracked.

### Budget Events

| Event Name | Trigger | Parameters |
|:---|:---|:---|
| `budget_set` | Budget created or updated | `{}` |
| `budget_warning_80` | User crosses 80% threshold | `{}` |
| `budget_exceeded` | User crosses 100% threshold | `{}` |

### Analytics & Reports Events

| Event Name | Trigger | Parameters |
|:---|:---|:---|
| `analytics_viewed` | Analytics tab opened | `{ month: 'current' \| 'historical' }` |
| `report_pdf_downloaded` | PDF successfully generated | `{}` |
| `report_csv_downloaded` | CSV downloaded | `{}` |

### Engagement Events

| Event Name | Trigger | Parameters |
|:---|:---|:---|
| `streak_milestone` | 7-day or 30-day streak reached | `{ days: 7 \| 30 }` |
| `badge_earned` | Any badge unlocked | `{ badge_id: string }` |
| `app_installed` | PWA install prompt accepted | `{}` |
| `notification_opted_in` | User enables push notifications | `{}` |

---

## 3. Custom Dimensions / User Properties

| Property | Value | Purpose |
|:---|:---|:---|
| `has_budget_set` | `true` / `false` | Filter activated users |
| `device_type` | `mobile` / `desktop` | Understand usage context |
| `theme_preference` | `dark` / `light` | Track feature adoption |

---

## 4. Implementation

```typescript
// src/lib/analytics/track.ts
import { logEvent } from 'firebase/analytics';
import { analytics } from '@/lib/firebase';

// Type-safe event logging
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, string | number | boolean>
) => {
  if (!analytics) return;
  logEvent(analytics, eventName, parameters);
};

// Usage example
trackEvent('expense_added', { category_id: 'food' });
```

---

## 5. Privacy Rules

- ❌ Never log expense amounts
- ❌ Never log expense notes or descriptions
- ❌ Never log user email, name, or UID
- ❌ Never log device-level identifiers
- ✅ Log only event types and category IDs (non-personal)
- ✅ Respect `analytics_storage: 'denied'` if user opts out
