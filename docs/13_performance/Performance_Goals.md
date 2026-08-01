# Performance Goals
## SpendWise — Student Expense Tracker

---

## 1. Performance Budget

| Metric | Target | Critical Threshold |
|:---|:---|:---|
| **LCP (Largest Contentful Paint)** | < 2.5s | > 4.0s = Fail |
| **CLS (Cumulative Layout Shift)** | < 0.1 | > 0.25 = Fail |
| **INP (Interaction to Next Paint)** | < 200ms | > 500ms = Fail |
| **FCP (First Contentful Paint)** | < 1.5s | > 3.0s = Fail |
| **TTI (Time to Interactive)** | < 3.5s | > 7.5s = Fail |
| **Lighthouse Performance Score** | > 80 | < 60 = Fail |
| **Bundle Size (initial JS)** | < 200 kB (gzipped) | > 500 kB = Fail |
| **Dashboard Data Load** | < 1.5s (p90) | > 3.0s = Fail |
| **Expense Entry (UI response)** | < 100ms (optimistic) | > 300ms = Fail |
| **PDF Generation** | < 5s (200 items) | > 10s = Fail |

---

## 2. Performance Rules

### 2.1 Bundle Size Rules
- Never import entire packages; always use named imports
- Heavy libraries (jsPDF, Recharts, html2canvas) MUST be dynamically imported
- Review bundle size with `npm run build` + `npx @next/bundle-analyzer` before merging

```typescript
// ✅ Dynamic import for heavy deps
const PDFReport = dynamic(() => import('@/components/reports/PDFReport'), { ssr: false });

// ❌ Static import kills initial bundle
import { jsPDF } from 'jspdf';
```

### 2.2 Image Rules
- ALL images must use `next/image` with `width`, `height`, and `alt`
- Use WebP format (next/image converts automatically)
- Icons: Use Lucide React (SVG, tree-shakable) — never import icon packs

### 2.3 Font Rules
- Load Inter and JetBrains Mono via `next/font/google` (built-in optimization)
- Subset fonts to only Latin characters (saves ~40% font size)

### 2.4 Rendering Rules
- Use React.memo for list items that receive callbacks as props
- Use Zustand selectors to prevent unnecessary re-renders
- Use `useMemo` for expensive analytics calculations (category sorting)
- Do NOT use `useCallback` unless a callback is passed to a memoized child component

---

## 3. Firestore Read Optimization

| Strategy | Implementation |
|:---|:---|
| **Pre-aggregated analytics** | Budget document stores category breakdown; analytics reads 1 doc, not 100+ expense docs |
| **Pagination** | Expense list: 100 items max per query, `limit(100)` + `startAfter()` for more |
| **Real-time listeners** | Use `onSnapshot` instead of repeated `getDoc()` calls in useEffect |
| **Offline persistence** | Enable Firestore offline persistence to serve cached data instantly on reconnect |
| **No redundant reads** | Set up listeners once in layout, not on every page mount |

---

## 4. Performance Monitoring

- **Firebase Performance Monitoring:** Auto-captures page load times, network request latency
- **Google Search Console:** Core Web Vitals from real users (after launch)
- **Lighthouse CI:** Automated performance regression check on every PR
- **Manual Testing:** Always test on a real low-end Android device (not just Chrome DevTools emulation)

---

## 5. Performance Testing Schedule

| Cadence | Activity |
|:---|:---|
| Every PR | Lighthouse CI automated check |
| Every sprint | Manual performance review on low-end device |
| Every release | Full Core Web Vitals review in Firebase Console |
| Quarterly | Full bundle size audit with @next/bundle-analyzer |
