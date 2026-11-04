'use client';

import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useStore } from '@/store';
import { addExpense } from '@/lib/expenses/index';
import { getLocalMonthString } from '@/lib/date-sharding';
import { formatCurrency } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { Plus, Zap, Coffee, Utensils, Bus, FileText, ShoppingBag, Sparkles } from 'lucide-react';
import { AddExpenseMorph } from '@/components/features/expenses/AddExpenseMorph';
import type { ExpenseDocument, QuickAddPreset } from '@/types/firestore';

const STUDENT_PRESETS: Array<QuickAddPreset & { iconColor: string; bgTint: string }> = [
  { id: 'chai', amount: 15, categoryId: 'food', note: 'Chai', icon: 'Coffee', color: '#f59e0b', iconColor: 'text-amber-500', bgTint: 'bg-amber-500/10' },
  { id: 'canteen', amount: 40, categoryId: 'food', note: 'Canteen Meal', icon: 'Utensils', color: '#10b981', iconColor: 'text-emerald-500', bgTint: 'bg-emerald-500/10' },
  { id: 'metro', amount: 30, categoryId: 'travel', note: 'Metro / Auto', icon: 'BusFront', color: '#3b82f6', iconColor: 'text-blue-500', bgTint: 'bg-blue-500/10' },
  { id: 'xerox', amount: 20, categoryId: 'supplies', note: 'Xerox / Notes', icon: 'FileText', color: '#8b5cf6', iconColor: 'text-purple-500', bgTint: 'bg-purple-500/10' },
  { id: 'snacks', amount: 100, categoryId: 'food', note: 'Evening Snacks', icon: 'ShoppingBag', color: '#ec4899', iconColor: 'text-pink-500', bgTint: 'bg-pink-500/10' },
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
    <div className="w-full rounded-[28px] p-5 sm:p-6 bg-gradient-to-r from-theme-surface via-theme-surface to-theme-base border border-theme-border/70 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      {/* Title & Quick Guidance */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-theme-accent text-theme-inverse flex items-center justify-center shadow-xs">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm sm:text-base font-extrabold text-theme-primary tracking-tight leading-none">
              1-Tap Fast Log
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10">
              Instant
            </span>
          </div>
          <p className="text-xs text-theme-secondary mt-1">
            Tap any preset to log immediately with zero friction
          </p>
        </div>
      </div>

      {/* Preset Physical Keys */}
      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
        {activePresets.map((preset) => {
          const isBusy = loadingId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => handleQuickAdd(preset)}
              disabled={loadingId !== null}
              type="button"
              className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-theme-base/90 hover:bg-theme-surface border border-theme-border/60 hover:border-theme-accent/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all shadow-xs disabled:opacity-50 text-xs font-semibold text-theme-primary cursor-pointer"
            >
              <span className="w-7 h-7 rounded-xl bg-theme-surface border border-theme-border/40 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                {preset.id === 'chai' ? (
                  <Coffee className="w-3.5 h-3.5 text-amber-500" />
                ) : preset.id === 'canteen' ? (
                  <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                ) : preset.id === 'metro' ? (
                  <Bus className="w-3.5 h-3.5 text-blue-500" />
                ) : preset.id === 'xerox' ? (
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
                )}
              </span>

              <span className="font-bold">{preset.note}</span>

              <span className="px-2 py-0.5 rounded-lg bg-theme-elevated text-theme-primary font-mono font-bold text-[11px] tabular-nums">
                ₹{preset.amount}
              </span>

              {isBusy && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-theme-accent animate-ping" />
              )}
            </button>
          );
        })}

        {/* Custom Expense Trigger */}
        <AddExpenseMorph>
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-theme-primary hover:opacity-90 text-theme-inverse transition-all font-bold text-xs shadow-sm active:scale-95 cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Custom</span>
          </button>
        </AddExpenseMorph>
      </div>
    </div>
  );
};
