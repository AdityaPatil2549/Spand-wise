'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { CalendarClock, Plus, ArrowRight, ChevronDown, RefreshCw, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { CategoryPicker } from '@/components/shared/CategoryPicker';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { AnimatedDatePicker } from '@/components/ui/AnimatedDatePicker';
import { SubscriptionListItem } from '@/components/features/scheduled/SubscriptionListItem';
import { dateToInputValue } from '@/lib/utils/date';
import { addScheduledTransaction, deleteScheduledTransaction, updateScheduledTransaction } from '@/lib/scheduled';
import { addExpense } from '@/lib/expenses';
import { Timestamp } from 'firebase/firestore';

export default function ScheduledPage() {
  const isHydrated = useHydrated();
  const scheduledTransactions = useStore((s) => s.scheduledTransactions);
  const categories = useStore((s) => s.categories);
  const user = useStore(s => s.user);
  const householdId = useStore(s => s.householdId);
  const accounts = useStore(s => s.accounts);
  const addScheduledOptimistic = useStore(s => s.addScheduledOptimistic);
  const removeScheduledOptimistic = useStore(s => s.removeScheduledOptimistic);
  const addExpenseOptimistic = useStore(s => s.addExpenseOptimistic);
  const addToast = useStore(s => s.addToast);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'bills' | 'subscriptions'>('all');
  
  // Form State
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(dateToInputValue());

  const activeScheduled = scheduledTransactions.filter(t => t.isActive);

  const filteredScheduled = useMemo(() => {
    if (activeTab === 'bills') {
      return activeScheduled.filter(s => s.frequency === 'one-time');
    }
    if (activeTab === 'subscriptions') {
      return activeScheduled.filter(s => s.frequency !== 'one-time');
    }
    return activeScheduled;
  }, [activeScheduled, activeTab]);

  const totalMonthlyCommitment = useMemo(() => {
    return activeScheduled.reduce((sum, s) => {
      let multiplier = 1;
      if (s.frequency === 'daily') multiplier = 30;
      else if (s.frequency === 'weekly') multiplier = 4.33;
      else if (s.frequency === 'yearly') multiplier = 1 / 12;
      return sum + s.amount * multiplier;
    }, 0);
  }, [activeScheduled]);

  const liquidReserve = useMemo(() => {
    return accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  }, [accounts]);

  const dueInNext7Days = useMemo(() => {
    const now = Date.now();
    const sevenDaysLater = now + 7 * 24 * 60 * 60 * 1000;
    return activeScheduled
      .filter(s => {
        const due = s.nextDueDate.toDate().getTime();
        return due >= now - 24 * 60 * 60 * 1000 && due <= sevenDaysLater;
      })
      .reduce((sum, s) => sum + s.amount, 0);
  }, [activeScheduled]);

  const coverageRatio = dueInNext7Days > 0 ? (liquidReserve / dueInNext7Days).toFixed(1) : 'Fully Covered';

  if (!isHydrated) {
    return (
      <div className="min-h-screen pb-36 pt-24 max-w-4xl mx-auto px-4 md:px-8 space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!amount || !categoryId || !user) return;
    
    const nextDueDate = Timestamp.fromDate(new Date(startDate));
    const tempId = `temp-${Date.now()}`;
    const payload = {
      amount: parseFloat(amount),
      categoryId,
      frequency,
      note: note.trim() || null,
      payee: note.trim() || null,
      type: frequency === 'one-time' ? ('bill' as const) : ('subscription' as const),
      startDate: nextDueDate,
      nextDueDate,
      isActive: true,
      createdBy: user.uid,
      accountId: 'bank'
    };

    addScheduledOptimistic({
      ...payload,
      id: tempId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    setIsAddOpen(false);
    setAmount('');
    setNote('');
    setCategoryId('');
    setStartDate(dateToInputValue());
    
    await addScheduledTransaction(user.uid, payload);
  };

  const handleLogPaid = async (subscription: any) => {
    if (!user) return;
    const cat = categories.find(c => c.id === subscription.categoryId);
    const catName = cat?.name || 'Subscription';
    const billTitle = subscription.note || catName;
    const now = new Date();
    const month = format(now, 'yyyy-MM');
    const tempId = `temp-sub-paid-${Date.now()}`;

    const expensePayload = {
      amount: subscription.amount,
      categoryId: subscription.categoryId,
      date: Timestamp.now(),
      month,
      note: `${billTitle} (${subscription.frequency === 'one-time' ? 'Bill Paid' : 'Scheduled'})`,
      paymentMode: 'bank' as const,
      isShared: false,
      isSettlement: false,
      isDeleted: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      userId: user.uid,
      householdId: householdId || user.uid,
    };

    addExpenseOptimistic({
      ...expensePayload,
      id: tempId,
    });

    // If it's a one-time bill/IOU, mark it inactive so it moves to settled
    if (subscription.frequency === 'one-time') {
      removeScheduledOptimistic(subscription.id);
      try {
        await updateScheduledTransaction(householdId || user.uid, subscription.id, { isActive: false });
      } catch (err) {
        console.error('Failed to complete one-time bill:', err);
      }
    }

    addToast({
      type: 'success',
      message: `Marked "${billTitle}" as paid (${CURRENCY_SYMBOL}${subscription.amount})`,
    });

    try {
      const created = await addExpense(householdId || user.uid, user.uid, {
        amount: subscription.amount,
        categoryId: subscription.categoryId,
        date: now.toISOString(),
        note: `${billTitle} (${subscription.frequency === 'one-time' ? 'Bill Paid' : 'Scheduled'})`,
        accountId: 'bank',
      });
      addExpenseOptimistic(created);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (subscription: any) => {
    if (!householdId) return;
    try {
      removeScheduledOptimistic(subscription.id);
      addToast({ type: 'success', message: 'Subscription removed' });
      await deleteScheduledTransaction(householdId, subscription.id);
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', message: 'Failed to remove subscription' });
    }
  };

  return (
    <div className="min-h-screen pb-36 pt-24 animate-fade-in">
      <div className="px-4 md:px-8 max-w-4xl mx-auto">
        
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2 tracking-tight font-display">
              <RefreshCw className="w-6 h-6 text-indigo-500" />
              Commitments & Bills
            </h1>
            <p className="text-sm text-theme-secondary mt-1">
              Track upcoming friend dues, hostel rent, utilities, and recurring subscriptions.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setIsAddOpen(true)} 
            className="px-4 py-2.5 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverse rounded-2xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-xs cursor-pointer self-start sm:self-auto"
            aria-label="Add Commitment or Bill"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Bill / Due</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 p-1 rounded-2xl bg-theme-surface border border-theme-border/50 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-theme-primary text-theme-inverse shadow-xs'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            All Commitments ({activeScheduled.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bills')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'bills'
                ? 'bg-theme-primary text-theme-inverse shadow-xs'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Bills & IOUs ({activeScheduled.filter(s => s.frequency === 'one-time').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'bg-theme-primary text-theme-inverse shadow-xs'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Subscriptions ({activeScheduled.filter(s => s.frequency !== 'one-time').length})
          </button>
        </div>

        {/* Executive Cash-Flow Commitment Forecast */}
        {activeScheduled.length > 0 && (
          <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-theme-surface/70 border border-theme-border/50 shadow-sm backdrop-blur-md">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-theme-border/30">
              <div>
                <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block">
                  Monthly Commitment
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-400 tabular-nums">
                  {CURRENCY_SYMBOL}{totalMonthlyCommitment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-theme-tertiary block mt-0.5">
                  Across {activeScheduled.length} active commitment{activeScheduled.length > 1 ? 's' : ''}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block">
                  Due in Next 7 Days
                </span>
                <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${dueInNext7Days > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {CURRENCY_SYMBOL}{dueInNext7Days.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-theme-tertiary block mt-0.5">
                  {dueInNext7Days > 0 ? 'Upcoming liquidity draw' : 'Zero near-term dues'}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block">
                  Reserve Coverage
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums font-mono">
                    {coverageRatio === 'Fully Covered' ? '100%' : `${coverageRatio}x`}
                  </span>
                </div>
                <span className="text-xs text-theme-tertiary block mt-0.5">
                  {CURRENCY_SYMBOL}{liquidReserve.toLocaleString('en-IN', { maximumFractionDigits: 0 })} in liquid reserves
                </span>
              </div>
            </div>

            <div className="pt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-theme-secondary">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-theme-accent" />
                Tap the checkmark icon on any bill to instantly log payment to this month's expenses.
              </span>
              <span className="px-2.5 py-1 rounded-full bg-theme-surface border border-theme-border/50 text-theme-tertiary">
                Swipe left to delete
              </span>
            </div>
          </div>
        )}

        {filteredScheduled.length === 0 ? (
          <div className="text-center py-16 bg-theme-surface border border-theme-border/50 rounded-3xl p-6">
            <RefreshCw className="w-12 h-12 text-theme-tertiary mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold text-theme-primary mb-1">
              {activeTab === 'bills' ? 'No pending bills or friend dues' : activeTab === 'subscriptions' ? 'No active subscriptions' : 'No active commitments'}
            </h3>
            <p className="text-theme-secondary text-sm max-w-md mx-auto">
              Add friend dues (e.g. Pay Rohan ₹200), hostel mess bills, flat rent, or recurring subscriptions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredScheduled.map((st) => {
              const category = categories.find(c => c.id === st.categoryId);
              return (
                <SubscriptionListItem
                  key={st.id}
                  subscription={st}
                  category={category}
                  onDelete={handleDelete}
                  onLogPaid={handleLogPaid}
                />
              );
            })}
          </div>
        )}

      </div>

      <BottomSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Bill or Commitment">
        <div className="flex flex-col gap-4 pb-8 px-4">
          <Input 
            label="Title / Payee" 
            type="text" 
            value={note} 
            onChange={(e) => setNote(e.target.value)} 
            placeholder="e.g. Pay Rohan for Canteen, Hostel Mess, Wi-Fi" 
          />

          <Input 
            label="Amount" 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="0.00" 
          />
          
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">Category</label>
            <CategoryPicker 
              selectedId={categoryId} 
              onSelect={setCategoryId} 
            />
          </div>

          <div className="relative z-50">
            <label className="block text-sm font-medium text-theme-secondary mb-2">Frequency / Type</label>
            <DropdownMenu 
              align="left"
              trigger={
                <div className="w-full bg-theme-surface border border-theme-border rounded-xl px-4 py-3 text-theme-primary focus:border-theme-accent outline-none flex items-center justify-between cursor-pointer">
                  <span className="capitalize">
                    {frequency === 'one-time' ? 'One-Time Bill / IOU' : frequency}
                  </span>
                  <ChevronDown className="w-4 h-4 text-theme-tertiary" />
                </div>
              }
              items={[
                { label: 'One-Time (Due / Bill / IOU)', onClick: () => setFrequency('one-time') },
                { label: 'Monthly (Rent, Subscriptions)', onClick: () => setFrequency('monthly') },
                { label: 'Weekly (Mess, Grocery)', onClick: () => setFrequency('weekly') },
                { label: 'Daily (Milk, Daily passes)', onClick: () => setFrequency('daily') },
                { label: 'Yearly (Annual gym, Domain)', onClick: () => setFrequency('yearly') },
              ]}
              className="w-full"
              menuClassName="w-full"
            />
          </div>

          <div className="z-40">
            <label className="block text-sm font-medium text-theme-secondary mb-2">Due Date</label>
            <AnimatedDatePicker 
              value={startDate} 
              onChange={setStartDate} 
            />
          </div>

          <Button 
            className="w-full mt-4" 
            onClick={handleAdd}
            disabled={!amount || !categoryId}
          >
            Create Scheduled Expense
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
