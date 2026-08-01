# Component Architecture API
## SpendWise — Student Expense Tracker

---

## 1. Component Philosophy
SpendWise relies on heavily reusable, atomic UI components. All UI primitives reside in `src/components/ui/` and must strictly adhere to the Tailwind design tokens.

We do NOT use external component libraries like Material-UI or Chakra to keep the bundle size minimal.

---

## 2. Core Primitives

### 2.1 `<Button />`
The standard interactive element.

**Props Interface:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**Variants Logic:**
- `primary`: Solid Electric Violet background (`bg-brand-500 hover:bg-brand-600 text-white`).
- `secondary`: Light violet background (`bg-brand-100 text-brand-900`).
- `destructive`: Red background (`bg-red-500 hover:bg-red-600`).
- `isLoading`: Disables button, hides `leftIcon`, displays a spinning SVG loader.

### 2.2 `<Card />`
Used as the container for dashboard metrics and analytics blocks.

**Structure (Compound Components):**
```tsx
<Card className="shadow-md border-border-subtle">
  <CardHeader>
    <CardTitle>Remaining Budget</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-4xl font-bold">₹15,000</p>
  </CardContent>
</Card>
```

### 2.3 `<BottomSheet />`
The primary mechanism for expense entry. Powered by Framer Motion.

**Props Interface:**
```typescript
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  preventOutsideClick?: boolean;
}
```
**Implementation Details:**
- Uses Framer Motion's `<AnimatePresence>` for mount/unmount animations.
- Must trap focus inside the sheet for accessibility.
- Renders via React Portal (`createPortal`) directly into the `document.body` to escape any parent `overflow: hidden` constraints.

---

## 3. Domain Components

### 3.1 `<ExpenseForm />`
The complex stateful component injected into the `<BottomSheet />`.

**Internal State:**
- `amount: number`
- `categoryId: string`
- `note: string`
- `date: Date` (default: `new Date()`)

**Dependencies:**
- Calls `useAppStore().addExpenseOptimistic(data)` on submit.
- Validates state against Zod `AddExpenseSchema`.

### 3.2 `<ExpenseTimeline />`
Renders the grouped list of expenses.

**Props:**
```typescript
interface ExpenseTimelineProps {
  expenses: ExpenseDocument[];
  isLoading: boolean;
}
```

**Internal Logic:**
- Groups the raw `expenses` array by day using `date-fns` `format(date, 'yyyy-MM-dd')`.
- Renders sticky date headers (e.g., "Today", "Yesterday", "Monday, 14th") for each group.
- Applies React `memo` to individual `<ExpenseRow />` components to prevent massive re-renders when a new expense is added at the top.

---

## 4. UI Slices (Zustand)

Component state that needs to survive unmounts (like toast notifications or active bottom sheet states) lives in the UI slice of the Zustand store.

```typescript
interface UIStore {
  // Toasts
  toast: { message: string, type: 'success'|'error', isVisible: boolean } | null;
  showToast: (type: 'success'|'error', message: string) => void;
  hideToast: () => void;
  
  // Modals
  activeSheet: 'ADD_EXPENSE' | 'EDIT_EXPENSE' | null;
  sheetData: any | null;
  openSheet: (type: string, data?: any) => void;
  closeSheet: () => void;
}
```
Using the global store for the `BottomSheet` allows ANY button in the app (e.g., a CTA on the Empty State page) to open the Add Expense flow without passing props down a massive component tree.
