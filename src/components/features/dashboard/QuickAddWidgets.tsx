'use client';

import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useStore } from '@/store';
import { addExpense } from '@/lib/expenses/index';
import { getLocalMonthString } from '@/lib/date-sharding';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { formatCurrency } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import type { ExpenseDocument, QuickAddPreset } from '@/types/firestore';
import { AnimatedGroup } from '@/components/ui/motion/animated-group';
const PRESETS: QuickAddPreset[] = [
  { id: 'chai', amount: 15, categoryId: 'food', note: 'Chai', icon: 'Coffee', color: '#e67e22' },
  { id: 'snacks', amount: 20, categoryId: 'food', note: 'Snacks', icon: 'Utensils', color: '#e67e22' },
  { id: 'bus', amount: 50, categoryId: 'travel', note: 'Bus Ticket', icon: 'BusFront', color: '#3498db' },
];

export const QuickAddWidgets: React.FC = () => {
  const { user, householdId, addExpenseOptimistic, removeExpenseOptimistic, adjustTotalSpentOptimistic, addToast, categoriesMap, quickAddPresets } = useStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const activePresets = quickAddPresets && quickAddPresets.length > 0 ? quickAddPresets : PRESETS;

  const handleQuickAdd = async (preset: QuickAddPreset) => {
    if (!user) return;
    
    // Trigger haptic feedback for mobile users
    triggerHaptic('medium');
    
    setLoadingId(preset.id);
    
    const now = new Date();
    const tempId = `temp-${Date.now()}`;
    const newMonth = getLocalMonthString(now);
    
    const tempExpense: ExpenseDocument = {
      id: tempId,
      amount: preset.amount,
      categoryId: preset.categoryId,
      note: preset.note,
      date: Timestamp.fromDate(now),
      month: newMonth,
      isDeleted: false,
      createdAt: Timestamp.now(),
      createdBy: user.uid,
      updatedAt: Timestamp.now(),
    };
    
    // Optimistic Update
    addExpenseOptimistic(tempExpense);
    adjustTotalSpentOptimistic(preset.amount);
    
    try {
      const data = {
        amount: preset.amount,
        categoryId: preset.categoryId,
        note: preset.note,
        date: now.toISOString(),
      };
      
      const newExpense = await addExpense(householdId || user.uid, user.uid, data);
      
      // Replace temp expense with real one
      removeExpenseOptimistic(tempId);
      addExpenseOptimistic(newExpense);
      addToast({ type: 'success', message: `Added ${preset.note}` });
      triggerHaptic('heavy');
    } catch (error: any) {
      console.error('Failed to quick add expense:', error);
      
      // ATOMIC ROLLBACK
      removeExpenseOptimistic(tempId);
      adjustTotalSpentOptimistic(-preset.amount);
      addToast({ type: 'error', message: 'Failed to add expense' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AnimatedGroup preset="fade" className="mt-8 flex flex-wrap gap-3">
      {activePresets.map((preset) => {
        const cat = categoriesMap.get(preset.categoryId);
        const iconName = cat?.icon || preset.icon;
        const color = cat?.color || preset.color;
        
        return (
          <button
            key={preset.id}
            onClick={() => handleQuickAdd(preset)}
            disabled={loadingId !== null}
            className="flex items-center gap-3 px-4 py-3 rounded-sm bg-theme-surface border border-theme-border/50 hover:border-theme-accent hover:-translate-y-[1px] transition-all active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <span 
              className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}15`, color: color }}
            >
              <CategoryIcon iconName={cat?.name || preset.categoryId} className="w-3.5 h-3.5" />
            </span>
            <span className="font-body font-medium text-[15px] text-theme-primary">{preset.note}</span>
            <span className="font-mono font-medium text-sm text-theme-secondary ml-1">
              {formatCurrency(preset.amount)}
            </span>
          </button>
        );
      })}
    </AnimatedGroup>
  );
};
