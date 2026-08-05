'use client';
import React from 'react';
import { useHydrated } from '@/hooks/useHydrated';
import { formatCurrency } from '@/lib/utils';

export const FormattedCurrency: React.FC<{ amount: number; className?: string }> = ({ amount, className = '' }) => {
  const isHydrated = useHydrated();
  if (!isHydrated) {
    return <span className={`font-manrope tabular-nums tracking-tight opacity-80 ${className}`}>₹{amount}</span>;
  }
  return <span className={`font-manrope tabular-nums tracking-tight ${className}`}>{formatCurrency(amount)}</span>;
};
