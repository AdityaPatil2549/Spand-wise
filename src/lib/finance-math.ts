import { getDaysInMonth, getDate } from 'date-fns';

export interface FinancialSummary {
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  safeDailySpend: number;
  projectedMonthlyTotal: number;
  isOverBudget: boolean;
}

export function calculateSpendPercentage(spent: number, limit: number): number {
  if (!limit || limit <= 0) return 0; // Prevent Division-by-Zero / Infinity
  const rawPercentage = (spent / limit) * 100;
  return Number(Math.min(rawPercentage, 999.9).toFixed(1));
}

export function calculateFinancialSummary(
  expenses: { amount: number; date: Date }[],
  monthlyBudget: number,
  currentDate: Date = new Date()
): FinancialSummary {
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const safeBudget = Math.max(monthlyBudget, 0);
  const remainingBudget = safeBudget - totalSpent;
  const percentageUsed = calculateSpendPercentage(totalSpent, safeBudget);

  const totalDaysInMonth = getDaysInMonth(currentDate);
  const currentDay = getDate(currentDate);
  const daysRemaining = Math.max(totalDaysInMonth - currentDay + 1, 1);

  const safeDailySpend = remainingBudget > 0 ? Math.floor(remainingBudget / daysRemaining) : 0;
  const averageDailyBurn = currentDay > 0 ? totalSpent / currentDay : 0;
  const projectedMonthlyTotal = Math.round(totalSpent + (daysRemaining - 1) * averageDailyBurn);

  return {
    totalSpent,
    remainingBudget,
    percentageUsed,
    safeDailySpend,
    projectedMonthlyTotal,
    isOverBudget: totalSpent > safeBudget,
  };
}
