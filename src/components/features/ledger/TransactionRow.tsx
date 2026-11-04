import React from 'react';
import { FormattedCurrency } from '@/components/ui/FormattedCurrency';
import { CategoryIcon } from '@/components/shared/CategoryIcon';

interface TransactionRowProps {
  title: string;
  categoryName: string;
  amount: number;
  formattedTime: string;
  categoryColor: string;
  iconName?: string;
  type?: 'expense' | 'income';
  isStandalone?: boolean;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  title,
  categoryName,
  amount,
  formattedTime,
  categoryColor,
  iconName,
  type = 'expense',
  isStandalone = false,
}) => {
  const isIncome = type === 'income';

  return (
    <div
      className={`flex items-center justify-between py-3 px-4 transition-colors hover:bg-theme-surface-hover/70 ${
        isStandalone
          ? 'rounded-2xl bg-theme-surface/70 border border-theme-border/40 shadow-xs'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${categoryColor}18`,
            color: categoryColor,
            border: `1px solid ${categoryColor}25`,
          }}
          aria-hidden="true"
        >
          <CategoryIcon iconName={iconName} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans font-medium text-sm text-theme-primary truncate">
            {title}
          </p>
          <p className="font-sans text-xs text-theme-secondary flex items-center gap-1.5 mt-0.5">
            <span>{categoryName}</span>
            <span className="text-theme-tertiary/60">•</span>
            <span>{formattedTime}</span>
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 pl-4">
        {/* Tabular numbers ensure digits never shift column alignment */}
        <span
          className={`font-semibold text-sm tabular-nums tracking-tight ${
            isIncome ? 'text-emerald-500' : 'text-theme-primary'
          }`}
        >
          {isIncome ? '+' : '-'}
          <FormattedCurrency amount={amount} />
        </span>
      </div>
    </div>
  );
};

