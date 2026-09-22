'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Wallet, Landmark, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useHydrated } from '@/hooks/useHydrated';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import { updateAccountBalance } from '@/lib/accounts';

export default function AccountsPage() {
  const isHydrated = useHydrated();
  const accounts = useStore((s) => s.accounts);
  const householdId = useStore((s) => s.householdId);
  const updateAccountInStore = useStore((s) => s.updateAccountInStore);
  const addToast = useStore((s) => s.addToast);
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cashAccount = accounts.find(a => a.type === 'cash' || (a.name && a.name.toLowerCase().includes('cash'))) || accounts[1];
  const bankAccount = accounts.find(a => a.type === 'bank' || (a.name && a.name.toLowerCase().includes('bank'))) || accounts[0];
  
  const totalBalance = (cashAccount?.balance || 0) + (bankAccount?.balance || 0);

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
      // Optimistic update
      updateAccountInStore(selectedAccountId, amountChange);
      
      // Backend update
      await updateAccountBalance(householdId, selectedAccountId, amountChange);
      
      addToast({ type: 'success', message: 'Account balance updated' });
      setSelectedAccountId(null);
      setAmount('');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || 'Unknown error';
      addToast({ type: 'error', message: `Failed to update balance: ${errorMessage}` });
      // Rollback
      updateAccountInStore(selectedAccountId, -amountChange);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTransactionModal = (accountId: string, type: 'deposit' | 'withdrawal') => {
    setSelectedAccountId(accountId);
    setTransactionType(type);
    setAmount('');
  };

  if (!isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-theme-border border-t-theme-accent animate-spin" />
      </div>
    );
  }

  const selectedAccountName = accounts.find(a => a.id === selectedAccountId)?.name || 'Account';

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-theme-primary tracking-tight">My Savings</h1>
          <p className="text-sm text-theme-secondary mt-1">Manage your savings and cash balances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available Balance */}
        <Card className="p-6 bg-gradient-to-br from-theme-elevated to-theme-base border-theme-border">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-theme-secondary">Total Savings</h3>
          </div>
          <p className="text-3xl font-bold tracking-tight text-theme-primary">
            {CURRENCY_SYMBOL} {totalBalance.toFixed(2)}
          </p>
        </Card>

        {/* Available Credit */}
        <Card className="p-6 bg-gradient-to-br from-theme-elevated to-theme-base border-theme-border opacity-50 hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-theme-secondary">Available Credit</h3>
          </div>
          <p className="text-3xl font-bold tracking-tight text-theme-primary">
            {CURRENCY_SYMBOL} 0.00
          </p>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-500" />
            Savings Accounts
          </h2>
          <Card className="p-4 hover:bg-theme-elevated/50 transition-colors group">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-theme-primary">{bankAccount?.name === 'Bank Account' ? 'UPI' : (bankAccount?.name || 'UPI')}</h3>
                  <p className="text-xs text-theme-secondary">Savings</p>
                </div>
              </div>
              <p className="font-semibold text-theme-primary text-lg">{CURRENCY_SYMBOL} {(bankAccount?.balance || 0).toFixed(2)}</p>
            </div>
            
             <div className="flex gap-2 mt-4 pt-4 border-t border-theme-border/50">
               <button 
                 onClick={() => bankAccount ? openTransactionModal(bankAccount.id, 'deposit') : addToast({ type: 'error', message: 'Account not ready, please wait or refresh' })}
                 className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors">
                 <ArrowUpCircle className="w-4 h-4" /> Deposit
               </button>
               <button 
                 onClick={() => bankAccount ? openTransactionModal(bankAccount.id, 'withdrawal') : addToast({ type: 'error', message: 'Account not ready, please wait or refresh' })}
                 className="flex-1 py-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors">
                 <ArrowDownCircle className="w-4 h-4" /> Withdraw
               </button>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-500" />
            Cash
          </h2>
          <Card className="p-4 hover:bg-theme-elevated/50 transition-colors group">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-theme-primary">{cashAccount?.name || 'Cash Wallet'}</h3>
                  <p className="text-xs text-theme-secondary">Physical cash</p>
                </div>
              </div>
              <p className="font-semibold text-theme-primary text-lg">{CURRENCY_SYMBOL} {(cashAccount?.balance || 0).toFixed(2)}</p>
            </div>
            
             <div className="flex gap-2 mt-4 pt-4 border-t border-theme-border/50">
               <button 
                 onClick={() => cashAccount ? openTransactionModal(cashAccount.id, 'deposit') : addToast({ type: 'error', message: 'Account not ready, please wait or refresh' })}
                 className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors">
                 <ArrowUpCircle className="w-4 h-4" /> Add Cash
               </button>
               <button 
                 onClick={() => cashAccount ? openTransactionModal(cashAccount.id, 'withdrawal') : addToast({ type: 'error', message: 'Account not ready, please wait or refresh' })}
                 className="flex-1 py-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors">
                 <ArrowDownCircle className="w-4 h-4" /> Remove Cash
               </button>
            </div>
          </Card>
        </div>
      </div>

      <BottomSheet
        isOpen={!!selectedAccountId}
        onClose={() => setSelectedAccountId(null)}
        title={`${transactionType === 'deposit' ? 'Add to' : 'Withdraw from'} ${selectedAccountName}`}
      >
        <form onSubmit={handleTransaction} className="flex flex-col gap-6">
          <div>
            <label className="text-sm font-medium text-theme-secondary mb-1.5 block font-body">
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
                className="w-full pl-10 pr-4 py-4 text-4xl font-manrope tabular-nums font-semibold rounded-2xl border-2
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
            className="w-full"
            isLoading={isSubmitting}
          >
            Confirm {transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
