# Backend Error Handling
## SpendWise — Student Expense Tracker

---

## 1. Error Handling Philosophy

- **Never crash silently.**
- **Log everything locally (or to Crashlytics).**
- **Translate internal errors into user-friendly UI messages.**
- **Always provide a recovery path (e.g., "Try again").**

Since SpendWise uses Firebase as its backend, backend errors primarily manifest as Firebase SDK exceptions in the client code.

---

## 2. Standardized Error Wrapper

All operations in `src/lib/` must catch Firebase errors and throw a standardized `AppError`.

```typescript
// src/lib/utils/errors.ts
export class AppError extends Error {
  code: string;
  isRecoverable: boolean;

  constructor(message: string, code: string = 'UNKNOWN', isRecoverable = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.isRecoverable = isRecoverable;
  }
}
```

---

## 3. Firebase Error Mapping

```typescript
// src/lib/utils/errorHandler.ts
import { FirebaseError } from 'firebase/app';

export const handleFirebaseError = (error: unknown): AppError => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return new AppError('You do not have permission to perform this action.', 'AUTH_DENIED');
      case 'unavailable':
        return new AppError('Network unavailable. Action will sync when online.', 'NETWORK_OFFLINE');
      case 'unauthenticated':
        return new AppError('Your session expired. Please sign in again.', 'AUTH_EXPIRED', false);
      case 'resource-exhausted':
        return new AppError('System is busy. Please try again later.', 'RATE_LIMITED');
      default:
        // Log raw error to monitoring service
        console.error('[Firebase Error]', error.code, error.message);
        return new AppError('Something went wrong on our end.', 'INTERNAL_ERROR');
    }
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'CLIENT_ERROR');
  }
  
  return new AppError('An unexpected error occurred.', 'UNKNOWN_ERROR');
};
```

---

## 4. UI Layer Error Handling

In the React components, we catch the `AppError` and display a toast.

```typescript
// Example inside a component
const submitForm = async () => {
  try {
    await addExpense(user.uid, data);
    showToast({ type: 'success', message: 'Saved!' });
  } catch (error) {
    const appError = handleFirebaseError(error);
    showToast({ 
      type: 'error', 
      message: appError.message 
    });
    
    if (!appError.isRecoverable) {
      // e.g., session expired -> redirect to login
      logout();
    }
  }
};
```

---

## 5. Offline Handling (Special Case)

Firestore supports offline persistence. When the device is offline:
1. `addDoc` / `setDoc` will **resolve successfully** (the write is queued locally).
2. The UI updates instantly (optimistic).
3. We do NOT show an error message.
4. We display an `OfflineBanner` at the top of the app reading network status from `navigator.onLine`, indicating that data will sync when connectivity is restored.
