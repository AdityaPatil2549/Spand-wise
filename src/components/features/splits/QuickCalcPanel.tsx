'use client';

import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  Copy,
  Plus,
  Receipt,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useStore } from '@/store';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import { addExpense } from '@/lib/expenses/index';
import { normalizeAccounts } from '@/lib/accounts/normalize';
import { dateToInputValue } from '@/lib/utils/date';
import {
  computeShares,
  formatPaise,
  fromPaise,
  toPaise,
  validateSplitInputs,
} from '@/lib/splits/engine';
import type { SplitMode } from '@/types/firestore';

export function QuickCalcPanel() {
  const user = useStore((s) => s.user);
  const householdId = useStore((s) => s.householdId);
  const rawAccounts = useStore((s) => s.accounts);
  const accounts = useMemo(() => normalizeAccounts(rawAccounts), [rawAccounts]);
  const categoriesMap = useStore((s) => s.categoriesMap);
  const addToast = useStore((s) => s.addToast);
  const addExpenseOptimistic = useStore((s) => s.addExpenseOptimistic);
  const adjustTotalSpentOptimistic = useStore((s) => s.adjustTotalSpentOptimistic);

  const [billName, setBillName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [extraFees, setExtraFees] = useState('');
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [people, setPeople] = useState<string[]>(['You', 'Roommate 1', 'Roommate 2']);
  const [customInputs, setCustomInputs] = useState<Record<string, number>>({});
  const [newPersonName, setNewPersonName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_CATEGORY_ID);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    return (
      accounts.find((a) => a.id === 'bank' || a.type === 'bank')?.id ||
      accounts[0]?.id ||
      'cash'
    );
  });
  const [copied, setCopied] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const accountChoices = useMemo(() => {
    if (accounts.length > 0) {
      return accounts.map((a) => ({
        id: a.id,
        label: a.name || (a.type === 'bank' ? 'UPI' : 'Cash'),
      }));
    }
    return [
      { id: 'cash', label: 'Cash' },
      { id: 'bank', label: 'UPI' },
    ];
  }, [accounts]);

  const grandTotalPaise = useMemo(() => {
    const rawBill = Math.max(0, parseFloat(totalAmount) || 0);
    const fees = Math.max(0, parseFloat(extraFees) || 0);
    return toPaise(rawBill + fees);
  }, [totalAmount, extraFees]);

  const validation = useMemo(
    () =>
      validateSplitInputs({
        totalPaise: grandTotalPaise,
        memberIds: people,
        mode: splitMode,
        customInputs,
      }),
    [grandTotalPaise, people, splitMode, customInputs]
  );

  const allocations = useMemo(
    () =>
      computeShares({
        totalPaise: grandTotalPaise,
        memberIds: people,
        mode: splitMode,
        customInputs,
      }),
    [grandTotalPaise, people, splitMode, customInputs]
  );

  const mySharePaise = allocations.find((a) => a.memberId === 'You')?.amountPaise ?? allocations[0]?.amountPaise ?? 0;

  const handleAddPerson = () => {
    const trimmed = newPersonName.trim();
    if (!trimmed) return;
    if (people.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      addToast({ type: 'warning', message: `${trimmed} is already in this split.` });
      return;
    }
    setPeople((prev) => [...prev, trimmed]);
    setNewPersonName('');
  };

  const handleRemovePerson = (person: string) => {
    if (person === 'You' || people.length <= 2) {
      addToast({ type: 'warning', message: 'A split requires at least 2 people including You.' });
      return;
    }
    setPeople((prev) => prev.filter((p) => p !== person));
  };

  const shareText = useMemo(() => {
    const title = billName.trim() || 'Shared Expense';
    const lines = [
      `Bill Split: ${title}`,
      `Total: ${formatPaise(grandTotalPaise, CURRENCY_SYMBOL)} (${splitMode} split across ${people.length})`,
      ...allocations.map((a) => `  • ${a.memberId}: ${formatPaise(a.amountPaise, CURRENCY_SYMBOL)}`),
      '',
      `My Share: ${formatPaise(mySharePaise, CURRENCY_SYMBOL)}`,
      'Sent via SpendWise',
    ];
    return lines.join('\n');
  }, [billName, grandTotalPaise, splitMode, people.length, allocations, mySharePaise]);

  const handleCopyShare = async () => {
    if (grandTotalPaise <= 0) {
      addToast({ type: 'warning', message: 'Enter a valid bill amount before sharing.' });
      return;
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      addToast({ type: 'success', message: 'Share summary copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast({ type: 'error', message: 'Failed to copy summary.' });
    }
  };

  const handleLogMyShare = async () => {
    if (!validation.valid || mySharePaise <= 0) {
      addToast({ type: 'error', message: validation.error || 'Enter a valid bill amount first.' });
      return;
    }
    if (!user || !householdId) {
      addToast({ type: 'error', message: 'Please sign in to log this share.' });
      return;
    }

    setIsLogging(true);
    try {
      const shareRupees = fromPaise(mySharePaise);
      const title = billName.trim()
        ? `${billName.trim()} (My Share / ${people.length})`
        : `Bill Split Share (${people.length} people)`;

      const created = await addExpense(householdId, user.uid, {
        amount: shareRupees,
        categoryId: selectedCategory,
        note: title,
        date: dateToInputValue(new Date()),
        type: 'expense',
        accountId: selectedAccountId,
      });

      addExpenseOptimistic(created);
      adjustTotalSpentOptimistic(shareRupees);

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
      });

      addToast({
        type: 'success',
        message: `Logged ${formatPaise(mySharePaise, CURRENCY_SYMBOL)} from your wallet!`,
      });
    } catch {
      addToast({ type: 'error', message: 'Failed to log your share.' });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-7 space-y-5">
        <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-theme-border space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="font-headline font-bold text-lg text-theme-primary flex items-center gap-2">
              <Receipt className="w-5 h-5 text-theme-accent" />
              Instant Split Calculator
            </h2>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-theme-surface border border-theme-border">
              {(['equal', 'exact', 'percentage', 'shares'] as SplitMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSplitMode(mode)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                    splitMode === mode
                      ? 'bg-theme-accent text-theme-on-accent'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  {mode === 'percentage' ? '%' : mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-theme-secondary block mb-1">
                Bill Description
              </label>
              <input
                type="text"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                placeholder="e.g. Swiggy Dinner, Flat WiFi, Cab"
                className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme-border text-theme-primary text-sm placeholder:text-theme-secondary outline-none focus:border-theme-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-theme-secondary block mb-1">
                  Bill Total ({CURRENCY_SYMBOL})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="e.g. 1200"
                  className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme-border text-theme-primary text-base font-mono font-bold outline-none focus:border-theme-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-theme-secondary block mb-1">
                  Delivery / Tip ({CURRENCY_SYMBOL})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={extraFees}
                  onChange={(e) => setExtraFees(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme-border text-theme-primary text-sm font-mono outline-none focus:border-theme-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-theme-secondary block mb-1">
                  Category Tag
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-theme-surface border border-theme-border text-theme-primary text-sm outline-none focus:border-theme-accent"
                >
                  {Array.from(categoriesMap.entries()).map(([id, cat]) => (
                    <option key={id} value={id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-theme-secondary block mb-1">
                  Deduct My Share From
                </label>
                <div className="flex items-center gap-1.5 bg-theme-surface border border-theme-border rounded-2xl p-1">
                  {accountChoices.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 transition-all ${
                        selectedAccountId === acc.id
                          ? 'bg-theme-accent text-theme-on-accent'
                          : 'text-theme-secondary hover:text-theme-primary'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>{acc.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participants & Split Values */}
        <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-theme-border space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-headline font-bold text-base text-theme-primary">
              Participants ({people.length})
            </h3>
            {splitMode !== 'equal' && grandTotalPaise > 0 && !validation.valid && validation.error && (
              <span className="text-xs font-semibold text-theme-danger">{validation.error}</span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPerson())}
              placeholder="Add roommate or friend..."
              className="flex-1 px-4 py-2 rounded-xl bg-theme-surface border border-theme-border text-theme-primary text-sm placeholder:text-theme-secondary outline-none focus:border-theme-accent"
            />
            <button
              type="button"
              onClick={handleAddPerson}
              className="px-4 py-2 rounded-xl bg-theme-accent text-theme-on-accent font-semibold text-xs inline-flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2">
            {allocations.map((alloc) => (
              <div
                key={alloc.memberId}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-theme-surface border border-theme-border"
              >
                <span className="text-sm font-semibold text-theme-primary">{alloc.memberId}</span>
                <div className="flex items-center gap-2.5">
                  {splitMode !== 'equal' && (
                    <input
                      type="number"
                      min="0"
                      step={splitMode === 'exact' ? '0.01' : '1'}
                      value={customInputs[alloc.memberId] ?? (splitMode === 'shares' ? 1 : '')}
                      onChange={(e) =>
                        setCustomInputs((prev) => ({
                          ...prev,
                          [alloc.memberId]: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder={splitMode === 'exact' ? '₹' : splitMode === 'percentage' ? '%' : '1'}
                      className="w-20 px-2.5 py-1 rounded-lg bg-theme-base border border-theme-border text-xs font-mono text-theme-primary text-right focus:outline-none focus:border-theme-accent"
                    />
                  )}
                  <span className="text-sm font-mono font-bold text-theme-accent tabular-nums min-w-[68px] text-right">
                    {formatPaise(alloc.amountPaise, CURRENCY_SYMBOL)}
                  </span>
                  {alloc.memberId !== 'You' && people.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(alloc.memberId)}
                      className="text-theme-tertiary hover:text-theme-danger transition-colors text-xs px-1"
                      aria-label={`Remove ${alloc.memberId}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary & Sharing */}
      <div className="lg:col-span-5 space-y-5">
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-theme-border relative overflow-hidden space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary block mb-1">
              Your Share
            </span>
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-theme-primary font-mono tabular-nums">
              {formatPaise(mySharePaise, CURRENCY_SYMBOL)}
            </div>
            <p className="text-xs text-theme-secondary mt-1.5">
              Out of {formatPaise(grandTotalPaise, CURRENCY_SYMBOL)} total across {people.length} people.
            </p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-theme-border">
            <button
              type="button"
              onClick={handleLogMyShare}
              disabled={isLogging || !validation.valid || mySharePaise <= 0}
              className="w-full py-3 rounded-2xl bg-theme-accent text-theme-on-accent font-bold text-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isLogging ? 'Logging...' : 'Log My Share to SpendWise'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShare}
              className="w-full py-2.5 rounded-2xl bg-theme-surface border border-theme-border text-theme-primary font-semibold text-xs sm:text-sm hover:bg-theme-elevated active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-theme-positive" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Summary!' : 'Copy WhatsApp Summary'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-theme-surface border border-theme-border">
            <span className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block mb-1.5">
              Message Preview
            </span>
            <pre className="text-xs text-theme-secondary font-sans whitespace-pre-wrap leading-relaxed select-all">
              {shareText}
            </pre>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border text-xs text-theme-secondary flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-theme-accent shrink-0 mt-0.5" />
          <p>
            Logging only your share keeps your SpendWise budget velocity accurate while Friends &amp; Groups track every roommate settlement to the exact paise.
          </p>
        </div>
      </div>
    </div>
  );
}

