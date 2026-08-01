import { CURRENCY_SYMBOL, LOCALE } from '@/config/constants';

/**
 * Format a number as an Indian Rupee currency string.
 * Examples: 15000 → "₹15,000", 1500.50 → "₹1,500.50"
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return `${CURRENCY_SYMBOL}0`;
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number as a compact Indian Rupee string for tight spaces.
 * Examples: 15000 → "₹15K", 1500000 → "₹15L"
 */
export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 10_00_000) {
    return `${CURRENCY_SYMBOL}${(amount / 10_00_000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `${CURRENCY_SYMBOL}${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};

/**
 * Format a percentage value.
 * Examples: 0.75 → "75%", 1.2 → "120%"
 */
export const formatPercent = (value: number, decimals = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format a number with Indian locale grouping.
 * Examples: 15000 → "15,000"
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat(LOCALE).format(value);
};
