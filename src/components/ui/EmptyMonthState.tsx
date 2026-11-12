import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

export const EmptyMonthState: React.FC<{ monthName: string; onAddClick: () => void }> = ({
  monthName,
  onAddClick,
}) => {
  return (
    <div className="w-full py-14 px-6 rounded-2xl bg-theme-surface/70 border border-theme-border/60 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-12 h-12 rounded-full bg-theme-base flex items-center justify-center mb-3 border border-theme-accent/25 text-theme-accent">
        <Sparkles className="w-5 h-5" />
      </div>
      <h3 className="font-display text-lg text-theme-primary mb-1">A Fresh Ledger for {monthName}</h3>
      <p className="font-body text-xs text-theme-secondary max-w-sm mb-5 leading-relaxed">
        No transactions have been recorded for this period yet. Log your first expense to begin tracking your daily burn rate.
      </p>
      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-accent text-theme-on-accent font-medium text-xs shadow hover:opacity-95 transition-all active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add First Expense</span>
      </button>
    </div>
  );
};
