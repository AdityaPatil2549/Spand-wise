'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStore } from '@/store';
import { setBudgetAmount } from '@/lib/budget/index';
import { MIN_BUDGET_AMOUNT, MAX_BUDGET_AMOUNT, CURRENCY_SYMBOL } from '@/config/constants';

const budgetSchema = z.object({
  budgetAmount: z
    .number()
    .min(MIN_BUDGET_AMOUNT, `Budget must be at least ${CURRENCY_SYMBOL}${MIN_BUDGET_AMOUNT}`)
    .max(MAX_BUDGET_AMOUNT, 'Budget amount is too large'),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

/**
 * BudgetSetupCard — shown on dashboard when no budget is configured.
 * Prompts user to set their monthly allowance.
 */
export const BudgetSetupCard = () => {
  const user = useStore((s) => s.user);
  const householdId = useStore((s) => s.householdId);
  const setBudget = useStore((s) => s.setBudget);
  const budget = useStore((s) => s.budget);
  const addToast = useStore((s) => s.addToast);

  const hasBudgetSet = (budget?.budgetAmount || 0) > 0;
  const isFirstOfMonth = new Date().getDate() === 1;
  const [isExpanded, setIsExpanded] = useState(!hasBudgetSet || isFirstOfMonth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budgetAmount: budget?.budgetAmount || undefined,
    }
  });

  const onSubmit = async (data: BudgetFormValues) => {
    if (!user) return;
    try {
      await setBudgetAmount(householdId || user.uid, data.budgetAmount);
      if (budget) {
        setBudget({ ...budget, budgetAmount: data.budgetAmount });
      }
      addToast({ type: 'success', message: 'Budget saved! 🎯' });
      setIsExpanded(false);
    } catch {
      addToast({ type: 'error', message: 'Failed to save budget. Try again.' });
    }
  };

  if (!isExpanded) {
    return (
      <div className="mx-4 bg-theme-surface rounded-2xl p-4 shadow-sm border border-theme-border/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-theme-accent/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-theme-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold text-theme-primary">Monthly Budget</h2>
            <p className="text-xs text-theme-secondary">
              Current: <span className="font-medium text-theme-primary">{CURRENCY_SYMBOL}{budget?.budgetAmount}</span>
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => setIsExpanded(true)} className="text-sm">
          Update
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-4 bg-theme-surface rounded-2xl p-6 shadow-sm border border-theme-border/50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-theme-accent/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-theme-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-theme-primary">
              {hasBudgetSet ? 'Update Monthly Budget' : 'Set Monthly Budget'}
            </h2>
            <p className="text-sm text-theme-secondary">How much do you have this month?</p>
          </div>
        </div>
        {hasBudgetSet && !isFirstOfMonth && (
          <button onClick={() => setIsExpanded(false)} className="text-theme-secondary hover:text-theme-primary">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          prefix={CURRENCY_SYMBOL}
          type="number"
          inputMode="numeric"
          placeholder="15000"
          {...register('budgetAmount', { valueAsNumber: true })}
          error={errors.budgetAmount?.message}
          aria-label="Monthly budget amount"
        />
        <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
          {hasBudgetSet ? 'Update Budget' : 'Set Budget'}
        </Button>
      </form>
    </div>
  );
};
