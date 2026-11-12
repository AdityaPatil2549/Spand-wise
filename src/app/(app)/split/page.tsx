'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Handshake, Users } from 'lucide-react';
import { useStore } from '@/store';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { QuickCalcPanel } from '@/components/features/splits/QuickCalcPanel';
import { SplitLedgerPanel } from '@/components/features/splits/SplitLedgerPanel';
import { computeNetBalances, formatPaise } from '@/lib/splits/engine';
import { subscribeSplitExpenses, subscribeSplitGroups } from '@/lib/splits/firestore';
import type { SplitExpenseDocument, SplitGroupDocument } from '@/types/firestore';

type SplitTab = 'groups' | 'friends' | 'quick';

export default function SplitBillsPage() {
  const householdId = useStore((s) => s.householdId);
  const addToast = useStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<SplitTab>('groups');
  const [groups, setGroups] = useState<SplitGroupDocument[]>([]);
  const [splitExpenses, setSplitExpenses] = useState<SplitExpenseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!householdId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let loadedGroups = false;
    let loadedExpenses = false;
    const finishIfReady = () => {
      if (loadedGroups && loadedExpenses) setIsLoading(false);
    };

    const unsubGroups = subscribeSplitGroups(
      householdId,
      (data) => {
        setGroups(data);
        loadedGroups = true;
        finishIfReady();
      },
      () => {
        loadedGroups = true;
        finishIfReady();
        addToast({ type: 'error', message: 'Failed to sync split groups.' });
      }
    );

    const unsubExpenses = subscribeSplitExpenses(
      householdId,
      (data) => {
        setSplitExpenses(data);
        loadedExpenses = true;
        finishIfReady();
      },
      () => {
        loadedExpenses = true;
        finishIfReady();
        addToast({ type: 'error', message: 'Failed to sync shared bills.' });
      }
    );

    return () => {
      unsubGroups();
      unsubExpenses();
    };
  }, [householdId, addToast]);

  // Global net position across all groups & 1:1 friends for "self"
  const overallSelfNetPaise = useMemo(() => {
    let total = 0;
    for (const g of groups) {
      const gExps = splitExpenses.filter((e) => e.groupId === g.id);
      const balances = computeNetBalances(g.members, gExps);
      total += balances.self ?? 0;
    }
    return total;
  }, [groups, splitExpenses]);

  return (
    <div className="w-full">
      <div className="flex-1 w-full px-4 sm:px-6 pt-6 pb-32 md:pb-12 max-w-6xl mx-auto space-y-6">
        {/* Header + Overall Position Pill */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent/15 text-theme-accent text-xs font-semibold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Splitwise Engine &amp; Quick Calc</span>
            </div>
            <TextEffect
              as="h1"
              preset="fade"
              className="font-display text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-theme-primary"
            >
              Split Bills
            </TextEffect>
            <p className="text-sm text-theme-secondary max-w-xl mt-1">
              Track shared hostel, flat, and trip expenses with integer-paise accuracy, Min-Cash-Flow debt simplification, and 1-tap UPI settlement.
            </p>
          </div>

          <div className="glass-panel px-4 py-3 rounded-2xl border border-theme-border shrink-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-theme-secondary">
              Your Overall Position
            </span>
            <span
              className={`text-lg font-mono font-bold tabular-nums ${
                overallSelfNetPaise > 0
                  ? 'text-theme-positive'
                  : overallSelfNetPaise < 0
                  ? 'text-theme-danger'
                  : 'text-theme-primary'
              }`}
            >
              {overallSelfNetPaise > 0
                ? `Owed ${formatPaise(overallSelfNetPaise, CURRENCY_SYMBOL)}`
                : overallSelfNetPaise < 0
                ? `You owe ${formatPaise(Math.abs(overallSelfNetPaise), CURRENCY_SYMBOL)}`
                : 'All Settled'}
            </span>
          </div>
        </div>

        {/* 3 Clean Split Tabs */}
        <div
          role="tablist"
          aria-label="Split workspace modes"
          className="inline-flex p-1.5 rounded-2xl bg-theme-surface border border-theme-border gap-1 flex-wrap"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'groups'}
            onClick={() => setActiveTab('groups')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'groups'
                ? 'bg-theme-accent text-theme-on-accent shadow-sm'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Groups</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'friends'}
            onClick={() => setActiveTab('friends')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'friends'
                ? 'bg-theme-accent text-theme-on-accent shadow-sm'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Handshake className="w-4 h-4" />
            <span>1:1 Friends</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'quick'}
            onClick={() => setActiveTab('quick')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'quick'
                ? 'bg-theme-accent text-theme-on-accent shadow-sm'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Quick Calc</span>
          </button>
        </div>

        {/* Active Panel */}
        {activeTab === 'quick' ? (
          <QuickCalcPanel />
        ) : (
          <SplitLedgerPanel
            mode={activeTab}
            groups={groups}
            expenses={splitExpenses}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
