# Deployment Guide
## SpendWise — Student Expense Tracker

---

## 1. Infrastructure Overview

| Component | Service | Environment |
|---|---|---|
| Frontend (Next.js) | Firebase Hosting / Vercel | All |
| Database | Firebase Firestore | All |
| Auth | Firebase Auth | All |
| Cloud Functions | Firebase Cloud Functions (Gen 2) | All |
| File Storage | Firebase Storage | All |
| Push Notifications | Firebase Cloud Messaging | Staging + Production |
| CI/CD | GitHub Actions | All |

---

## 2. Environments

| Environment | URL | Branch | Auto-Deploy |
|---|---|---|---|
| Development | localhost:3000 | feature/* | No (local) |
| Staging | staging.spendwise.app | main | Yes |
| Production | spendwise.app | release/* tags | Yes |

---

## 3. Prerequisites

### Local Development Requirements
```bash
# Required tools
node --version    # >= 20.0.0
npm --version     # >= 10.0.0
firebase --version # >= 13.0.0

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Install Java (required for emulators)
# Java >= 11 required
java -version
```

---

## 4. Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-username/spendwise.git
cd spendwise

# 2. Install dependencies
npm install

# 3. Install Cloud Functions dependencies
cd functions && npm install && cd ..

# 4. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase project credentials

# 5. Start Firebase emulators
firebase emulators:start

# 6. In a separate terminal, start Next.js
npm run dev

# App available at: http://localhost:3000
# Emulator UI available at: http://localhost:4000
```

### Emulator Ports
| Emulator | Port |
|---|---|
| Auth | 9099 |
| Firestore | 8080 |
| Cloud Functions | 5001 |
| Firebase Hosting | 5000 |
| Emulator UI | 4000 |

---

## 5. Firebase Project Setup

### 5.1 Create Firebase Project

```bash
# Create project at https://console.firebase.google.com
# Or via CLI:
firebase projects:create spendwise-prod

# Initialize Firebase in the project
firebase init
# Select: Firestore, Functions, Hosting, Storage, Emulators
```

### 5.2 Enable Firebase Services

In the Firebase Console:
1. **Authentication:** Enable Google provider + Email/Password
2. **Firestore:** Create database in production mode (region: asia-south1)
3. **Storage:** Set up Firebase Storage (same region)
4. **Cloud Functions:** Enable billing (required for Gen 2 functions)
5. **Cloud Messaging:** Enable FCM

### 5.3 Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage
```

### 5.4 Seed Preset Categories

Run the seed script after first deploy:
```bash
npm run seed:categories
# This creates the 15 preset categories in Firestore
```

---

## 6. Environment Variables Setup

### Required Variables

```bash
# .env.local (for local development)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=spendwise-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=spendwise-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=spendwise-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development

NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
NEXT_PUBLIC_ENABLE_PRO_FEATURES=false
```

### GitHub Secrets (for CI/CD)

Set these in GitHub repository Settings > Secrets:
```
FIREBASE_SERVICE_ACCOUNT_STAGING    — Firebase admin SDK key (staging)
FIREBASE_SERVICE_ACCOUNT_PRODUCTION — Firebase admin SDK key (production)
NEXT_PUBLIC_FIREBASE_API_KEY_STAGING
NEXT_PUBLIC_FIREBASE_PROJECT_ID_STAGING
... (all NEXT_PUBLIC_ vars for each environment)
VERCEL_TOKEN                         — If using Vercel for hosting
```

---

## 7. CI/CD Pipeline

### 7.1 Staging Deployment (GitHub Actions)

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:unit
      
      - name: Type check
        run: npm run type-check
      
      - name: Build Next.js
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY_STAGING }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID_STAGING }}
          NEXT_PUBLIC_APP_ENV: staging
        run: npm run build
      
      - name: Deploy to Firebase Hosting (Staging)
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_STAGING }}
          channelId: live
          projectId: spendwise-staging
      
      - name: Deploy Cloud Functions (Staging)
        run: |
          cd functions
          npm ci
          npm run build
          firebase deploy --only functions --project spendwise-staging
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN_STAGING }}
```

### 7.2 Production Deployment

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v[0-9]+.[0-9]+.[0-9]+'  # Only on version tags (e.g., v1.2.3)

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval in GitHub
    steps:
      # ... same as staging but with production secrets
      
      - name: Deploy to Firebase Hosting (Production)
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_PRODUCTION }}
          projectId: spendwise-prod
      
      - name: Deploy Cloud Functions (Production)
        run: firebase deploy --only functions --project spendwise-prod
      
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

---

## 8. Manual Deployment (Emergency)

```bash
# Build the app
npm run build

# Deploy only frontend to Firebase Hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Cloud Functions
cd functions && npm run build
firebase deploy --only functions

# Deploy everything
firebase deploy
```

---

## 9. Database Migrations

When Firestore schema changes are needed:

```bash
# 1. Write migration script in scripts/migrations/
# 2. Test against Firestore emulator
# 3. Deploy to staging first
# 4. Run migration:
npm run migrate:staging

# 5. Verify data integrity
# 6. Run on production:
npm run migrate:production
```

Migration scripts use the Firebase Admin SDK and are idempotent (safe to run multiple times).

---

## 10. Monitoring & Alerting

### Firebase Monitoring
- Firebase Console → Project Overview → Usage and billing
- Set up budget alerts at $10/month and $25/month
- Firestore read/write monitoring dashboard

### Error Monitoring
```bash
# Install Sentry (optional but recommended)
npm install @sentry/nextjs

# Configure in next.config.js with Sentry DSN
```

### Uptime Monitoring
- Set up UptimeRobot (free) to monitor https://spendwise.app every 5 minutes
- Alert via email when downtime detected

---

## 11. Rollback Procedure

### Frontend Rollback
```bash
# Firebase Hosting keeps previous 10 releases
# Rollback via Firebase Console: Hosting → Release History → Rollback
# Or via CLI:
firebase hosting:channel:open live  # View current
firebase deploy --only hosting      # After reverting code to previous tag
```

### Database Rollback
- Firestore doesn't support rollback of data changes
- Use Firestore scheduled exports (daily backups to Google Cloud Storage)
- In case of data corruption: restore from last backup

```bash
# Export Firestore data (run daily via Cloud Scheduler)
gcloud firestore export gs://spendwise-backups/$(date +%Y-%m-%d)

# Restore from backup (EMERGENCY ONLY)
gcloud firestore import gs://spendwise-backups/2026-07-20
```

---

## 12. Release Process

```
1. Create release branch: git checkout -b release/v1.2.0
2. Update CHANGELOG.md
3. Update version in package.json
4. Run full test suite: npm run test:all
5. Deploy to staging: git push origin release/v1.2.0
   → GitHub Actions deploys to staging automatically
6. QA sign-off on staging environment
7. Create release tag: git tag v1.2.0
8. Push tag: git push origin v1.2.0
   → GitHub Actions deploys to production (with approval gate)
9. Verify production deployment
10. Announce release
```

---

*Deployment Guide v1.0 — July 2026*
