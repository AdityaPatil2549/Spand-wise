'use client';

import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useStore } from '@/store';
import { addExpense } from '@/lib/expenses/index';
import { getLocalMonthString } from '@/lib/date-sharding';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { formatCurrency } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { Plus, Zap, Coffee, Utensils, Bus, FileText, ShoppingBag } from 'lucide-react';
import { AddExpenseMorph } from '@/components/features/expenses/AddExpenseMorph';
import type { ExpenseDocument, QuickAddPreset } from '@/types/firestore';

const STUDENT_PRESETS: Array<QuickAddPreset & { iconComponent?: React.ReactNode }> = [
  { id: 'chai', amount: 15, categoryId: 'food', note: 'Chai', icon: 'Coffee', color: '#f59e0b' },
  { id: 'canteen', amount: 40, categoryId: 'food', note: 'Canteen Meal', icon: 'Utensils', color: '#10b981' },
  { id: 'metro', amount: 30, categoryId: 'travel', note: 'Metro / Auto', icon: 'BusFront', color: '#3b82f6' },
  { id: 'xerox', amount: 20, categoryId: 'supplies', note: 'Xerox / Notes', icon: 'FileText', color: '#8b5cf6' },
  { id: 'snacks', amount: 100, categoryId: 'food', note: 'Evening Snacks', icon: 'ShoppingBag', color: '#ec4899' },
];

export const BentoFastLogBar: React.FC = () => {
  const {
    user,
    householdId,
    addExpenseOptimistic,
    removeExpenseOptimistic,
    adjustTotalSpentOptimistic,
    addToast,
    categoriesMap,
    quickAddPresets,
  } = useStore();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const activePresets =
    quickAddPresets && quickAddPresets.length > 0 ? quickAddPresets : STUDENT_PRESETS;

  const handleQuickAdd = async (preset: QuickAddPreset) => {
    if (!user) return;

    // Tactile haptic pulse
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

    // Immediate optimistic store injection
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

      // Settle temp document with remote Firestore entity
      removeExpenseOptimistic(tempId);
      addExpenseOptimistic(newExpense);
      addToast({ type: 'success', message: `Logged ${preset.note} (${formatCurrency(preset.amount)})` });
      triggerHaptic('heavy');
    } catch (error) {
      console.error('Failed to quick add expense:', error);

      // Atomic Rollback
      removeExpenseOptimistic(tempId);
      adjustTotalSpentOptimistic(-preset.amount);
      addToast({ type: 'error', message: 'Failed to record expense. Rolled back.' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full rounded-[24px] p-5 sm:p-6 bg-theme-surface/70 border border-theme-border/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Title & Micro-Pitch */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-theme-accent/10 text-theme-accent flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-theme-primary tracking-tight leading-none">
            1-Tap Fast Log
          </h4>
          <p className="text-xs text-theme-secondary mt-1">
            Student 3-second presets • Instant sync
          </p>
        </div>
      </div>

      {/* Preset Chips Carousel / Wrap */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {activePresets.map((preset) => {
          const cat = categoriesMap.get(preset.categoryId);
          const isBusy = loadingId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => handleQuickAdd(preset)}
              disabled={loadingId !== null}
              type="button"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-theme-base/80 border border-theme-border/40 hover:border-theme-accent/40 hover:bg-theme-surface hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all shadow-2xs disabled:opacity-50 text-xs font-semibold text-theme-primary cursor-pointer"
            >
              <span className="w-5 h-5 rounded-lg bg-theme-surface border border-theme-border/30 flex items-center justify-center text-[10px]">
                {preset.id === 'chai' ? (
                  <Coffee className="w-3 h-3 text-amber-500" />
                ) : preset.id === 'canteen' ? (
                  <Utensils className="w-3 h-3 text-emerald-500" />
                ) : preset.id === 'metro' ? (
                  <Bus className="w-3 h-3 text-blue-500" />
                ) : preset.id === 'xerox' ? (
                  <FileText className="w-3 h-3 text-purple-500" />
                ) : (
                  <ShoppingBag className="w-3 h-3 text-pink-500" />
                )}
              </span>
              <span>{preset.note}</span>
              <span className="text-theme-secondary font-mono font-medium">
                {formatCurrency(preset.amount)}
              </span>
              {isBusy && <span className="w-2 h-2 rounded-full bg-theme-accent animate-ping" />}
            </button>
          );
        })}

        {/* Custom Transaction Trigger */}
        <AddExpenseMorph>
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-theme-inverse transition-all font-semibold text-xs shadow-sm shadow-theme-accent/20 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Custom</span>
          </button>
        </AddExpenseMorph>
      </div>
    </div>
  );
};
