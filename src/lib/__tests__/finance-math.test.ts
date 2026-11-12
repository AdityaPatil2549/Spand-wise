import { describe, expect, it } from 'vitest';
import { calculateFinancialSummary, calculateSpendPercentage } from '@/lib/finance-math';

describe('calculateSpendPercentage', () => {
  it('prevents division by zero and caps runaway percentages cleanly', () => {
    expect(calculateSpendPercentage(500, 0)).toBe(0);
    expect(calculateSpendPercentage(500, -100)).toBe(0);
    expect(calculateSpendPercentage(1500, 3000)).toBe(50);
    expect(calculateSpendPercentage(50000, 100)).toBe(999.9);
  });
});

describe('calculateFinancialSummary', () => {
  it('computes safe daily spend, remaining budget, and projections accurately', () => {
    const mockDate = new Date(2026, 10, 11); // Nov 11 (30 days in Nov -> 20 days remaining inclusive)
    const expenses = [
      { amount: 2200, date: new Date(2026, 10, 2) },
      { amount: 1100, date: new Date(2026, 10, 8) },
    ];

    const summary = calculateFinancialSummary(expenses, 10000, mockDate);
    expect(summary.totalSpent).toBe(3300);
    expect(summary.remainingBudget).toBe(6700);
    expect(summary.percentageUsed).toBe(33);
    expect(summary.safeDailySpend).toBe(335); // floor(6700 / 20)
    expect(summary.isOverBudget).toBe(false);
    expect(summary.projectedMonthlyTotal).toBe(9000); // 3300 + 19 * (3300 / 11)
  });

  it('flags over-budget cleanly with zero safe daily spend', () => {
    const mockDate = new Date(2026, 10, 15);
    const expenses = [{ amount: 5500, date: new Date(2026, 10, 10) }];
    const summary = calculateFinancialSummary(expenses, 5000, mockDate);
    expect(summary.isOverBudget).toBe(true);
    expect(summary.remainingBudget).toBe(-500);
    expect(summary.safeDailySpend).toBe(0);
  });
});

