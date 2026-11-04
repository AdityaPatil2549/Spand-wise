'use client';

import React, { useMemo } from 'react';
import { getDaysInMonth, getDate } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown, TrendingUp, Activity } from 'lucide-react';
import type { ExpenseDocument } from '@/types/firestore';

interface BentoVelocitySparklineProps {
  expenses: ExpenseDocument[];
  budgetAmount: number;
  totalSpent: number;
}

export const BentoVelocitySparkline: React.FC<BentoVelocitySparklineProps> = ({
  expenses,
  budgetAmount,
  totalSpent,
}) => {
  const now = new Date();
  const daysInMonth = getDaysInMonth(now);
  const currentDay = Math.max(1, getDate(now));

  // Compute daily spend aggregates and trajectories
  const { trajectoryData, deltaPacing, isSurplus, dailyAverage, projectedTotal } = useMemo(() => {
    // Bucket non-deleted expenses in current month by day of month
    const dailyMap = new Map<number, number>();
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap.set(d, 0);
    }

    expenses.forEach((exp) => {
      if (exp.isDeleted || exp.type === 'income') return;
      try {
        const expDate = exp.date.toDate();
        // Check if same month and year
        if (expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()) {
          const day = getDate(expDate);
          dailyMap.set(day, (dailyMap.get(day) || 0) + exp.amount);
        }
      } catch (err) {
        // Fallback for mock or string dates
      }
    });

    let runningActual = 0;
    const trajectory: Array<{ day: number; actual: number; ideal: number }> = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const ideal = (budgetAmount / daysInMonth) * d;
      if (d <= currentDay) {
        runningActual += dailyMap.get(d) || 0;
        trajectory.push({ day: d, actual: runningActual, ideal });
      } else {
        trajectory.push({ day: d, actual: runningActual, ideal });
      }
    }

    const idealToDate = (budgetAmount / daysInMonth) * currentDay;
    const delta = idealToDate - totalSpent;
    const surplus = delta >= 0;
    const avg = currentDay > 0 ? Math.round(totalSpent / currentDay) : 0;
    const projected = Math.round(avg * daysInMonth);

    return {
      trajectoryData: trajectory,
      deltaPacing: Math.abs(delta),
      isSurplus: surplus,
      dailyAverage: avg,
      projectedTotal: projected,
    };
  }, [expenses, budgetAmount, totalSpent, currentDay, daysInMonth, now]);

  // Generate SVG path coordinates
  const svgWidth = 320;
  const svgHeight = 120;
  const paddingX = 10;
  const paddingY = 12;

  const maxVal = Math.max(budgetAmount || 1, totalSpent || 1, projectedTotal || 1);

  const getCoordinates = (day: number, val: number) => {
    const x = paddingX + ((day - 1) / (daysInMonth - 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - 2 * paddingY);
    return { x, y: Math.max(paddingY, Math.min(svgHeight - paddingY, y)) };
  };

  // Build actual spend curve up to today
  const actualPoints = trajectoryData
    .filter((p) => p.day <= currentDay)
    .map((p) => getCoordinates(p.day, p.actual));

  const actualPath = actualPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Build area fill path
  const areaPath =
    actualPoints.length > 0
      ? `${actualPath} L ${actualPoints[actualPoints.length - 1].x} ${svgHeight - paddingY} L ${actualPoints[0].x} ${svgHeight - paddingY} Z`
      : '';

  // Build ideal baseline path (day 1 to last day of month)
  const idealStart = getCoordinates(1, 0);
  const idealEnd = getCoordinates(daysInMonth, budgetAmount);
  const idealPath = `M ${idealStart.x} ${idealStart.y} L ${idealEnd.x} ${idealEnd.y}`;

  // Build predictive projection line (from today to end of month)
  const todayPoint = actualPoints[actualPoints.length - 1];
  const projectedPoint = getCoordinates(daysInMonth, projectedTotal);
  const hasProjection = currentDay < daysInMonth && !!todayPoint;
  const projectedPath = hasProjection
    ? `M ${todayPoint.x} ${todayPoint.y} L ${projectedPoint.x} ${projectedPoint.y}`
    : '';

  return (
    <div className="relative w-full rounded-[28px] p-6 sm:p-8 bg-theme-surface/70 border border-theme-border/60 flex flex-col justify-between min-h-[350px] shadow-sm">
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-theme-secondary uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5 text-theme-accent" />
            <span>Velocity Pacing</span>
          </div>
          <h3 className="font-sans text-xl font-bold text-theme-primary tracking-tight">
            30-Day Trajectory
          </h3>
        </div>

        {/* Pacing Delta Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isSurplus
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}
        >
          {isSurplus ? (
            <TrendingDown className="w-3.5 h-3.5 stroke-[2.2]" />
          ) : (
            <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
          )}
          <span>
            {isSurplus ? '+' : '-'}
            {formatCurrency(deltaPacing)} {isSurplus ? 'Surplus' : 'Burn'}
          </span>
        </div>
      </div>

      {/* SVG Velocity Canvas */}
      <div className="relative my-3 w-full h-[140px] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isSurplus ? '#10b981' : '#f43f5e'}
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor={isSurplus ? '#10b981' : '#f43f5e'}
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {/* Ideal Linear Pace Baseline (dashed) */}
          <path
            d={idealPath}
            stroke="currentColor"
            className="text-theme-border"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />

          {/* Actual Gradient Fill Area */}
          {areaPath && <path d={areaPath} fill="url(#velocityGradient)" />}

          {/* Predictive Run-rate Projection Curve (dashed cyan) */}
          {projectedPath && (
            <path
              d={projectedPath}
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
          )}

          {/* Actual Cumulative Trajectory Line */}
          {actualPath && (
            <path
              d={actualPath}
              stroke={isSurplus ? '#10b981' : '#f43f5e'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}

          {/* Day 30 Projected Run-rate Pin */}
          {hasProjection && (
            <circle
              cx={projectedPoint.x}
              cy={projectedPoint.y}
              r="3.5"
              className="fill-cyan-400"
              stroke="#0891b2"
              strokeWidth="1.5"
            />
          )}

          {/* Current Day Pin */}
          {actualPoints.length > 0 && (
            <circle
              cx={actualPoints[actualPoints.length - 1].x}
              cy={actualPoints[actualPoints.length - 1].y}
              r="4.5"
              className={isSurplus ? 'fill-emerald-500' : 'fill-rose-500'}
              stroke="#ffffff"
              strokeWidth="2"
            />
          )}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute top-1 right-2 flex items-center gap-3 text-[11px] text-theme-secondary font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-theme-border inline-block" /> Ideal Pace
          </span>
          <span className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                isSurplus ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />{' '}
            Actual
          </span>
          {hasProjection && (
            <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
              <span className="w-2.5 h-0.5 bg-cyan-500 inline-block border-b border-dashed" /> Projected
            </span>
          )}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-theme-border/30 text-xs">
        <div>
          <span className="text-theme-secondary text-[11px] block">Daily Avg Burn</span>
          <strong className="text-theme-primary font-semibold tabular-nums text-sm">
            {formatCurrency(dailyAverage)} / day
          </strong>
        </div>
        <div className="text-right">
          <span className="text-theme-secondary text-[11px] block">Projected Total</span>
          <strong
            className={`font-semibold tabular-nums text-sm ${
              projectedTotal > budgetAmount ? 'text-rose-500' : 'text-theme-primary'
            }`}
          >
            {formatCurrency(projectedTotal)}
          </strong>
        </div>
      </div>
    </div>
  );
};
