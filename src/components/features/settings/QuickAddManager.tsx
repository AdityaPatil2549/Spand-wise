'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { updateQuickAddPresets } from '@/lib/user/index';
import { Plus, X } from 'lucide-react';
import { CategoryPicker } from '@/components/shared/CategoryPicker';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import type { QuickAddPreset } from '@/types/firestore';
import { formatCurrency } from '@/lib/utils';
import { CURRENCY_SYMBOL } from '@/config/constants';

const DEFAULT_PRESETS: QuickAddPreset[] = [
  { id: 'chai', amount: 15, categoryId: 'food', note: 'Chai', icon: 'Coffee', color: '#e67e22' },
  { id: 'snacks', amount: 20, categoryId: 'food', note: 'Snacks', icon: 'Utensils', color: '#e67e22' },
  { id: 'bus', amount: 50, categoryId: 'travel', note: 'Bus Ticket', icon: 'BusFront', color: '#3498db' },
];

export const QuickAddManager: React.FC = () => {
  const { user, quickAddPresets, setQuickAddPresets, categoriesMap, addToast } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('food'); // Default

  const activePresets = quickAddPresets && quickAddPresets.length > 0 ? quickAddPresets : DEFAULT_PRESETS;

  const handleDelete = async (id: string) => {
    if (!user) return;
    const updated = activePresets.filter((p) => p.id !== id);
    try {
      await updateQuickAddPresets(user.uid, updated);
      setQuickAddPresets(updated);
      addToast({ type: 'success', message: 'Preset removed.' });
    } catch (e: any) {
      addToast({ type: 'error', message: 'Failed to remove preset.' });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amount = Number(newAmount);
    if (!amount || amount <= 0 || !newNote || !newCategoryId) {
      addToast({ type: 'error', message: 'Please fill all fields.' });
      return;
    }

    const newPreset: QuickAddPreset = {
      id: crypto.randomUUID(),
      amount,
      note: newNote,
      categoryId: newCategoryId,
    };

    const updated = [...activePresets, newPreset];
    try {
      await updateQuickAddPresets(user.uid, updated);
      setQuickAddPresets(updated);
      setIsAdding(false);
      setNewAmount('');
      setNewNote('');
      addToast({ type: 'success', message: 'Preset added.' });
    } catch (e: any) {
      addToast({ type: 'error', message: 'Failed to add preset.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-theme-primary">Quick Add Widgets</h4>
          <p className="text-sm text-theme-tertiary">Configure the 1-tap widgets on your dashboard.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-theme-accent/10 text-theme-accent rounded-xl hover:bg-theme-accent/20 transition-colors font-medium text-sm"
          >
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-theme-surface border border-theme-border/50 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-theme-tertiary mb-1 uppercase tracking-widest">Note/Label</label>
              <input
                type="text"
                placeholder="e.g. Chai"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full bg-theme-base border border-theme-border/50 rounded-lg px-3 py-2 text-theme-primary text-sm focus:outline-none focus:border-theme-accent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-tertiary mb-1 uppercase tracking-widest">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary text-sm pointer-events-none">
                  {CURRENCY_SYMBOL}
                </span>
                <input
                  type="number"
                  placeholder="20"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-theme-base border border-theme-border/50 rounded-lg pl-8 pr-3 py-2 text-theme-primary text-sm focus:outline-none focus:border-theme-accent"
                  required
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-theme-tertiary mb-1 uppercase tracking-widest">Category</label>
            <div className="bg-theme-base border border-theme-border/50 rounded-xl pt-1">
              <CategoryPicker selectedId={newCategoryId} onSelect={setNewCategoryId} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-theme-accent text-theme-inverse rounded-lg hover:bg-theme-accent-hover transition-colors"
            >
              Save Preset
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activePresets.map((preset) => {
          const cat = categoriesMap.get(preset.categoryId);
          const iconName = cat?.icon || preset.icon;
          const color = cat?.color || preset.color || '#95a5a6';

          return (
            <div key={preset.id} className="flex items-center justify-between p-3 bg-theme-surface rounded-xl border border-theme-border/50">
              <div className="flex items-center gap-3">
                <span 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}15`, color: color }}
                >
                  <CategoryIcon iconName={iconName} className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-medium text-theme-primary text-sm">{preset.note}</p>
                  <p className="text-xs text-theme-secondary font-medium">{formatCurrency(preset.amount)}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(preset.id)}
                className="p-2 text-theme-tertiary hover:text-theme-danger hover:bg-theme-danger/10 rounded-lg transition-colors"
                aria-label="Remove preset"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
