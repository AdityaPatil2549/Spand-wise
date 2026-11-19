'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Handshake,
  Plus,
  Receipt,
  Scale,
  Smartphone,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useStore } from '@/store';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';
import { addExpense } from '@/lib/expenses/index';
import { dateToInputValue } from '@/lib/utils/date';
import {
  buildUpiDeepLink,
  computeNetBalances,
  computeRawDebts,
  computeShares,
  formatPaise,
  fromPaise,
  simplifyDebts,
  toPaise,
  validateSplitInputs,
  type DebtTransfer,
} from '@/lib/splits/engine';
import {
  addSplitExpense,
  createSplitGroup,
  softDeleteSplitExpense,
  updateSplitGroupSimplify,
} from '@/lib/splits/firestore';
import type {
  SplitExpenseDocument,
  SplitGroupDocument,
  SplitGroupMember,
  SplitMode,
} from '@/types/firestore';

interface SplitLedgerPanelProps {
  mode: 'groups' | 'friends';
  groups: SplitGroupDocument[];
  expenses: SplitExpenseDocument[];
  isLoading: boolean;
}

const EMOJI_OPTIONS = ['🏠', '✈️', '🍕', '🎉', '🚗', '🎓'];

export function SplitLedgerPanel({ mode, groups, expenses, isLoading }: SplitLedgerPanelProps) {
  const user = useStore((s) => s.user);
  const householdId = useStore((s) => s.householdId);
  const accounts = useStore((s) => s.accounts);
  const addToast = useStore((s) => s.addToast);
  const addExpenseOptimistic = useStore((s) => s.addExpenseOptimistic);
  const adjustTotalSpentOptimistic = useStore((s) => s.adjustTotalSpentOptimistic);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create Group / Friend state
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏠');
  const [friendUpi, setFriendUpi] = useState('');
  const [draftMembers, setDraftMembers] = useState<Array<{ name: string; upiId?: string }>>([]);
  const [memberInputName, setMemberInputName] = useState('');
  const [memberInputUpi, setMemberInputUpi] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Add Expense inside Group / Friend state
  const [desc, setDesc] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [paidById, setPaidById] = useState('self');
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [customInputs, setCustomInputs] = useState<Record<string, number>>({});
  const [logPersonalShare, setLogPersonalShare] = useState(false);
  const [personalAccountId, setPersonalAccountId] = useState<string>(() => {
    return (
      accounts.find((a) => a.id === 'bank' || a.type === 'bank')?.id ||
      accounts[0]?.id ||
      'cash'
    );
  });
  const [isSavingBill, setIsSavingBill] = useState(false);
  const [settlingTransfer, setSettlingTransfer] = useState<DebtTransfer | null>(null);
  const [isSettling, setIsSettling] = useState(false);

  const filteredGroups = useMemo(
    () => groups.filter((g) => (mode === 'friends' ? !!g.isDirect : !g.isDirect)),
    [groups, mode]
  );

  const activeGroup = useMemo(() => {
    if (filteredGroups.length === 0) return null;
    return filteredGroups.find((g) => g.id === selectedGroupId) || filteredGroups[0];
  }, [filteredGroups, selectedGroupId]);

  const groupExpenses = useMemo(() => {
    if (!activeGroup) return [];
    return expenses.filter((e) => e.groupId === activeGroup.id);
  }, [expenses, activeGroup]);

  const memberNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!activeGroup) return map;
    for (const m of activeGroup.members) {
      map[m.id] = m.name;
    }
    return map;
  }, [activeGroup]);

  const memberUpiMap = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    if (!activeGroup) return map;
    for (const m of activeGroup.members) {
      map[m.id] = m.upiId;
    }
    return map;
  }, [activeGroup]);

  const netBalances = useMemo(() => {
    if (!activeGroup) return {};
    return computeNetBalances(activeGroup.members, groupExpenses);
  }, [activeGroup, groupExpenses]);

  const maxAbsBalance = useMemo(() => {
    const vals = Object.values(netBalances).map((v) => Math.abs(v));
    return Math.max(100, ...vals);
  }, [netBalances]);

  const transfers = useMemo(() => {
    if (!activeGroup) return [];
    return activeGroup.simplifyDebts
      ? simplifyDebts(netBalances, memberNamesMap)
      : computeRawDebts(groupExpenses, memberNamesMap);
  }, [activeGroup, netBalances, groupExpenses, memberNamesMap]);

  const handleCopyUpi = (upiId: string, name: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(upiId).then(() => {
        addToast({ type: 'success', message: `Copied ${name}'s UPI ID: ${upiId}` });
      }).catch(() => {
        addToast({ type: 'error', message: 'Failed to copy UPI ID' });
      });
    }
  };

  const totalPaiseInput = toPaise(parseFloat(amountStr) || 0);
  const activeMemberIds = useMemo(
    () => (activeGroup ? activeGroup.members.map((m) => m.id) : []),
    [activeGroup]
  );

  const splitValidation = useMemo(
    () =>
      validateSplitInputs({
        totalPaise: totalPaiseInput,
        memberIds: activeMemberIds,
        mode: splitMode,
        customInputs,
      }),
    [totalPaiseInput, activeMemberIds, splitMode, customInputs]
  );

  const previewAllocations = useMemo(
    () =>
      computeShares({
        totalPaise: totalPaiseInput,
        memberIds: activeMemberIds,
        mode: splitMode,
        customInputs,
      }),
    [totalPaiseInput, activeMemberIds, splitMode, customInputs]
  );

  const handleAddDraftMember = () => {
    const trimmed = memberInputName.trim();
    if (!trimmed) return;
    if (draftMembers.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      addToast({ type: 'warning', message: 'Member already added.' });
      return;
    }
    setDraftMembers((prev) => [
      ...prev,
      { name: trimmed, upiId: memberInputUpi.trim() || undefined },
    ]);
    setMemberInputName('');
    setMemberInputUpi('');
  };

  const handleCreateGroupOrFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !householdId) {
      addToast({ type: 'error', message: 'Sign in required to save groups.' });
      return;
    }
    const cleanName = newName.trim();
    if (!cleanName) {
      addToast({ type: 'error', message: mode === 'friends' ? 'Enter friend name.' : 'Enter group name.' });
      return;
    }

    const selfMember: SplitGroupMember = {
      id: 'self',
      name: user.displayName?.split(' ')[0] || 'You',
      isSelf: true,
    };

    const members: SplitGroupMember[] =
      mode === 'friends'
        ? [
            selfMember,
            {
              id: `friend-${Date.now()}`,
              name: cleanName,
              upiId: friendUpi.trim() || undefined,
            },
          ]
        : [
            selfMember,
            ...draftMembers.map((m, i) => ({
              id: `m-${Date.now()}-${i}`,
              name: m.name,
              upiId: m.upiId,
            })),
          ];

    if (members.length < 2) {
      addToast({ type: 'error', message: 'Add at least 1 other person.' });
      return;
    }

    setIsCreatingGroup(true);
    try {
      const createdId = await createSplitGroup(householdId, user.uid, {
        name: cleanName,
        emoji: mode === 'friends' ? '🤝' : newEmoji,
        isDirect: mode === 'friends',
        simplifyDebts: true,
        members,
      });
      setSelectedGroupId(createdId);
      setNewName('');
      setFriendUpi('');
      setDraftMembers([]);
      setShowCreateForm(false);
      addToast({
        type: 'success',
        message: mode === 'friends' ? `Added ${cleanName} to 1:1 Friends!` : `Group "${cleanName}" created!`,
      });
    } catch {
      addToast({ type: 'error', message: 'Failed to create ledger.' });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleAddGroupExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !householdId || !activeGroup) return;
    if (!desc.trim()) {
      addToast({ type: 'error', message: 'Enter an expense description.' });
      return;
    }
    if (!splitValidation.valid) {
      addToast({ type: 'error', message: splitValidation.error || 'Invalid split distribution.' });
      return;
    }

    setIsSavingBill(true);
    try {
      await addSplitExpense(householdId, user.uid, {
        groupId: activeGroup.id,
        description: desc.trim(),
        totalPaise: totalPaiseInput,
        paidById,
        paidByName: memberNamesMap[paidById] || 'You',
        mode: splitMode,
        allocations: previewAllocations,
      });

      const selfAlloc = previewAllocations.find((a) => a.memberId === 'self');
      if (logPersonalShare && selfAlloc && selfAlloc.amountPaise > 0) {
        const shareRupees = fromPaise(selfAlloc.amountPaise);
        const createdExp = await addExpense(householdId, user.uid, {
          amount: shareRupees,
          categoryId: DEFAULT_CATEGORY_ID,
          note: `${desc.trim()} (${activeGroup.name} Share)`,
          date: dateToInputValue(new Date()),
          type: 'expense',
          accountId: personalAccountId,
        });
        addExpenseOptimistic(createdExp);
        adjustTotalSpentOptimistic(shareRupees);
      }

      setDesc('');
      setAmountStr('');
      setCustomInputs({});
      addToast({ type: 'success', message: 'Shared expense recorded!' });
    } catch {
      addToast({ type: 'error', message: 'Failed to save shared expense.' });
    } finally {
      setIsSavingBill(false);
    }
  };

  const handleRecordSettlement = async (transfer: DebtTransfer) => {
    if (!user || !householdId || !activeGroup) return;
    setIsSettling(true);
    try {
      await addSplitExpense(householdId, user.uid, {
        groupId: activeGroup.id,
        description: `Settlement: ${transfer.fromName} -> ${transfer.toName}`,
        totalPaise: transfer.amountPaise,
        paidById: transfer.fromId,
        paidByName: transfer.fromName,
        mode: 'exact',
        allocations: [{ memberId: transfer.toId, amountPaise: transfer.amountPaise }],
        isSettlement: true,
      });
      setSettlingTransfer(null);
      addToast({
        type: 'success',
        message: `Settled ${formatPaise(transfer.amountPaise, CURRENCY_SYMBOL)} cleanly!`,
      });
    } catch {
      addToast({ type: 'error', message: 'Failed to record settlement.' });
    } finally {
      setIsSettling(false);
    }
  };

  const handleToggleSimplify = async () => {
    if (!householdId || !activeGroup) return;
    try {
      await updateSplitGroupSimplify(householdId, activeGroup.id, !activeGroup.simplifyDebts);
    } catch {
      addToast({ type: 'error', message: 'Failed to toggle debt mode.' });
    }
  };

  const handleCopyGroupSummary = async () => {
    if (!activeGroup) return;
    const lines = [
      `${activeGroup.emoji || '💸'} ${activeGroup.name} Balances:`,
      ...activeGroup.members.map((m) => {
        const bal = netBalances[m.id] ?? 0;
        const status =
          bal > 0
            ? `gets back ${formatPaise(bal, CURRENCY_SYMBOL)}`
            : bal < 0
            ? `owes ${formatPaise(Math.abs(bal), CURRENCY_SYMBOL)}`
            : 'settled up';
        return `  • ${m.name}: ${status}`;
      }),
      '',
      'Settlement Plan:',
      ...(transfers.length === 0
        ? ['  All settled up!']
        : transfers.map(
            (t) => `  • ${t.fromName} -> ${t.toName}: ${formatPaise(t.amountPaise, CURRENCY_SYMBOL)}`
          )),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      addToast({ type: 'success', message: 'Balances summary copied!' });
    } catch {
      addToast({ type: 'error', message: 'Clipboard copy failed.' });
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center text-sm text-theme-secondary">
        Loading your shared ledgers...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Group / Friend Pill Selector + New Button */}
      <div className="flex flex-wrap items-center gap-2">
        {filteredGroups.map((g) => {
          const isSelected = activeGroup?.id === g.id && !showCreateForm;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setSelectedGroupId(g.id);
                setShowCreateForm(false);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold border transition-all ${
                isSelected
                  ? 'bg-theme-accent text-theme-on-accent border-theme-accent shadow-sm'
                  : 'bg-theme-surface border-theme-border text-theme-primary hover:bg-theme-elevated'
              }`}
            >
              <span>{g.emoji || (mode === 'friends' ? '🤝' : '🏠')}</span>
              <span>{g.name}</span>
              <span className="text-[11px] opacity-80">({g.members.length})</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setShowCreateForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-theme-surface hover:bg-theme-elevated border border-dashed border-theme-accent/50 text-theme-accent transition-all"
        >
          {mode === 'friends' ? <UserPlus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{mode === 'friends' ? 'Add Friend' : 'New Group'}</span>
        </button>
      </div>

      {/* Inline Create Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateGroupOrFriend}
          className="glass-panel p-5 sm:p-6 rounded-3xl border border-theme-accent/30 space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-base text-theme-primary flex items-center gap-2">
              {mode === 'friends' ? <Handshake className="w-4 h-4 text-theme-accent" /> : <Users className="w-4 h-4 text-theme-accent" />}
              {mode === 'friends' ? 'Add 1:1 Friend Ledger' : 'Create Shared Group'}
            </h3>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-theme-secondary hover:text-theme-primary"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-theme-secondary block mb-1">
                {mode === 'friends' ? 'Friend Name' : 'Group Name'}
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={mode === 'friends' ? 'e.g. Rahul Verma' : 'e.g. Room 402 / Goa Trip'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme-border text-sm text-theme-primary outline-none focus:border-theme-accent"
              />
            </div>

            {mode === 'friends' ? (
              <div>
                <label className="text-xs font-semibold text-theme-secondary block mb-1">
                  Friend&apos;s UPI ID (Optional, for 1-Tap Pay)
                </label>
                <input
                  type="text"
                  value={friendUpi}
                  onChange={(e) => setFriendUpi(e.target.value)}
                  placeholder="e.g. rahul@okicici"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme-border text-sm text-theme-primary outline-none focus:border-theme-accent"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-theme-secondary block mb-1">
                  Icon Badge
                </label>
                <div className="flex items-center gap-1.5">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewEmoji(em)}
                      className={`w-10 h-10 rounded-xl border text-lg flex items-center justify-center transition-all ${
                        newEmoji === em
                          ? 'bg-theme-accent text-theme-on-accent border-theme-accent'
                          : 'bg-theme-surface border-theme-border hover:bg-theme-elevated'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {mode === 'groups' && (
            <div className="space-y-2.5 pt-2 border-t border-theme-border">
              <label className="text-xs font-semibold text-theme-secondary block">
                Add Members (You are included automatically)
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={memberInputName}
                  onChange={(e) => setMemberInputName(e.target.value)}
                  placeholder="Member name..."
                  className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-theme-surface border border-theme-border text-sm text-theme-primary outline-none focus:border-theme-accent"
                />
                <input
                  type="text"
                  value={memberInputUpi}
                  onChange={(e) => setMemberInputUpi(e.target.value)}
                  placeholder="UPI ID (optional)"
                  className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-theme-surface border border-theme-border text-sm text-theme-primary outline-none focus:border-theme-accent"
                />
                <button
                  type="button"
                  onClick={handleAddDraftMember}
                  className="px-4 py-2 rounded-xl bg-theme-elevated border border-theme-border text-xs font-bold text-theme-primary hover:bg-theme-surface"
                >
                  + Add Person
                </button>
              </div>
              {draftMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {draftMembers.map((m) => (
                    <span
                      key={m.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent/15 text-theme-accent text-xs font-semibold"
                    >
                      <span>{m.name}</span>
                      {m.upiId && <span className="opacity-75">({m.upiId})</span>}
                      <button
                        type="button"
                        onClick={() => setDraftMembers((prev) => prev.filter((x) => x.name !== m.name))}
                        className="ml-1 hover:text-theme-danger"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreatingGroup}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-theme-on-accent font-bold text-xs sm:text-sm hover:opacity-90 disabled:opacity-50"
            >
              {isCreatingGroup
                ? 'Creating...'
                : mode === 'friends'
                ? 'Create 1:1 Ledger'
                : 'Create Group'}
            </button>
          </div>
        </form>
      )}

      {/* Empty State when no group/friend exists yet */}
      {!activeGroup && !showCreateForm && (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-theme-border text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-theme-accent/15 text-theme-accent flex items-center justify-center mx-auto">
            {mode === 'friends' ? <Handshake className="w-6 h-6" /> : <Users className="w-6 h-6" />}
          </div>
          <h3 className="font-headline font-bold text-lg text-theme-primary">
            {mode === 'friends' ? 'No 1:1 Friend Ledgers Yet' : 'No Shared Groups Yet'}
          </h3>
          <p className="text-xs sm:text-sm text-theme-secondary max-w-md mx-auto">
            {mode === 'friends'
              ? 'Add a friend to track pairwise IOUs, unequal shares, and settle via UPI with zero awkward reminders.'
              : 'Create a hostel room, flat, or trip group with automatic Splitwise Min-Cash-Flow debt simplification.'}
          </p>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-theme-accent text-theme-on-accent font-bold text-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            <span>{mode === 'friends' ? 'Add First Friend' : 'Create First Group'}</span>
          </button>
        </div>
      )}

      {/* Active Workspace */}
      {activeGroup && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Balances + Add Expense + Activity */}
          <div className="lg:col-span-7 space-y-5">
            {/* Diverging Net Balances Bar Card */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-theme-border space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-base text-theme-primary flex items-center gap-2">
                  <Scale className="w-4 h-4 text-theme-accent" />
                  <span>{activeGroup.name} Net Balances</span>
                </h3>
                <button
                  type="button"
                  onClick={handleCopyGroupSummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-theme-surface border border-theme-border text-xs font-semibold text-theme-secondary hover:text-theme-primary"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {activeGroup.members.map((m) => {
                  const bal = netBalances[m.id] ?? 0;
                  const pct = Math.min(100, Math.round((Math.abs(bal) / maxAbsBalance) * 100));
                  const isCreditor = bal > 0;
                  const isDebtor = bal < 0;
                  return (
                    <div key={m.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-theme-primary">{m.name}</span>
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            isCreditor
                              ? 'text-theme-positive'
                              : isDebtor
                              ? 'text-theme-danger'
                              : 'text-theme-secondary'
                          }`}
                        >
                          {isCreditor
                            ? `+${formatPaise(bal, CURRENCY_SYMBOL)} owed`
                            : isDebtor
                            ? `-${formatPaise(Math.abs(bal), CURRENCY_SYMBOL)} owes`
                            : 'Settled'}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-theme-surface overflow-hidden border border-theme-border/60">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCreditor
                              ? 'bg-theme-positive'
                              : isDebtor
                              ? 'bg-theme-danger'
                              : 'bg-theme-border'
                          }`}
                          style={{ width: `${bal === 0 ? 0 : Math.max(8, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Log Shared Bill Form */}
            <form
              onSubmit={handleAddGroupExpense}
              className="glass-panel p-5 sm:p-6 rounded-3xl border border-theme-border space-y-4"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-headline font-bold text-base text-theme-primary flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-theme-accent" />
                  <span>Add Shared Bill</span>
                </h3>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-theme-surface border border-theme-border">
                  {(['equal', 'exact', 'percentage', 'shares'] as SplitMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSplitMode(m)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                        splitMode === m
                          ? 'bg-theme-accent text-theme-on-accent'
                          : 'text-theme-secondary hover:text-theme-primary'
                      }`}
                    >
                      {m === 'percentage' ? '%' : m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="split-expense-desc" className="text-[11px] font-semibold text-theme-secondary block mb-1">
                    Description
                  </label>
                  <input
                    id="split-expense-desc"
                    name="splitDescription"
                    type="text"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="e.g. Groceries, Electricity, Dinner"
                    aria-label="Split expense description"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme-border text-sm text-theme-primary outline-none focus:border-theme-accent"
                  />
                </div>
                <div>
                  <label htmlFor="split-expense-total" className="text-[11px] font-semibold text-theme-secondary block mb-1">
                    Total ({CURRENCY_SYMBOL})
                  </label>
                  <input
                    id="split-expense-total"
                    name="splitTotalAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0"
                    aria-label={`Split total amount in ${CURRENCY_SYMBOL}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme-border text-sm font-mono font-bold text-theme-primary outline-none focus:border-theme-accent"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="split-expense-paid-by" className="text-xs font-semibold text-theme-secondary">Paid by:</label>
                  <select
                    id="split-expense-paid-by"
                    name="paidByMember"
                    value={paidById}
                    onChange={(e) => setPaidById(e.target.value)}
                    aria-label="Select member who paid"
                    className="px-3 py-1.5 rounded-xl bg-theme-surface border border-theme-border text-xs font-semibold text-theme-primary outline-none focus:border-theme-accent"
                  >
                    {activeGroup.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {totalPaiseInput > 0 && !splitValidation.valid && splitValidation.error && (
                  <span className="text-xs font-semibold text-theme-danger">
                    {splitValidation.error}
                  </span>
                )}
              </div>

              {/* Member Split Breakdown Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {previewAllocations.map((alloc) => (
                  <div
                    key={alloc.memberId}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-theme-surface border border-theme-border"
                  >
                    <span className="text-xs font-semibold text-theme-primary truncate">
                      {memberNamesMap[alloc.memberId] || alloc.memberId}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
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
                          className="w-16 px-2 py-1 rounded-lg bg-theme-base border border-theme-border text-xs font-mono text-theme-primary text-right focus:outline-none focus:border-theme-accent"
                        />
                      )}
                      <span className="text-xs font-mono font-bold text-theme-accent tabular-nums">
                        {formatPaise(alloc.amountPaise, CURRENCY_SYMBOL)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional deduct personal budget share */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-theme-border">
                <label htmlFor="split-deduct-personal-share" className="inline-flex items-center gap-2 text-xs text-theme-secondary cursor-pointer select-none">
                  <input
                    id="split-deduct-personal-share"
                    name="logPersonalShare"
                    type="checkbox"
                    checked={logPersonalShare}
                    onChange={(e) => setLogPersonalShare(e.target.checked)}
                    aria-label="Also deduct my share from SpendWise wallet"
                    className="rounded border-theme-border accent-[rgb(var(--theme-accent))]"
                  />
                  <span>Also deduct my share from SpendWise wallet:</span>
                </label>
                {logPersonalShare && (
                  <select
                    id="split-personal-account-select"
                    name="personalAccountId"
                    value={personalAccountId}
                    onChange={(e) => setPersonalAccountId(e.target.value)}
                    aria-label="Select wallet to deduct share from"
                    className="px-2.5 py-1 rounded-lg bg-theme-surface border border-theme-border text-xs font-semibold text-theme-primary"
                  >
                    {(accounts.length > 0
                      ? accounts
                      : [
                          { id: 'cash', name: 'Cash' },
                          { id: 'bank', name: 'UPI' },
                        ]
                    ).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                type="submit"
                disabled={isSavingBill || !splitValidation.valid}
                className="w-full py-3 rounded-2xl bg-theme-accent text-theme-on-accent font-bold text-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isSavingBill ? 'Saving...' : 'Save Shared Expense'}
              </button>
            </form>

            {/* Activity Feed */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-theme-border space-y-3">
              <h3 className="font-headline font-bold text-base text-theme-primary">
                Recent Activity ({groupExpenses.length})
              </h3>
              {groupExpenses.length === 0 ? (
                <p className="text-xs text-theme-secondary py-4 text-center">
                  No shared bills logged in {activeGroup.name} yet. Add one above to calculate balances automatically.
                </p>
              ) : (
                <div className="space-y-2">
                  {groupExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl bg-theme-surface border border-theme-border"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-theme-primary truncate">
                            {exp.description}
                          </span>
                          {exp.isSettlement && (
                            <span className="px-2 py-0.5 rounded-full bg-theme-positive/15 text-theme-positive text-[10px] font-bold">
                              Settled
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-theme-secondary">
                          {exp.paidByName} paid • {exp.mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-sm font-mono font-bold text-theme-primary tabular-nums">
                          {formatPaise(exp.totalPaise, CURRENCY_SYMBOL)}
                        </span>
                        <button
                          type="button"
                          onClick={() => householdId && softDeleteSplitExpense(householdId, exp.id)}
                          className="p-1.5 rounded-lg text-theme-tertiary hover:text-theme-danger hover:bg-theme-danger/10 transition-colors"
                          aria-label={`Delete ${exp.description}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Debt Simplification + Settle Up + UPI Links */}
          <div className="lg:col-span-5 space-y-5">
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-theme-border space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-headline font-bold text-base text-theme-primary">
                    Suggested Settlements
                  </h3>
                  <p className="text-[11px] text-theme-secondary">
                    {activeGroup.simplifyDebts
                      ? 'Min-Cash-Flow Simplified (fewer transfers)'
                      : 'Raw Pairwise Transfers (unsimplified)'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSimplify}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                    activeGroup.simplifyDebts
                      ? 'bg-theme-accent/15 text-theme-accent border-theme-accent/30'
                      : 'bg-theme-surface text-theme-secondary border-theme-border'
                  }`}
                >
                  {activeGroup.simplifyDebts ? 'Simplified ON' : 'Raw Mode'}
                </button>
              </div>

              {transfers.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-9 h-9 text-theme-positive mx-auto" />
                  <p className="text-sm font-semibold text-theme-primary">All settled up!</p>
                  <p className="text-xs text-theme-secondary">Zero pending dues in {activeGroup.name}.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transfers.map((t, idx) => {
                    const upiHref = buildUpiDeepLink({
                      payeeUpiId: memberUpiMap[t.toId],
                      payeeName: t.toName,
                      amountPaise: t.amountPaise,
                      note: `${activeGroup.name} settle`,
                    });
                    const isConfirming =
                      settlingTransfer?.fromId === t.fromId &&
                      settlingTransfer?.toId === t.toId;

                    return (
                      <div
                        key={`${t.fromId}-${t.toId}-${idx}`}
                        className="p-3.5 rounded-2xl bg-theme-surface border border-theme-border space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-theme-primary min-w-0">
                            <span className="truncate">{t.fromName}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                            <span className="truncate">{t.toName}</span>
                          </div>
                          <span className="text-sm font-mono font-bold text-theme-accent tabular-nums shrink-0">
                            {formatPaise(t.amountPaise, CURRENCY_SYMBOL)}
                          </span>
                        </div>

                        {isConfirming ? (
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-theme-border">
                            <span className="text-[11px] font-medium text-theme-secondary">
                              Mark {formatPaise(t.amountPaise, CURRENCY_SYMBOL)} paid?
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSettlingTransfer(null)}
                                className="px-2.5 py-1 rounded-lg bg-theme-base border border-theme-border text-[11px] font-semibold text-theme-secondary"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={isSettling}
                                onClick={() => handleRecordSettlement(t)}
                                className="px-3 py-1 rounded-lg bg-theme-positive text-theme-on-primary text-[11px] font-bold"
                              >
                                {isSettling ? 'Saving...' : 'Confirm'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSettlingTransfer(t)}
                              className="flex-1 py-2 rounded-xl bg-theme-accent text-theme-on-accent font-bold text-xs inline-flex items-center justify-center gap-1.5 hover:opacity-90"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Settle Up</span>
                            </button>
                            {upiHref ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <a
                                  href={upiHref}
                                  className="px-3.5 py-2 rounded-xl bg-theme-base border border-theme-border text-theme-primary font-semibold text-xs inline-flex items-center gap-1.5 hover:border-theme-accent active:scale-95 transition-all"
                                >
                                  <Smartphone className="w-3.5 h-3.5 text-theme-accent" />
                                  <span>Pay UPI</span>
                                </a>
                                {memberUpiMap[t.toId] && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyUpi(memberUpiMap[t.toId]!, t.toName)}
                                    title={`Copy UPI: ${memberUpiMap[t.toId]}`}
                                    aria-label={`Copy ${t.toName}'s UPI ID`}
                                    className="p-2 rounded-xl bg-theme-base border border-theme-border text-theme-secondary hover:text-theme-primary hover:border-theme-accent active:scale-95 transition-all"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span
                                className="px-3 py-2 rounded-xl bg-theme-base border border-theme-border text-[11px] text-theme-tertiary"
                                title={`No UPI ID saved for ${t.toName}`}
                              >
                                No UPI ID
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

