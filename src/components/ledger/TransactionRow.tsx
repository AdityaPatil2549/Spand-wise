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
    <span className="flex items-center justify-between py-3 px-4 rounded-sm bg-theme-base border-b border-theme-border/30 hover:bg-theme-surface transition-colors">
      <span className="flex items-center gap-4 min-w-0">
        <span 
          className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${categoryColor}10`, color: categoryColor }}
        >
          <span className="material-symbols-outlined text-[18px]">{getMaterialIcon(iconName)}</span>
        </span>
        <span className="min-w-0 flex-1 flex flex-col gap-0.5">
          <span className="block font-body font-medium text-[15px] text-theme-primary truncate">{title}</span>
          <span className="block font-mono text-[12px] uppercase tracking-widest text-theme-secondary">{categoryName}</span>
        </span>
      </span>
      <span className="text-right flex flex-col items-end flex-shrink-0 pl-4 gap-0.5">
        <FormattedCurrency amount={amount} className="font-mono font-medium text-[15px] text-theme-primary tabular-nums" />
        <span className="font-mono text-[11px] text-theme-tertiary">{formattedTime}</span>
      </span>
    </span>
  );
};
