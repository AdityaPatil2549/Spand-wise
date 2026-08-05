import React from 'react';
import { getMaterialIcon, formatCurrency } from '@/lib/utils';
import { FormattedCurrency } from '@/components/ui/FormattedCurrency';

interface TransactionRowProps {
  title: string;
  categoryName: string;
  amount: number;
  formattedTime: string;
  categoryColor: string;
  iconName?: string;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  title, categoryName, amount, formattedTime, categoryColor, iconName
}) => {
  return (
    <span className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-[var(--surface-base)] border border-[var(--border-light)] hover:bg-black/5 transition-colors">
      <span className="flex items-center gap-3.5 min-w-0">
        <span 
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
        >
          <span className="material-symbols-outlined text-[20px]">{getMaterialIcon(iconName)}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-manrope font-medium text-sm text-[var(--text-primary)] truncate">{title}</span>
          <span className="block font-manrope text-xs text-[var(--text-secondary)]">{categoryName} • {formattedTime}</span>
        </span>
      </span>
      <span className="text-right flex-shrink-0 pl-4">
        {/* Tabular numbers ensure Rupee digits never shift column alignment */}
        <FormattedCurrency amount={amount} className="font-semibold text-sm text-[var(--text-primary)]" />
      </span>
    </span>
  );
};
