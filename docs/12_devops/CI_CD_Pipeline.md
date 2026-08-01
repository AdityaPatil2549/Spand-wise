# CI/CD Pipeline & DevOps Architecture
## SpendWise — Student Expense Tracker

---

## 1. Hosting Infrastructure (Vercel)

SpendWise utilizes Vercel for frontend hosting. Vercel is chosen because it provides zero-config integration with Next.js App Router, edge caching, and automatic preview environments for Pull Requests.

---

## 2. The Git Workflow (Trunk-Based Development)

We avoid complex GitFlow patterns (like `develop` and `release` branches) in favor of Trunk-Based Development.
- `main` is the only long-lived branch.
- `main` is ALWAYS in a deployable state.
- Features are developed in short-lived branches (`feature/add-expense-drawer`) and merged directly into `main` via PR.

---

## 3. GitHub Actions Pipeline (CI)

Before any code can be merged into `main`, it must pass the Continuous Integration (CI) pipeline.

### 3.1 Step 1: Static Analysis
- **Linter:** `npm run lint` (ESLint configuration checking for unused variables, explicit anys, and rules defined in `.cursorrules`).
- **Type Check:** `tsc --noEmit` (Strict TypeScript validation. A single type error fails the build).
- **Formatter:** `prettier --check` (Ensures uniform code style).

### 3.2 Step 2: Unit Testing
- Runs `npm run test` (Vitest).
- Generates coverage report (Target: 80% coverage on `src/lib/utils`).

### 3.3 Step 3: E2E Testing & Emulators
- Installs Firebase CLI.
- Starts Firebase Local Emulator (Auth, Firestore).
- Boots the Next.js development server (`npm run dev`).
- Executes Playwright test suite (`npx playwright test`).

---

## 4. Continuous Deployment (CD)

### 4.1 Preview Deployments
When a Pull Request is opened, Vercel automatically creates an ephemeral deployment URL (e.g., `spendwise-pr-14.vercel.app`). This allows stakeholders to manually QA the feature before merging.

### 4.2 Production Deployment
When a PR is merged into `main`:
1. Vercel detects the push.
2. Vercel executes `npm run build`.
3. If the build succeeds, traffic is instantly shifted to the new deployment (Zero-Downtime Deployment).

---

## 5. Environment Variables & Secretops

Secrets are NEVER committed to the repository.

### 5.1 Required Secrets
```text
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

### 5.2 Secret Distribution
- Local: Developers copy `.env.example` to `.env.local` and populate values.
- Vercel (Production): Secrets are injected via Vercel Project Settings -> Environment Variables.
- GitHub Actions: Secrets are injected via GitHub Repository Secrets for E2E tests.

### 5.3 Zod Env Validation
To prevent the app from booting with missing secrets, `src/config/env.ts` parses `process.env` through a Zod schema during initialization. If a variable is missing, the app throws a fatal error immediately (Fail Fast).
