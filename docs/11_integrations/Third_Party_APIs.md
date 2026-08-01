# Third Party APIs
## SpendWise — Student Expense Tracker

---

## 1. Minimal Dependency Principle

To keep the application fast, reliable, and cost-effective, SpendWise minimizes reliance on third-party APIs. For v1.0, the only external services utilized are Google-owned infrastructure via Firebase.

---

## 2. Active APIs (v1.0)

### 2.1 Firebase Authentication
- **Purpose:** Secure user login and identity management.
- **Provider:** Google / Firebase
- **Endpoints Used:** Google OAuth 2.0 provider.
- **Data Exchanged:** User email, display name, profile picture URL.
- **Cost:** Free tier covers all expected usage.

### 2.2 Cloud Firestore
- **Purpose:** Primary database for user, expense, category, and budget data.
- **Provider:** Google / Firebase
- **Endpoints Used:** Firestore REST API (abstracted via Web SDK v10).
- **Data Exchanged:** JSON-like document data.
- **Cost:** Spark Plan (Free) -> 50K reads/day, 20K writes/day, 1GB storage.

### 2.3 Firebase Hosting
- **Purpose:** Serve the Next.js static export / application bundle.
- **Provider:** Google / Firebase
- **Endpoints Used:** Edge CDN delivery.
- **Data Exchanged:** HTML, CSS, JS bundles.

---

## 3. Evaluated but Rejected APIs

These APIs were considered during the planning phase but rejected for the MVP.

| API / Service | Category | Reason for Rejection |
|:---|:---|:---|
| Plaid | Banking Integration | Scope creep, privacy concerns, high cost. Does not fit the "manual tracking" philosophy. |
| OpenAI API | AI Insights | High latency, variable cost. Basic insights can be generated locally via math functions without AI. |
| ExchangeRate-API | Currency Conversion | Multi-currency is postponed to v3.0. |
| SendGrid | Transactional Email | Not needed. Firebase Auth handles essential emails (verification/password reset). |
| Sentry | Error Tracking | Overkill for MVP. Console logging is sufficient for early alpha/beta testing. |

---

## 4. Planned Future APIs (v2.0+)

### 4.1 Local AI Models (WebLLM)
Instead of relying on costly external LLMs (like OpenAI), future features for categorizing expenses based on notes (e.g., "Dominos" -> Food) will attempt to use on-device ML models or simple keyword-matching dictionaries to preserve privacy.

### 4.2 Crashlytics (via Firebase)
If the app moves beyond the web into React Native, Firebase Crashlytics will be integrated for robust native crash reporting.
