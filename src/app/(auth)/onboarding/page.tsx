'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import { useStore } from '@/store';
import { completeOnboardingSetup } from '@/lib/onboarding';
import { getCurrentMonth } from '@/lib/utils/date';
import { MIN_BUDGET_AMOUNT, MAX_BUDGET_AMOUNT, CURRENCY_SYMBOL } from '@/config/constants';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';
import { triggerHaptic } from '@/lib/haptics';
import { useAuthGuard } from '@/hooks/useAuth';

const schema = z.object({
  budgetAmount: z
    .number({ message: 'Enter a valid amount' })
    .min(MIN_BUDGET_AMOUNT, `Must be at least ${CURRENCY_SYMBOL}${MIN_BUDGET_AMOUNT}`)
    .max(MAX_BUDGET_AMOUNT, 'Amount cannot exceed limits'),
});

type FormValues = z.infer<typeof schema>;

// Authentic student tiers: ₹3k to ₹15k
const STUDENT_PRESET_AMOUNTS = [3000, 5000, 8000, 12000, 15000];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthGuard();
  const householdId = useStore((s) => s.householdId);
  const addToast = useStore((s) => s.addToast);
  const setOnboardingComplete = useStore((s) => s.setOnboardingComplete);
  const setBudget = useStore((s) => s.setBudget);

  // Warm up Next.js route cache so navigation to /dashboard is instant
  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      budgetAmount: 8000,
    },
  });

  const rawAmount = watch('budgetAmount');
  const budgetAmount = Math.max(0, typeof rawAmount === 'number' && !isNaN(rawAmount) ? rawAmount : 0);

  // Daily runway & clean 60/40 allocation
  const calculations = useMemo(() => {
    const safeDaily = Math.round(budgetAmount / 30);
    const essentials = Math.round(budgetAmount * 0.6); // 60% Meals & Commute
    const buffer = Math.max(0, budgetAmount - essentials); // 40% Weekend & Buffer

    return {
      safeDaily,
      essentials,
      buffer,
    };
  }, [budgetAmount]);

  const handlePresetSelect = (amt: number) => {
    triggerHaptic('medium');
    setValue('budgetAmount', amt, { shouldValidate: true });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    triggerHaptic('light');
    setValue('budgetAmount', val, { shouldValidate: true });
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    triggerHaptic('heavy');

    const effectiveHouseholdId = householdId || user.uid;
    const currentMonth = getCurrentMonth();

    // 1. Optimistic Instant State: Update client immediately
    setOnboardingComplete(true);
    setBudget({
      id: currentMonth,
      budgetAmount: data.budgetAmount,
      totalSpent: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // 2. Instant Navigation: Move to dashboard immediately (0ms artificial wait)
    router.push('/dashboard');
    addToast({ type: 'success', message: 'Monthly budget established.' });

    // 3. Background Sync: All 17 writes (15 categories + budget + user) in 1 single Firestore batch
    if (effectiveHouseholdId !== 'guest_demo_household') {
      completeOnboardingSetup(user.uid, effectiveHouseholdId, data.budgetAmount).catch((err) => {
        console.error('[Onboarding] Background setup sync failed:', err);
      });
    }
  };

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary font-sans flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-theme-accent/10 rounded-full blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10 flex flex-col items-center"
      >
        {/* Brand Header */}
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 p-2 rounded-2xl bg-theme-surface/80 border border-theme-border/60 shadow-sm backdrop-blur-md">
            <BrandLogo size="lg" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-primary tracking-tight">
            Set Your Monthly Budget
          </h1>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1 max-w-xs text-balance">
            How much do you have to spend this month?
          </p>
        </div>

        {/* Clean, Focused Onboarding Card */}
        <div className="w-full rounded-3xl p-5 sm:p-6 bg-theme-surface/90 border border-theme-border/70 shadow-xl backdrop-blur-xl space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            
            {/* Input Field */}
            <div>
              <label
                htmlFor="budget-amount"
                className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block mb-1.5"
              >
                Monthly Allowance
              </label>

              <div className="relative flex items-center rounded-2xl bg-theme-base/80 border border-theme-border/80 focus-within:border-theme-accent focus-within:ring-2 focus-within:ring-theme-accent/20 transition-all shadow-inner">
                <span className="pl-4 text-3xl font-bold text-theme-secondary pointer-events-none select-none font-mono">
                  {CURRENCY_SYMBOL}
                </span>
                <input
                  id="budget-amount"
                  type="number"
                  inputMode="numeric"
                  step="500"
                  placeholder="8000"
                  autoFocus
                  className="w-full pl-2.5 pr-4 py-3 text-3xl font-extrabold font-mono tracking-tight tabular-nums bg-transparent text-theme-primary placeholder:text-theme-tertiary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  {...register('budgetAmount', { valueAsNumber: true })}
                  aria-invalid={!!errors.budgetAmount}
                  aria-describedby={errors.budgetAmount ? 'budget-error' : undefined}
                />
              </div>

              {errors.budgetAmount && (
                <p id="budget-error" className="mt-1.5 text-xs font-semibold text-rose-500" role="alert">
                  {errors.budgetAmount.message}
                </p>
              )}
            </div>

            {/* Quick Preset Chips */}
            <div className="flex items-center gap-1.5 justify-between">
              {STUDENT_PRESET_AMOUNTS.map((amount) => {
                const isSelected = budgetAmount === amount;
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handlePresetSelect(amount)}
                    className={`flex-1 py-1.5 px-1 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer text-center active:scale-95 ${
                      isSelected
                        ? 'bg-theme-accent text-theme-on-accent shadow-sm border border-transparent'
                        : 'bg-theme-base/70 text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated border border-theme-border/50'
                    }`}
                  >
                    {CURRENCY_SYMBOL}{(amount / 1000)}k
                  </button>
                );
              })}
            </div>

            {/* Subtle Range Scrubber */}
            <div className="pt-0.5">
              <label htmlFor="onboarding-budget-slider" className="sr-only">
                Monthly allowance scrubber
              </label>
              <input
                id="onboarding-budget-slider"
                name="budgetSlider"
                type="range"
                min={1000}
                max={20000}
                step={500}
                value={Math.min(20000, Math.max(1000, budgetAmount))}
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-theme-elevated rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                aria-label="Monthly allowance scrubber"
              />
            </div>

            {/* Sleek, Compact Daily Safe Spend Card */}
            <div className="rounded-2xl p-4 bg-theme-base/70 border border-theme-border/60 space-y-3 shadow-sm">
              
              {/* Header: Title + Big Daily Limit */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                    <Zap className="w-4 h-4 fill-emerald-400/20" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-theme-primary tracking-tight leading-snug">
                      Daily Safe Spend Limit
                    </h3>
                    <p className="text-[11px] text-theme-secondary">
                      Spend up to this daily to stay on track
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-theme-primary tabular-nums flex items-baseline justify-end">
                    <span className="text-theme-accent font-normal mr-0.5">{CURRENCY_SYMBOL}</span>
                    <AnimatedNumber value={calculations.safeDaily} />
                  </div>
                  <span className="text-[10px] font-mono text-theme-tertiary block -mt-0.5">
                    / day
                  </span>
                </div>
              </div>

              {/* Segmented Split Bar */}
              <div className="space-y-1.5 pt-0.5">
                <div className="h-2 w-full rounded-full bg-theme-elevated flex overflow-hidden p-0.5 gap-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: '60%' }}
                  />
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
                    style={{ width: '40%' }}
                  />
                </div>

                {/* Clean, readable legend */}
                <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
                  <div className="flex items-center gap-1.5 text-theme-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Essentials (~60%):</span>
                    <span className="font-bold text-theme-primary tabular-nums">
                      {CURRENCY_SYMBOL}{calculations.essentials.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-theme-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>Buffer (~40%):</span>
                    <span className="font-bold text-theme-primary tabular-nums">
                      {CURRENCY_SYMBOL}{calculations.buffer.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              id="set-budget-btn"
              className="w-full py-3.5 px-4 rounded-2xl bg-theme-accent hover:bg-theme-accent-hover text-theme-on-accent font-bold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Setting Up...' : 'Start Tracking'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Quiet footer reassurance */}
        <p className="mt-4 text-xs text-theme-secondary/80 text-center">
          You can change this anytime in Settings
        </p>
      </motion.div>
    </div>
  );
}
