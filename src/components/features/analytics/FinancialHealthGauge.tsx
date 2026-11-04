'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ShieldCheck, Info, ChevronRight, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';
import type { FinancialHealthResult } from '@/lib/algorithms/financialHealth';

interface FinancialHealthGaugeProps {
  healthResult: FinancialHealthResult;
  monthlyIncome: number;
  totalSpent: number;
  budgetAmount: number;
}

export const FinancialHealthGauge: React.FC<FinancialHealthGaugeProps> = ({
  healthResult,
  monthlyIncome,
  totalSpent,
  budgetAmount,
}) => {
  const [showModal, setShowModal] = useState(false);

  const { score, tier, color, recommendation, metrics } = healthResult;

  return (
    <>
      <div className="w-full rounded-[28px] p-6 sm:p-7 bg-theme-surface/70 border border-theme-border/60 shadow-sm flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}15`, color: color }}
            >
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-sans text-base font-bold text-theme-primary tracking-tight">
                  Financial Health Score
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  aria-label="How health score is calculated"
                  className="text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-theme-secondary">
                5-Variable deterministic algorithmic audit
              </p>
            </div>
          </div>

          {/* Tier Badge */}
          <span
            className="px-3 py-1 rounded-full text-xs font-bold border capitalize"
            style={{
              backgroundColor: `${color}15`,
              color: color,
              borderColor: `${color}30`,
            }}
          >
            {tier} Tier
          </span>
        </div>

        {/* Big Score Display & Progress Ring */}
        <div className="my-6 flex items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-5xl font-extrabold text-theme-primary tracking-tight tabular-nums">
                {score}
              </span>
              <span className="text-sm font-semibold text-theme-secondary">/ 100</span>
            </div>
            <p className="text-xs text-theme-secondary leading-snug max-w-xs">
              {recommendation || 'Your financial pacing is stable and balanced.'}
            </p>
          </div>

          {/* Mini Metric Score Pill Matrix */}
          <div className="grid grid-cols-2 gap-2 text-right">
            <div className="p-2 rounded-xl bg-theme-base/60 border border-theme-border/30 text-xs">
              <span className="text-[10px] text-theme-secondary block uppercase tracking-wider">
                Savings
              </span>
              <strong className="text-theme-primary font-bold tabular-nums">
                {metrics?.savings?.score ?? 0}/{metrics?.savings?.maxScore ?? 25}
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-theme-base/60 border border-theme-border/30 text-xs">
              <span className="text-[10px] text-theme-secondary block uppercase tracking-wider">
                Velocity
              </span>
              <strong className="text-theme-primary font-bold tabular-nums">
                {metrics?.burnRate?.score ?? 0}/{metrics?.burnRate?.maxScore ?? 25}
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-theme-base/60 border border-theme-border/30 text-xs">
              <span className="text-[10px] text-theme-secondary block uppercase tracking-wider">
                Stability
              </span>
              <strong className="text-theme-primary font-bold tabular-nums">
                {metrics?.volatility?.score ?? 0}/{metrics?.volatility?.maxScore ?? 20}
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-theme-base/60 border border-theme-border/30 text-xs">
              <span className="text-[10px] text-theme-secondary block uppercase tracking-wider">
                Essential
              </span>
              <strong className="text-theme-primary font-bold tabular-nums">
                {metrics?.allocation?.score ?? 0}/{metrics?.allocation?.maxScore ?? 15}
              </strong>
            </div>
          </div>
        </div>

        {/* Footer Deep-Dive Link */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-theme-base hover:bg-theme-surface border border-theme-border/40 text-xs font-semibold text-theme-primary flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer"
        >
          <span>Inspect algorithmic score breakdown</span>
          <ChevronRight className="w-4 h-4 text-theme-secondary" />
        </button>
      </div>

      {/* Algorithmic Breakdown Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-theme-border/30">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-theme-accent" />
                <h4 className="font-sans text-base font-bold text-theme-primary">
                  Financial Health Algorithm (0–100)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close dialog"
                className="p-1.5 rounded-full hover:bg-theme-base text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {metrics && (
                <>
                  <div className="p-3.5 rounded-2xl bg-theme-base/60 border border-theme-border/30 space-y-1">
                    <div className="flex justify-between font-bold text-theme-primary">
                      <span>1. {metrics.savings.name}</span>
                      <span className="tabular-nums font-mono">
                        {metrics.savings.score} / {metrics.savings.maxScore}
                      </span>
                    </div>
                    <p className="text-theme-secondary leading-normal">
                      {metrics.savings.explanation}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-theme-base/60 border border-theme-border/30 space-y-1">
                    <div className="flex justify-between font-bold text-theme-primary">
                      <span>2. {metrics.burnRate.name}</span>
                      <span className="tabular-nums font-mono">
                        {metrics.burnRate.score} / {metrics.burnRate.maxScore}
                      </span>
                    </div>
                    <p className="text-theme-secondary leading-normal">
                      {metrics.burnRate.explanation}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-theme-base/60 border border-theme-border/30 space-y-1">
                    <div className="flex justify-between font-bold text-theme-primary">
                      <span>3. {metrics.volatility.name}</span>
                      <span className="tabular-nums font-mono">
                        {metrics.volatility.score} / {metrics.volatility.maxScore}
                      </span>
                    </div>
                    <p className="text-theme-secondary leading-normal">
                      {metrics.volatility.explanation}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-theme-base/60 border border-theme-border/30 space-y-1">
                    <div className="flex justify-between font-bold text-theme-primary">
                      <span>4. {metrics.allocation.name}</span>
                      <span className="tabular-nums font-mono">
                        {metrics.allocation.score} / {metrics.allocation.maxScore}
                      </span>
                    </div>
                    <p className="text-theme-secondary leading-normal">
                      {metrics.allocation.explanation}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-theme-primary text-theme-inverse font-semibold text-xs hover:opacity-95 transition-opacity cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
