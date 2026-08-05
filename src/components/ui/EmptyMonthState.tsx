import React from 'react';

export const EmptyMonthState: React.FC<{ monthName: string; onAddClick: () => void }> = ({ monthName, onAddClick }) => {
  return (
    <div className="w-full py-14 px-6 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-light)] flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-12 h-12 rounded-full bg-[var(--theme-base)] flex items-center justify-center mb-3 border border-[var(--theme-accent)]/20">
        <span className="font-serif text-xl text-[var(--theme-accent)]">✦</span>
      </div>
      <h3 className="font-serif text-lg text-[var(--text-primary)] mb-1">A Fresh Ledger for {monthName}</h3>
      <p className="font-manrope text-xs text-[var(--text-secondary)] max-w-sm mb-5 leading-relaxed">
        No transactions have been recorded for this period yet. Log your first expense to begin tracking your daily burn rate.
      </p>
      <button
        onClick={onAddClick}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--theme-accent)] text-white font-manrope font-medium text-xs shadow hover:opacity-95 transition-all active:scale-95"
      >
        <span className="material-symbols-rounded text-sm">add</span>
        <span>Add First Expense</span>
      </button>
    </div>
  );
};
