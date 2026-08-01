# Environment Variables
## SpendWise — Student Expense Tracker

---

## 1. Environment File Strategy

| File | Purpose | Committed to Git? |
|:---|:---|:---:|
| `.env.local` | Local development secrets | ❌ NO (in .gitignore) |
| `.env.example` | Template with placeholder values | ✅ YES |
| `.env.test` | Test environment (emulator) | ✅ YES (no real secrets) |
| `.env.production` | Production values (set via CI/CD) | ❌ NO |

---

## 2. Required Environment Variables

### Firebase Configuration (Public — `NEXT_PUBLIC_*`)
These are safe to expose client-side. They identify the Firebase project; security is handled by Firestore security rules.

```bash
# .env.example
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Application Configuration (Public)
```bash
NEXT_PUBLIC_APP_URL=https://spendwise.app
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development  # 'development' | 'production'
```

### Analytics (Public)
```bash
NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED=true
```

---

## 3. Environment Validation (Zod)

All environment variables are validated at startup using Zod to prevent silent misconfigurations.

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ... etc
});

// This will throw a clear error at startup if any variable is missing.
```

---

## 4. Local Development Setup

```bash
# 1. Copy the example file
cp .env.example .env.local

# 2. Fill in real Firebase config values
# Get them from: Firebase Console → Project Settings → Your apps → Web app → SDK setup

# 3. Never commit .env.local
# .gitignore already includes .env.local — do NOT remove it
```

---

## 5. Production Deployment (Firebase Hosting)

For Firebase Hosting deployments, environment variables are set during the build process:

```bash
# In CI/CD pipeline (e.g., GitHub Actions)
# Set as repository secrets in GitHub Actions settings
# Reference them in the workflow:
- name: Build
  env:
    NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    # ... etc
  run: npm run build
```
