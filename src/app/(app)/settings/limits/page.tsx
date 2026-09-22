'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { setCategoryBudget } from '@/lib/budget';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { ArrowLeft } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';

export default function CategoryLimitsPage() {
  const router = useRouter();
  const isHydrated = useHydrated();
  const user = useStore((s) => s.user);
  const householdId = useStore((s) => s.householdId);
  const categories = useStore((s) => s.categories);
  const budget = useStore((s) => s.budget);
  const setCategoryBudgetOptimistic = useStore((s) => s.setCategoryBudgetOptimistic);
  const selectedMonth = useStore((s) => s.selectedMonth);
  const addToast = useStore((s) => s.addToast);

  const [budgets, setBudgets] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (budget?.categoryBudgets) {
      for (const [catId, amount] of Object.entries(budget.categoryBudgets)) {
        initial[catId] = String(amount);
      }
    }
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      for (const cat of categories) {
        const val = budgets[cat.id];
        if (val && !isNaN(Number(val))) {
          const amount = Number(val);
          if (budget?.categoryBudgets?.[cat.id] !== amount) {
            await setCategoryBudget(householdId || user.uid, cat.id, amount, selectedMonth);
            setCategoryBudgetOptimistic(cat.id, amount);
          }
        } else if (val === '' && budget?.categoryBudgets?.[cat.id] !== undefined) {
          // Allow clearing a budget limit
          await setCategoryBudget(householdId || user.uid, cat.id, 0, selectedMonth);
          setCategoryBudgetOptimistic(cat.id, 0);
        }
      }
      addToast({ type: 'success', message: 'Category budgets updated!' });
      router.back();
    } catch {
      addToast({ type: 'error', message: 'Failed to update category budgets' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="bg-theme-base text-theme-primary flex flex-col min-h-screen font-body w-full pb-32">
      <div className="px-5 md:px-8 pt-12 md:max-w-3xl md:mx-auto w-full flex-1 flex flex-col h-full">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()} 
            className="p-3 -ml-3 rounded-full hover:bg-theme-surface transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-theme-primary" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-theme-primary">Adjust Category Limits</h1>
        </div>

        <p className="text-sm text-theme-secondary mb-8">
          Set specific monthly allowances for your categories. Leave blank for no limit.
        </p>

        {/* Categories List */}
        <div className="flex-1 space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 bg-theme-surface p-4 rounded-2xl border border-theme-border shadow-sm">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
              >
                <CategoryIcon iconName={cat.icon || 'Package'} size={24} />
              </div>
              <div className="flex-1">
                <p className="text-[16px] font-semibold text-theme-primary">{cat.name}</p>
              </div>
              <div className="w-28 shrink-0">
                <Input
                  type="number"
                  inputMode="numeric"
                  prefix={CURRENCY_SYMBOL}
                  placeholder="0"
                  value={budgets[cat.id] || ''}
                  onChange={(e) => setBudgets((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                  className="!text-right text-[16px] font-medium"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-theme-border sticky bottom-4 md:static">
          <Button fullWidth onClick={handleSave} isLoading={isSaving} size="lg">
            Save Limits
          </Button>
        </div>

      </div>
    </div>
  );
}
