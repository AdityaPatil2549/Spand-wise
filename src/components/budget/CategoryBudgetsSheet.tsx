'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { setCategoryBudget } from '@/lib/budget';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { CURRENCY_SYMBOL } from '@/config/constants';

interface CategoryBudgetsSheetProps {
  onClose: () => void;
}

export const CategoryBudgetsSheet = ({ onClose }: CategoryBudgetsSheetProps) => {
  const user = useStore((s) => s.user);
  const householdId = useStore((s) => s.householdId);
  const categories = useStore((s) => s.categories);
  const budget = useStore((s) => s.budget);
  const setCategoryBudgetOptimistic = useStore((s) => s.setCategoryBudgetOptimistic);
  const selectedMonth = useStore((s) => s.selectedMonth);
  const addToast = useStore((s) => s.addToast);

  // Local state for all category budgets being edited
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
      // Save all updated budgets
      for (const cat of categories) {
        const val = budgets[cat.id];
        if (val && !isNaN(Number(val))) {
          const amount = Number(val);
          // Only save if different or newly set
          if (budget?.categoryBudgets?.[cat.id] !== amount) {
            await setCategoryBudget(householdId || user.uid, cat.id, amount, selectedMonth);
            setCategoryBudgetOptimistic(cat.id, amount);
          }
        }
      }
      addToast({ type: 'success', message: 'Category budgets updated!' });
      onClose();
    } catch {
      addToast({ type: 'error', message: 'Failed to update category budgets' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <p className="text-sm text-[var(--text-secondary)] mb-4 shrink-0">
        Set specific monthly allowances for your categories. Leave blank for no limit.
      </p>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none pb-4">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 bg-[var(--surface-primary)] p-3 rounded-xl border border-[var(--surface-secondary)]">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
            >
              <CategoryIcon iconName={cat.icon || 'Package'} size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{cat.name}</p>
            </div>
            <div className="w-24 shrink-0">
              <Input
                type="number"
                inputMode="numeric"
                prefix={CURRENCY_SYMBOL}
                placeholder="0"
                value={budgets[cat.id] || ''}
                onChange={(e) => setBudgets((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                className="!text-right text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 mt-auto border-t border-[var(--surface-secondary)] bg-[var(--surface-base)] shrink-0">
        <Button fullWidth onClick={handleSave} isLoading={isSaving}>
          Save Budgets
        </Button>
      </div>
    </div>
  );
};
