'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store';
import { setBudgetAmount } from '@/lib/budget/index';
import { seedCategories } from '@/lib/categories/index';
import { markOnboardingComplete } from '@/lib/firebase/auth';
import { MIN_BUDGET_AMOUNT, MAX_BUDGET_AMOUNT, CURRENCY_SYMBOL } from '@/config/constants';

const schema = z.object({
  budgetAmount: z
    .number()
    .min(MIN_BUDGET_AMOUNT, `Must be at least ${CURRENCY_SYMBOL}${MIN_BUDGET_AMOUNT}`)
    .max(MAX_BUDGET_AMOUNT, 'Amount is too large'),
});

type FormValues = z.infer<typeof schema>;

import { useAuthGuard } from '@/hooks/useAuth';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthGuard();
  const householdId = useStore((s) => s.householdId);
  const addToast = useStore((s) => s.addToast);
  const setOnboardingComplete = useStore((s) => s.setOnboardingComplete);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    try {
      // Seed categories and set budget in parallel
      await Promise.all([
        seedCategories(householdId || user.uid),
        setBudgetAmount(householdId || user.uid, data.budgetAmount),
        markOnboardingComplete(user.uid),
      ]);
      setOnboardingComplete(true);
      addToast({ type: 'success', message: 'Welcome to SpendWise! 🎉 Start tracking.' });
      router.push('/dashboard');
    } catch (err) {
      console.error('[Onboarding]', err);
      addToast({ type: 'error', message: 'Setup failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-base)] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-fab)]">
            <Target className="w-10 h-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            Set Your Monthly Budget
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            How much do you have to spend this month?
          </p>
        </div>

        <div className="bg-[var(--surface-primary)] rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Amount input */}
            <div>
              <label
                htmlFor="budget-amount"
                className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
              >
                Monthly Allowance
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[var(--text-secondary)] pointer-events-none">
                  {CURRENCY_SYMBOL}
                </span>
                <input
                  id="budget-amount"
                  type="number"
                  inputMode="numeric"
                  placeholder="15000"
                  autoFocus
                  className="w-full pl-10 pr-4 py-4 text-3xl font-bold rounded-2xl border-2
                    bg-[var(--surface-secondary)] text-[var(--text-primary)]
                    placeholder:text-[var(--text-tertiary)]
                    border-transparent focus:border-violet-500 focus:outline-none
                    transition-all duration-150"
                  {...register('budgetAmount', { valueAsNumber: true })}
                  aria-invalid={!!errors.budgetAmount}
                  aria-describedby={errors.budgetAmount ? 'budget-error' : undefined}
                />
              </div>
              {errors.budgetAmount && (
                <p id="budget-error" className="mt-2 text-sm text-red-500" role="alert">
                  {errors.budgetAmount.message}
                </p>
              )}
            </div>

            {/* Suggestions */}
            <div className="flex gap-2 flex-wrap">
              {[5000, 10000, 15000, 20000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setValue('budgetAmount', amount, { shouldValidate: true })}
                  className="px-3 py-1.5 text-sm font-medium rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
                >
                  {CURRENCY_SYMBOL}{(amount / 1000).toFixed(0)}K
                </button>
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              id="set-budget-btn"
            >
              Start Tracking 🚀
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--text-tertiary)] mt-4">
          You can change this anytime in Settings
        </p>
      </motion.div>
    </div>
  );
}
