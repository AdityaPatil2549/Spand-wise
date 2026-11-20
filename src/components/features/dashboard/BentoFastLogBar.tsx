'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { useAddExpenseMutation } from '@/hooks/mutations/useExpenseMutations';
import { formatCurrency } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { Plus, Zap, Coffee, Utensils, Bus, FileText, ShoppingBag } from 'lucide-react';
import { AddExpenseMorph } from '@/components/features/expenses/AddExpenseMorph';
import type { QuickAddPreset } from '@/types/firestore';

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
    adjustTotalSpentOptimistic,
    addToast,
    quickAddPresets,
  } = useStore();

  const addExpenseMutation = useAddExpenseMutation();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const activePresets =
    quickAddPresets && quickAddPresets.length > 0 ? quickAddPresets : STUDENT_PRESETS;

  const handleQuickAdd = async (preset: QuickAddPreset) => {
    if (!user) return;

    // Tactile haptic pulse
    triggerHaptic('medium');
    setLoadingId(preset.id);

    const now = new Date();

    try {
      const data = {
        amount: preset.amount,
        categoryId: preset.categoryId,
        note: preset.note,
        date: now.toISOString(),
      };

      await addExpenseMutation.mutateAsync({
        householdId: householdId || user.uid,
        userId: user.uid,
        input: data,
      });

      adjustTotalSpentOptimistic(preset.amount);
      addToast({ type: 'success', message: `Logged ${preset.note} (${formatCurrency(preset.amount)})` });
      triggerHaptic('heavy');
    } catch (error) {
      console.error('Failed to quick add expense:', error);
      addToast({ type: 'error', message: 'Failed to record expense. Rolled back.' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="relative overflow-hidden w-full rounded-3xl p-5 sm:p-6 bg-theme-surface/70 border border-theme-border/60 shadow-sm hover:border-theme-border hover:shadow-md transition-all duration-300 group flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      {/* Top subtle specular highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {/* Title & Quick Guidance */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-theme-accent text-theme-on-accent flex items-center justify-center shadow-sm">
          <Zap className="w-4 h-4 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-theme-primary tracking-tight leading-none">
              Quick Log
            </h3>
            <span className="text-[10px] font-sans uppercase tracking-wider text-theme-accent font-semibold px-2 py-0.5 rounded-md bg-theme-accent/10 border border-theme-accent/20">
              Instant
            </span>
          </div>
          <p className="text-xs text-theme-secondary mt-1">
            Tap any preset to record immediately
          </p>
        </div>
      </div>

      {/* Preset Physical Keys Carousel (Horizontal Scroll Snap on Mobile, Smooth Row on Desktop) */}
      <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto py-0.5">
        {activePresets.map((preset) => {
          const isBusy = loadingId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => handleQuickAdd(preset)}
              disabled={loadingId !== null}
              type="button"
              className="group relative flex items-center gap-2 px-3 py-2 rounded-xl bg-theme-base/80 hover:bg-theme-surface border border-theme-border/60 hover:border-theme-accent/40 active:scale-95 transition-all shadow-sm disabled:opacity-50 text-xs font-semibold text-theme-primary cursor-pointer shrink-0"
            >
              <span className="w-6 h-6 rounded-lg bg-theme-surface border border-theme-border/40 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                {preset.id === 'chai' ? (
                  <Coffee className="w-3.5 h-3.5 text-amber-500" />
                ) : preset.id === 'canteen' ? (
                  <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                ) : preset.id === 'metro' ? (
                  <Bus className="w-3.5 h-3.5 text-blue-500" />
                ) : preset.id === 'xerox' ? (
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
                )}
              </span>

              <span className="font-semibold whitespace-nowrap">{preset.note}</span>

              <span className="px-1.5 py-0.5 rounded-md bg-theme-elevated text-theme-primary font-mono font-bold text-[11px] tabular-nums whitespace-nowrap">
                ₹{preset.amount}
              </span>

              {isBusy && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-theme-accent animate-ping" />
              )}
            </button>
          );
        })}

        {/* Custom Expense Trigger */}
        <AddExpenseMorph className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-theme-primary hover:opacity-90 text-theme-on-primary transition-all font-bold text-xs shadow-sm active:scale-95 cursor-pointer shrink-0 whitespace-nowrap">
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Custom</span>
        </AddExpenseMorph>
      </div>
    </div>
  );
};
