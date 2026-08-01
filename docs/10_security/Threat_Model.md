# Threat Model
## SpendWise — Student Expense Tracker

---

## 1. Methodology: STRIDE

We use the STRIDE framework to identify threats: **S**poofing, **T**ampering, **R**epudiation, **I**nformation Disclosure, **D**enial of Service, **E**levation of Privilege.

---

## 2. Asset Inventory

| Asset | Sensitivity | Impact if Compromised |
|:---|:---:|:---|
| User expense data (amounts, notes) | Medium | Privacy violation; embarrassment |
| User email address | Medium | Spam, phishing |
| Firebase Auth credentials | High | Account takeover |
| Monthly budget amount | Low | Minor privacy issue |
| Firestore security rules | Critical | Complete data exposure if bypassed |

---

## 3. STRIDE Threat Analysis

### S — Spoofing (Identity Impersonation)
| Threat | Mitigation |
|:---|:---|
| Attacker spoofs a user's Google account to gain access | Firebase Auth's Google OAuth is managed by Google; we cannot be bypassed client-side |
| Attacker creates a fake Firebase token | Firebase Auth tokens are RS256 signed; only Google's private key can sign them; validated on every Firestore request |
| Brute-force email/password login | Firebase Auth rate-limits login attempts and supports automatic lockout (`auth/too-many-requests`) |

### T — Tampering (Data Modification)
| Threat | Mitigation |
|:---|:---|
| Attacker modifies another user's expenses via Firestore REST API | Firestore security rules enforce `userId == request.auth.uid` on all reads/writes |
| Attacker submits negative amounts to drain the budget | Firestore security rules validate `amount > 0 && amount <= 1000000` on expense writes |
| Attacker changes `isDeleted: false` on another user's expense | Security rules prevent cross-user writes entirely |

### R — Repudiation (Denying Actions)
| Threat | Mitigation |
|:---|:---|
| User denies adding an expense | Firestore documents have `createdAt: serverTimestamp()` — set by server, not client; provides audit trail |
| Developer accidentally deletes user data | Soft delete (isDeleted flag) preserves data; no permanent deletes in v1.0 |

### I — Information Disclosure (Data Leakage)
| Threat | Mitigation |
|:---|:---|
| User A reads User B's expense data | Firestore security rules deny all cross-user reads |
| Firebase credentials exposed in client-side code | Firebase API keys in client-side code are **not secrets** — they're identifiers. Security is enforced by security rules, not API key secrecy |
| User data exposed in browser developer tools | Data is in Firestore (not localStorage); only the current user's data is fetched |
| Error messages reveal system internals | All Firebase error codes are mapped to user-friendly messages; raw codes never shown |

### D — Denial of Service
| Threat | Mitigation |
|:---|:---|
| Attacker floods Firestore with writes using a valid account | Firebase provides write rate limits per document; Firestore security rules add validation overhead |
| Attacker causes a student to hit Firebase Spark limits | Not a significant threat for a student app; monitored via Firebase Console alerts |

### E — Elevation of Privilege
| Threat | Mitigation |
|:---|:---|
| Attacker gains admin access to Firestore | No admin SDK is exposed in client code; admin operations require Firebase Console access (Google account protected) |
| Client-side code attempts to write to another user's path | Security rules reject any write where `userId != request.auth.uid` |

---

## 4. Out-of-Scope Threats (v1.0)

- SQL injection: N/A (NoSQL database)
- XSS via stored data: Mitigated by React's default escaping; notes are plain text
- CSRF: N/A for Firebase Auth (stateless JWT tokens)
- Dependency supply chain attacks: Mitigated by `npm audit` in CI
