/**
 * ==============================================================================
 * SpendWise Financial Health Score Engine
 * Pure Mathematics & Calculus Algorithm (Zero AI / Zero External API Dependencies)
 * ==============================================================================
 *
 * Models a user's financial health via a rigorous multi-variable mathematical
 * formulation incorporating:
 *  1. S_savings     : Logistic Surplus Saturation function (25 pts)
 *  2. S_burn        : Temporal Integral Pacing Velocity Derivative (25 pts)
 *  3. S_volatility  : Coefficient of Variation / Statistical Dispersion (20 pts)
 *  4. S_allocation  : Essential vs Discretionary Allocation Ratio (15 pts)
 *  5. S_momentum    : Month-over-Month First Discrete Difference (15 pts)
 *
 * Total Score S = round(sum(S_i)) in [0, 100]
 */

export interface FinancialHealthInputs {
  monthlyIncome: number;
  totalSpent: number;
  budgetAmount: number;
  dailySpending: number[]; // non-income spend per day elapsed
  daysElapsed: number;
  totalDaysInMonth: number;
  expenses: { amount: number; categoryId: string; type?: string }[];
  categoriesMap: Map<string, { name: string; isDefault?: boolean }>;
  prevMonthSpent?: number;
}

export interface MetricBreakdown {
  name: string;
  score: number;
  maxScore: number;
  weightPct: number;
  formula: string;
  metricValue: string;
  status: 'optimal' | 'moderate' | 'warning';
  explanation: string;
}

export interface FinancialHealthResult {
  score: number; // 0 to 100
  tier: 'Exceptional' | 'Healthy' | 'Moderate' | 'At Risk';
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  color: string;
  bgLight: string;
  summary: string;
  recommendation: string;
  metrics: {
    savings: MetricBreakdown;
    burnRate: MetricBreakdown;
    volatility: MetricBreakdown;
    allocation: MetricBreakdown;
    momentum: MetricBreakdown;
  };
  mathematicalFactors: {
    savingsRate: number; // e.g. 0.25 (25%)
    velocityFactor: number; // V = beta / tau
    coefficientOfVariation: number; // CV = sigma / mu
    essentialRatio: number; // rho_ess
    momDelta: number; // delta E
  };
}

// Essential category keywords for deterministic allocation weighting
const ESSENTIAL_KEYWORDS = [
  'grocery', 'groceries', 'food', 'rent', 'tuition', 'academic', 
  'book', 'medical', 'health', 'medicine', 'transport', 'commute',
  'utility', 'bills', 'recharge', 'subscription'
];

/**
 * Computes deterministic Financial Health Score using pure financial calculus
 */
export function calculateFinancialHealth(inputs: FinancialHealthInputs): FinancialHealthResult {
  const {
    monthlyIncome,
    totalSpent,
    budgetAmount,
    dailySpending,
    daysElapsed,
    totalDaysInMonth,
    expenses,
    categoriesMap,
    prevMonthSpent = 0,
  } = inputs;

  // Safe denominators
  const effectiveInflow = Math.max(monthlyIncome, budgetAmount, totalSpent, 1);
  const netSavings = monthlyIncome > 0 ? (monthlyIncome - totalSpent) : (budgetAmount - totalSpent);
  const savingsRate = effectiveInflow > 0 ? netSavings / effectiveInflow : 0;

  // --------------------------------------------------------------------------
  // 1. S_savings (0 - 25 points): Logistic Surplus Saturation Function
  // f(r) = 25 / (1 + exp(-12 * (r - 0.15)))
  // --------------------------------------------------------------------------
  let savingsScore = 0;
  if (savingsRate >= 0) {
    savingsScore = 25 / (1 + Math.exp(-12 * (savingsRate - 0.15)));
    savingsScore = Math.min(25, Math.max(0, savingsScore));
  } else {
    // Deficit penalty: decays linearly from 10 to 0 as deficit reaches -50%
    savingsScore = Math.max(0, 10 * (1 + savingsRate / 0.5));
  }
  savingsScore = Number(savingsScore.toFixed(1));

  // --------------------------------------------------------------------------
  // 2. S_burn (0 - 25 points): Temporal Integral Pacing Velocity
  // tau = daysElapsed / totalDaysInMonth
  // beta = totalSpent / budgetAmount
  // V = beta / tau
  // --------------------------------------------------------------------------
  const safeDaysElapsed = Math.max(daysElapsed, 1);
  const tau = Math.min(1, Math.max(0.01, safeDaysElapsed / Math.max(totalDaysInMonth, 1)));
  const baselineBudget = budgetAmount > 0 ? budgetAmount : effectiveInflow;
  const beta = totalSpent / baselineBudget;
  const velocityFactor = beta / tau;

  let burnScore = 25;
  if (totalSpent === 0) {
    burnScore = 25;
  } else if (velocityFactor <= 1.0) {
    // Pacing at or below permissible daily allowance
    burnScore = 25 * (1 - 0.08 * velocityFactor);
  } else {
    // Exponential decay under excessive pacing acceleration: 25 * exp(-1.8 * (V - 1))
    burnScore = 25 * Math.exp(-1.8 * (velocityFactor - 1.0));
  }
  burnScore = Number(Math.min(25, Math.max(0, burnScore)).toFixed(1));

  // --------------------------------------------------------------------------
  // 3. S_volatility (0 - 20 points): Coefficient of Variation (CV = sigma / mu)
  // Evaluates standard deviation of daily spending
  // --------------------------------------------------------------------------
  const nonZeroDays = dailySpending.length > 0 ? dailySpending : [totalSpent / safeDaysElapsed];
  const mu = nonZeroDays.reduce((sum, v) => sum + v, 0) / nonZeroDays.length;

  let variance = 0;
  if (nonZeroDays.length > 1) {
    variance = nonZeroDays.reduce((sum, v) => sum + Math.pow(v - mu, 2), 0) / (nonZeroDays.length - 1);
  }
  const sigma = Math.sqrt(variance);
  const cv = mu > 0 ? sigma / mu : 0;

  // Transfer function: 20 / (1 + 0.55 * CV)
  let volatilityScore = 20 / (1 + 0.55 * cv);
  volatilityScore = Number(Math.min(20, Math.max(0, volatilityScore)).toFixed(1));

  // --------------------------------------------------------------------------
  // 4. S_allocation (0 - 15 points): Essential vs Discretionary Allocation Ratio
  // rho_ess = E_essential / E_total
  // --------------------------------------------------------------------------
  let essentialSpend = 0;
  expenses.forEach(e => {
    if (e.type !== 'income') {
      const cat = categoriesMap.get(e.categoryId);
      const name = (cat?.name || '').toLowerCase();
      const isEssential = ESSENTIAL_KEYWORDS.some(kw => name.includes(kw));
      if (isEssential) {
        essentialSpend += e.amount;
      }
    }
  });

  const essentialRatio = totalSpent > 0 ? (essentialSpend / totalSpent) : 0.70;
  let allocationScore = 15;
  if (totalSpent > 0) {
    // 15 * min(1, rho_ess / 0.65)
    allocationScore = 15 * Math.min(1, essentialRatio / 0.65);
  }
  allocationScore = Number(Math.min(15, Math.max(0, allocationScore)).toFixed(1));

  // --------------------------------------------------------------------------
  // 5. S_momentum (0 - 15 points): Month-over-Month Spending Derivative
  // delta = (E_current - E_prev) / max(E_prev, 1)
  // --------------------------------------------------------------------------
  let momentumScore = 12; // default if no prior data
  let momDelta = 0;

  if (prevMonthSpent > 0 && totalSpent > 0) {
    // Normalized comparison: compare current daily burn rate against prior month daily baseline
    const currentDailyBurn = totalSpent / safeDaysElapsed;
    const prevDailyBurn = prevMonthSpent / Math.max(totalDaysInMonth, 28);
    const diff = currentDailyBurn - prevDailyBurn;
    momDelta = diff / prevDailyBurn;

    if (momDelta <= 0) {
      // Velocity contracted or stayed stable
      momentumScore = 12 + 3 * Math.min(1, Math.abs(momDelta));
    } else {
      // Velocity accelerated
      momentumScore = Math.max(0, 12 * (1 - 1.2 * momDelta));
    }
  }
  momentumScore = Number(Math.min(15, Math.max(0, momentumScore)).toFixed(1));

  // --------------------------------------------------------------------------
  // Composite Total Score S in [0, 100]
  // --------------------------------------------------------------------------
  const compositeScore = Math.round(
    savingsScore + burnScore + volatilityScore + allocationScore + momentumScore
  );
  const boundedScore = Math.min(100, Math.max(0, compositeScore));

  // Determine Tier and Grade
  let tier: FinancialHealthResult['tier'] = 'Moderate';
  let grade: FinancialHealthResult['grade'] = 'B';
  let color = '#f59e0b';
  let bgLight = 'rgba(245, 158, 11, 0.12)';

  if (boundedScore >= 85) {
    tier = 'Exceptional';
    grade = 'A+';
    color = '#10b981';
    bgLight = 'rgba(16, 185, 129, 0.12)';
  } else if (boundedScore >= 70) {
    tier = 'Healthy';
    grade = 'A';
    color = '#06b6d4';
    bgLight = 'rgba(6, 182, 212, 0.12)';
  } else if (boundedScore >= 50) {
    tier = 'Moderate';
    grade = 'B';
    color = '#f59e0b';
    bgLight = 'rgba(245, 158, 11, 0.12)';
  } else {
    tier = 'At Risk';
    grade = 'D';
    color = '#ef4444';
    bgLight = 'rgba(239, 68, 68, 0.12)';
  }

  // Actionable Recommendation synthesis based on the lowest sub-score
  const subScores = [
    { key: 'savings', score: savingsScore / 25, advice: `Increase net liquid reserves; current savings rate is ${(savingsRate * 100).toFixed(0)}%.` },
    { key: 'burnRate', score: burnScore / 25, advice: `Pacing acceleration is high (${velocityFactor.toFixed(2)}x allowable rate). Slow daily expenditure.` },
    { key: 'volatility', score: volatilityScore / 20, advice: `Spending has high statistical variance (CV = ${cv.toFixed(2)}). Smooth out impulsive spikes.` },
    { key: 'allocation', score: allocationScore / 15, advice: `Discretionary spend exceeds recommended baseline. Reallocate towards essential obligations.` },
    { key: 'momentum', score: momentumScore / 15, advice: `Spending expanded by ${Math.abs(momDelta * 100).toFixed(0)}% MoM. Rein in month-over-month growth.` },
  ].sort((a, b) => a.score - b.score);

  const recommendation = subScores[0]?.advice || 'Financial indicators are balanced and stable.';
  const summary = `Calculated with 5 mathematical variables. Score: ${boundedScore}/100 (${tier}). Pacing velocity: ${velocityFactor.toFixed(2)}x, Daily variance CV: ${cv.toFixed(2)}.`;

  return {
    score: boundedScore,
    tier,
    grade,
    color,
    bgLight,
    summary,
    recommendation,
    metrics: {
      savings: {
        name: 'Savings Capacity',
        score: savingsScore,
        maxScore: 25,
        weightPct: 25,
        formula: 'f(r) = 25 / (1 + e^{-12(r - 0.15)})',
        metricValue: `${(savingsRate * 100).toFixed(1)}% savings rate`,
        status: savingsScore >= 18 ? 'optimal' : savingsScore >= 10 ? 'moderate' : 'warning',
        explanation: 'Evaluates net surplus ratio against effective monthly inflow using a logistic curve.',
      },
      burnRate: {
        name: 'Pacing Velocity',
        score: burnScore,
        maxScore: 25,
        weightPct: 25,
        formula: 'V = (E / B) / (t / T)',
        metricValue: `${velocityFactor.toFixed(2)}x allowable burn`,
        status: velocityFactor <= 1.05 ? 'optimal' : velocityFactor <= 1.35 ? 'moderate' : 'warning',
        explanation: 'Measures budget burn relative to calendar time elapsed using discrete velocity derivatives.',
      },
      volatility: {
        name: 'Daily Consistency',
        score: volatilityScore,
        maxScore: 20,
        weightPct: 20,
        formula: 'CV = \\sigma / \\mu',
        metricValue: `CV = ${cv.toFixed(2)} (${cv < 1.0 ? 'Consistent' : 'Volatile'})`,
        status: cv <= 1.2 ? 'optimal' : cv <= 2.0 ? 'moderate' : 'warning',
        explanation: 'Analyzes standard deviation and dispersion of daily spending to detect impulsive spikes.',
      },
      allocation: {
        name: 'Budget Allocation',
        score: allocationScore,
        maxScore: 15,
        weightPct: 15,
        formula: '\\rho_{ess} = E_{ess} / E_{total}',
        metricValue: `${(essentialRatio * 100).toFixed(0)}% essential`,
        status: essentialRatio >= 0.60 ? 'optimal' : essentialRatio >= 0.40 ? 'moderate' : 'warning',
        explanation: 'Tracks essential obligations (groceries, academics, rent) vs discretionary lifestyle spends.',
      },
      momentum: {
        name: 'MoM Momentum',
        score: momentumScore,
        maxScore: 15,
        weightPct: 15,
        formula: '\\Delta E = (E_m - E_{m-1}) / E_{m-1}',
        metricValue: prevMonthSpent > 0 ? `${momDelta >= 0 ? '+' : ''}${(momDelta * 100).toFixed(1)}% MoM` : 'Baseline',
        status: momDelta <= 0.05 ? 'optimal' : momDelta <= 0.20 ? 'moderate' : 'warning',
        explanation: 'First discrete derivative of spending trajectory compared to the prior billing cycle.',
      },
    },
    mathematicalFactors: {
      savingsRate,
      velocityFactor,
      coefficientOfVariation: cv,
      essentialRatio,
      momDelta,
    },
  };
}
