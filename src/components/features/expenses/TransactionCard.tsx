import React from 'react';
import { FormattedCurrency } from '@/components/ui/FormattedCurrency';
import { CategoryIcon } from '@/components/shared/CategoryIcon';

export interface TransactionCardProps {
  id: string;
  title: string;
  category: string;
  amount: number;
  time: string;
  icon: string;
  iconColor?: string;
  iconBgClass?: string;
  type?: 'expense' | 'income';
}

export function TransactionCard({
  title,
  category,
  amount,
  time,
  icon,
  iconColor = '#605850',
  type = 'expense',
}: TransactionCardProps) {
  const isIncome = type === 'income';

  return (
    <div className="group bg-transparent hover:bg-theme-surface-hover/70 transition-colors duration-150 py-3 px-4 flex items-center justify-between cursor-pointer">
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${iconColor}18`,
            color: iconColor,
            border: `1px solid ${iconColor}25`,
          }}
          aria-hidden="true"
        >
          <CategoryIcon iconName={icon} size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans font-medium text-sm text-theme-primary truncate">
            {title}
          </p>
          <p className="font-sans text-xs text-theme-secondary flex items-center gap-1.5 mt-0.5">
            <span>{category}</span>
            <span className="text-theme-tertiary/60">•</span>
            <span>{time}</span>
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 pl-4">
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
}
