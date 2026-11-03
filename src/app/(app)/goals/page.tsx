'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { GoalCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Timestamp } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  Flame,
  Calendar,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Wallet,
  Clock,
  Compass,
  DollarSign
} from 'lucide-react';
import type { GoalDocument } from '@/types/firestore';

const PRESET_ICONS = ['💻', '🏖️', '🎒', '📱', '🚲', '📚', '🍕', '🎮', '💡', '🛡️'];

export default function GoalsPage() {
  const user = useStore((s) => s.user);
  const householdId = useStore((s) => s.householdId);
  const budget = useStore((s) => s.budget);
  const goals = useStore((s) => s.goals);
  const isGoalsLoading = useStore((s) => s.isGoalsLoading);
  const loadGoals = useStore((s) => s.loadGoals);
  const addGoal = useStore((s) => s.addGoal);
  const updateGoal = useStore((s) => s.updateGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const contributeToGoal = useStore((s) => s.contributeToGoal);
  const addToast = useStore((s) => s.addToast);

  // Filter & Modals
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<GoalDocument | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionType, setContributionType] = useState<'deposit' | 'withdraw'>('deposit');

  // New Goal Form State
  const [newGoalName, setNewGoalName] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newInitialAmount, setNewInitialAmount] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newIcon, setNewIcon] = useState('🎯');
  const [newColor, setNewColor] = useState('#6366f1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulation Slider State (Extra spend today)
  const [simulatedExtraSpend, setSimulatedExtraSpend] = useState<number>(0);

  // Load goals on mount
  useEffect(() => {
    if (householdId) {
      loadGoals(householdId);
    }
  }, [householdId, loadGoals]);

  // Mathematical Safe-To-Spend Runway Engine
  const runway = useMemo(() => {
    const budgetAmount = budget?.budgetAmount || 0;
    const totalSpent = budget?.totalSpent || 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Days in current month
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

    // Remaining disposable funds
    const remainingBudget = Math.max(0, budgetAmount - totalSpent);
    
    // Baseline safe to spend per day
    const dailySafeToSpend = remainingBudget / daysRemaining;

    // Daily spend velocity so far
    const avgDailySpend = totalSpent / Math.max(1, currentDay);

    // Pacing velocity ratio V = (E / B) / (t / T)
    const normalizedTime = currentDay / totalDaysInMonth;
    const normalizedSpend = budgetAmount > 0 ? totalSpent / budgetAmount : 1;
    const velocityRatio = normalizedTime > 0 ? normalizedSpend / normalizedTime : 1;

    // Pacing status & days until budget exhaust
    let daysUntilExhaust = 999;
    if (avgDailySpend > 0) {
      daysUntilExhaust = Math.round(remainingBudget / avgDailySpend);
    }

    // What-If Simulation
    const simulatedRemaining = Math.max(0, remainingBudget - simulatedExtraSpend);
    const simulatedDailySafe = simulatedRemaining / daysRemaining;

    return {
      budgetAmount,
      totalSpent,
      remainingBudget,
      totalDaysInMonth,
      currentDay,
      daysRemaining,
      dailySafeToSpend,
      avgDailySpend,
      velocityRatio,
      daysUntilExhaust,
      simulatedRemaining,
      simulatedDailySafe,
      isOverPacing: avgDailySpend > dailySafeToSpend && totalSpent > 0,
      isOverBudget: totalSpent > budgetAmount,
    };
  }, [budget, simulatedExtraSpend]);

  // Filtered goals list
  const filteredGoals = useMemo(() => {
    if (!goals) return [];
    if (filter === 'active') return goals.filter((g) => !g.isCompleted);
    if (filter === 'completed') return goals.filter((g) => g.isCompleted);
    return goals;
  }, [goals, filter]);

  // Handle Goal Creation
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim()) {
      addToast({ type: 'warning', message: 'Please enter a goal title.' });
      return;
    }
    const target = parseFloat(newTargetAmount);
    if (!target || target <= 0) {
      addToast({ type: 'warning', message: 'Target amount must be greater than 0.' });
      return;
    }

    const initial = Math.max(0, parseFloat(newInitialAmount) || 0);

    setIsSubmitting(true);
    try {
      let targetDateTs: Timestamp | undefined = undefined;
      if (newTargetDate) {
        targetDateTs = Timestamp.fromDate(new Date(newTargetDate));
      }

      await addGoal({
        name: newGoalName.trim(),
        targetAmount: target,
        currentAmount: initial,
        icon: newIcon,
        color: newColor,
        targetDate: targetDateTs,
        isCompleted: initial >= target,
        createdBy: user?.uid || 'user',
      });

      // Reset form
      setNewGoalName('');
      setNewTargetAmount('');
      setNewInitialAmount('');
      setNewTargetDate('');
      setIsAddModalOpen(false);

      if (initial >= target) {
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      }
    } catch {
      addToast({ type: 'error', message: 'Could not create goal.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Contribution (Deposit / Withdraw)
  const handleContributionSubmit = async () => {
    if (!contributeGoal) return;
    const amount = parseFloat(contributionAmount);
    if (!amount || amount <= 0) {
      addToast({ type: 'warning', message: 'Enter a valid amount.' });
      return;
    }

    try {
      if (contributionType === 'deposit') {
        const newTotal = contributeGoal.currentAmount + amount;
        await contributeToGoal(contributeGoal.id, amount);
        
        if (newTotal >= contributeGoal.targetAmount) {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
          });
          addToast({
            type: 'success',
            message: `🎉 Goal "${contributeGoal.name}" reached 100%! Congratulations!`,
          });
        } else {
          addToast({
            type: 'success',
            message: `Deposited ${CURRENCY_SYMBOL}${amount.toFixed(2)} to ${contributeGoal.name}`,
          });
        }
      } else {
        // Withdraw
        const newTotal = Math.max(0, contributeGoal.currentAmount - amount);
        await updateGoal(contributeGoal.id, {
          currentAmount: newTotal,
          isCompleted: false,
        });
        addToast({
          type: 'info',
          message: `Withdrew ${CURRENCY_SYMBOL}${amount.toFixed(2)} from ${contributeGoal.name}`,
        });
      }

      setContributeGoal(null);
      setContributionAmount('');
    } catch {
      addToast({ type: 'error', message: 'Operation failed.' });
    }
  };

  return (
    <div className="w-full">
      <main className="flex-1 w-full px-4 sm:px-6 pt-8 pb-32 md:pb-12 max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent/10 text-theme-accent text-xs font-semibold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Student Pacing & Milestones</span>
            </div>
            <TextEffect as="h1" preset="fade" className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-none tracking-tight text-theme-primary mb-2">
              Savings Goals & Runway
            </TextEffect>
            <p className="text-theme-secondary text-sm md:text-base max-w-xl">
              Track student milestone targets, calculate daily safe-to-spend limits, and simulate what-if expense pacing.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-theme-accent hover:bg-theme-accent-hover text-theme-white font-medium text-sm shadow-lg shadow-theme-accent/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Goal
          </button>
        </div>

        {/* SECTION 1: Student Daily Safe-to-Spend Runway (Pure Math Engine) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-theme-accent/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-theme-border/20">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-semibold text-theme-primary">Daily Safe-To-Spend Allowance</h2>
              </div>
              <p className="text-xs sm:text-sm text-theme-secondary">
                Calculated dynamically via temporal pacing calculus (&Delta;B / d_rem) across {runway.daysRemaining} days remaining in this month.
              </p>
            </div>

            {/* Pacing Badge */}
            <div className="flex items-center gap-2 self-start">
              {runway.isOverBudget ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Budget Exceeded
                </span>
              ) : runway.isOverPacing ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Fast Burn Pace
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Optimal Pacing
                </span>
              )}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme-border/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-theme-secondary flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-theme-accent" />
                Safe Daily Limit
              </span>
              <p className="text-2xl sm:text-3xl font-display font-medium text-theme-primary">
                {CURRENCY_SYMBOL}{runway.dailySafeToSpend.toFixed(0)}
                <span className="text-xs font-sans text-theme-secondary font-normal ml-1">/ day</span>
              </p>
              <p className="text-xs text-theme-secondary mt-1">
                For the next {runway.daysRemaining} days
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme-border/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-theme-secondary flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5 text-cyan-500" />
                Remaining Budget
              </span>
              <p className="text-2xl sm:text-3xl font-display font-medium text-theme-primary">
                {CURRENCY_SYMBOL}{runway.remainingBudget.toFixed(0)}
              </p>
              <p className="text-xs text-theme-secondary mt-1">
                Out of {CURRENCY_SYMBOL}{runway.budgetAmount.toFixed(0)} limit
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme-border/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-theme-secondary flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                Current Burn Rate
              </span>
              <p className="text-2xl sm:text-3xl font-display font-medium text-theme-primary">
                {CURRENCY_SYMBOL}{runway.avgDailySpend.toFixed(0)}
                <span className="text-xs font-sans text-theme-secondary font-normal ml-1">/ day</span>
              </p>
              <p className="text-xs text-theme-secondary mt-1">
                Velocity ratio: {runway.velocityRatio.toFixed(2)}x
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme-border/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-theme-secondary flex items-center gap-1.5 mb-1">
                <Compass className="w-3.5 h-3.5 text-purple-500" />
                Runway Pacing
              </span>
              <p className="text-2xl sm:text-3xl font-display font-medium text-theme-primary">
                {runway.isOverBudget 
                  ? '0 Days' 
                  : `${Math.min(runway.daysRemaining, runway.daysUntilExhaust)} Days`}
              </p>
              <p className="text-xs text-theme-secondary mt-1">
                {runway.daysUntilExhaust >= runway.daysRemaining 
                  ? 'Covers month fully with surplus' 
                  : `Depletes ${runway.daysRemaining - runway.daysUntilExhaust}d before month end`}
              </p>
            </div>
          </div>

          {/* Interactive What-If Simulation Slider */}
          <div className="mt-8 pt-6 border-t border-theme-border/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-theme-accent" />
                <h3 className="text-sm font-semibold text-theme-primary">
                  What-If Pacing Simulator
                </h3>
              </div>
              <span className="text-xs text-theme-secondary">
                Simulate spending extra: <strong className="text-theme-accent font-semibold">{CURRENCY_SYMBOL}{simulatedExtraSpend}</strong>
              </span>
            </div>

            <div className="space-y-3">
              <input
                type="range"
                min={0}
                max={Math.max(1000, Math.min(5000, runway.remainingBudget))}
                step={50}
                value={simulatedExtraSpend}
                onChange={(e) => setSimulatedExtraSpend(Number(e.target.value))}
                className="w-full accent-theme-accent cursor-pointer h-2 bg-theme-border/40 rounded-lg appearance-none"
              />

              <div className="flex items-center justify-between text-xs text-theme-secondary">
                <span>₹0 (Current)</span>
                <span>
                  New Safe Daily Limit: <strong className="text-theme-primary font-semibold">{CURRENCY_SYMBOL}{runway.simulatedDailySafe.toFixed(0)}/day</strong>
                </span>
                <span>Max ₹{Math.max(1000, Math.min(5000, runway.remainingBudget))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Goals Management Header & Filter Tabs */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-medium text-theme-primary">
                Student Goals & Milestones
              </h2>
              <p className="text-xs sm:text-sm text-theme-secondary">
                {goals.length} total goals ({goals.filter(g => g.isCompleted).length} completed)
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-theme-surface/70 border border-theme-border/30 self-start">
              {(['active', 'completed', 'all'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    filter === tab
                      ? 'bg-theme-accent text-theme-white shadow-sm'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Goals Grid */}
          {isGoalsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <GoalCardSkeleton key={n} />
              ))}
            </div>
          ) : filteredGoals.length === 0 ? (
            <EmptyState
              icon={Target}
              title={filter === 'completed' ? 'No completed goals yet' : 'No active savings goals'}
              description="Set targets for semester fees, travel, gadgets, or emergency reserves to stay financially disciplined."
              actionLabel="Create Your First Goal"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGoals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

                // Math ETA
                let daysToTarget = null;
                let dailyNeeded = null;
                if (goal.targetDate) {
                  const targetTime = goal.targetDate.toDate ? goal.targetDate.toDate().getTime() : (goal.targetDate as any).seconds * 1000;
                  const msDiff = targetTime - Date.now();
                  daysToTarget = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
                  dailyNeeded = remaining / daysToTarget;
                }

                return (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-panel p-6 rounded-3xl border border-theme-border/30 flex flex-col justify-between hover-elevate group transition-all"
                  >
                    <div>
                      {/* Top Row */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                            style={{ backgroundColor: `${goal.color || '#6366f1'}20` }}
                          >
                            <span>{goal.icon || '🎯'}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-theme-primary text-base leading-snug">
                              {goal.name}
                            </h3>
                            <span className="text-xs text-theme-secondary flex items-center gap-1.5 mt-0.5">
                              {goal.isCompleted ? (
                                <span className="text-emerald-500 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed!
                                </span>
                              ) : daysToTarget !== null ? (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-theme-accent" />
                                  {daysToTarget > 0 ? `${daysToTarget} days left` : 'Due today'}
                                </span>
                              ) : (
                                'Ongoing Goal'
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Delete Action */}
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-theme-secondary hover:text-rose-500 rounded-xl hover:bg-rose-500/10 cursor-pointer"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Amounts Display */}
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xl font-display font-medium text-theme-primary">
                          {CURRENCY_SYMBOL}{goal.currentAmount.toLocaleString()}
                        </span>
                        <span className="text-xs text-theme-secondary">
                          of {CURRENCY_SYMBOL}{goal.targetAmount.toLocaleString()} ({percent}%)
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-theme-surface/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-theme-border/30">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: goal.color || '#6366f1',
                          }}
                        />
                      </div>

                      {/* Mathematical projection */}
                      {!goal.isCompleted && dailyNeeded !== null && dailyNeeded > 0 && (
                        <p className="text-xs text-theme-secondary mt-3">
                          Save <strong className="text-theme-primary">{CURRENCY_SYMBOL}{dailyNeeded.toFixed(0)}/day</strong> to reach by target deadline.
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-theme-border/20">
                      <button
                        onClick={() => {
                          setContributeGoal(goal);
                          setContributionType('deposit');
                          setContributionAmount('');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-theme-accent/10 hover:bg-theme-accent text-theme-accent hover:text-theme-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Deposit
                      </button>

                      {goal.currentAmount > 0 && (
                        <button
                          onClick={() => {
                            setContributeGoal(goal);
                            setContributionType('withdraw');
                            setContributionAmount('');
                          }}
                          className="py-2 px-3 rounded-xl bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL: Create New Goal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel bg-theme-base p-6 sm:p-8 rounded-3xl border border-theme-border/60 max-w-md w-full shadow-2xl relative"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-theme-accent" />
                    <h2 className="text-xl font-display font-semibold text-theme-primary">
                      Create Savings Goal
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-theme-secondary hover:text-theme-primary text-sm p-1"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateGoal} className="space-y-4">
                  {/* Icon Selector */}
                  <div>
                    <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block mb-2">
                      Goal Icon
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_ICONS.map((icon) => (
                        <button
                          type="button"
                          key={icon}
                          onClick={() => setNewIcon(icon)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                            newIcon === icon
                              ? 'bg-theme-accent text-white scale-110 shadow-sm'
                              : 'bg-theme-surface hover:bg-theme-surface-hover'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goal Name */}
                  <div>
                    <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block mb-1.5">
                      Goal Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Goa Trip, New Laptop, Security Deposit"
                      value={newGoalName}
                      onChange={(e) => setNewGoalName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-theme-surface/70 border border-theme-border/40 text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent text-sm"
                    />
                  </div>

                  {/* Target Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block mb-1.5">
                        Target ({CURRENCY_SYMBOL}) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="5000"
                        value={newTargetAmount}
                        onChange={(e) => setNewTargetAmount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-theme-surface/70 border border-theme-border/40 text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block mb-1.5">
                        Initial ({CURRENCY_SYMBOL})
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={newInitialAmount}
                        onChange={(e) => setNewInitialAmount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-theme-surface/70 border border-theme-border/40 text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent text-sm"
                      />
                    </div>
                  </div>

                  {/* Target Date */}
                  <div>
                    <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block mb-1.5">
                      Target Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      value={newTargetDate}
                      onChange={(e) => setNewTargetDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-theme-surface/70 border border-theme-border/40 text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent text-sm"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-theme-white font-semibold text-sm shadow-md shadow-theme-accent/25 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'Creating...' : 'Save & Start Tracking'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: Deposit / Withdraw Contribution */}
        <AnimatePresence>
          {contributeGoal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel bg-theme-base p-6 sm:p-8 rounded-3xl border border-theme-border/60 max-w-sm w-full shadow-2xl relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{contributeGoal.icon}</span>
                    <h2 className="text-lg font-semibold text-theme-primary truncate">
                      {contributionType === 'deposit' ? 'Deposit to' : 'Withdraw from'} {contributeGoal.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setContributeGoal(null)}
                    className="text-theme-secondary hover:text-theme-primary text-sm p-1"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-theme-secondary mb-4">
                  Current Balance: <strong className="text-theme-primary">{CURRENCY_SYMBOL}{contributeGoal.currentAmount.toLocaleString()}</strong> of {CURRENCY_SYMBOL}{contributeGoal.targetAmount.toLocaleString()}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block mb-1.5">
                      Amount ({CURRENCY_SYMBOL})
                    </label>
                    <input
                      type="number"
                      autoFocus
                      min="1"
                      placeholder="e.g. 500"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-theme-surface/70 border border-theme-border/40 text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    {[100, 250, 500, 1000].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setContributionAmount(String(quick))}
                        className="flex-1 py-1.5 rounded-lg bg-theme-surface/80 hover:bg-theme-surface-hover text-xs font-semibold text-theme-secondary hover:text-theme-primary border border-theme-border/30 transition-colors"
                      >
                        +{quick}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleContributionSubmit}
                      className="w-full py-3.5 px-4 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-theme-white font-semibold text-sm shadow-md shadow-theme-accent/25 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Confirm {contributionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
