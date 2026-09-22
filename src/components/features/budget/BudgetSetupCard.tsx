'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet, ChevronRight, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStore } from '@/store';
import { setBudgetAmount } from '@/lib/budget/index';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/index';
import { MIN_BUDGET_AMOUNT, MAX_BUDGET_AMOUNT, CURRENCY_SYMBOL } from '@/config/constants';
import { format } from 'date-fns';

const budgetSchema = z.object({
  budgetAmount: z
    .number()
    .min(MIN_BUDGET_AMOUNT, `Budget must be at least ${CURRENCY_SYMBOL}${MIN_BUDGET_AMOUNT}`)
    .max(MAX_BUDGET_AMOUNT, 'Budget amount is too large'),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export const BudgetSetupCard = () => {
  const user = useStore((s) => s.user);
  const householdId = useStore((s) => s.householdId);
  const setBudget = useStore((s) => s.setBudget);
  const budget = useStore((s) => s.budget);
  const addToast = useStore((s) => s.addToast);
  const categories = useStore((s) => s.categories);
  const selectedMonth = useStore((s) => s.selectedMonth);

  const isBudgetLoading = useStore((s) => s.isBudgetLoading);
  const hasBudgetSet = (budget?.budgetAmount || 0) > 0;
  const isFirstOfMonth = new Date().getDate() === 1;

  const [isExpanded, setIsExpanded] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(budget?.categoryBudgets || {});

  useEffect(() => {
    if (!isBudgetLoading && !hasInitialized) {
      setIsExpanded(!hasBudgetSet || isFirstOfMonth);
      setHasInitialized(true);
    }
  }, [isBudgetLoading, hasBudgetSet, isFirstOfMonth, hasInitialized]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budgetAmount: budget?.budgetAmount || undefined,
    }
  });

  const totalLimit = watch('budgetAmount') || 0;

  const handleSave = async (data: BudgetFormValues) => {
    if (!user) return;
    try {
      // Clean up empty category limits
      const cleanedLimits: Record<string, number> = {};
      Object.entries(categoryLimits).forEach(([key, val]) => {
        if (val > 0) cleanedLimits[key] = val;
      });

      // Save total amount
      await setBudgetAmount(householdId || user.uid, data.budgetAmount);
      
      // Save category limits to Firestore directly since setBudgetAmount doesn't handle it yet
      const budgetRef = doc(db, 'households', householdId || user.uid, 'budgets', selectedMonth);
      await updateDoc(budgetRef, {
        categoryBudgets: cleanedLimits
      });

      if (budget) {
        setBudget({ ...budget, budgetAmount: data.budgetAmount, categoryBudgets: cleanedLimits });
      }
      
      addToast({ type: 'success', message: 'Budget saved! 🎯' });
      setIsExpanded(false);
      setStep(1);
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to save budget. Try again.' });
    }
  };

  const handleCategoryLimitChange = (categoryId: string, val: string) => {
    const num = parseFloat(val);
    setCategoryLimits(prev => ({
      ...prev,
      [categoryId]: isNaN(num) ? 0 : num
    }));
  };

  if (!isExpanded) {
    return (
      <div className="mx-4 bg-theme-surface rounded-3xl p-5 shadow-[var(--shadow-3d-card)] border border-theme-border/50 flex justify-between items-center transition-transform active:scale-[0.98]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-theme-primary tracking-tight">Monthly Budget</h2>
            <p className="text-sm font-medium text-theme-secondary">
              Current limit: <span className="text-theme-primary">{CURRENCY_SYMBOL}{budget?.budgetAmount}</span>
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => setIsExpanded(true)} className="text-sm font-semibold rounded-xl bg-theme-elevated hover:bg-theme-border/50">
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-4 bg-theme-surface rounded-[2rem] shadow-[var(--shadow-3d-card)] border border-theme-border/50 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-theme-border/50">
        <button 
          onClick={() => step === 2 ? setStep(1) : setIsExpanded(false)}
          className="p-2 rounded-full hover:bg-theme-elevated transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-theme-secondary" />
        </button>
        <h2 className="text-lg font-bold text-theme-primary flex-1 text-center pr-9">
          Edit budget
        </h2>
        {hasBudgetSet && step === 1 && (
          <button className="p-2 rounded-full hover:bg-theme-danger/10 text-theme-danger transition-colors absolute right-4">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {step === 1 ? (
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="bg-theme-base p-4 rounded-2xl border border-theme-border/40">
              <label className="text-sm font-semibold text-theme-primary mb-2 block">Budget for</label>
              <div className="flex items-center gap-2 bg-theme-surface rounded-xl p-3 border border-theme-border/50 text-theme-primary font-medium">
                <span className="material-symbols-outlined text-theme-secondary text-xl">calendar_today</span>
                {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
              </div>
            </div>

            <div className="bg-theme-base p-4 rounded-2xl border border-theme-border/40">
              <label className="text-sm font-semibold text-theme-primary mb-2 block">What's your total budget limit?</label>
              <Input
                prefix={CURRENCY_SYMBOL}
                type="number"
                inputMode="numeric"
                placeholder="9000.0"
                className="text-lg font-bold"
                {...register('budgetAmount', { valueAsNumber: true })}
                error={errors.budgetAmount?.message}
              />
            </div>

            <div 
              onClick={() => setStep(2)}
              className="bg-theme-base p-4 rounded-2xl border border-theme-border/40 cursor-pointer hover:border-theme-accent/50 transition-colors group"
            >
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-theme-primary cursor-pointer group-hover:text-theme-accent transition-colors">Included Categories</label>
                <ChevronRight className="w-5 h-5 text-theme-secondary group-hover:text-theme-accent transition-colors" />
              </div>
              <p className="text-xs text-theme-secondary mb-4">All categories included in your budget</p>
              
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                {categories.slice(0, 4).map(cat => (
                  <div key={cat.id} className="flex flex-col items-center gap-2 min-w-[64px]">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <span className="material-symbols-outlined">{cat.icon}</span>
                    </div>
                    <span className="text-[10px] text-theme-secondary text-center leading-tight">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              type="button" 
              variant="primary" 
              fullWidth 
              className="py-4 text-base font-bold rounded-2xl mt-4"
              onClick={() => setStep(2)}
              disabled={!totalLimit || !!errors.budgetAmount}
            >
              Next
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit(handleSave)}>
            <div>
              <h3 className="font-bold text-theme-primary text-lg">Set category-wise limits <span className="text-theme-secondary text-sm font-normal">(optional)</span></h3>
              <p className="text-sm text-theme-secondary mt-1">Set limits on categories within your budget, if you want</p>
            </div>

            <div className="bg-theme-base rounded-2xl border border-theme-border/40 p-4 flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs text-theme-secondary font-medium">Total Budget</p>
                <p className="text-xl font-bold text-theme-primary mt-1">{CURRENCY_SYMBOL}{totalLimit.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-theme-secondary font-medium">Remaining</p>
                <p className="text-xl font-bold text-theme-primary mt-1">
                  {CURRENCY_SYMBOL}{(totalLimit - Object.values(categoryLimits).reduce((a, b) => a + (b || 0), 0)).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-theme-secondary">{categories.length} categories included</span>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 pb-4">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between bg-theme-base p-3 rounded-2xl border border-theme-border/30">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <span className="material-symbols-outlined">{cat.icon}</span>
                    </div>
                    <span className="font-medium text-theme-primary">{cat.name}</span>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary text-sm">₹</span>
                    <input 
                      type="number"
                      placeholder="No Limit"
                      className="w-full bg-theme-surface border border-theme-border rounded-xl py-2 pl-7 pr-3 text-sm text-right font-medium text-theme-primary focus:outline-none focus:border-theme-accent transition-colors"
                      value={categoryLimits[cat.id] || ''}
                      onChange={(e) => handleCategoryLimitChange(cat.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              className="py-4 text-base font-bold rounded-2xl mt-2"
              isLoading={isSubmitting}
            >
              Save
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
