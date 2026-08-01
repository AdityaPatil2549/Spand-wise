# Authentication
## SpendWise — Student Expense Tracker

---

## 1. Authentication Strategy

SpendWise uses **Firebase Authentication** as the sole identity provider.

**Supported Methods (v1.0):**
1. Google OAuth 2.0 (primary, recommended)
2. Email + Password (secondary)

**Why Firebase Auth?**
- Zero backend code required
- Google OAuth works seamlessly with Firestore security rules
- Secure JWT tokens managed automatically by the SDK
- Firebase handles token refresh, session persistence, and revocation

---

## 2. Auth Flows

### 2.1 Google Sign-In Flow
```
User taps "Continue with Google"
  → Firebase calls signInWithPopup(auth, new GoogleAuthProvider())
  → Browser opens Google account picker
  → User selects account
  → Firebase creates/updates user in Firebase Auth
  → SDK returns UserCredential with idToken
  → App reads auth.currentUser (listener updates Zustand)
  → App checks for onboardingComplete in Firestore
  → Routes to /onboarding (new user) or /dashboard (returning user)
```

### 2.2 Email/Password Sign-In
```
User enters email + password → taps "Sign In"
  → Firebase calls signInWithEmailAndPassword(auth, email, password)
  → On success: same routing logic as Google
  → On error: display mapped error message (see Error Handling)
```

### 2.3 Email/Password Sign-Up
```
User fills form → taps "Create Account"
  → Firebase calls createUserWithEmailAndPassword(auth, email, password)
  → Firebase calls updateProfile(user, { displayName })
  → App writes initial UserDocument to Firestore
  → Routes to /onboarding
```

### 2.4 Password Reset
```
User enters email → taps "Send Reset Link"
  → Firebase calls sendPasswordResetEmail(auth, email)
  → Success: Show "Check your email" confirmation
  → Firebase emails the user directly (no custom email server needed)
```

---

## 3. Session Persistence

Firebase Auth maintains session persistence automatically.
```typescript
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

// Set once during app initialization
await setPersistence(auth, browserLocalPersistence);
// Sessions persist across browser restarts (stored in IndexedDB by Firebase SDK)
```

---

## 4. Auth State Management (Zustand)

```typescript
// src/store/auth.slice.ts
interface AuthSlice {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
}
```

```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const { setUser } = useAuthStore();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe; // Cleanup on unmount
  }, [setUser]);
};
```

---

## 5. Route Protection

```typescript
// src/middleware.ts (Next.js Middleware)
export const config = { matcher: ['/app/:path*'] };

export function middleware(request: NextRequest) {
  const token = request.cookies.get('__session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}
```

---

## 6. Auth Error Codes → User Messages

| Firebase Error Code | User-Facing Message |
|:---|:---|
| `auth/user-not-found` | "No account found with this email." |
| `auth/wrong-password` | "Incorrect password. Please try again." |
| `auth/email-already-in-use` | "This email is already registered. Please sign in." |
| `auth/weak-password` | "Password must be at least 8 characters." |
| `auth/invalid-email` | "Please enter a valid email address." |
| `auth/too-many-requests` | "Too many attempts. Please wait a few minutes." |
| `auth/network-request-failed` | "Connection error. Please check your internet." |
