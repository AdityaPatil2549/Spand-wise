'use client';
import { Timestamp } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { useHaptic } from '@/hooks/useHaptic';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AnimatedTimePicker } from '@/components/ui/AnimatedTimePicker';
import { AnimatedDatePicker } from '@/components/ui/AnimatedDatePicker';
import { AnimatedSelect } from '@/components/ui/AnimatedSelect';
import { CategoryPicker } from '@/components/shared/CategoryPicker';
import { ReceiptScanner } from '@/components/features/expenses/ReceiptScanner';
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
  type: z.enum(['expense', 'income']).default('expense'),
  amount: z
    .number()
    .min(MIN_EXPENSE_AMOUNT, 'Amount must be greater than 0')
    .max(MAX_EXPENSE_AMOUNT, `Amount cannot exceed ${CURRENCY_SYMBOL}10,00,000`),
  categoryId: z.string().min(1, 'Select a category'),
  note: z.string().max(MAX_NOTE_LENGTH, `Max ${MAX_NOTE_LENGTH} characters`).optional(),
  date: z.string().min(1, 'Date is required'),
  accountId: z.string().optional(),
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
  const haptic = useHaptic();

  const triggerConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#3b82f6', '#f43f5e'],
        zIndex: 9999,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#3b82f6', '#f43f5e'],
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

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
      type: editingExpense?.type || 'expense',
      amount: editingExpense?.amount ?? undefined,
      categoryId: editingExpense?.categoryId ?? initialCategoryId ?? DEFAULT_CATEGORY_ID,
      note: editingExpense?.note ?? '',
      date: editingExpense
        ? dateToInputValue(editingExpense.date.toDate())
        : dateToInputValue(),
      accountId: editingExpense?.accountId ?? 'cash',
    },
  });

  const currentDateTime = watch('date') || '';
  const currentType = watch('type');
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
          month: newMonth,
          accountId: data.accountId,
          type: data.type
        });
        
        // This is a rough optimistic update that doesn't handle type switching, 
        // but backend will correct it on next refresh.
        const delta = data.amount - editingExpense.amount;
        if (data.type === editingExpense.type && data.type === 'expense') {
          adjustTotalSpentOptimistic(delta);
        }
        
        await editExpense(
          householdId || user.uid, 
          { ...data, id: editingExpense.id }, 
          editingExpense.amount, 
          editingExpense.month, 
          editingExpense.type,
          editingExpense.accountId
        );
        haptic.medium();
        addToast({ type: 'success', message: 'Transaction updated!' });
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
          type: data.type,
          createdAt: Timestamp.now(),
          createdBy: user.uid,
          updatedAt: Timestamp.now(),
          accountId: data.accountId || 'cash',
        };
        
        addExpenseOptimistic(tempExpense);
        if (data.type === 'expense') {
          adjustTotalSpentOptimistic(data.amount);
        }
        
        const newExpense = await addExpense(householdId || user.uid, user.uid, data);
        // Replace temp expense with real one
        removeExpenseOptimistic(tempId);
        addExpenseOptimistic(newExpense);
        haptic.success();
        triggerConfetti();
        addToast({ type: 'success', message: data.type === 'income' ? 'Income added! 💰' : 'Expense added! 💸' });
      }

      // Check category budget thresholds
      const currentMonth = useStore.getState().selectedMonth;
      const expenseMonth = getLocalMonthString(new Date(data.date));
      
      if (data.type === 'expense' && currentMonth === expenseMonth) {
        const { budget, expenses, categoriesMap } = useStore.getState();
        const limit = budget?.categoryBudgets?.[data.categoryId];
        if (limit) {
           const newTotal = expenses
             .filter(e => e.categoryId === data.categoryId && e.type !== 'income')
             .reduce((sum, e) => sum + e.amount, 0);
             
           const delta = isEdit ? (data.amount - (previousState?.amount || 0)) : data.amount;
           const oldTotal = newTotal - delta;
           
           const oldPercentage = oldTotal / limit;
           const newPercentage = newTotal / limit;
           const catName = categoriesMap.get(data.categoryId)?.name || 'Category';

           if (oldPercentage < 1 && newPercentage >= 1) {
             addToast({ type: 'error', message: `You exceeded your ${catName} limit!` });
           } else if (oldPercentage < 0.9 && newPercentage >= 0.9) {
             addToast({ type: 'warning', message: `You reached 90% of your ${catName} limit.` });
           } else if (oldPercentage < 0.5 && newPercentage >= 0.5) {
             addToast({ type: 'warning', message: `You reached 50% of your ${catName} limit.` });
           }
        }
      }

      reset();
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save transaction:', error);
      
      // ATOMIC ROLLBACK
      if (isEdit && previousState) {
        updateExpenseOptimistic(previousState);
        if (previousState.type === 'expense' && data.type === 'expense') {
          adjustTotalSpentOptimistic(previousState.amount - data.amount);
        }
      } else if (!isEdit && tempId) {
        removeExpenseOptimistic(tempId);
        if (data.type === 'expense') {
          adjustTotalSpentOptimistic(-data.amount);
        }
      }
      
      addToast({ type: 'error', message: error.message || 'Failed to save transaction' });
    }
  };

  const handleDelete = async () => {
    if (!editingExpense || !householdId || !user) return;
    try {
      // Optimistic delete
      removeExpenseOptimistic(editingExpense.id);
      if (editingExpense.type !== 'income') {
        adjustTotalSpentOptimistic(-editingExpense.amount);
      }
      
      await softDeleteExpense(
        householdId, 
        editingExpense.id, 
        editingExpense.amount, 
        editingExpense.month, 
        editingExpense.type,
        editingExpense.accountId
      );
      addToast({ type: 'success', message: 'Transaction deleted' });
      onSuccess();
    } catch (error: any) {
      console.error('Failed to delete transaction:', error);
      
      // ATOMIC ROLLBACK
      const { restoreExpenseOptimistic } = useStore.getState();
      restoreExpenseOptimistic(editingExpense);
      if (editingExpense.type !== 'income') {
        adjustTotalSpentOptimistic(editingExpense.amount);
      }
      
      addToast({ type: 'error', message: error.message || 'Failed to delete transaction' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      
      {/* Type Toggle */}
      <div className="flex bg-theme-surface p-1 rounded-xl mb-2">
        <button
          type="button"
          onClick={() => setValue('type', 'expense')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${currentType === 'expense' ? 'bg-theme-base text-theme-primary shadow-sm' : 'text-theme-secondary hover:text-theme-primary'}`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setValue('type', 'income')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${currentType === 'income' ? 'bg-theme-base text-[#10b981] shadow-sm' : 'text-theme-secondary hover:text-[#10b981]'}`}
        >
          Income
        </button>
      </div>

      {/* Amount Input */}
      <div>
        <label className="text-sm font-medium text-theme-secondary mb-1.5 block font-body flex justify-between items-end">
          <span>Amount</span>
        </label>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 flex items-center">
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
          <ReceiptScanner 
            onScanComplete={(data) => {
              if (data.amount) {
                setValue('amount', data.amount, { shouldValidate: true });
              }
              if (data.date) {
                // We use watch('date') to grab the current state, but it might be stale in closure. 
                // However, since it's an inline function, we can just let react-hook-form handle it.
                // It's safer to just set the date directly to noon on that day if we can't reliably get the time.
                setValue('date', `${data.date}T12:00`, { shouldValidate: true });
              }
            }} 
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
    <CategoryPicker selectedId={field.value} onSelect={field.onChange} type={currentType} />
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

 {/* Account Selector */}
 <div>
   <label className="text-sm font-medium text-theme-secondary mb-2 block font-body">
     Payment Mode
   </label>
    <AnimatedSelect
      value={watch('accountId') || 'cash'}
      onChange={(val) => setValue('accountId', val, { shouldValidate: true })}
      options={[
        { label: 'Cash', value: 'cash' },
        { label: 'UPI', value: 'bank' }
      ]}
    />
 </div>

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
