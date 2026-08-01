# Rollback Plan
## SpendWise — Student Expense Tracker

---

## 1. Rollback Strategy

SpendWise uses Firebase Hosting, which makes rollbacks instant. Firebase Hosting keeps a history of deployed versions and allows one-click rollback to any previous version.

---

## 2. When to Roll Back

Initiate a rollback if ANY of the following are observed within 2 hours of a deployment:

| Trigger | Action |
|:---|:---|
| P0 bug: Users cannot log in | Immediate rollback + hotfix |
| P0 bug: Expenses are being lost or duplicated | Immediate rollback + data audit |
| P0 bug: Budget calculations are wrong by > 10% | Immediate rollback |
| > 5% of sessions result in uncaught errors | Evaluate severity; likely rollback |
| Firebase quota exhausted unexpectedly | Rollback + investigate query issue |

---

## 3. Rollback Procedure

### Step 1: Assess the severity (< 5 minutes)
- Check Firebase Console → Crashlytics for error spike
- Check Firebase Analytics → Real-time dashboard for drop in key events
- Check browser console on production URL for visible errors

### Step 2: Execute Firebase Hosting Rollback (< 2 minutes)
```bash
# List all deployment releases
firebase hosting:channel:list

# Or use the Firebase Console:
# Firebase Console → Hosting → Release History → Click "Rollback" on the previous version
```

### Step 3: Verify Rollback (5 minutes)
- Visit production URL and confirm previous version is live
- Confirm version number in `Settings > About` page or in the page footer
- Re-run core smoke tests: Login, Add Expense, View Dashboard

### Step 4: Communicate (Internal)
- Notify any stakeholders that rollback was executed
- Create a GitHub Issue with: deployment version, symptoms observed, root cause (if known)

---

## 4. Database Rollback

⚠️ **Firestore data cannot be rolled back automatically.** Firestore does not support point-in-time recovery on the Spark free tier.

**Prevention measures:**
- Soft delete only: No data is ever permanently deleted in v1.0
- Firestore security rules prevent cross-user corruption
- All writes use batch operations to prevent partial states

**In case of data corruption:**
1. Identify the affected user(s) via Crashlytics / support report
2. Manually inspect the Firestore document in the Firebase Console
3. Correct the data manually if feasible
4. For large-scale corruption: Contact Firebase support (requires Blaze plan)

---

## 5. Post-Rollback Actions

1. Investigate root cause (within 24 hours)
2. Write a detailed post-mortem in `docs/19_optional/Decision_Log.md`
3. Add a regression test to prevent the same issue
4. Apply hotfix, test thoroughly on preview channel, re-deploy
