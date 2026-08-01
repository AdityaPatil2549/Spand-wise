# Monetization Strategy
## SpendWise — Student Expense Tracker

---

## 1. Monetization Principles

1. **Never monetize core tracking:** Adding and viewing expenses is sacred. It must always be free.
2. **Pay for power, not basics:** Premium features are for power users who actively want more. Basic users should get full value for free.
3. **Student pricing always:** Pro pricing must be lower than a Spotify subscription and feel like a no-brainer.
4. **No ads—ever:** Banner ads in a financial trust app are brand suicide.

---

## 2. Freemium Feature Gate Matrix

| Feature | Free | Pro |
|:---|:---:|:---:|
| Expense logging (unlimited) | ✅ | ✅ |
| Monthly budget tracking | ✅ | ✅ |
| 17 Preset categories | ✅ | ✅ |
| 3 Custom categories | ✅ | — |
| Unlimited custom categories | — | ✅ |
| Basic analytics (donut chart) | ✅ | ✅ |
| Daily spending chart | ✅ | ✅ |
| AI spending insights | — | ✅ |
| PDF exports (3/month) | ✅ | — |
| Unlimited PDF exports | — | ✅ |
| CSV export | ✅ | ✅ |
| Category budget limits | — | ✅ |
| Recurring expense automation | — | ✅ |
| Savings goals tracker | — | ✅ |
| Google Drive auto-backup | — | ✅ |
| Data export (full JSON) | — | ✅ |
| Priority support | — | ✅ |

---

## 3. Conversion Strategy

### Moment-Based Upsell
Trigger Pro upsell prompts at natural "hitting a limit" moments, not randomly.

**Trigger: 3rd Custom Category Added**
> *"You've hit the 3 category limit on the free plan. Upgrade to Pro for unlimited custom categories and much more."*

**Trigger: 4th PDF Export Requested**
> *"You've used your 3 free PDF exports this month. Upgrade to Pro for unlimited reports."*

**Trigger: User Tries to Set Category Budget**
> *"Category budgets are a Pro feature. Take full control of your spending — upgrade for ₹49/month."*

### Soft Paywalls (Not Hard Blocks)
Never hard-block a feature mid-flow (e.g., don't start generating a PDF then stop). Instead, show the upsell before they start the action.

---

## 4. Payment Integration (Future)

For Pro subscriptions, we will use **Razorpay** (India-native payment gateway).
- Supports UPI, Net Banking, Credit/Debit cards, and Wallets
- Student-friendly payment methods (UPI is dominant)
- No international payment complexity at v1.x scale
- Webhook integration with Firebase Cloud Functions for subscription status updates

---

## 5. Launch Pricing Strategy

**Early Adopter Offer (First 6 months post-Pro launch):**
- Lifetime deal for ₹999 (limited to first 50 users)
- This creates advocates who have a "stake" in the product's success and generates initial revenue for Firebase Blaze activation.
