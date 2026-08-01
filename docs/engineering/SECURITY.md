# Security Guidelines
## SpendWise — Student Expense Tracker

---

## 1. Security Philosophy

SpendWise handles financial data — one of the most sensitive categories of personal information. We adopt a **defense-in-depth** approach: multiple layers of security such that compromising any single layer does not expose user data.

**Core Principles:**
1. **Least Privilege** — Each component has access only to what it needs
2. **Zero Trust** — Never trust client-side data; always validate server-side
3. **Privacy by Design** — Collect only what's necessary; never sell or share user data
4. **Fail Securely** — When in doubt, deny access

---

## 2. Authentication Security

### 2.1 Firebase Auth
- JWT tokens issued and managed by Firebase Auth
- Access tokens expire in 1 hour (Firebase default)
- Refresh tokens stored securely by Firebase SDK (IndexedDB on web)
- **Never** store auth tokens in localStorage manually

### 2.2 Password Requirements
- Minimum 8 characters (enforced client + Firebase)
- Firebase's built-in brute-force protection (rate limiting)
- After 5 failed attempts: CAPTCHA challenge (Firebase default)

### 2.3 Google OAuth Security
- Scopes: only `email` and `profile` — no access to Google data
- State parameter validated to prevent CSRF
- Token handled entirely by Firebase SDK

### 2.4 Session Security
- Sessions automatically expire when refresh token is revoked
- Logout invalidates local tokens + clears all cached state
- No remember-me beyond Firebase's default session management

---

## 3. Data Security

### 3.1 Firestore Security Rules (CRITICAL)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // =============================================
    // HELPER FUNCTIONS
    // =============================================
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isValidAmount(data) {
      return data.amount is number 
        && data.amount > 0 
        && data.amount <= 1000000;
    }
    
    function isValidNote(data) {
      return !('note' in data) 
        || (data.note is string && data.note.size() <= 200);
    }
    
    function isValidBudget(data) {
      return data.amount is number 
        && data.amount > 0 
        && data.amount <= 10000000;
    }
    
    // User cannot change their own userId (immutable)
    function userIdUnchanged() {
      return request.resource.data.userId == resource.data.userId;
    }
    
    // =============================================
    // USERS COLLECTION
    // =============================================
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId)
        && request.resource.data.uid == resource.data.uid  // uid immutable
        && request.resource.data.email == resource.data.email; // email immutable
      allow delete: if false;  // Account deletion via Cloud Function only
    }
    
    // =============================================
    // EXPENSES COLLECTION
    // =============================================
    match /expenses/{expenseId} {
      allow read: if isAuthenticated() 
        && isOwner(resource.data.userId);
      
      allow create: if isAuthenticated()
        && isOwner(request.resource.data.userId)
        && isValidAmount(request.resource.data)
        && isValidNote(request.resource.data)
        && request.resource.data.isDeleted == false;
      
      allow update: if isAuthenticated()
        && isOwner(resource.data.userId)
        && userIdUnchanged()
        && isValidAmount(request.resource.data)
        && isValidNote(request.resource.data);
      
      // HARD DELETE NOT PERMITTED — use soft delete
      allow delete: if false;
    }
    
    // =============================================
    // BUDGETS COLLECTION
    // =============================================
    match /budgets/{budgetId} {
      allow read: if isAuthenticated() 
        && isOwner(resource.data.userId);
      
      allow create: if isAuthenticated()
        && isOwner(request.resource.data.userId)
        && isValidBudget(request.resource.data);
      
      allow update: if isAuthenticated()
        && isOwner(resource.data.userId)
        && userIdUnchanged();
      
      allow delete: if false;
    }
    
    // =============================================
    // CATEGORIES COLLECTION
    // =============================================
    match /categories/{categoryId} {
      // Anyone authenticated can read system categories
      allow read: if isAuthenticated()
        && (resource.data.userId == 'SYSTEM' || isOwner(resource.data.userId));
      
      allow create: if isAuthenticated()
        && isOwner(request.resource.data.userId)
        && request.resource.data.userId != 'SYSTEM';  // Cannot create SYSTEM categories
      
      allow update: if isAuthenticated()
        && isOwner(resource.data.userId)
        && resource.data.userId != 'SYSTEM';  // Cannot modify SYSTEM categories
      
      allow delete: if false;
    }
    
    // =============================================
    // REPORTS COLLECTION
    // =============================================
    match /reports/{reportId} {
      allow read, write: if isAuthenticated() 
        && isOwner(resource.data.userId);
    }
    
    // =============================================
    // DEFAULT: DENY ALL
    // =============================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3.2 Data Encryption
- **In Transit:** TLS 1.3 enforced by Firebase (all connections encrypted)
- **At Rest:** AES-256 encryption (Firebase/Google Cloud default)
- **Client-side:** No additional encryption needed (Firebase handles it)

### 3.3 Data Minimization
- We collect ONLY what the app needs to function
- No tracking of device location
- No tracking of browsing behavior beyond the app
- No third-party analytics that collect PII (Firebase Analytics is first-party)

---

## 4. Input Validation & Sanitization

### 4.1 Client-Side Validation (Zod)
All form inputs validated with Zod schemas before submission:
```typescript
// No HTML characters in text fields
const sanitizeText = (text: string) => text.replace(/<[^>]*>/g, '');

// Applied in all text input schemas
note: z.string()
  .max(200)
  .transform(sanitizeText)
  .optional()
```

### 4.2 Server-Side Validation (Firestore Rules)
Even if client-side validation is bypassed:
- Amount: must be positive number ≤ 1,000,000
- Note: must be string ≤ 200 characters
- userId: must match authenticated user's UID

### 4.3 XSS Prevention
- All user content rendered as text (never innerHTML)
- React's default escaping for JSX expressions
- No `dangerouslySetInnerHTML` anywhere in the codebase
- Content Security Policy (CSP) headers set in Next.js

### 4.4 CSRF Protection
- Firebase Auth uses same-site cookies
- Firestore SDK authenticates via token headers (not cookies) — inherently CSRF-safe

---

## 5. API Security

### 5.1 Rate Limiting
Cloud Functions enforce rate limiting:
```typescript
const rateLimits = {
  addExpense:      { window: '1m', max: 60 },   // 60 expenses/minute max
  generateReport:  { window: '1h', max: 10 },   // 10 reports/hour
  sendNotification: { window: '1h', max: 5 },   // 5 notifications/hour
};
```

### 5.2 HTTPS Only
- Firebase Hosting enforces HTTPS
- HTTP → HTTPS redirect configured
- HSTS header: `max-age=31536000; includeSubDomains; preload`

### 5.3 Security Headers (Next.js Config)
```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https://lh3.googleusercontent.com",
      "connect-src 'self' https://*.googleapis.com wss://*.firebaseio.com",
      "font-src https://fonts.gstatic.com",
    ].join('; ')
  }
];
```

---

## 6. Privacy & Data Protection

### 6.1 What Data We Store
| Data | Stored | Purpose | Retention |
|---|---|---|---|
| Email | Yes | Authentication | Until account deleted |
| Display Name | Yes | Personalization | Until account deleted |
| Profile Photo URL | Yes (URL only) | UI display | Until account deleted |
| Monthly Budget | Yes | Core feature | Until account deleted |
| Expense amount | Yes | Core feature | Until deleted by user |
| Expense category | Yes | Core feature | Until deleted by user |
| Expense note | Yes | Core feature | Until deleted by user |
| Expense date | Yes | Core feature | Until deleted by user |
| Device ID | Yes | Sync attribution | 30 days rolling |

### 6.2 What We DO NOT Store
- ❌ Bank account numbers or credentials
- ❌ UPI IDs or payment handles
- ❌ Government IDs (PAN, Aadhaar)
- ❌ Precise GPS location
- ❌ Contacts or address book
- ❌ SMS content
- ❌ Browser history

### 6.3 Data Sharing
- **Third parties:** Firebase/Google (data processor under DPA)
- **No advertising:** We do not share data with advertisers
- **No selling:** We never sell user data. Ever.
- **Law enforcement:** Only if legally compelled with valid court order

### 6.4 Account Deletion
When user deletes their account:
1. Firebase Auth account deleted
2. Cloud Function triggered: delete all Firestore documents (userId == uid)
3. Firebase Storage files deleted
4. Process completes within 30 days
5. Backups purged within 90 days

---

## 7. Dependency Security

### 7.1 Dependency Management
```bash
# Run weekly, minimum before each release
npm audit

# Fix automatically where safe
npm audit fix

# Review manually for breaking change fixes
npm audit fix --force
```

### 7.2 Dependabot Configuration
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels: ["dependencies"]
    
  - package-ecosystem: "npm"
    directory: "/functions"
    schedule:
      interval: "weekly"
```

### 7.3 No Unvetted Third-Party Scripts
- No third-party CDN scripts in the app
- No unvetted analytics scripts
- All dependencies from npm with known maintainers

---

## 8. Incident Response

### 8.1 Security Incident Classification

| Severity | Description | Response Time |
|---|---|---|
| Critical | Data breach, unauthorized access to user data | 1 hour |
| High | Authentication bypass, privilege escalation | 4 hours |
| Medium | Stored XSS, CSRF, data leakage | 24 hours |
| Low | Non-exploitable vulnerability, missing header | 1 week |

### 8.2 Breach Response Procedure
1. **Contain:** Revoke compromised credentials, disable affected features
2. **Assess:** Determine scope of breach (how many users, what data)
3. **Notify:** Affected users within 72 hours (GDPR requirement)
4. **Fix:** Patch vulnerability and deploy
5. **Post-mortem:** Document and update security procedures

### 8.3 Responsible Disclosure
We welcome security reports at: security@spendwise.app  
Response within 48 hours.  
We do not pursue legal action against good-faith security researchers.

---

## 9. Security Checklist (Pre-Release)

- [ ] Firestore Security Rules tested with Firebase Rules Playground
- [ ] All inputs validated with Zod (client-side)
- [ ] All inputs validated by Firestore rules (server-side)
- [ ] No sensitive data in console.log statements
- [ ] No sensitive data in URL parameters
- [ ] Security headers configured in Next.js
- [ ] HTTPS enforced
- [ ] npm audit: zero high/critical vulnerabilities
- [ ] Firebase rules deployed to production
- [ ] CSP headers tested (no CSP violations in console)
- [ ] Authentication flows tested (no bypass possible)
- [ ] Account deletion flow tested (all data removed)

---

*Security Guidelines v1.0 — July 2026. Review quarterly or after any security incident.*
