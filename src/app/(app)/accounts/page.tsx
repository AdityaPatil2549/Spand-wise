'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Wallet, Landmark, Plus, ArrowUpCircle, ArrowDownCircle, ArrowRight, ArrowLeftRight, Copy, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useHydrated } from '@/hooks/useHydrated';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { updateAccountBalance } from '@/lib/accounts';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHaptic } from '@/hooks/useHaptic';

export default function AccountsPage() {
  const isHydrated = useHydrated();
  const accounts = useStore((s) => s.accounts);
  const householdId = useStore((s) => s.householdId);
  const updateAccountInStore = useStore((s) => s.updateAccountInStore);
  const addToast = useStore((s) => s.addToast);
  const haptic = useHaptic();
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inter-account transfer state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferDirection, setTransferDirection] = useState<'bank_to_cash' | 'cash_to_bank'>('bank_to_cash');
  const [transferAmount, setTransferAmount] = useState('');
  const [copiedUPI, setCopiedUPI] = useState(false);

  const cashAccount = accounts.find(a => a.type === 'cash' || (a.name && a.name.toLowerCase().includes('cash'))) || accounts[1];
  const bankAccount = accounts.find(a => a.type === 'bank' || (a.name && a.name.toLowerCase().includes('bank'))) || accounts[0];
  
  const bankBalance = bankAccount?.balance || 0;
  const cashBalance = cashAccount?.balance || 0;
  const totalBalance = bankBalance + cashBalance;

  const bankPercent = totalBalance > 0 ? Math.max(0, Math.min(100, Math.round((bankBalance / totalBalance) * 100))) : 50;
  const cashPercent = 100 - bankPercent;

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId || !selectedAccountId) return;
    
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      addToast({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    const amountChange = transactionType === 'deposit' ? numAmount : -numAmount;
    
    setIsSubmitting(true);
    try {
      updateAccountInStore(selectedAccountId, amountChange);
      await updateAccountBalance(householdId, selectedAccountId, amountChange);
      
      haptic.success();
      addToast({ type: 'success', message: 'Account balance updated' });
      setSelectedAccountId(null);
      setAmount('');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || 'Unknown error';
      addToast({ type: 'error', message: `Failed to update balance: ${errorMessage}` });
      updateAccountInStore(selectedAccountId, -amountChange);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId || !bankAccount || !cashAccount) return;

    const numAmount = Number(transferAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      addToast({ type: 'error', message: 'Please enter a valid transfer amount' });
      return;
    }

    const source = transferDirection === 'bank_to_cash' ? bankAccount : cashAccount;
    const target = transferDirection === 'bank_to_cash' ? cashAccount : bankAccount;

    if (source.balance < numAmount) {
      addToast({ type: 'error', message: `Insufficient balance in ${source.name}` });
      return;
    }

    setIsSubmitting(true);
    try {
      updateAccountInStore(source.id, -numAmount);
      updateAccountInStore(target.id, numAmount);

      await updateAccountBalance(householdId, source.id, -numAmount);
      await updateAccountBalance(householdId, target.id, numAmount);

      haptic.success();
      addToast({
        type: 'success',
        message: `Transferred ${CURRENCY_SYMBOL}${numAmount.toFixed(2)} from ${source.name} to ${target.name}`,
      });
      setIsTransferOpen(false);
      setTransferAmount('');
    } catch (error: any) {
      console.error(error);
      updateAccountInStore(source.id, numAmount);
      updateAccountInStore(target.id, -numAmount);
      addToast({ type: 'error', message: 'Transfer failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUPI = () => {
    haptic.light();
    navigator.clipboard.writeText('student@spendwise');
    setCopiedUPI(true);
    addToast({ type: 'info', message: 'UPI ID copied to clipboard' });
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const openTransactionModal = (accountId: string, type: 'deposit' | 'withdrawal') => {
    haptic.light();
    setSelectedAccountId(accountId);
    setTransactionType(type);
    setAmount('');
  };

  if (!isHydrated) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-36">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const selectedAccountName = accounts.find(a => a.id === selectedAccountId)?.name || 'Account';

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in pb-36 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-theme-primary tracking-tight font-display">
            Accounts & Reserves
          </h1>
          <p className="text-sm text-theme-secondary mt-1">
            Total accumulated cash & bank reserves (persists continuously, not reset monthly)
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              haptic.light();
              setIsTransferOpen(true);
            }}
            className="text-xs font-semibold text-theme-primary bg-theme-surface border border-theme-border/60 hover:bg-theme-elevated active:scale-95 px-3.5 py-2.5 rounded-2xl transition-all inline-flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-theme-accent" />
            <span>Transfer Funds</span>
          </button>
          <Link 
            href="/analytics" 
            className="text-xs font-semibold text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20 px-3.5 py-2.5 rounded-2xl transition-all inline-flex items-center gap-1.5"
          >
            <span>Analytics</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </Link>
        </div>
      </div>

      {/* Net Reserve Card */}
      <Card className="p-6 bg-gradient-to-br from-theme-elevated to-theme-base border border-theme-border/60 rounded-3xl shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">Total Net Liquid Balance</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
            Lifetime Accumulated
          </span>
        </div>
        <p className="text-3xl sm:text-4xl font-bold tracking-tight text-theme-primary font-mono tabular-nums">
          {CURRENCY_SYMBOL} {totalBalance.toFixed(2)}
        </p>
        <p className="text-xs text-theme-tertiary mt-2">Combined liquidity across your digital UPI and physical Cash accounts</p>

        {/* Liquidity Ratio Segmented Bar */}
        <div className="mt-6 pt-5 border-t border-theme-border/40">
          <div className="flex justify-between items-center text-xs font-semibold mb-2.5">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Landmark className="w-3.5 h-3.5" />
              UPI / Bank: {bankPercent}% ({CURRENCY_SYMBOL}{bankBalance.toFixed(0)})
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Wallet className="w-3.5 h-3.5" />
              Cash: {cashPercent}% ({CURRENCY_SYMBOL}{cashBalance.toFixed(0)})
            </span>
          </div>
          <div className="h-2.5 w-full bg-theme-border/30 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${bankPercent}%` }} 
              className="bg-indigo-500 h-full transition-all duration-500" 
              title={`Bank ${bankPercent}%`}
            />
            <div 
              style={{ width: `${cashPercent}%` }} 
              className="bg-emerald-500 h-full transition-all duration-500" 
              title={`Cash ${cashPercent}%`}
            />
          </div>
        </div>
      </Card>

      {/* Individual Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* UPI / Bank Account Card */}
        <Card className="p-5 sm:p-6 bg-theme-surface/70 border border-theme-border/60 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-sm">
                  <Landmark className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary text-base">
                    {bankAccount?.name === 'Bank Account' ? 'UPI Account' : (bankAccount?.name || 'UPI Account')}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyUPI}
                    className="text-xs text-theme-secondary hover:text-indigo-400 flex items-center gap-1 mt-0.5 transition-colors group"
                  >
                    <span>student@spendwise</span>
                    {copiedUPI ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-theme-tertiary group-hover:text-indigo-400" />}
                  </button>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Primary
              </span>
            </div>

            <div className="my-4">
              <span className="text-xs text-theme-tertiary uppercase tracking-wider block">Available Balance</span>
              <p className="font-bold text-theme-primary text-2xl sm:text-3xl font-mono tabular-nums tracking-tight">
                {CURRENCY_SYMBOL} {bankBalance.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-theme-border/40">
            <button 
              type="button"
              onClick={() => bankAccount ? openTransactionModal(bankAccount.id, 'deposit') : addToast({ type: 'error', message: 'Account not ready' })}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 active:scale-98 transition-all"
            >
              <ArrowUpCircle className="w-4 h-4" /> Deposit
            </button>
            <button 
              type="button"
              onClick={() => bankAccount ? openTransactionModal(bankAccount.id, 'withdrawal') : addToast({ type: 'error', message: 'Account not ready' })}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-rose-500/20 active:scale-98 transition-all"
            >
              <ArrowDownCircle className="w-4 h-4" /> Withdraw
            </button>
          </div>
        </Card>

        {/* Physical Cash Card */}
        <Card className="p-5 sm:p-6 bg-theme-surface/70 border border-theme-border/60 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-sm">
                  <Wallet className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary text-base">
                    {cashAccount?.name || 'Cash Wallet'}
                  </h3>
                  <p className="text-xs text-theme-secondary mt-0.5">Physical pocket cash & change</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Liquid
              </span>
            </div>

            <div className="my-4">
              <span className="text-xs text-theme-tertiary uppercase tracking-wider block">Available Cash</span>
              <p className="font-bold text-theme-primary text-2xl sm:text-3xl font-mono tabular-nums tracking-tight">
                {CURRENCY_SYMBOL} {cashBalance.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-theme-border/40">
            <button 
              type="button"
              onClick={() => cashAccount ? openTransactionModal(cashAccount.id, 'deposit') : addToast({ type: 'error', message: 'Account not ready' })}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 active:scale-98 transition-all"
            >
              <ArrowUpCircle className="w-4 h-4" /> Add Cash
            </button>
            <button 
              type="button"
              onClick={() => cashAccount ? openTransactionModal(cashAccount.id, 'withdrawal') : addToast({ type: 'error', message: 'Account not ready' })}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-rose-500/20 active:scale-98 transition-all"
            >
              <ArrowDownCircle className="w-4 h-4" /> Remove Cash
            </button>
          </div>
        </Card>
      </div>

      {/* Deposit/Withdrawal Modal */}
      <BottomSheet
        isOpen={!!selectedAccountId}
        onClose={() => setSelectedAccountId(null)}
        title={`${transactionType === 'deposit' ? 'Add to' : 'Withdraw from'} ${selectedAccountName}`}
      >
        <form onSubmit={handleTransaction} className="flex flex-col gap-6 pb-8 px-4">
          <div>
            <label className="text-sm font-medium text-theme-secondary mb-1.5 block">
              Amount
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-theme-secondary font-bold text-xl pointer-events-none select-none">
                {CURRENCY_SYMBOL}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full pl-10 pr-4 py-4 text-3xl font-mono tabular-nums font-semibold rounded-2xl border-2
                bg-theme-elevated text-theme-primary
                placeholder:text-theme-tertiary
                border-transparent focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent
                transition-all duration-150"
              />
            </div>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full min-h-[48px]"
            isLoading={isSubmitting}
          >
            Confirm {transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
          </Button>
        </form>
      </BottomSheet>

      {/* Transfer Between Accounts Modal */}
      <BottomSheet
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Transfer Funds Between Accounts"
      >
        <form onSubmit={handleTransfer} className="flex flex-col gap-5 pb-8 px-4">
          <div>
            <label className="text-sm font-medium text-theme-secondary mb-2 block">
              Transfer Flow
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-theme-surface rounded-2xl border border-theme-border/50">
              <button
                type="button"
                onClick={() => setTransferDirection('bank_to_cash')}
                className={`py-3 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  transferDirection === 'bank_to_cash'
                    ? 'bg-theme-accent text-theme-inverse shadow-sm'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                <span>ATM Withdrawal</span>
                <span className="text-[10px] opacity-80">UPI → Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setTransferDirection('cash_to_bank')}
                className={`py-3 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  transferDirection === 'cash_to_bank'
                    ? 'bg-theme-accent text-theme-inverse shadow-sm'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                <span>Bank Deposit</span>
                <span className="text-[10px] opacity-80">Cash → UPI</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-theme-secondary mb-1.5 block">
              Transfer Amount
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-theme-secondary font-bold text-xl pointer-events-none select-none">
                {CURRENCY_SYMBOL}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full pl-10 pr-4 py-4 text-3xl font-mono tabular-nums font-semibold rounded-2xl border-2
                bg-theme-elevated text-theme-primary
                placeholder:text-theme-tertiary
                border-transparent focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent
                transition-all duration-150"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full min-h-[48px]"
            isLoading={isSubmitting}
          >
            Execute Transfer
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
