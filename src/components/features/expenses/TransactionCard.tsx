import React from 'react';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';

export interface TransactionCardProps {
  id: string;
  title: string;
  category: string;
  amount: number;
  time: string;
  icon: string;
  iconColor?: string;
  iconBgClass: string;
}

export function TransactionCard({
  title,
  category,
  amount,
  time,
  icon,
  iconColor,
  iconBgClass,
}: TransactionCardProps) {
  return (
    <div className="group bg-[#f6f0e8] hover:bg-[#ece6dc] transition-colors duration-300 rounded-xl p-5 flex items-center gap-6 cursor-pointer border border-transparent hover:border-[#d8d0c8]/40">
      <div className={`w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`} style={{ color: iconColor }}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-headline text-xl text-[#3a302a] mb-0.5">{title}</h4>
        <p className="font-body text-sm text-[#605850]">{category}</p>
      </div>
      <div className="text-right">
        <p className="font-body text-lg font-medium text-[#3a302a] flex justify-end items-center gap-[1px]">
          -$<AnimatedNumber value={Math.floor(amount)} />
          {(amount % 1).toFixed(2).substring(1)}
        </p>
        <p className="font-body text-xs text-[#78706a]">{time}</p>
      </div>
    </div>
  );
}
