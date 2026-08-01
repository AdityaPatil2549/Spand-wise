# CI/CD Pipeline
## SpendWise — Student Expense Tracker

---

## 1. CI/CD Strategy

SpendWise uses **GitHub Actions** for continuous integration and **Firebase Hosting** for continuous deployment.

**Pipeline Goals:**
- Prevent broken code from reaching production
- Automate repetitive tasks (lint, test, build, deploy)
- Provide fast feedback (< 5 minutes for CI)
- Zero-downtime deployments via Firebase CDN

---

## 2. GitHub Actions Workflow

### ci.yml (Run on every Pull Request and Push to `main`)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - name: TypeScript Check
        run: npx tsc --noEmit
      
      - name: ESLint
        run: npm run lint
      
      - name: Run Unit Tests
        run: npm run test:unit -- --coverage
        env:
          FIRESTORE_EMULATOR_HOST: localhost:8080
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v4
  
  build:
    name: Build
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - name: Build Next.js App
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          # ... all required env vars
      
      - name: Lighthouse Audit
        uses: treosh/lighthouse-ci-action@v12
        with:
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### deploy.yml (Deploy on push to `main`)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  deploy:
    needs: [quality, build]  # Only deploy if CI passes
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          # ... other env vars
      
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
```

---

## 3. Git Branch Strategy

```
main         ← Production. Only updated via PR from develop.
  │
develop      ← Integration branch. Feature branches merge here.
  ├── feature/US-001-auth-flow
  ├── feature/US-003-add-expense
  └── bugfix/budget-calculation-error
```

**Rules:**
- `main` is protected: Requires PR review + all CI checks green
- `develop` requires CI checks green before merge
- Feature branches: Deleted after merge

---

## 4. Deployment Environments

| Environment | Branch | URL | Firebase Channel |
|:---|:---|:---|:---|
| Production | `main` | `https://spendwise.app` | `live` |
| Preview | Any PR | Auto-generated URL | `pr-{number}` |
| Local Dev | — | `http://localhost:3000` | Firebase Emulator |
