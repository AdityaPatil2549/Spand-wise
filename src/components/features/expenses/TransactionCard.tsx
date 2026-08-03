import React from 'react';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';
import { CURRENCY_SYMBOL } from '@/config/constants';

export interface TransactionCardProps {
  id: string;
  title: string;
  category: string;
  amount: number;
  time: string;
  icon: string;
  iconColor?: string;
  iconBgClass: string;
  transactionType?: 'expense' | 'income';
}

export function TransactionCard({
  title,
  category,
  amount,
  time,
  icon,
  iconColor,
  iconBgClass,
  transactionType = 'expense',
}: TransactionCardProps) {
  const isIncome = transactionType === 'income';

  return (
    <div className="group bg-theme-surface hover:bg-theme-surface-hover transition-colors duration-300 rounded-xl p-5 flex items-center gap-6 cursor-pointer border border-transparent hover:border-theme-border/40">
      <div className={`w-12 h-12 rounded-full ${isIncome ? 'bg-emerald-50' : iconBgClass} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`} style={{ color: isIncome ? '#22c55e' : iconColor }}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-headline text-xl text-theme-primary mb-0.5">{title}</h4>
        <p className="font-body text-sm text-theme-secondary">{category}</p>
      </div>
      <div className="text-right">
        <p className={`font-body text-lg font-medium flex justify-end items-center gap-[1px] ${isIncome ? 'text-emerald-500' : 'text-theme-primary'}`}>
          {isIncome ? '+' : '-'}{CURRENCY_SYMBOL}<AnimatedNumber value={Math.floor(amount)} />
          {(amount % 1).toFixed(2).substring(1)}
        </p>
        <p className="font-body text-xs text-theme-tertiary">{time}</p>
      </div>
    </div>
  );
}
