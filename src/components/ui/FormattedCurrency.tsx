'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface FormattedCurrencyProps {
  amount: number;
  className?: string;
  showDecimals?: boolean;
}

/**
 * Universal Currency Display Component.
 * Guarantees tabular-nums alignment, font-sans crisp geometry, and optical non-breaking spaces.
 */
export const FormattedCurrency: React.FC<FormattedCurrencyProps> = ({
  amount,
  className = '',
  showDecimals = false,
}) => {
  return (
    <span className={`font-sans tabular-nums tracking-tight ${className}`}>
      {formatCurrency(amount, showDecimals)}
    </span>
  );
};
