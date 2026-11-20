'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trash2,
  Calculator,
  ClipboardPaste,
  ChevronDown,
  ChevronUp,
  Delete,
  CalendarClock,
  Banknote,
  Smartphone,
  CreditCard,
} from 'lucide-react';
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
import { parseExpenseDate } from '@/lib/expenses/index';
import {
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '@/hooks/mutations/useExpenseMutations';
import { dateToInputValue } from '@/lib/utils/date';
import { getLocalMonthString } from '@/lib/date-sharding';
import { predictCategory } from '@/lib/ml/categorizer';
import { formatCurrency } from '@/lib/utils';
import {
  evaluateCalculatorExpression,
  formatExpressionDisplay,
  parseUpiSms,
} from '@/lib/utils/calculator';
import {
 MAX_EXPENSE_AMOUNT,
 MIN_EXPENSE_AMOUNT,
 MAX_NOTE_LENGTH,
 CURRENCY_SYMBOL,
} from '@/config/constants';
import { normalizeAccounts } from '@/lib/accounts/normalize';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import type { ExpenseDocument } from '@/types/firestore';

const expenseSchema = z.object({
  type: z.enum(['expense', 'income']),
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
  const categoriesMap = useStore((s) => s.categoriesMap);
  const addToast = useStore((s) => s.addToast);
  const adjustTotalSpentOptimistic = useStore((s) => s.adjustTotalSpentOptimistic);

  const addExpenseMutation = useAddExpenseMutation();
  const updateExpenseMutation = useUpdateExpenseMutation();
  const deleteExpenseMutation = useDeleteExpenseMutation();

  const isEdit = !!editingExpense;
  const haptic = useHaptic();

  // Thumb-first Calculator, UPI SMS & Collapsible Details State
  const [expr, setExpr] = useState<string>(() =>
    editingExpense?.amount ? String(editingExpense.amount) : ''
  );
  const [showCalcPad, setShowCalcPad] = useState(false);
  const [showSmsBox, setShowSmsBox] = useState(false);
  const [smsText, setSmsText] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(isEdit);

  // ML Auto-Categorization State
  const [isAutoCategorized, setIsAutoCategorized] = useState(false);
  const [autoCategoryName, setAutoCategoryName] = useState<string | null>(null);
  const [userSelectedCategoryManually, setUserSelectedCategoryManually] = useState(false);

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

  const rawAccounts = useStore((s) => s.accounts);
  const accounts = useMemo(() => normalizeAccounts(rawAccounts), [rawAccounts]);
  const resolvedDefaultAccountId =
    accounts.find((a) => a.id === 'cash' || a.type === 'cash')?.id ||
    accounts[0]?.id ||
    'cash';

  const accountOptions = useMemo(() => {
    if (!accounts.length) {
      return [
        { label: 'Cash', value: 'cash' },
        { label: 'UPI', value: 'bank' },
      ];
    }
    const labelCounts = new Map<string, number>();
    accounts.forEach((a) => {
      const lbl = a.name || (a.type === 'bank' ? 'UPI' : 'Cash');
      labelCounts.set(lbl, (labelCounts.get(lbl) || 0) + 1);
    });

    const seenLabels = new Map<string, number>();
    return accounts.map((a) => {
      const baseLabel = a.name || (a.type === 'bank' ? 'UPI' : 'Cash');
      const count = labelCounts.get(baseLabel) || 0;
      if (count > 1) {
        const index = (seenLabels.get(baseLabel) || 0) + 1;
        seenLabels.set(baseLabel, index);
        return {
          label: `${baseLabel} (${a.type === 'bank' ? 'Account ' + index : a.id === 'cash' ? 'Primary' : 'Wallet ' + index})`,
          value: a.id,
        };
      }
      return {
        label: baseLabel,
        value: a.id,
      };
    });
  }, [accounts]);

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
      accountId: editingExpense?.accountId ?? resolvedDefaultAccountId,
    },
  });

  const currentDateTime = watch('date') || '';
  const currentType = watch('type');
  const currentAccountId = watch('accountId') || resolvedDefaultAccountId;
  const watchedNote = watch('note');
  const watchedAmount = watch('amount');
  const datePart = currentDateTime.includes('T') ? currentDateTime.split('T')[0] : '';
  const timePart = currentDateTime.includes('T') ? currentDateTime.split('T')[1] : '';

  const hasMathOperator = /[+\-*/×÷]/.test(expr.replace(/^-/, ''));
  const evaluatedExpr = evaluateCalculatorExpression(expr);

  const syncExpression = useCallback(
    (rawNext: string) => {
      const normalized = rawNext.replace(/×/g, '*').replace(/÷/g, '/');
      setExpr(normalized);
      const val = evaluateCalculatorExpression(normalized);
      if (val !== null && val > 0) {
        setValue('amount', val, { shouldValidate: true });
      } else {
        setValue('amount', 0, { shouldValidate: normalized.trim().length > 0 });
      }
    },
    [setValue]
  );

  const handleCalcTap = (token: string) => {
    haptic.light();
    if (token === 'C') {
      setExpr('');
      setValue('amount', 0, { shouldValidate: false });
      return;
    }
    if (token === '⌫') {
      syncExpression(expr.slice(0, -1));
      return;
    }
    if (token === '=') {
      if (evaluatedExpr !== null && evaluatedExpr > 0) {
        const resultStr = String(evaluatedExpr);
        setExpr(resultStr);
        setValue('amount', evaluatedExpr, { shouldValidate: true });
      }
      return;
    }
    const isOp = /^[+\-*/]$/.test(token);
    if (isOp) {
      if (!expr && token !== '-') return;
      if (/[+\-*/]$/.test(expr)) {
        syncExpression(expr.slice(0, -1) + token);
        return;
      }
    }
    syncExpression(`${expr}${token}`);
  };

  const handleParseSms = () => {
    const parsed = parseUpiSms(smsText);
    if (!parsed) {
      addToast({ type: 'error', message: 'Could not detect amount or merchant in that SMS text.' });
      return;
    }
    if (parsed.amount && parsed.amount > 0) {
      syncExpression(String(parsed.amount));
    }
    if (parsed.note) {
      setValue('note', parsed.note, { shouldValidate: true });
    }
    if (parsed.accountId === 'bank') {
      const bankAcc = accounts.find((a) => a.id === 'bank' || a.type === 'bank');
      if (bankAcc) {
        setValue('accountId', bankAcc.id, { shouldValidate: true });
      }
    }
    haptic.success();
    setShowSmsBox(false);
    setSmsText('');
    addToast({ type: 'success', message: 'Parsed SMS details into form!' });
  };

  // Intelligent real-time categorizer effect
  useEffect(() => {
    if (isEdit) return; // Never override existing transactions automatically
    if (userSelectedCategoryManually) return; // Respect manual selection by user
    if (!watchedNote || watchedNote.trim().length < 2) {
      setIsAutoCategorized(false);
      setAutoCategoryName(null);
      return;
    }

    const prediction = predictCategory(watchedNote, watchedAmount, currentType);
    if (prediction && prediction.confidence >= 0.65) {
      setValue('categoryId', prediction.categoryId, { shouldValidate: true });
      setIsAutoCategorized(true);
      const catName = categoriesMap.get(prediction.categoryId)?.name || prediction.categoryId;
      setAutoCategoryName(catName);
    }
  }, [watchedNote, watchedAmount, userSelectedCategoryManually, isEdit, currentType, categoriesMap, setValue]);

  const onSubmit = async (data: ExpenseFormValues) => {
    if (!user) return;
    const previousState = isEdit ? editingExpense : null;

    try {
      if (isEdit && editingExpense) {
        await updateExpenseMutation.mutateAsync({
          householdId: householdId || user.uid,
          input: { ...data, id: editingExpense.id },
          previousExpense: editingExpense,
        });

        const delta = data.amount - editingExpense.amount;
        if (data.type === editingExpense.type && data.type === 'expense') {
          adjustTotalSpentOptimistic(delta);
        }

        haptic.medium();
        addToast({ type: 'success', message: 'Transaction updated!' });
      } else {
        await addExpenseMutation.mutateAsync({
          householdId: householdId || user.uid,
          userId: user.uid,
          input: {
            ...data,
            accountId: data.accountId || resolvedDefaultAccountId,
          },
        });

        if (data.type === 'expense') {
          adjustTotalSpentOptimistic(data.amount);
        }

        haptic.success();
        triggerConfetti();
        addToast({ type: 'success', message: data.type === 'income' ? 'Income added! 💰' : 'Expense added! 💸' });
      }

      // Check category budget thresholds
      const currentMonth = useStore.getState().selectedMonth;
      const expenseMonth = getLocalMonthString(parseExpenseDate(data.date));
      
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

      setExpr('');
      reset();
      onSuccess();
    } catch (error: unknown) {
      console.error('Failed to save transaction:', error);
      addToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to save transaction' });
    }
  };

  const handleDelete = async () => {
    if (!editingExpense || !householdId || !user) return;
    try {
      if (editingExpense.type !== 'income') {
        adjustTotalSpentOptimistic(-editingExpense.amount);
      }

      await deleteExpenseMutation.mutateAsync({
        householdId,
        expense: editingExpense,
      });

      addToast({ type: 'success', message: 'Transaction deleted' });
      onSuccess();
    } catch (error: unknown) {
      console.error('Failed to delete transaction:', error);
      if (editingExpense.type !== 'income') {
        adjustTotalSpentOptimistic(editingExpense.amount);
      }
      addToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to delete transaction' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Top Row: Compact Type + Account Quick Pills (Thumb-First Cashew Style) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex bg-theme-surface p-1 rounded-xl border border-theme-border/60">
          <button
            type="button"
            onClick={() => setValue('type', 'expense')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentType === 'expense'
                ? 'bg-theme-base text-theme-primary shadow-sm'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setValue('type', 'income')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentType === 'income'
                ? 'bg-theme-base text-theme-positive shadow-sm'
                : 'text-theme-secondary hover:text-theme-positive'
            }`}
          >
            Income
          </button>
        </div>

        <div className="flex items-center gap-1 bg-theme-surface p-1 rounded-xl border border-theme-border/60">
          {accountOptions.slice(0, 3).map((acc) => {
            const isSelected = currentAccountId === acc.value;
            const isCash = acc.value === 'cash' || acc.label.toLowerCase().includes('cash');
            const isBank = acc.value === 'bank' || acc.label.toLowerCase().includes('upi') || acc.label.toLowerCase().includes('bank');
            return (
              <button
                key={acc.value}
                type="button"
                onClick={() => {
                  setValue('accountId', acc.value, { shouldValidate: true });
                  haptic.light();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-theme-accent text-theme-on-accent shadow-sm'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                {isCash ? (
                  <Banknote className="w-3.5 h-3.5" />
                ) : isBank ? (
                  <Smartphone className="w-3.5 h-3.5" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5" />
                )}
                <span>{acc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculator Expression Hero Amount + Live Readout */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-theme-secondary font-body">
            Amount
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setShowCalcPad((v) => !v);
                haptic.light();
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                showCalcPad
                  ? 'bg-theme-accent text-theme-on-accent border-theme-accent'
                  : 'bg-theme-surface text-theme-secondary border-theme-border hover:text-theme-primary'
              }`}
            >
              <Calculator className="w-3 h-3" />
              <span>123 Calc</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSmsBox((v) => !v);
                haptic.light();
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                showSmsBox
                  ? 'bg-theme-accent text-theme-on-accent border-theme-accent'
                  : 'bg-theme-surface text-theme-secondary border-theme-border hover:text-theme-primary'
              }`}
            >
              <ClipboardPaste className="w-3 h-3" />
              <span>Paste SMS</span>
            </button>
          </div>
        </div>

        {/* Hidden registered input for React Hook Form */}
        <input type="hidden" {...register('amount', { valueAsNumber: true })} />

        <div className="flex gap-2.5 items-center">
          <div className="relative flex-1 flex items-center">
            <label htmlFor="expense-amount-input" className="sr-only">
              Expense Amount or Math Expression
            </label>
            <span className="absolute left-4 text-theme-secondary font-bold text-xl pointer-events-none select-none">
              {CURRENCY_SYMBOL}
            </span>
            <input
              id="expense-amount-input"
              name="expressionAmount"
              type="text"
              inputMode="decimal"
              value={formatExpressionDisplay(expr)}
              onChange={(e) => syncExpression(e.target.value)}
              placeholder="0 or 180+45"
              autoFocus={!showCalcPad}
              className="w-full pl-10 pr-24 py-3.5 text-3xl sm:text-4xl font-mono tabular-nums font-bold rounded-2xl border-2 bg-theme-elevated text-theme-primary placeholder:text-theme-tertiary placeholder:text-2xl border-theme-border/60 focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/30 transition-all duration-150"
              aria-label="Expense amount or math expression in rupees"
              aria-invalid={!!errors.amount}
            />
            {hasMathOperator && evaluatedExpr !== null && evaluatedExpr > 0 && (
              <span className="absolute right-3 px-2.5 py-1 rounded-lg bg-theme-accent/15 border border-theme-accent/30 text-theme-accent text-xs font-mono font-bold tabular-nums pointer-events-none">
                = {formatCurrency(evaluatedExpr)}
              </span>
            )}
          </div>
          <ReceiptScanner
            onScanComplete={(data) => {
              if (data.amount) {
                syncExpression(String(data.amount));
              }
              if (data.date) {
                setValue('date', `${data.date}T12:00`, { shouldValidate: true });
                setShowMoreOptions(true);
              }
              if (data.note) {
                setValue('note', data.note, { shouldValidate: true });
              }
              if (data.categoryId) {
                setValue('categoryId', data.categoryId, { shouldValidate: true });
                setUserSelectedCategoryManually(false);
                setIsAutoCategorized(true);
                const catName = categoriesMap.get(data.categoryId)?.name || data.categoryId;
                setAutoCategoryName(catName);
              }
            }}
          />
        </div>

        {/* Inline Operator Bar + Quick Chips (Hidden when full 4x4 keypad is expanded) */}
        {!showCalcPad && (
          <div className="flex items-center justify-between gap-2 mt-2 flex-wrap animate-in fade-in duration-150">
            <div className="flex items-center gap-1">
              {[
                { label: '+', token: '+' },
                { label: '-', token: '-' },
                { label: '×', token: '*' },
                { label: '÷', token: '/' },
                { label: '=', token: '=' },
                { label: '⌫', token: '⌫' },
                { label: 'C', token: 'C' },
              ].map((op) => (
                <button
                  key={op.label}
                  type="button"
                  onClick={() => handleCalcTap(op.token)}
                  className={`min-w-[30px] h-7 px-2 rounded-lg text-xs font-mono font-bold border transition-all active:scale-95 ${
                    op.token === '='
                      ? 'bg-theme-accent text-theme-on-accent border-theme-accent'
                      : op.token === 'C'
                      ? 'bg-theme-danger/10 text-theme-danger border-theme-danger/30'
                      : 'bg-theme-surface hover:bg-theme-elevated text-theme-primary border-theme-border'
                  }`}
                  aria-label={`Calculator ${op.label}`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[50, 100, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    const baseVal = evaluatedExpr ?? 0;
                    syncExpression(String(baseVal + amt));
                    haptic.light();
                  }}
                  className="px-2 py-1 rounded-lg bg-theme-surface hover:bg-theme-elevated border border-theme-border text-[11px] font-bold text-theme-primary tabular-nums active:scale-95 transition-all"
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expandable 4x4 Thumb-Zone Numpad */}
        {showCalcPad && (
          <div className="mt-2.5 p-2.5 rounded-2xl bg-theme-surface border border-theme-border grid grid-cols-4 gap-2 animate-in fade-in duration-150">
            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '.', '+'].map(
              (key) => {
                const isOp = ['/', '*', '-', '+'].includes(key);
                const display = key === '*' ? '×' : key === '/' ? '÷' : key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCalcTap(key)}
                    className={`h-11 rounded-xl font-mono text-base font-bold border transition-all active:scale-95 flex items-center justify-center ${
                      key === 'C'
                        ? 'bg-theme-danger/15 text-theme-danger border-theme-danger/30'
                        : isOp
                        ? 'bg-theme-accent/15 text-theme-accent border-theme-accent/30'
                        : 'bg-theme-base hover:bg-theme-elevated text-theme-primary border-theme-border'
                    }`}
                  >
                    {display}
                  </button>
                );
              }
            )}
            <button
              type="button"
              onClick={() => handleCalcTap('⌫')}
              className="col-span-2 h-10 rounded-xl bg-theme-elevated hover:bg-theme-surface text-theme-primary border border-theme-border font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Delete className="w-4 h-4" />
              <span>Backspace</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleCalcTap('=');
                setShowCalcPad(false);
              }}
              className="col-span-2 h-10 rounded-xl bg-theme-accent text-theme-on-accent font-bold text-sm flex items-center justify-center active:scale-95 transition-all"
            >
              Done (=)
            </button>
          </div>
        )}

        {/* Expandable UPI / Bank SMS Paste Parser */}
        {showSmsBox && (
          <div className="mt-2.5 p-3 rounded-2xl bg-theme-surface border border-theme-accent/30 space-y-2 animate-in fade-in duration-150">
            <label htmlFor="sms-paste-input" className="text-[11px] font-semibold text-theme-secondary block">
              Paste UPI / Bank SMS alert (e.g. &ldquo;Paid Rs. 240 to Swiggy via UPI&rdquo;)
            </label>
            <div className="flex gap-2">
              <input
                id="sms-paste-input"
                name="smsPasteText"
                type="text"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Paste bank or GPay/PhonePe SMS..."
                aria-label="Paste bank or GPay PhonePe SMS alert"
                className="flex-1 px-3 py-2 rounded-xl bg-theme-base border border-theme-border text-xs text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:border-theme-accent"
              />
              <Button type="button" variant="primary" size="sm" onClick={handleParseSms}>
                Extract
              </Button>
            </div>
          </div>
        )}

        {errors.amount && (
          <p className="mt-1.5 text-xs text-theme-danger font-medium" role="alert">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Category Picker */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-theme-secondary block font-body">
            Category
          </label>
          {isAutoCategorized && autoCategoryName && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-theme-accent bg-theme-accent/15 px-2 py-0.5 rounded-full border border-theme-accent/25 animate-in fade-in duration-200">
              <Sparkles className="w-3 h-3 stroke-[2.2]" />
              Auto: {autoCategoryName}
            </span>
          )}
        </div>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <CategoryPicker
              selectedId={field.value}
              onSelect={(catId) => {
                field.onChange(catId);
                setUserSelectedCategoryManually(true);
                setIsAutoCategorized(false);
                setAutoCategoryName(null);
              }}
              type={currentType}
            />
          )}
        />
        {errors.categoryId && (
          <p className="mt-1 text-xs text-theme-danger font-medium" role="alert">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Note Input */}
      <Input
        label="Note (optional)"
        placeholder="Merchant or description (triggers auto-category)"
        {...register('note')}
        error={errors.note?.message}
        maxLength={MAX_NOTE_LENGTH}
      />

      {/* Collapsible Date, Time & Extra Account Details */}
      <div className="rounded-2xl border border-theme-border/80 bg-theme-surface/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowMoreOptions((v) => !v)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-theme-accent" />
            <span>Date, Time &amp; More</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-theme-tertiary">
            <span>{datePart} {timePart}</span>
            {showMoreOptions ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </button>

        {showMoreOptions && (
          <div className="px-3.5 pb-3.5 pt-2 border-t border-theme-border/60 space-y-3 animate-in fade-in duration-150">
            {accountOptions.length > 0 && (
              <div>
                <label className="text-xs font-medium text-theme-secondary mb-1.5 block font-body">
                  All Accounts
                </label>
                <AnimatedSelect
                  value={currentAccountId}
                  onChange={(val) => setValue('accountId', val, { shouldValidate: true })}
                  options={accountOptions}
                />
              </div>
            )}

            <div className="flex gap-3">
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
          </div>
        )}
      </div>

      {/* Sticky Submit / Actions */}
      <div className="sticky bottom-0 z-20 flex gap-3 pt-3 pb-1 mt-2 bg-theme-surface/95 backdrop-blur-md border-t border-theme-border/30 -mx-1 px-1 sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0 sm:m-0">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="flex-1 font-bold"
          isLoading={isSubmitting}
        >
          {isEdit ? 'Update Transaction' : currentType === 'income' ? 'Save Income' : 'Save Expense'}
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleDelete}
            className="text-theme-danger border-theme-danger/30 hover:bg-theme-danger/10 hover:border-theme-danger/60 transition-colors px-4 flex-shrink-0"
            disabled={isSubmitting}
            title="Delete Expense"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
      </div>
    </form>
  );
};
