'use client';
import { Timestamp } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AnimatedTimePicker } from '@/components/ui/AnimatedTimePicker';
import { AnimatedDatePicker } from '@/components/ui/AnimatedDatePicker';
import { CategoryPicker } from '@/components/shared/CategoryPicker';
import { useStore } from '@/store';
import { addExpense, editExpense, softDeleteExpense } from '@/lib/expenses/index';
import { dateToInputValue } from '@/lib/utils/date';
import { getLocalMonthString } from '@/lib/date-sharding';
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
 const removeExpenseOptimistic = useStore((s) => s.removeExpenseOptimistic);
 const adjustTotalSpentOptimistic = useStore((s) => s.adjustTotalSpentOptimistic);

 const isEdit = !!editingExpense;

 const {
 register,
 handleSubmit,
 control,
 reset,
 setValue,
 watch,
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

 const currentDateTime = watch('date') || '';
 const datePart = currentDateTime.includes('T') ? currentDateTime.split('T')[0] : '';
 const timePart = currentDateTime.includes('T') ? currentDateTime.split('T')[1] : '';

  const onSubmit = async (data: ExpenseFormValues) => {
    if (!user) return;
    const previousState = isEdit ? editingExpense : null;
    let tempId = '';

    try {
      if (isEdit && editingExpense) {
        // Optimistic update
        const newMonth = getLocalMonthString(new Date(data.date));
        updateExpenseOptimistic({ 
          id: editingExpense.id, 
          amount: data.amount, 
          categoryId: data.categoryId, 
          note: data.note ?? null,
          date: Timestamp.fromDate(new Date(data.date)),
          month: newMonth
        });
        const delta = data.amount - editingExpense.amount;
        adjustTotalSpentOptimistic(delta);
        
        await editExpense(householdId || user.uid, { ...data, id: editingExpense.id }, editingExpense.amount, editingExpense.month);
        addToast({ type: 'success', message: 'Expense updated!' });
      } else {
        // Optimistic add — create a temporary ID
        tempId = `temp-${Date.now()}`;
        const newMonth = getLocalMonthString(new Date(data.date));
        const tempExpense: ExpenseDocument = {
          id: tempId,
          amount: data.amount,
          categoryId: data.categoryId,
          note: data.note ?? null,
          date: Timestamp.fromDate(new Date(data.date)),
          month: newMonth,
          isDeleted: false,
          createdAt: Timestamp.now(),
          createdBy: user.uid,
          updatedAt: Timestamp.now(),
        };
        
        addExpenseOptimistic(tempExpense);
        adjustTotalSpentOptimistic(data.amount);
        
        const newExpense = await addExpense(householdId || user.uid, user.uid, data);
        // Replace temp expense with real one
        removeExpenseOptimistic(tempId);
        addExpenseOptimistic(newExpense);
        addToast({ type: 'success', message: 'Expense added! 💸' });
      }
      reset();
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save expense:', error);
      
      // ATOMIC ROLLBACK
      if (isEdit && previousState) {
        // Rollback update
        updateExpenseOptimistic(previousState);
        adjustTotalSpentOptimistic(previousState.amount - data.amount);
      } else if (!isEdit && tempId) {
        // Rollback add
        removeExpenseOptimistic(tempId);
        adjustTotalSpentOptimistic(-data.amount);
      }
      
      addToast({ type: 'error', message: error.message || 'Failed to save expense' });
    }
  };

  const handleDelete = async () => {
    if (!editingExpense || !householdId || !user) return;
    try {
      // Optimistic delete
      removeExpenseOptimistic(editingExpense.id);
      adjustTotalSpentOptimistic(-editingExpense.amount);
      
      await softDeleteExpense(householdId, editingExpense.id, editingExpense.amount, editingExpense.month);
      addToast({ type: 'success', message: 'Expense deleted' });
      onSuccess();
    } catch (error: any) {
      console.error('Failed to delete expense:', error);
      
      // ATOMIC ROLLBACK
      const { restoreExpenseOptimistic } = useStore.getState();
      restoreExpenseOptimistic(editingExpense);
      adjustTotalSpentOptimistic(editingExpense.amount);
      
      addToast({ type: 'error', message: error.message || 'Failed to delete expense' });
    }
  };

 return (
 <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
 {/* Amount Input */}
 <div>
 <label className="text-sm font-medium text-theme-secondary mb-1.5 block font-body">
 Amount
 </label>
 <div className="relative flex items-center">
 <span className="absolute left-4 text-theme-secondary font-bold text-xl pointer-events-none select-none">
 {CURRENCY_SYMBOL}
 </span>
 <input
 type="number"
 inputMode="numeric"
 step="1"
 placeholder="0"
 autoFocus
 className="w-full pl-10 pr-4 py-4 text-4xl font-manrope tabular-nums font-semibold rounded-2xl border-2
 bg-theme-elevated text-theme-primary
 placeholder:text-theme-tertiary
 border-transparent focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent
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
 <label className="text-sm font-medium text-theme-secondary mb-2 block font-body">
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

 {/* Date and Time */}
 <div className="flex gap-4">
 <div className="flex-1">
 <AnimatedDatePicker
 label="Date"
 value={datePart}
 onChange={(newDate) => setValue('date', `${newDate}T${timePart}`, { shouldValidate: true })}
 />
 </div>
 <div className="flex-1">
 <AnimatedTimePicker
 label="Time"
 value={timePart}
 onChange={(newTime) => setValue('date', `${datePart}T${newTime}`, { shouldValidate: true })}
 />
 </div>
 </div>

 {/* Submit / Actions */}
 <div className="flex gap-3">
 <Button
 type="submit"
 variant="primary"
 size="lg"
 className="flex-1"
 isLoading={isSubmitting}
 >
 {isEdit ? 'Update Expense' : 'Add Expense'}
 </Button>
 {isEdit && (
 <Button
 type="button"
 variant="outline"
 size="lg"
 onClick={handleDelete}
 className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors px-4 flex-shrink-0"
 disabled={isSubmitting}
 title="Delete Expense"
 >
 <span className="material-symbols-outlined text-[20px]">delete</span>
 </Button>
 )}
 </div>
 </form>
 );
};
