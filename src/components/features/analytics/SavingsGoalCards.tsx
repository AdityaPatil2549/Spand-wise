'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { Target, Plus, Trophy, Sparkles, X } from 'lucide-react';
import type { GoalDocument } from '@/types/firestore';

interface SavingsGoalCardsProps {
  goals: GoalDocument[];
  addGoal: (goal: Omit<GoalDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number) => Promise<void>;
  addToast: (toast: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

export const SavingsGoalCards: React.FC<SavingsGoalCardsProps> = ({
  goals,
  addGoal,
  contributeToGoal,
  addToast,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  // Add Goal Form State
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !target) return;
    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      await addGoal({
        name: name.trim(),
        targetAmount: parseFloat(target),
        currentAmount: 0,
        category: category.trim() || 'General',
        isCompleted: false,
        createdBy: '',
      });

      triggerHaptic('heavy');
      addToast({ type: 'success', message: `Created goal "${name}"` });
      setName('');
      setTarget('');
      setCategory('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create goal:', err);
      addToast({ type: 'error', message: 'Failed to create savings goal.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContribute = async (goalId: string) => {
    const amt = parseFloat(contributeAmount);
    if (isNaN(amt) || amt <= 0) return;
    triggerHaptic('medium');

    try {
      await contributeToGoal(goalId, amt);
      triggerHaptic('heavy');
      addToast({ type: 'success', message: `Added ${formatCurrency(amt)} to goal!` });
      setContributeAmount('');
      setContributeGoalId(null);
    } catch (err) {
      console.error('Failed to contribute to goal:', err);
      addToast({ type: 'error', message: 'Failed to record contribution.' });
    }
  };

  return (
    <div className="w-full rounded-[28px] p-6 sm:p-7 bg-theme-surface/70 border border-theme-border/60 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-theme-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-theme-accent/10 text-theme-accent flex items-center justify-center">
            <Target className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-theme-primary tracking-tight">
              Savings Targets & Milestones
            </h3>
            <p className="text-xs text-theme-secondary">
              Gamified discipline for laptops, travel & emergency funds
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-primary text-theme-inverse text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Target</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      {goals.length === 0 ? (
        <div className="py-8 text-center text-xs text-theme-secondary space-y-2">
          <Trophy className="w-8 h-8 mx-auto text-theme-border" />
          <p className="font-semibold text-theme-primary">No savings milestones configured yet</p>
          <p className="max-w-xs mx-auto text-[11px]">
            Set target savings for semester fees, travel, or new gadgets to stay motivated.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100));
            const isContributing = contributeGoalId === goal.id;

            return (
              <div
                key={goal.id}
                className="p-4 rounded-2xl bg-theme-base/70 border border-theme-border/40 space-y-3 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-theme-accent uppercase tracking-wider block">
                      {goal.category || 'Target'}
                    </span>
                    <h4 className="font-bold text-sm text-theme-primary truncate mt-0.5">
                      {goal.name}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-theme-primary tabular-nums">
                    {pct}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-theme-elevated/70 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-theme-accent transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-theme-secondary tabular-nums">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>Target: {formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>

                {/* Quick Contribute Trigger */}
                {isContributing ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      placeholder="Amount ₹"
                      value={contributeAmount}
                      onChange={(e) => setContributeAmount(e.target.value)}
                      className="flex-1 py-1 px-2.5 rounded-lg bg-theme-surface border border-theme-border text-xs text-theme-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleContribute(goal.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-semibold cursor-pointer active:scale-95"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setContributeGoalId(null)}
                      className="p-1 rounded-lg hover:bg-theme-surface text-theme-secondary"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setContributeGoalId(goal.id)}
                    className="w-full py-1.5 px-3 rounded-xl bg-theme-surface hover:bg-theme-surface-hover border border-theme-border/40 text-xs font-semibold text-theme-primary flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-theme-accent" />
                    <span>Contribute</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Goal Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-theme-surface border border-theme-border p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-theme-border/30">
              <h4 className="font-bold text-base text-theme-primary">Create Savings Target</h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-theme-base text-theme-secondary hover:text-theme-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-theme-secondary font-medium mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. New Laptop, Goa Trip"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full py-2 px-3 rounded-xl bg-theme-base border border-theme-border text-theme-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-theme-secondary font-medium mb-1">Target Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                  className="w-full py-2 px-3 rounded-xl bg-theme-base border border-theme-border text-theme-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-theme-secondary font-medium mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Gadgets, Travel, Emergency"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-theme-base border border-theme-border text-theme-primary focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 rounded-xl bg-theme-base hover:bg-theme-surface border border-theme-border text-theme-primary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 rounded-xl bg-theme-primary text-theme-inverse font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
