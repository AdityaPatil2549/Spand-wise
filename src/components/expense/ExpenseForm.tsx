'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CategoryPicker } from '@/components/shared/CategoryPicker';
import { useStore } from '@/store';
import { addExpense, editExpense } from '@/lib/expenses/index';
import { dateToInputValue } from '@/lib/utils/date';
import {
  MAX_EXPENSE_AMOUNT,
  MIN_EXPENSE_AMOUNT,
  MAX_NOTE_LENGTH,
  CURRENCY_SYMBOL,
} from '@/config/constants';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import type { ExpenseDocument } from '@/types/firestore';

const expenseSchema = z.object({
  amount: z
    .number()
    .min(MIN_EXPENSE_AMOUNT, 'Amount must be greater than 0')
    .max(MAX_EXPENSE_AMOUNT, `Amount cannot exceed ${CURRENCY_SYMBOL}10,00,000`),
  categoryId: z.string().min(1, 'Select a category'),
  note: z.string().max(MAX_NOTE_LENGTH, `Max ${MAX_NOTE_LENGTH} characters`).optional(),
  date: z.string().min(1, 'Date is required'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  editingExpense?: ExpenseDocument | null;
  initialCategoryId?: string | null;
  onSuccess: () => void;
}

/**
 * Add / Edit Expense form.
 * Handles both create and update flows via a single form.
 * Validates with Zod, submits with optimistic UI.
 */
export const ExpenseForm = ({ editingExpense, initialCategoryId, onSuccess }: ExpenseFormProps) => {
  const user = useStore((s) => s.user);
  const householdId = useStore((s) => s.householdId);
  const addToast = useStore((s) => s.addToast);
  const addExpenseOptimistic = useStore((s) => s.addExpenseOptimistic);
  const updateExpenseOptimistic = useStore((s) => s.updateExpenseOptimistic);
  const adjustTotalSpentOptimistic = useStore((s) => s.adjustTotalSpentOptimistic);

  const isEdit = !!editingExpense;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: editingExpense?.amount ?? undefined,
      categoryId: editingExpense?.categoryId ?? initialCategoryId ?? DEFAULT_CATEGORY_ID,
      note: editingExpense?.note ?? '',
      date: editingExpense
        ? dateToInputValue(editingExpense.date.toDate())
        : dateToInputValue(),
    },
  });

  const onSubmit = async (data: ExpenseFormValues) => {
    if (!user) return;
    try {
      if (isEdit && editingExpense) {
        // Optimistic update
        updateExpenseOptimistic({ id: editingExpense.id, amount: data.amount, categoryId: data.categoryId, note: data.note ?? null });
        const delta = data.amount - editingExpense.amount;
        adjustTotalSpentOptimistic(delta);
        await editExpense(householdId || user.uid, { ...data, id: editingExpense.id }, editingExpense.amount);
        addToast({ type: 'success', message: 'Expense updated!' });
      } else {
        // Optimistic add — create a temporary ID
        adjustTotalSpentOptimistic(data.amount);
        const newExpense = await addExpense(householdId || user.uid, user.uid, data);
        addExpenseOptimistic(newExpense);
        addToast({ type: 'success', message: 'Expense added! 💸' });
      }
      reset();
      onSuccess();
    } catch (error) {
      console.error('[ExpenseForm]', error);
      // Rollback optimistic changes
      if (!isEdit) adjustTotalSpentOptimistic(-data.amount);
      addToast({ type: 'error', message: 'Something went wrong. Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {/* Amount Input */}
      <div>
        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">
          Amount
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-[var(--text-secondary)] font-bold text-xl pointer-events-none select-none">
            {CURRENCY_SYMBOL}
          </span>
          <input
            type="number"
            inputMode="numeric"
            step="1"
            placeholder="0"
            autoFocus
            className="w-full pl-10 pr-4 py-4 text-4xl font-bold rounded-2xl border-2
              bg-[var(--surface-secondary)] text-[var(--text-primary)]
              placeholder:text-[var(--text-tertiary)]
              border-transparent focus:border-violet-500 focus:outline-none
              transition-all duration-150"
            {...register('amount', { valueAsNumber: true })}
            aria-label="Expense amount in rupees"
            aria-invalid={!!errors.amount}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-red-500" role="alert">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Category Picker */}
      <div>
        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
          Category
        </label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <CategoryPicker selectedId={field.value} onSelect={field.onChange} />
          )}
        />
        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-500" role="alert">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Note Input */}
      <Input
        label="Note (optional)"
        placeholder="What was this for?"
        {...register('note')}
        error={errors.note?.message}
        maxLength={MAX_NOTE_LENGTH}
      />

      {/* Date/Time */}
      <Input
        label="Date & Time"
        type="datetime-local"
        {...register('date')}
        error={errors.date?.message}
      />

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
      >
        {isEdit ? 'Update Expense' : 'Add Expense'}
      </Button>
    </form>
  );
};
