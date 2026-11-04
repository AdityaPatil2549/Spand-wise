'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '@/store';
import { useHydrated } from '@/hooks/useHydrated';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  subMonths,
  getDay,
  getDate,
  getDaysInMonth,
} from 'date-fns';
import { getDoc } from 'firebase/firestore';
import { budgetDocRef } from '@/lib/firebase/firestore';
import { calculateFinancialHealth } from '@/lib/algorithms/financialHealth';
import { FileDown, Calendar, Sparkles } from 'lucide-react';

// Analytics Domain Components
import { AnalyticsSkeleton } from '@/components/features/analytics/AnalyticsSkeleton';
import { FinancialHealthGauge } from '@/components/features/analytics/FinancialHealthGauge';
import { CategorySpendDonut } from '@/components/features/analytics/CategorySpendDonut';
import { BurnRateVelocityChart } from '@/components/features/analytics/BurnRateVelocityChart';
import { WaterfallMoneyFlow } from '@/components/features/analytics/WaterfallMoneyFlow';
import { RecurringVsVariableSplit } from '@/components/features/analytics/RecurringVsVariableSplit';
import { SavingsGoalCards } from '@/components/features/analytics/SavingsGoalCards';
import { ExportReportModal } from '@/components/features/analytics/ExportReportModal';

export default function AnalyticsPage() {
  const isHydrated = useHydrated();
  const {
    user,
    expenses,
    budget,
    categoriesMap,
    householdId,
    goals,
    loadGoals,
    addGoal,
    contributeToGoal,
    addToast,
  } = useStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [pastBudgets, setPastBudgets] = useState<
    Array<{
      name: string;
      monthId: string;
      Income: number;
      Expenses: number;
      NetSavings: number;
    }>
  >([]);
  const [momChange, setMomChange] = useState<{
    percent: number;
    isIncrease: boolean;
    hasPrevious: boolean;
  }>({
    percent: 0,
    isIncrease: false,
    hasPrevious: false,
  });

  // Load goals on mount / household change
  useEffect(() => {
    if (householdId) {
      loadGoals(householdId);
    }
  }, [householdId, loadGoals]);

  // Fetch true multi-month historical budgets from Firestore
  useEffect(() => {
    if (!householdId) return;
    let isMounted = true;

    const fetchPast6Months = async () => {
      try {
        const last6MonthIds = Array.from({ length: 6 })
          .map((_, i) => format(subMonths(new Date(), i), 'yyyy-MM'))
          .reverse();

        const currentMonthId = format(new Date(), 'yyyy-MM');

        const fetchedDocs = await Promise.all(
          last6MonthIds.map(async (monthId) => {
            try {
              const snap = await getDoc(budgetDocRef(householdId, monthId));
              if (snap.exists()) {
                const data = snap.data();
                return {
                  id: monthId,
                  totalIncome: data.totalIncome || 0,
                  totalSpent: data.totalSpent || 0,
                };
              }
              return { id: monthId, totalIncome: 0, totalSpent: 0 };
            } catch {
              return { id: monthId, totalIncome: 0, totalSpent: 0 };
            }
          })
        );

        if (!isMounted) return;

        const chartData = last6MonthIds.map((monthId) => {
          const b = fetchedDocs.find((doc) => doc.id === monthId);
          const displayMonth = format(new Date(`${monthId}-01T00:00:00`), 'MMM');

          const expensesVal =
            monthId === currentMonthId && budget ? budget.totalSpent : b?.totalSpent || 0;
          const incomeVal =
            monthId === currentMonthId && budget ? budget.totalIncome || 0 : b?.totalIncome || 0;

          return {
            name: displayMonth,
            monthId,
            Income: incomeVal,
            Expenses: expensesVal,
            NetSavings: incomeVal - expensesVal,
          };
        });

        setPastBudgets(chartData);

        if (chartData.length >= 2) {
          const currentMonthData = chartData[chartData.length - 1];
          const prevMonthData = chartData[chartData.length - 2];

          if (prevMonthData && prevMonthData.Expenses > 0) {
            const diff = currentMonthData.Expenses - prevMonthData.Expenses;
            const pct = Math.abs((diff / prevMonthData.Expenses) * 100);
            setMomChange({
              percent: Number(pct.toFixed(1)),
              isIncrease: diff > 0,
              hasPrevious: true,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch past budgets:', err);
      }
    };

    fetchPast6Months();
    return () => {
      isMounted = false;
    };
  }, [householdId, budget]);

  // Aggregated Category and Trajectory Calculations
  const { categoryTotals, totalSpent, pieData, areaData, dailySpendMap } = useMemo(() => {
    let total = 0;
    const totals: Record<string, number> = {};
    const dayMap: Record<string, number> = {};

    expenses.forEach((expense) => {
      if (expense.type !== 'income' && !expense.isDeleted) {
        total += expense.amount;
        totals[expense.categoryId] = (totals[expense.categoryId] || 0) + expense.amount;

        try {
          const dayStr = format(expense.date.toDate(), 'yyyy-MM-dd');
          dayMap[dayStr] = (dayMap[dayStr] || 0) + expense.amount;
        } catch {}
      }
    });

    const pie = Object.entries(totals)
      .map(([id, value]) => ({
        name: categoriesMap.get(id)?.name || 'Other',
        value,
        color: categoriesMap.get(id)?.color || '#6366f1',
      }))
      .sort((a, b) => b.value - a.value);

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const days = eachDayOfInterval({ start, end });

    const currentDay = Math.max(1, getDate(now));
    const avgDailyBurn = total / currentDay;

    let cumulative = 0;
    const area = days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const daySpend = dayMap[dayStr] || 0;
      const dayNum = getDate(day);
      if (day <= now) {
        cumulative += daySpend;
      }
      const projected =
        dayNum >= currentDay ? Math.round(total + (dayNum - currentDay) * avgDailyBurn) : null;

      return {
        date: format(day, 'MMM d'),
        spent: day <= now ? cumulative : null,
        projected,
      };
    });

    return {
      categoryTotals: totals,
      totalSpent: total,
      pieData: pie,
      areaData: area,
      dailySpendMap: dayMap,
    };
  }, [expenses, categoriesMap]);

  // Dynamic Savings & Velocity Calculations
  const savingsThisMonth = useMemo(() => {
    const monthlyIncome = budget?.totalIncome || 0;
    const netSavings = monthlyIncome - totalSpent;
    return {
      monthlyIncome,
      netSavings,
    };
  }, [budget?.totalIncome, totalSpent]);

  // Day of Week Spending Pattern (Peak spending day)
  const dayOfWeekStats = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    expenses.forEach((e) => {
      if (e.type !== 'income' && !e.isDeleted) {
        try {
          const dayIdx = getDay(e.date.toDate());
          totals[dayIdx] += e.amount;
          counts[dayIdx] += 1;
        } catch {}
      }
    });

    let peakIdx = 0;
    let maxSpend = 0;
    totals.forEach((amt, idx) => {
      if (amt > maxSpend) {
        maxSpend = amt;
        peakIdx = idx;
      }
    });

    const data = days.map((day, idx) => ({
      day,
      spend: totals[idx],
      count: counts[idx],
      isPeak: idx === peakIdx && maxSpend > 0,
    }));

    return {
      data,
      peakDay: maxSpend > 0 ? days[peakIdx] : 'None',
      peakAmount: maxSpend,
    };
  }, [expenses]);

  // Daily Spending Velocity & Projections
  const velocityStats = useMemo(() => {
    const now = new Date();
    const currentDay = Math.max(1, getDate(now));
    const totalDays = getDaysInMonth(now);
    const daysRemaining = Math.max(totalDays - currentDay + 1, 1);

    const dailyBurn = totalSpent / currentDay;
    const remainingBudget = (budget?.budgetAmount || 0) - totalSpent;
    const safeDailyAllowance = remainingBudget > 0 ? remainingBudget / daysRemaining : 0;
    const projectedMonthEnd = Math.round(totalSpent + (daysRemaining - 1) * dailyBurn);

    return {
      dailyBurn: Math.round(dailyBurn),
      safeDailyAllowance: Math.round(safeDailyAllowance),
      projectedMonthEnd,
      daysRemaining,
    };
  }, [totalSpent, budget]);

  // Financial Health Algorithm Result
  const healthResult = useMemo(() => {
    const now = new Date();
    const currentDay = Math.max(1, getDate(now));
    const totalDays = getDaysInMonth(now);
    const dailySpendingArr = Array.from({ length: currentDay }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dStr = format(d, 'yyyy-MM-dd');
      return dailySpendMap[dStr] || 0;
    });

    const prevMonthSpend =
      pastBudgets.length >= 2 ? pastBudgets[pastBudgets.length - 2]?.Expenses || 0 : 0;

    return calculateFinancialHealth({
      monthlyIncome: savingsThisMonth.monthlyIncome,
      totalSpent,
      budgetAmount: budget?.budgetAmount || 0,
      dailySpending: dailySpendingArr,
      daysElapsed: currentDay,
      totalDaysInMonth: totalDays,
      expenses,
      categoriesMap,
      prevMonthSpent: prevMonthSpend,
    });
  }, [dailySpendMap, pastBudgets, savingsThisMonth.monthlyIncome, totalSpent, budget?.budgetAmount, expenses, categoriesMap]);

  if (!isHydrated) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="flex flex-col w-full pb-32 md:pb-16 animate-in fade-in duration-300 space-y-6">
      {/* Top Header & Export Statement CTA */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] tracking-widest font-mono font-bold text-theme-accent uppercase px-2.5 py-0.5 rounded-full bg-theme-accent/10 border border-theme-accent/20">
              Intelligence • {format(new Date(), 'MMMM yyyy')}
            </span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-theme-primary tracking-tight mt-1">
            Financial Analysis & Cockpit
          </h1>
          <p className="text-xs text-theme-secondary mt-0.5">
            Algorithmic health audit, velocity trajectories & cashflow breakdown
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-primary text-theme-inverse text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <FileDown className="w-4 h-4 stroke-[2.2]" />
          <span>Export Report</span>
        </button>
      </section>

      {/* Domain Row 1: Financial Health Gauge & Category Allocation Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-6 flex">
          <FinancialHealthGauge
            healthResult={healthResult}
            monthlyIncome={savingsThisMonth.monthlyIncome}
            totalSpent={totalSpent}
            budgetAmount={budget?.budgetAmount || 0}
          />
        </div>

        <div className="lg:col-span-6 flex">
          <CategorySpendDonut
            pieData={pieData}
            totalSpent={totalSpent}
            categoriesMap={categoriesMap}
          />
        </div>
      </div>

      {/* Domain Row 2: Burn Rate Velocity Chart & Historical 6-Month Comparison */}
      <BurnRateVelocityChart
        areaData={areaData}
        pastBudgets={pastBudgets}
        momChange={momChange}
        velocityStats={velocityStats}
        dayOfWeekStats={dayOfWeekStats}
      />

      {/* Domain Row 3: Waterfall Cashflow Stepwise Breakdown */}
      <WaterfallMoneyFlow
        income={savingsThisMonth.monthlyIncome}
        budgetAmount={budget?.budgetAmount || 0}
        expenses={expenses}
        categoriesMap={categoriesMap}
      />

      {/* Domain Row 4: Recurring vs Variable Split */}
      <RecurringVsVariableSplit
        expenses={expenses}
        categoriesMap={categoriesMap}
      />

      {/* Domain Row 5: Savings Goal Targets & Milestones */}
      <SavingsGoalCards
        goals={goals}
        addGoal={addGoal}
        contributeToGoal={contributeToGoal}
        addToast={addToast}
      />

      {/* Export Statement Modal */}
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        expenses={expenses}
        budget={budget}
        categoriesMap={categoriesMap}
        householdId={householdId || user?.uid || ''}
      />
    </div>
  );
}
