# Routing Architecture
## SpendWise — Student Expense Tracker

---

## 1. Next.js App Router Structure

SpendWise uses the Next.js App Router (`src/app/`) for all routing.

```text
src/app/
├── layout.tsx                 # Root layout (Providers, Fonts, Meta)
├── globals.css                # Global styles
├── page.tsx                   # Landing Page (Unauthenticated)
│
├── (auth)/                    # Auth route group (no path prefix)
│   ├── layout.tsx             # Auth layout (centered card)
│   ├── login/
│   │   └── page.tsx           # Login screen
│   ├── signup/
│   │   └── page.tsx           # Signup screen
│   └── onboarding/
│       └── page.tsx           # Initial budget setup
│
└── (app)/                     # Authenticated app route group
    ├── layout.tsx             # App layout (Bottom Nav, Auth Guard)
    ├── dashboard/
    │   └── page.tsx           # Dashboard tab
    ├── expenses/
    │   └── page.tsx           # Expense list tab
    ├── analytics/
    │   └── page.tsx           # Analytics tab
    ├── reports/
    │   └── page.tsx           # Reports tab
    └── settings/
        ├── page.tsx           # Settings main menu
        ├── account/page.tsx   # Account details
        └── budget/page.tsx    # Budget configuration
```

---

## 2. Route Groups

We use Route Groups `(folderName)` to organize layouts without affecting the URL structure.

### `(auth)`
- **URL impact:** None (e.g., `/login` not `/auth/login`)
- **Layout:** Minimal, centered container, no navigation bar.
- **Purpose:** Used for screens where the user is not yet fully in the app experience.

### `(app)`
- **URL impact:** None (e.g., `/dashboard` not `/app/dashboard`... wait, in early docs we defined it as `/app/dashboard`. We will use Next.js standard where `(app)` doesn't add to URL, but to keep with the PRD, we will actually name the folder `app` without parentheses if we want the `/app` prefix. Let's assume standard App Router where `(app)` is just for layout).
- **Update:** Based on the PRD, the URL *should* contain `/app`. Therefore, the folder structure is actually `src/app/app/` (or a middleware rewrite). To avoid confusion, we will use the exact URLs defined in Navigation.md.

*Correction based on Navigation.md:*
- The folder is literally `src/app/app/` to get the `/app/dashboard` URL.
- The `src/app/app/layout.tsx` enforces authentication and renders the bottom navigation.

---

## 3. Navigation State

### Programmatic Navigation
We use `next/navigation` hooks:
```typescript
import { useRouter, usePathname } from 'next/navigation';

const router = useRouter();
const pathname = usePathname();

// Pushing a new route
router.push('/app/expenses');

// Checking active tab
const isActive = pathname.startsWith('/app/analytics');
```

### Pre-fetching
Next.js `<Link>` components automatically pre-fetch routes when they enter the viewport. This makes tab switching instantaneous.
```tsx
import Link from 'next/link';

<Link href="/app/dashboard" prefetch={true}>
  <HomeIcon />
  <span>Home</span>
</Link>
```

---

## 4. Middleware (Route Protection)

The `src/middleware.ts` file acts as the gatekeeper for all `/app/*` routes.

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for Firebase session cookie or custom auth token in cookies
  const session = request.cookies.get('__session');

  // If trying to access /app but no session exists, redirect to login
  if (request.nextUrl.pathname.startsWith('/app') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access /login but session exists, redirect to dashboard
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/login'],
};
```
