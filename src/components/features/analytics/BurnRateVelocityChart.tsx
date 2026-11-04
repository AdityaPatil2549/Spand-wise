'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Flame, TrendingUp, TrendingDown, Calendar, Activity } from 'lucide-react';

export interface AreaChartPoint {
  date: string;
  spent: number | null;
}

export interface PastBudgetPoint {
  name: string;
  monthId: string;
  Income: number;
  Expenses: number;
  NetSavings: number;
}

interface BurnRateVelocityChartProps {
  areaData: AreaChartPoint[];
  pastBudgets: PastBudgetPoint[];
  momChange: { percent: number; isIncrease: boolean; hasPrevious: boolean };
  velocityStats: {
    dailyBurn: number;
    safeDailyAllowance: number;
    projectedMonthEnd: number;
    daysRemaining: number;
  };
  dayOfWeekStats: {
    data: Array<{ day: string; spend: number; count: number; isPeak: boolean }>;
    peakDay: string;
    peakAmount: number;
  };
}

export const BurnRateVelocityChart: React.FC<BurnRateVelocityChartProps> = ({
  areaData,
  pastBudgets,
  momChange,
  velocityStats,
  dayOfWeekStats,
}) => {
  return (
    <div className="space-y-6">
      {/* Chart 1: 30-Day Cumulative Trajectory */}
      <div className="w-full rounded-[28px] p-6 sm:p-7 bg-theme-surface/70 border border-theme-border/60 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-theme-accent/10 text-theme-accent flex items-center justify-center">
              <Flame className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-sans text-base font-bold text-theme-primary tracking-tight">
                Cumulative Burn Trajectory
              </h3>
              <p className="text-xs text-theme-secondary">
                Daily expenditure progression this month
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-theme-secondary block">Projected Total</span>
            <strong className="text-xs font-bold text-theme-primary tabular-nums">
              {formatCurrency(velocityStats.projectedMonthEnd)}
            </strong>
          </div>
        </div>

        {/* Recharts Area Canvas */}
        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="var(--theme-secondary)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'Cumulative Spent']}
                contentStyle={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="spent"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#areaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Trajectory Sub-Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-theme-border/30 text-xs">
          <div className="p-2.5 rounded-xl bg-theme-base/60 border border-theme-border/30">
            <span className="text-[10px] text-theme-secondary block">Daily Average</span>
            <strong className="text-theme-primary font-bold tabular-nums">
              {formatCurrency(velocityStats.dailyBurn)}/day
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-theme-base/60 border border-theme-border/30">
            <span className="text-[10px] text-theme-secondary block">Safe Allowance</span>
            <strong className="text-theme-primary font-bold tabular-nums">
              {formatCurrency(velocityStats.safeDailyAllowance)}/day
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-theme-base/60 border border-theme-border/30">
            <span className="text-[10px] text-theme-secondary block">Peak Spend Day</span>
            <strong className="text-theme-primary font-bold">
              {dayOfWeekStats.peakDay} ({formatCurrency(dayOfWeekStats.peakAmount)})
            </strong>
          </div>
        </div>
      </div>

      {/* Chart 2: 6-Month Multi-Month Historical Bar Chart */}
      <div className="w-full rounded-[28px] p-6 sm:p-7 bg-theme-surface/70 border border-theme-border/60 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-theme-accent/10 text-theme-accent flex items-center justify-center">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-sans text-base font-bold text-theme-primary tracking-tight">
                6-Month Historical Comparison
              </h3>
              <p className="text-xs text-theme-secondary">
                Income vs. Expenditures over time
              </p>
            </div>
          </div>

          {momChange.hasPrevious && (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                momChange.isIncrease
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}
            >
              {momChange.isIncrease ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>
                {momChange.percent}% MoM {momChange.isIncrease ? 'Increase' : 'Saved'}
              </span>
            </div>
          )}
        </div>

        {/* Recharts Bar Canvas */}
        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pastBudgets}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border)" opacity={0.3} />
              <XAxis
                dataKey="name"
                stroke="var(--theme-secondary)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'Amount']}
                contentStyle={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              />
              <Bar dataKey="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
