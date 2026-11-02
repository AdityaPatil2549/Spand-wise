'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '@/store';
import { Carousel, CarouselContent, CarouselNavigation, CarouselItem, CarouselIndicator } from '@/components/ui/motion/carousel';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/motion/accordion';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';
import { getMaterialIcon } from '@/lib/utils';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  subMonths, 
  getDay, 
  getDate, 
  getDaysInMonth,
  isSameDay
} from 'date-fns';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { budgetDocRef } from '@/lib/firebase/firestore';
import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Flame, 
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Landmark,
  ShieldCheck,
  Target,
  Plus,
  Info,
  CheckCircle2,
  Trophy,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react';
import { calculateFinancialHealth } from '@/lib/algorithms/financialHealth';

export default function AnalyticsPage() {
  const { 
    expenses, 
    budget, 
    categoriesMap, 
    householdId, 
    selectedMonth, 
    setCategoryBudgetOptimistic, 
    addToast,
    goals,
    loadGoals,
    addGoal,
    contributeToGoal
  } = useStore();

  const [editingLimit, setEditingLimit] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [pastBudgets, setPastBudgets] = useState<any[]>([]);
  const [isPastBudgetsLoading, setIsPastBudgetsLoading] = useState(true);
  const [paymentModeTab, setPaymentModeTab] = useState<'spending' | 'income'>('spending');
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  
  // New Goal form state
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');

  const [momChange, setMomChange] = useState<{ percent: number; isIncrease: boolean; hasPrevious: boolean }>({
    percent: 0,
    isIncrease: false,
    hasPrevious: false,
  });

  // Load Goals on mount / household change
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
      setIsPastBudgetsLoading(true);
      try {
        const last6MonthIds = Array.from({ length: 6 }).map((_, i) => 
          format(subMonths(new Date(), i), 'yyyy-MM')
        ).reverse(); // Chronological: oldest to newest

        const currentMonthId = format(new Date(), 'yyyy-MM');

        const fetchedDocs = await Promise.all(
          last6MonthIds.map(async (monthId) => {
            try {
              const snap = await getDoc(budgetDocRef(householdId, monthId));
              if (snap.exists()) {
                return { ...snap.data(), id: monthId };
              }
              return { id: monthId, totalIncome: 0, totalSpent: 0, categoryBudgets: {} as Record<string, number> };
            } catch {
              return { id: monthId, totalIncome: 0, totalSpent: 0, categoryBudgets: {} as Record<string, number> };
            }
          })
        );

        if (!isMounted) return;

        const chartData = last6MonthIds.map(monthId => {
          const b = fetchedDocs.find(doc => doc.id === monthId) as any;
          const displayMonth = format(new Date(monthId + '-01T00:00:00'), 'MMM');
          
          // Merge active live state for current month
          const expensesVal = (monthId === currentMonthId && budget) 
            ? budget.totalSpent 
            : (b?.totalSpent || 0);
          const incomeVal = (monthId === currentMonthId && budget) 
            ? (budget.totalIncome || 0) 
            : (b?.totalIncome || 0);

          return {
            name: displayMonth,
            monthId,
            Income: incomeVal,
            Expenses: expensesVal,
            NetSavings: incomeVal - expensesVal,
            categoryBudgets: b?.categoryBudgets || {},
          };
        });

        setPastBudgets(chartData);

        // Compute real Month-over-Month change (current month vs previous month)
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
          } else {
            setMomChange({ percent: 0, isIncrease: false, hasPrevious: false });
          }
        }
      } catch (err) {
        console.error("Failed to fetch past budgets", err);
      } finally {
        if (isMounted) setIsPastBudgetsLoading(false);
      }
    };

    fetchPast6Months();
    return () => { isMounted = false; };
  }, [householdId, budget]);

  // Calculations for categories, totals, pie, area charts
  const { categoryTotals, totalSpent, highestCategory, pieData, areaData, dailySpendMap } = useMemo(() => {
    let total = 0;
    const totals: Record<string, number> = {};
    const dayMap: Record<string, number> = {};

    expenses.forEach((expense) => {
      if (expense.type !== 'income') {
        total += expense.amount;
        totals[expense.categoryId] = (totals[expense.categoryId] || 0) + expense.amount;
        
        const dayStr = format(expense.date.toDate(), 'yyyy-MM-dd');
        dayMap[dayStr] = (dayMap[dayStr] || 0) + expense.amount;
      }
    });

    let maxAmount = 0;
    let maxCat = DEFAULT_CATEGORY_ID;
    for (const [catId, amount] of Object.entries(totals)) {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxCat = catId;
      }
    }

    const pie = Object.entries(totals).map(([id, value]) => ({
      name: categoriesMap.get(id)?.name || 'Other',
      value: value,
      color: categoriesMap.get(id)?.color || '#3a302a'
    })).sort((a, b) => b.value - a.value);

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start, end });

    let cumulative = 0;
    const area = daysInMonth.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const daySpend = dayMap[dayStr] || 0;

      if (day <= now) {
        cumulative += daySpend;
      }
      return {
        date: format(day, 'MMM dd'),
        spent: day <= now ? cumulative : null
      };
    });

    return {
      categoryTotals: totals,
      totalSpent: total,
      highestCategory: categoriesMap.get(maxCat) || categoriesMap.get(DEFAULT_CATEGORY_ID),
      pieData: pie,
      areaData: area,
      dailySpendMap: dayMap
    };
  }, [expenses, categoriesMap]);

  // Dynamic Savings This Month
  const savingsThisMonth = useMemo(() => {
    const incomeFromExpenses = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    const monthlyIncome = budget?.totalIncome || incomeFromExpenses;
    const netSavings = monthlyIncome - totalSpent;
    
    // Savings Rate against Income (or against Budget if income is 0)
    let rate = 0;
    if (monthlyIncome > 0) {
      rate = Math.round((netSavings / monthlyIncome) * 100);
    } else if (budget?.budgetAmount && budget.budgetAmount > 0) {
      rate = Math.round(((budget.budgetAmount - totalSpent) / budget.budgetAmount) * 100);
    }

    const budgetRemaining = (budget?.budgetAmount || 0) - totalSpent;

    return {
      monthlyIncome,
      netSavings,
      savingsRate: rate,
      isSurplus: netSavings >= 0,
      budgetRemaining,
    };
  }, [expenses, budget, totalSpent]);

  // Day of Week Spending Pattern (Peak spending day analysis)
  const dayOfWeekStats = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    expenses.forEach((e) => {
      if (e.type !== 'income') {
        const dayIdx = getDay(e.date.toDate());
        totals[dayIdx] += e.amount;
        counts[dayIdx] += 1;
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
    const currentDay = getDate(now);
    const totalDays = getDaysInMonth(now);
    const daysRemaining = Math.max(totalDays - currentDay + 1, 1);

    const dailyBurn = currentDay > 0 ? totalSpent / currentDay : 0;
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

  // Real Income Statistics
  const incomeMetrics = useMemo(() => {
    const incomeTransactions = expenses.filter(e => e.type === 'income');
    const totalInc = savingsThisMonth.monthlyIncome;
    const avgPerTx = incomeTransactions.length ? totalInc / incomeTransactions.length : totalInc;
    
    const validPastIncomes = pastBudgets.filter(b => b.Income > 0).map(b => b.Income);
    const avgPerMonth = validPastIncomes.length 
      ? validPastIncomes.reduce((a, b) => a + b, 0) / validPastIncomes.length 
      : totalInc;

    return {
      totalIncome: totalInc,
      avgPerTx: avgPerTx || 0,
      avgPerMonth: avgPerMonth || 0,
      count: incomeTransactions.length,
    };
  }, [expenses, savingsThisMonth.monthlyIncome, pastBudgets]);

  // Payment Modes Real Breakdown
  const paymentBreakdown = useMemo(() => {
    const isSpending = paymentModeTab === 'spending';
    const filtered = expenses.filter(e => isSpending ? e.type !== 'income' : e.type === 'income');

    const cashTotal = filtered
      .filter(e => !e.accountId || e.accountId === 'cash' || e.accountId?.includes('cash'))
      .reduce((sum, e) => sum + e.amount, 0);

    const upiTotal = filtered
      .filter(e => e.accountId === 'bank' || e.accountId?.includes('bank') || e.accountId === 'upi')
      .reduce((sum, e) => sum + e.amount, 0);

    const total = cashTotal + upiTotal || 1;

    return {
      cash: cashTotal,
      upi: upiTotal,
      cashPct: Math.round((cashTotal / total) * 100),
      upiPct: Math.round((upiTotal / total) * 100),
    };
  }, [expenses, paymentModeTab]);

  // Pure Mathematical Financial Health Score Engine
  const healthResult = useMemo(() => {
    const now = new Date();
    const currentDay = getDate(now);
    const totalDays = getDaysInMonth(now);

    const dailySpendingArr = Array.from({ length: currentDay }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dStr = format(d, 'yyyy-MM-dd');
      return dailySpendMap[dStr] || 0;
    });

    const prevMonthSpend = pastBudgets.length >= 2 
      ? pastBudgets[pastBudgets.length - 2]?.Expenses || 0 
      : 0;

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
  }, [savingsThisMonth.monthlyIncome, totalSpent, budget, dailySpendMap, pastBudgets, expenses, categoriesMap]);

  // No-Spend Days & Streak Tracker (Tier 2.4)
  const streakStats = useMemo(() => {
    const now = new Date();
    const currentDay = getDate(now);
    let zeroSpendDaysCount = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Check days 1 to currentDay
    for (let day = 1; day <= currentDay; day++) {
      const d = new Date(now.getFullYear(), now.getMonth(), day);
      const dStr = format(d, 'yyyy-MM-dd');
      const spend = dailySpendMap[dStr] || 0;

      if (spend === 0) {
        zeroSpendDaysCount++;
        tempStreak++;
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    // Current active streak: count backwards from today
    for (let day = currentDay; day >= 1; day--) {
      const d = new Date(now.getFullYear(), now.getMonth(), day);
      const dStr = format(d, 'yyyy-MM-dd');
      const spend = dailySpendMap[dStr] || 0;

      if (spend === 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      zeroSpendDaysCount,
      currentStreak,
      maxStreak,
      daysElapsed: currentDay,
    };
  }, [dailySpendMap]);

  // Top 5 Largest Expenses This Month (Tier 2.2)
  const topExpenses = useMemo(() => {
    return expenses
      .filter(e => e.type !== 'income' && !e.isDeleted)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  // Category Comparison MoM (Tier 2.3)
  const categoryMoMComparison = useMemo(() => {
    const prevMonthData = pastBudgets.length >= 2 ? pastBudgets[pastBudgets.length - 2] : null;
    const prevBudgets = prevMonthData?.categoryBudgets || {};

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([catId, currentAmount]) => {
        const cat = categoriesMap.get(catId) || categoriesMap.get(DEFAULT_CATEGORY_ID);
        const prevAmount = prevBudgets[catId] || 0;
        const diff = currentAmount - prevAmount;
        const pctChange = prevAmount > 0 ? (diff / prevAmount) * 100 : null;

        return {
          catId,
          name: cat?.name || 'Other',
          icon: cat?.icon,
          color: cat?.color || '#3a302a',
          currentAmount,
          prevAmount,
          diff,
          pctChange,
        };
      });
  }, [categoryTotals, pastBudgets, categoriesMap]);

  return (
    <div className="w-full">
      <main className="flex-1 w-full px-4 sm:px-6 pt-8 pb-32 md:pb-12 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <TextEffect as="h1" preset="fade" className="font-display text-4xl md:text-5xl font-medium leading-none tracking-tight text-theme-primary mb-2">
              Analytics
            </TextEffect>
            <TextEffect as="p" preset="fade" className="text-[17px] text-theme-secondary max-w-2xl">
              Authentic financial insights, mathematical health diagnostics, and behavioral patterns.
            </TextEffect>
          </div>

          {/* Month-over-Month Quick Badge */}
          {momChange.hasPrevious && (
            <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-sm font-semibold backdrop-blur-md self-start sm:self-auto ${
              momChange.isIncrease 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}>
              {momChange.isIncrease ? (
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>{momChange.percent}% spend {momChange.isIncrease ? 'higher' : 'lower'} than last month</span>
            </div>
          )}
        </div>

        {/* SECTION 1: Pure Mathematical Financial Health Score Card (Deterministic, No AI) */}
        <div className="mb-12">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 relative overflow-hidden">
            <div 
              className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40 transition-all duration-700" 
              style={{ backgroundColor: healthResult.color }} 
            />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              
              {/* Score Dial & Tier */}
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-theme-border/40"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={healthResult.color}
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * healthResult.score) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-theme-primary">
                      {healthResult.score}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-theme-tertiary tracking-wider">
                      Health Score
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                      style={{ 
                        color: healthResult.color, 
                        borderColor: `${healthResult.color}40`,
                        backgroundColor: healthResult.bgLight 
                      }}
                    >
                      Grade {healthResult.grade} • {healthResult.tier}
                    </span>
                    <span className="text-[11px] text-theme-tertiary flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Calculus Model
                    </span>
                  </div>
                  <h2 className="font-headline text-2xl sm:text-3xl font-bold text-theme-primary">
                    Financial Health Index
                  </h2>
                  <p className="text-xs sm:text-sm text-theme-secondary max-w-md">
                    {healthResult.recommendation}
                  </p>
                  <button
                    onClick={() => setShowHealthModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-accent hover:underline pt-1"
                  >
                    <span>Inspect mathematical breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 5 Variable Sub-Scores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-w-[300px] lg:max-w-lg w-full">
                {Object.entries(healthResult.metrics).map(([key, m]) => (
                  <div key={key} className="p-3 rounded-2xl bg-theme-surface/50 border border-theme-border/30">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-semibold text-theme-secondary truncate max-w-[90px]">
                        {m.name}
                      </span>
                      <span className="text-[11px] font-bold text-theme-primary">
                        {m.score}/{m.maxScore}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-theme-elevated rounded-full overflow-hidden mb-1">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ 
                          width: `${(m.score / m.maxScore) * 100}%`,
                          backgroundColor: m.status === 'optimal' ? '#10b981' : m.status === 'moderate' ? '#f59e0b' : '#ef4444'
                        }} 
                      />
                    </div>
                    <span className="text-[10px] text-theme-tertiary block truncate">
                      {m.metricValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Carousel */}
        <div className="mb-12">
          <Carousel className="w-full">
            <CarouselContent className="px-2">
              
              {/* Slide 1: Total Spent with MoM Trend */}
              <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3 pr-4">
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 h-72 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-theme-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <span className="font-medium text-theme-secondary uppercase tracking-widest text-xs">Total Spent</span>
                    {momChange.hasPrevious && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        momChange.isIncrease ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'
                      }`}>
                        {momChange.isIncrease ? `+${momChange.percent}% MoM` : `-${momChange.percent}% MoM`}
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 flex flex-col justify-end">
                    <h2 className="font-display text-4xl sm:text-5xl text-theme-primary flex items-baseline">
                      {CURRENCY_SYMBOL}<AnimatedNumber value={Math.floor(totalSpent)} />
                      <span className="text-xl sm:text-2xl text-theme-tertiary">
                        {(totalSpent % 1 !== 0) ? (totalSpent % 1).toFixed(2).substring(1) : '.00'}
                      </span>
                    </h2>
                    <p className="text-xs text-theme-secondary mt-2 flex items-center gap-1.5">
                      <span>Across {expenses.filter(e => e.type !== 'income').length} expense transactions</span>
                    </p>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 2: Category Donut Chart */}
              <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3 pr-4">
                <div className="glass-panel p-6 rounded-3xl border border-theme-border/30 h-72 flex flex-col relative overflow-hidden group">
                  <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-theme-danger/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                  <div className="flex justify-between items-center mb-1 z-10 relative">
                    <span className="font-medium text-theme-secondary uppercase tracking-widest text-xs">Category Split</span>
                    <span className="text-xs text-theme-tertiary">Top: {highestCategory?.name}</span>
                  </div>
                  <div className="relative z-10 flex-1 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData.length > 0 ? pieData : [{ name: 'No Expenses Yet', value: 100, color: '#e2dbce' }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={pieData.length > 0 ? 5 : 0}
                          dataKey="value"
                          stroke="none"
                        >
                          {(pieData.length > 0 ? pieData : [{ name: 'No Expenses Yet', value: 100, color: '#e2dbce' }]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} opacity={pieData.length > 0 ? 1 : 0.4} />
                          ))}
                        </Pie>
                        {pieData.length > 0 && (
                          <Tooltip 
                            formatter={(value: any) => `${CURRENCY_SYMBOL}${Number(value).toFixed(2)}`}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--theme-surface)' }}
                          />
                        )}
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 3: Cumulative Spend Trend */}
              <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3 pr-4">
                <div className="glass-panel p-6 rounded-3xl border border-theme-border/30 h-72 flex flex-col relative overflow-hidden group">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#10b981]/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                  <div className="flex justify-between items-center mb-2 z-10 relative">
                    <span className="font-medium text-theme-secondary uppercase tracking-widest text-xs">Cumulative Spend</span>
                    <span className="text-xs text-[#10b981] font-semibold bg-[#10b981]/10 px-2 py-0.5 rounded-md">
                      {((totalSpent / (budget?.budgetAmount || 1)) * 100).toFixed(0)}% budget used
                    </span>
                  </div>
                  <div className="relative z-10 flex-1 w-full h-full -ml-4">
                    {areaData.some(d => d.spent !== null && d.spent > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={areaData}>
                          <defs>
                            <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            formatter={(value: any) => `${CURRENCY_SYMBOL}${Number(value).toFixed(2)}`}
                            labelStyle={{ color: 'var(--theme-primary)', fontWeight: 600 }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--theme-surface)' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="spent" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorSpent)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-theme-tertiary ml-4 text-sm">No expenses this month</div>
                    )}
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 4: Real 6-Month Historical Comparison */}
              <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3 pr-4">
                <div className="glass-panel p-6 rounded-3xl border border-theme-border/30 h-72 flex flex-col relative overflow-hidden group">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                  <div className="flex justify-between items-center mb-1 z-10 relative">
                    <span className="font-medium text-theme-secondary uppercase tracking-widest text-xs">6-Month Trend</span>
                    <div className="flex items-center gap-2 text-[10px] text-theme-secondary">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Spent</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Income</span>
                    </div>
                  </div>
                  <div className="relative z-10 flex-1 w-full h-full -ml-4">
                    {isPastBudgetsLoading ? (
                      <div className="flex items-center justify-center h-full text-theme-tertiary ml-4 text-xs">Loading authentic records...</div>
                    ) : pastBudgets.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pastBudgets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8f8881' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8f8881' }} tickFormatter={(val) => `${CURRENCY_SYMBOL}${val}`} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--theme-surface)' }}
                            itemStyle={{ fontWeight: 600 }}
                          />
                          <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                          <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-theme-tertiary ml-4 text-sm">No historical data found</div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselNavigation className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between -ml-4 -mr-4" />
            <CarouselIndicator className="mt-6 relative bottom-0" />
          </Carousel>
        </div>

        {/* SECTION 2: Savings This Month & 6-Month Savings Trajectory (Tier 2.1) */}
        <div className="mb-12 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 relative overflow-hidden">
            <div className={`absolute -right-12 -bottom-12 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
              savingsThisMonth.isSurplus ? 'bg-emerald-500/15' : 'bg-rose-500/15'
            }`} />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-theme-accent/10 text-theme-accent flex items-center justify-center">
                    <PiggyBank className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <h3 className="font-headline text-xl sm:text-2xl font-bold text-theme-primary">
                    Savings This Month
                  </h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    savingsThisMonth.isSurplus 
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-rose-500/15 text-rose-500 border border-rose-500/20'
                  }`}>
                    {savingsThisMonth.isSurplus ? 'Net Surplus Added' : 'Reserve Deficit'}
                  </span>
                </div>
                <p className="text-sm text-theme-secondary max-w-xl">
                  {savingsThisMonth.isSurplus 
                    ? `Great job! You have preserved ${savingsThisMonth.savingsRate}% of your funds this month. Your liquid reserves grow when income exceeds spend.`
                    : `Your expenses exceeded income by ${CURRENCY_SYMBOL}${Math.abs(savingsThisMonth.netSavings).toFixed(2)} this month, funded from accumulated reserves.`}
                </p>
              </div>

              {/* Net Saved Highlight */}
              <div className="flex items-baseline gap-3 bg-theme-surface/60 p-4 sm:p-5 rounded-2xl border border-theme-border/40 backdrop-blur-md">
                <div>
                  <span className="text-xs uppercase tracking-wider text-theme-tertiary block font-semibold mb-1">
                    Net Saved This Month
                  </span>
                  <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                    savingsThisMonth.isSurplus ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {savingsThisMonth.isSurplus ? '+' : '-'}{CURRENCY_SYMBOL}{Math.abs(savingsThisMonth.netSavings).toFixed(2)}
                  </div>
                </div>
                <div className="text-right pl-4 border-l border-theme-border/30">
                  <span className="text-xs text-theme-tertiary block font-semibold mb-1">Savings Rate</span>
                  <span className={`text-2xl font-bold ${
                    savingsThisMonth.isSurplus ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {savingsThisMonth.savingsRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Inflow vs Outflow Mini Bar */}
            <div className="mt-8 pt-6 border-t border-theme-border/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl bg-theme-surface/40 border border-theme-border/30">
                <span className="text-xs text-theme-secondary block mb-1">Total Month Inflow (Income)</span>
                <span className="text-xl font-bold text-emerald-500">{CURRENCY_SYMBOL}{savingsThisMonth.monthlyIncome.toFixed(2)}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-theme-surface/40 border border-theme-border/30">
                <span className="text-xs text-theme-secondary block mb-1">Total Month Outflow (Spent)</span>
                <span className="text-xl font-bold text-theme-primary">{CURRENCY_SYMBOL}{totalSpent.toFixed(2)}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-theme-surface/40 border border-theme-border/30">
                <span className="text-xs text-theme-secondary block mb-1">Remaining Planned Budget</span>
                <span className={`text-xl font-bold ${savingsThisMonth.budgetRemaining >= 0 ? 'text-theme-primary' : 'text-rose-500'}`}>
                  {CURRENCY_SYMBOL}{savingsThisMonth.budgetRemaining.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 6-Month Savings Trajectory Area Chart (Tier 2.1) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h4 className="font-headline text-lg sm:text-xl font-bold text-theme-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  6-Month Net Savings Trajectory
                </h4>
                <p className="text-xs text-theme-secondary">
                  Chronological progression of retained liquid savings (Income - Expenses) across past semesters
                </p>
              </div>
              <span className="text-xs text-theme-tertiary">
                Zero Baseline represents Breakeven
              </span>
            </div>

            <div className="h-56 w-full -ml-4">
              {pastBudgets.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pastBudgets} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="savingsPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8f8881' }} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#8f8881' }} 
                      tickFormatter={(val) => `${CURRENCY_SYMBOL}${val}`} 
                    />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                    <Tooltip 
                      formatter={(val: any) => [`${CURRENCY_SYMBOL}${Number(val).toFixed(2)}`, 'Net Saved']}
                      contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--theme-surface)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="NetSavings" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fill="url(#savingsPositive)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-theme-tertiary">
                  No multi-month records available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: No-Spend Streak & Habit Tracker (Tier 2.4) */}
        <div className="mb-12">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                    <Flame className="w-4 h-4 fill-amber-500" />
                  </div>
                  <h3 className="font-headline text-xl sm:text-2xl font-bold text-theme-primary">
                    Zero-Spend Habit Tracker
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-theme-secondary max-w-xl">
                  Discipline builds financial independence. Track intentional zero-spend days where you resisted unbudgeted impulse purchases.
                </p>
              </div>

              {/* Streak Stat Badges */}
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme-border/40 text-center min-w-[110px]">
                  <span className="text-[11px] font-semibold text-theme-tertiary uppercase block">
                    Current Streak
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5 fill-amber-500" />
                    <span>{streakStats.currentStreak}d</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme-border/40 text-center min-w-[110px]">
                  <span className="text-[11px] font-semibold text-theme-tertiary uppercase block">
                    Zero Days
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500">
                    {streakStats.zeroSpendDaysCount} <span className="text-xs font-normal text-theme-tertiary">/ {streakStats.daysElapsed}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme-border/40 text-center min-w-[110px]">
                  <span className="text-[11px] font-semibold text-theme-tertiary uppercase block">
                    Best Streak
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-theme-primary flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>{streakStats.maxStreak}d</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Day Dots Visualization */}
            <div className="mt-8 pt-6 border-t border-theme-border/20">
              <span className="text-xs font-semibold text-theme-secondary block mb-3">
                Month Calendar Progress ({streakStats.daysElapsed} days elapsed)
              </span>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: streakStats.daysElapsed }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const now = new Date();
                  const d = new Date(now.getFullYear(), now.getMonth(), dayNum);
                  const dStr = format(d, 'yyyy-MM-dd');
                  const spent = dailySpendMap[dStr] || 0;
                  const isZero = spent === 0;

                  return (
                    <div 
                      key={dayNum}
                      title={`Day ${dayNum}: ${isZero ? 'No expenses (Zero spend!)' : `${CURRENCY_SYMBOL}${spent.toFixed(2)}`}`}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-[11px] font-bold transition-transform hover:scale-110 cursor-pointer ${
                        isZero 
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                          : 'bg-theme-elevated text-theme-secondary border border-theme-border/20'
                      }`}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Top 5 Largest Expenses & Category Comparison (Tiers 2.2 & 2.3) */}
        <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top 5 Largest Expenses (Tier 2.2) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-headline text-lg sm:text-xl font-bold text-theme-primary flex items-center gap-2">
                    <Activity className="w-5 h-5 text-rose-500" />
                    Top 5 Outflows This Month
                  </h3>
                  <p className="text-xs text-theme-secondary">High-ticket items dominating your expenditure</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 font-semibold">
                  Ranked
                </span>
              </div>

              {topExpenses.length > 0 ? (
                <div className="space-y-3">
                  {topExpenses.map((expense, idx) => {
                    const cat = categoriesMap.get(expense.categoryId) || categoriesMap.get(DEFAULT_CATEGORY_ID);
                    const pctOfTotal = totalSpent > 0 ? ((expense.amount / totalSpent) * 100).toFixed(1) : '0';

                    return (
                      <div 
                        key={expense.id || idx}
                        className="p-3.5 rounded-2xl bg-theme-surface/50 border border-theme-border/30 flex items-center justify-between hover:bg-theme-surface/80 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-theme-elevated text-theme-secondary text-xs font-bold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div 
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                            style={{ backgroundColor: cat?.color || '#3a302a' }}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {getMaterialIcon(cat?.icon)}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-theme-primary block truncate max-w-[140px] sm:max-w-[180px]">
                              {expense.note || cat?.name || 'Expense'}
                            </span>
                            <span className="text-[11px] text-theme-tertiary">
                              {format(expense.date.toDate(), 'MMM dd, yyyy')} • {pctOfTotal}% of spend
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-theme-primary text-base block">
                            {CURRENCY_SYMBOL}{expense.amount.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-theme-secondary">
                            {cat?.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-theme-tertiary text-sm">
                  No expense records logged for this billing period yet.
                </div>
              )}
            </div>

            <p className="text-xs text-theme-tertiary mt-4 pt-3 border-t border-theme-border/20">
              Identifying large outlier transactions is the fastest lever to curbing budget creep.
            </p>
          </div>

          {/* Category Comparison MoM (Tier 2.3) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-headline text-lg sm:text-xl font-bold text-theme-primary flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    Category Trajectory (MoM)
                  </h3>
                  <p className="text-xs text-theme-secondary">Comparative shift across top spending categories</p>
                </div>
                <span className="text-xs text-theme-tertiary">
                  Current vs Last Month
                </span>
              </div>

              {categoryMoMComparison.length > 0 ? (
                <div className="space-y-4">
                  {categoryMoMComparison.map((item) => (
                    <div key={item.catId} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <span className="font-semibold text-theme-primary">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-theme-primary">
                            {CURRENCY_SYMBOL}{item.currentAmount.toFixed(0)}
                          </span>
                          {item.pctChange !== null && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              item.diff > 0 
                                ? 'bg-rose-500/10 text-rose-500' 
                                : 'bg-emerald-500/10 text-emerald-500'
                            }`}>
                              {item.diff > 0 ? `+${item.pctChange.toFixed(0)}%` : `${item.pctChange.toFixed(0)}%`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Comparison Bar */}
                      <div className="w-full h-2 bg-theme-elevated rounded-full overflow-hidden flex">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, totalSpent > 0 ? (item.currentAmount / totalSpent) * 100 : 0)}%`,
                            backgroundColor: item.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-theme-tertiary text-sm">
                  No category comparison data available yet.
                </div>
              )}
            </div>

            <p className="text-xs text-theme-tertiary mt-4 pt-3 border-t border-theme-border/20">
              Green badges indicate spending contractions compared to last month; red shows expansion.
            </p>
          </div>
        </div>

        {/* SECTION 5: Student Financial Goals (Tier 5.2 - Requested by User) */}
        <div className="mb-12">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-headline text-xl sm:text-2xl font-bold text-theme-primary flex items-center gap-2">
                  <Target className="w-6 h-6 text-theme-accent" />
                  Financial Goals & Milestones
                </h3>
                <p className="text-xs sm:text-sm text-theme-secondary">
                  Targeted student savings funds (Semester fees, Laptop, Emergency buffer)
                </p>
              </div>

              <button
                onClick={() => setShowAddGoalModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-theme-accent text-white font-semibold text-xs hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Goal</span>
              </button>
            </div>

            {goals && goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / Math.max(g.targetAmount, 1)) * 100));
                  const remaining = Math.max(0, g.targetAmount - g.currentAmount);

                  return (
                    <div 
                      key={g.id}
                      className="p-5 rounded-2xl bg-theme-surface/60 border border-theme-border/40 flex flex-col justify-between hover:border-theme-accent/40 transition-all group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-theme-accent/10 text-theme-accent flex items-center justify-center font-bold">
                              <Target className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-headline font-bold text-base text-theme-primary">{g.name}</h4>
                              <span className="text-[11px] text-theme-tertiary">
                                {g.isCompleted ? 'Goal Achieved! 🎉' : `${CURRENCY_SYMBOL}${remaining.toFixed(0)} remaining`}
                              </span>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            g.isCompleted ? 'bg-emerald-500/15 text-emerald-500' : 'bg-theme-accent/15 text-theme-accent'
                          }`}>
                            {pct}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-theme-elevated rounded-full overflow-hidden my-3">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              g.isCompleted ? 'bg-emerald-500' : 'bg-theme-accent'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-baseline text-xs text-theme-secondary">
                          <span>Saved: {CURRENCY_SYMBOL}{g.currentAmount.toFixed(0)}</span>
                          <span className="font-semibold text-theme-primary">Target: {CURRENCY_SYMBOL}{g.targetAmount.toFixed(0)}</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-theme-border/20 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setContributeGoalId(g.id);
                            setContributeAmount('');
                          }}
                          className="text-xs font-semibold text-theme-accent bg-theme-accent/10 px-3.5 py-1.5 rounded-xl hover:bg-theme-accent/20 active:scale-95 transition-all"
                        >
                          + Contribute Funds
                        </button>
                        {g.isCompleted && (
                          <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-theme-surface/40 border border-theme-border/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-theme-accent/10 text-theme-accent mx-auto flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h4 className="font-headline text-lg font-bold text-theme-primary">Set Your First Student Savings Goal</h4>
                <p className="text-xs text-theme-secondary max-w-sm mx-auto">
                  Whether saving for textbook supplies, exam certifications, or next semester’s rent deposit, set milestone targets to stay motivated.
                </p>
                <button
                  onClick={() => setShowAddGoalModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-accent text-white font-semibold text-xs hover:opacity-90 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Goal</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: Behavioral Patterns (Day of Week & Velocity) */}
        <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Day of Week Pattern */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-headline text-lg sm:text-xl text-theme-primary font-bold">
                      Day-of-Week Spending
                    </h3>
                    <p className="text-xs text-theme-secondary">Identify peak college and outing spend days</p>
                  </div>
                </div>
                {dayOfWeekStats.peakAmount > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold border border-indigo-500/20">
                    Peak: {dayOfWeekStats.peakDay}
                  </span>
                )}
              </div>

              {/* Bar Chart for Day of Week */}
              <div className="h-44 w-full mt-4 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekStats.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8f8881' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8f8881' }} tickFormatter={(val) => `${CURRENCY_SYMBOL}${val}`} />
                    <Tooltip 
                      formatter={(val: any) => [`${CURRENCY_SYMBOL}${Number(val).toFixed(2)}`, 'Spent']}
                      contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--theme-surface)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar 
                      dataKey="spend" 
                      radius={[4, 4, 0, 0]} 
                      fill="var(--theme-accent)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <p className="text-xs text-theme-tertiary mt-4 pt-3 border-t border-theme-border/20">
              {dayOfWeekStats.peakAmount > 0 
                ? `You spend the most on ${dayOfWeekStats.peakDay}s (${CURRENCY_SYMBOL}${dayOfWeekStats.peakAmount.toFixed(0)} total). Plan ahead for weekend spikes!`
                : 'No transaction patterns recorded for this month yet.'}
            </p>
          </div>

          {/* Daily Burn Rate & Runway */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline text-lg sm:text-xl text-theme-primary font-bold">
                    Spending Velocity & Runway
                  </h3>
                  <p className="text-xs text-theme-secondary">{velocityStats.daysRemaining} days remaining in this billing month</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-theme-surface/50 border border-theme-border/40">
                  <span className="text-xs text-theme-secondary block mb-1">Average Daily Burn</span>
                  <p className="text-2xl font-bold text-theme-primary">
                    {CURRENCY_SYMBOL}{velocityStats.dailyBurn} <span className="text-xs font-normal text-theme-tertiary">/ day</span>
                  </p>
                  <p className="text-[11px] text-theme-tertiary mt-1">Based on days elapsed</p>
                </div>

                <div className="p-4 rounded-2xl bg-theme-surface/50 border border-theme-border/40">
                  <span className="text-xs text-theme-secondary block mb-1">Safe Daily Allowance</span>
                  <p className={`text-2xl font-bold ${velocityStats.safeDailyAllowance > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {CURRENCY_SYMBOL}{velocityStats.safeDailyAllowance} <span className="text-xs font-normal text-theme-tertiary">/ day</span>
                  </p>
                  <p className="text-[11px] text-theme-tertiary mt-1">To stay within budget</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-theme-elevated/40 border border-theme-border/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-theme-secondary block">Projected Month-End Spend</span>
                <span className="text-lg font-bold text-theme-primary">{CURRENCY_SYMBOL}{velocityStats.projectedMonthEnd}</span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                velocityStats.projectedMonthEnd <= (budget?.budgetAmount || 0)
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}>
                {velocityStats.projectedMonthEnd <= (budget?.budgetAmount || 0) ? 'Within Budget' : 'Exceeds Budget'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 7: Payment Modes & Financial Averages */}
        <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Payment Modes */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-xl text-theme-primary font-bold">Payment Modes</h3>
              
              {/* Tab Selector */}
              <div className="flex bg-theme-elevated/60 p-1 rounded-xl">
                <button 
                  onClick={() => setPaymentModeTab('spending')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    paymentModeTab === 'spending' 
                      ? 'bg-theme-surface text-theme-primary shadow-sm' 
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  Spending
                </button>
                <button 
                  onClick={() => setPaymentModeTab('income')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    paymentModeTab === 'income' 
                      ? 'bg-theme-surface text-theme-primary shadow-sm' 
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* UPI */}
              <div className="bg-theme-surface p-4 rounded-2xl border border-theme-border/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-theme-primary text-sm block">UPI / Bank</span>
                      <span className="text-xs text-theme-tertiary">{paymentBreakdown.upiPct}% of {paymentModeTab}</span>
                    </div>
                  </div>
                  <span className="font-bold text-theme-primary text-base">
                    {CURRENCY_SYMBOL}{paymentBreakdown.upi.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-theme-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${paymentBreakdown.upiPct}%` }} />
                </div>
              </div>

              {/* Cash */}
              <div className="bg-theme-surface p-4 rounded-2xl border border-theme-border/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-theme-primary text-sm block">Physical Cash</span>
                      <span className="text-xs text-theme-tertiary">{paymentBreakdown.cashPct}% of {paymentModeTab}</span>
                    </div>
                  </div>
                  <span className="font-bold text-theme-primary text-base">
                    {CURRENCY_SYMBOL}{paymentBreakdown.cash.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-theme-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paymentBreakdown.cashPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Authentic Financial Averages */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30">
            <h3 className="font-headline text-xl text-theme-primary font-bold mb-6">Financial Averages</h3>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Spending Stats */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-theme-danger uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Average Spending
                </h4>
                <div>
                  <p className="text-xs text-theme-secondary mb-1">Per month (Current)</p>
                  <p className="text-xl sm:text-2xl font-bold text-theme-primary">
                    {CURRENCY_SYMBOL}{(totalSpent || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-theme-secondary mb-1">Per transaction</p>
                  <p className="text-xl sm:text-2xl font-bold text-theme-primary">
                    {CURRENCY_SYMBOL}{expenses.filter(e => e.type !== 'income').length ? (totalSpent / expenses.filter(e => e.type !== 'income').length).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>

              {/* Real Income Stats */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Average Income
                </h4>
                <div>
                  <p className="text-xs text-theme-secondary mb-1">Per month</p>
                  <p className="text-xl sm:text-2xl font-bold text-theme-primary">
                    {CURRENCY_SYMBOL}{incomeMetrics.avgPerMonth.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-theme-secondary mb-1">Per transaction</p>
                  <p className="text-xl sm:text-2xl font-bold text-theme-primary">
                    {CURRENCY_SYMBOL}{incomeMetrics.avgPerTx.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 8: Category Breakdown Accordion with Budget Limits */}
        <div className="mb-16">
          <h3 className="font-headline text-2xl text-theme-primary mb-6 border-b border-theme-border/30 pb-4 font-bold">
            Category Breakdown & Budget Limits
          </h3>
          <Accordion
            className="flex w-full flex-col divide-y divide-theme-border/30"
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            variants={{
              expanded: { opacity: 1, scale: 1 },
              collapsed: { opacity: 0, scale: 0.95 },
            }}
          >
            {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([categoryId, amount]) => {
              const cat = categoriesMap.get(categoryId) || categoriesMap.get(DEFAULT_CATEGORY_ID);
              const percentage = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : '0';
              const categoryLimit = budget?.categoryBudgets?.[categoryId];
              const categoryLimitPercent = categoryLimit ? ((amount / categoryLimit) * 100).toFixed(1) : null;
              const isOverLimit = categoryLimit && amount > categoryLimit;

              return (
                <AccordionItem key={categoryId} value={categoryId} className="py-4">
                  <AccordionTrigger className="w-full text-left focus:outline-none">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-theme-surface flex items-center justify-center shrink-0" style={{ color: cat?.color }}>
                          <span className="material-symbols-outlined">{getMaterialIcon(cat?.icon)}</span>
                        </div>
                        <span className="font-medium text-base sm:text-lg text-theme-primary">{cat?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-semibold text-theme-primary text-base sm:text-lg">
                          {CURRENCY_SYMBOL}{amount.toFixed(2)}
                        </span>
                        <span className="text-xs text-theme-secondary">{percentage}% of total spend</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex flex-col gap-4 flex-1">
                        
                        {/* Total Spend Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-theme-secondary mb-1">
                            <span>Share of Total Monthly Spend</span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-theme-elevated rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: cat?.color }} />
                          </div>
                        </div>

                        {/* Category Limit Progress Bar */}
                        {categoryLimit && (
                          <div>
                            <div className="flex justify-between text-xs text-theme-secondary mb-1">
                              <span>Cap Limit ({CURRENCY_SYMBOL}{categoryLimit})</span>
                              <span className={isOverLimit ? 'text-theme-danger font-medium' : ''}>{categoryLimitPercent}% used</span>
                            </div>
                            <div className="w-full h-1.5 bg-theme-elevated rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${isOverLimit ? 'bg-theme-danger' : 'bg-theme-accent'}`} style={{ width: `${Math.min(Number(categoryLimitPercent), 100)}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-theme-surface/50 rounded-2xl p-4 border border-theme-border/30 self-start md:self-auto min-w-[240px]">
                        {editingLimit === categoryId ? (
                          <div className="flex items-center gap-2">
                            <span className="text-theme-secondary font-bold">{CURRENCY_SYMBOL}</span>
                            <input 
                              type="number" 
                              value={limitInput}
                              onChange={(e) => setLimitInput(e.target.value)}
                              className="bg-transparent w-24 text-theme-primary font-medium outline-none border-b border-theme-accent focus:border-b-2 text-sm"
                              placeholder="Limit"
                              autoFocus
                            />
                            <button 
                              className="text-theme-accent hover:opacity-80 active:scale-[0.98] transition-transform text-xs font-semibold px-2 py-1 bg-theme-accent/10 rounded-lg ml-2"
                              onClick={async () => {
                                if (!householdId || !selectedMonth) return;
                                const newLimit = Number(limitInput);
                                if (isNaN(newLimit) || newLimit < 0) return;
                                
                                setCategoryBudgetOptimistic(categoryId, newLimit);
                                setEditingLimit(null);
                                
                                try {
                                  await setDoc(budgetDocRef(householdId, selectedMonth), {
                                    categoryBudgets: {
                                      [categoryId]: newLimit
                                    }
                                  }, { merge: true });
                                  addToast({ type: 'success', message: `${cat?.name} limit updated!` });
                                } catch (error) {
                                  console.error("Failed to update limit:", error);
                                  addToast({ type: 'error', message: "Failed to save limit." });
                                }
                              }}
                            >
                              Save
                            </button>
                            <button 
                              className="text-theme-secondary hover:opacity-80 active:scale-[0.98] transition-transform text-xs ml-1"
                              onClick={() => setEditingLimit(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <div className="text-xs">
                              <span className="text-theme-secondary">Limit: </span>
                              <span className="text-theme-primary font-semibold">
                                {budget?.categoryBudgets?.[categoryId] ? `${CURRENCY_SYMBOL}${budget.categoryBudgets[categoryId]}` : 'None'}
                              </span>
                            </div>
                            <button 
                              className="text-xs font-semibold text-theme-accent bg-theme-accent/10 px-3 py-1.5 rounded-lg hover:bg-theme-accent/20 active:scale-[0.98] transition-all"
                              onClick={() => {
                                setLimitInput(budget?.categoryBudgets?.[categoryId]?.toString() || '');
                                setEditingLimit(categoryId);
                              }}
                            >
                              {budget?.categoryBudgets?.[categoryId] ? 'Edit Limit' : 'Set Limit'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* MODAL 1: Pure Mathematical Calculus Inspector Modal */}
        {showHealthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-theme-surface w-full max-w-2xl rounded-3xl border border-theme-border/40 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                      style={{ 
                        color: healthResult.color, 
                        borderColor: `${healthResult.color}40`,
                        backgroundColor: healthResult.bgLight 
                      }}
                    >
                      {healthResult.tier} (Grade {healthResult.grade})
                    </span>
                    <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Deterministic Math
                    </span>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-theme-primary">
                    Financial Health Calculus Formulation
                  </h3>
                  <p className="text-xs text-theme-secondary">
                    Composite score of {healthResult.score}/100 derived via multi-variable quantitative metrics (zero external AI).
                  </p>
                </div>
                <button
                  onClick={() => setShowHealthModal(false)}
                  className="p-2 rounded-xl text-theme-secondary hover:bg-theme-elevated transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Mathematical Metrics List */}
              <div className="space-y-4">
                {Object.entries(healthResult.metrics).map(([key, m]) => (
                  <div key={key} className="p-4 rounded-2xl bg-theme-elevated/40 border border-theme-border/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-theme-primary">{m.name}</span>
                        <code className="text-[11px] px-2 py-0.5 rounded bg-theme-surface font-mono text-theme-secondary">
                          {m.formula}
                        </code>
                      </div>
                      <span className="text-sm font-extrabold" style={{ color: healthResult.color }}>
                        {m.score} / {m.maxScore} pts
                      </span>
                    </div>
                    <p className="text-xs text-theme-secondary">{m.explanation}</p>
                    <div className="text-[11px] font-semibold text-theme-primary">
                      Evaluated value: <span className="text-theme-accent">{m.metricValue}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantitative Synthesis Diagnosis */}
              <div className="p-4 rounded-2xl bg-theme-accent/10 border border-theme-accent/20">
                <span className="text-xs font-bold text-theme-accent uppercase tracking-wider block mb-1">
                  Algorithmic Diagnosis & Advisory
                </span>
                <p className="text-xs sm:text-sm text-theme-primary font-medium">
                  {healthResult.recommendation}
                </p>
              </div>

              <button
                onClick={() => setShowHealthModal(false)}
                className="w-full py-3 rounded-2xl bg-theme-accent text-white font-semibold text-sm hover:opacity-95 active:scale-98 transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}

        {/* MODAL 2: Create New Student Goal Modal */}
        {showAddGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-theme-surface w-full max-w-md rounded-3xl border border-theme-border/40 p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-headline text-xl font-bold text-theme-primary">Create Savings Goal</h3>
                <button
                  onClick={() => setShowAddGoalModal(false)}
                  className="p-1.5 rounded-xl text-theme-secondary hover:bg-theme-elevated"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-theme-secondary block mb-1">Goal Name</label>
                  <input
                    type="text"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    placeholder="e.g. Laptop Fund, Semester Fees"
                    className="w-full px-4 py-2.5 rounded-xl bg-theme-elevated/60 border border-theme-border/40 text-theme-primary text-sm outline-none focus:border-theme-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-secondary block mb-1">Target Amount ({CURRENCY_SYMBOL})</label>
                  <input
                    type="number"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-4 py-2.5 rounded-xl bg-theme-elevated/60 border border-theme-border/40 text-theme-primary text-sm outline-none focus:border-theme-accent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddGoalModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-theme-elevated text-theme-secondary text-sm font-semibold hover:opacity-90"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const target = Number(newGoalTarget);
                    if (!newGoalName.trim() || isNaN(target) || target <= 0) {
                      addToast({ type: 'error', message: 'Please enter a valid goal name and amount.' });
                      return;
                    }
                    await addGoal({
                      name: newGoalName.trim(),
                      targetAmount: target,
                      currentAmount: 0,
                      isCompleted: false,
                      createdBy: householdId || '',
                    });
                    setNewGoalName('');
                    setNewGoalTarget('');
                    setShowAddGoalModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-theme-accent text-white text-sm font-semibold hover:opacity-95 active:scale-95 transition-all"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: Contribute Funds to Goal Modal */}
        {contributeGoalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-theme-surface w-full max-w-sm rounded-3xl border border-theme-border/40 p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-headline text-lg font-bold text-theme-primary">Contribute to Goal</h3>
                <button
                  onClick={() => setContributeGoalId(null)}
                  className="p-1.5 rounded-xl text-theme-secondary hover:bg-theme-elevated"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-theme-secondary block mb-1">
                  Amount to allocate ({CURRENCY_SYMBOL})
                </label>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="e.g. 500"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl bg-theme-elevated/60 border border-theme-border/40 text-theme-primary text-sm outline-none focus:border-theme-accent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setContributeGoalId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-theme-elevated text-theme-secondary text-sm font-semibold hover:opacity-90"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const amt = Number(contributeAmount);
                    if (isNaN(amt) || amt <= 0) {
                      addToast({ type: 'error', message: 'Enter a valid positive amount.' });
                      return;
                    }
                    await contributeToGoal(contributeGoalId, amt);
                    setContributeGoalId(null);
                    setContributeAmount('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-theme-accent text-white text-sm font-semibold hover:opacity-95 active:scale-95 transition-all"
                >
                  Allocate
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
