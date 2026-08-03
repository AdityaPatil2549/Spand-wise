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
import { Spotlight } from '@/components/ui/motion/spotlight';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { Tilt } from '@/components/ui/motion/tilt';

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
 <div className="min-h-screen bg-theme-base text-theme-primary font-body flex flex-col items-center justify-center p-6 relative overflow-hidden">
 <Spotlight className="z-0 from-white/40 via-white/10 to-transparent blur-2xl" size={400} />
 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-theme-accent/5 rounded-full blur-3xl"></div>
 <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10b981]/5 rounded-full blur-3xl"></div>
 
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
 className="w-full max-w-sm relative z-10"
 >
 {/* Icon */}
 <div className="text-center mb-10">
 <div className="w-20 h-20 bg-gradient-to-br from-theme-accent to-[#d3763b] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-theme-accent/20">
 <Target className="w-10 h-10 text-theme-inverse" aria-hidden="true" />
 </div>
 <TextEffect as="h1" preset="fade" className="font-display text-3xl font-medium text-theme-primary mb-3">
 Set Your Monthly Budget
 </TextEffect>
 <TextEffect as="p" preset="fade" className="text-lg text-theme-secondary">
 How much do you have to spend this month?
 </TextEffect>
 </div>

 <Tilt rotationFactor={4} isRevese>
 <div className="glass-panel rounded-3xl p-8 border border-theme-border/40 shadow-xl space-y-5">
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
 step="500"
 placeholder="15000"
 autoFocus
 className="w-full pl-10 pr-4 py-4 text-3xl font-bold rounded-2xl border-2
 bg-theme-surface text-theme-primary
 placeholder:text-theme-tertiary
 border-transparent focus:border-theme-accent focus:ring-4 focus:ring-theme-accent/20 focus:outline-none
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
 className="px-4 py-2 text-sm font-medium rounded-full bg-theme-surface text-theme-secondary hover:bg-theme-elevated hover:text-theme-primary border border-theme-border/50 transition-colors"
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
 </Tilt>

 <p className="text-center text-xs text-theme-tertiary mt-6">
 You can change this anytime in Settings
 </p>
 </motion.div>
 </div>
 );
}
