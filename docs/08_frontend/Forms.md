# Forms and Inputs
## SpendWise — Student Expense Tracker

---

## 1. Form Strategy

SpendWise uses controlled React components for forms. Given the simplicity of our forms (mostly 1-3 fields), we do not use heavy form libraries like `react-hook-form` or `formik` for v1.0 to keep the bundle size small.

Validation is handled via Zod schemas and executed on form submit or field blur.

---

## 2. Validation with Zod

```typescript
// src/types/forms.ts
import { z } from 'zod';

export const AddExpenseSchema = z.object({
  amount: z.number()
    .min(0.01, 'Amount must be greater than zero')
    .max(1000000, 'Amount cannot exceed ₹10,00,000'),
  categoryId: z.string().min(1, 'Please select a category'),
  note: z.string().max(200, 'Note is too long').optional(),
  date: z.date(),
});

export type AddExpenseFormValues = z.infer<typeof AddExpenseSchema>;
```

---

## 3. The Number Input (Amount)

The amount input is the most critical interaction in the app.

**UX Requirements:**
- Must open the numeric keyboard on mobile immediately (`inputmode="decimal"`).
- Must prevent invalid characters (`e`, `-`, `+`).
- Must format as currency on blur, but allow raw number entry on focus.
- Must handle the `₹` prefix visually without making it part of the input value.

**Implementation Pattern:**
```tsx
<div className="relative flex items-center justify-center">
  <span className="absolute left-4 text-text-tertiary text-2xl font-bold">₹</span>
  <input
    type="number"
    inputMode="decimal"
    value={amount || ''}
    onChange={(e) => setAmount(parseFloat(e.target.value))}
    className="w-full text-center text-4xl font-extrabold bg-transparent border-none focus:ring-0 pl-8"
    placeholder="0"
    autoFocus
  />
</div>
```

---

## 4. Handling Form State & Submission

```tsx
// src/components/expense/ExpenseForm.tsx
const ExpenseForm = () => {
  const [amount, setAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const result = AddExpenseSchema.safeParse({ amount, categoryId, note, date: new Date() });
    
    if (!result.success) {
      // Map Zod errors to field errors
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        newErrors[issue.path[0]] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    // Submit
    setIsSubmitting(true);
    try {
      await addExpense(uid, result.data);
      closeSheet();
      showToast({ type: 'success', message: 'Expense added' });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to add expense' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render...
}
```

---

## 5. Keyboard Management (Mobile)

Mobile keyboards pushing the UI up is a common pain point in PWAs.

**Mitigations:**
- Add Expense bottom sheet is placed at `z-index: 50`.
- The `padding-bottom` of the bottom sheet should account for the `env(safe-area-inset-bottom)`.
- Use `overscroll-behavior: none` on the body when a bottom sheet is open to prevent background scrolling.
- When the amount input is focused, the numeric keyboard appears. The CTA button ("Add Expense") should remain visible above the keyboard.
