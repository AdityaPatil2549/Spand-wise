'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { CalendarClock, Plus, ArrowRight, ChevronDown, RefreshCw } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { format } from 'date-fns';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { CategoryPicker } from '@/components/shared/CategoryPicker';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { AnimatedDatePicker } from '@/components/ui/AnimatedDatePicker';
import { SubscriptionListItem } from '@/components/features/scheduled/SubscriptionListItem';
import { dateToInputValue } from '@/lib/utils/date';
import { addScheduledTransaction, deleteScheduledTransaction } from '@/lib/scheduled';
import { Timestamp } from 'firebase/firestore';

export default function ScheduledPage() {
  const isHydrated = useHydrated();
  const scheduledTransactions = useStore((s) => s.scheduledTransactions);
  const categories = useStore((s) => s.categories);
  const user = useStore(s => s.user);
  const householdId = useStore(s => s.householdId);
  const addScheduledOptimistic = useStore(s => s.addScheduledOptimistic);
  const removeScheduledOptimistic = useStore(s => s.removeScheduledOptimistic);
  const addToast = useStore(s => s.addToast);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(dateToInputValue());

  if (!isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-theme-border border-t-theme-accent animate-spin" />
      </div>
    );
  }

  const handleAdd = async () => {
    if (!amount || !categoryId || !user) return;
    
    // Parse the startDate from the input (which is in YYYY-MM-DDTHH:mm format)
    const nextDueDate = Timestamp.fromDate(new Date(startDate));

    const tempId = `temp-${Date.now()}`;
    const payload = {
      amount: parseFloat(amount),
      categoryId,
      frequency,
      note: '',
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
    setCategoryId('');
    setStartDate(dateToInputValue());
    
    await addScheduledTransaction(user.uid, payload);
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
      // Revert optimism if failed (optional, but store fetch on next load will fix it anyway)
    }
  };

  const activeScheduled = scheduledTransactions.filter(t => t.isActive);

  return (
    <div className="min-h-screen pb-32 pt-24 animate-fade-in">
      <div className="px-4 md:px-8 max-w-4xl mx-auto">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2 tracking-tight">
              <RefreshCw className="w-6 h-6 text-indigo-500" />
              Subscriptions
            </h1>
            <p className="text-sm text-theme-secondary mt-2">
              Manage your recurring subscriptions and bills.
            </p>
          </div>
          <button onClick={() => setIsAddOpen(true)} className="p-3 bg-theme-accent text-white rounded-xl shadow-sm hover:opacity-90 transition-opacity">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {activeScheduled.length === 0 ? (
          <div className="text-center py-12 bg-theme-surface border border-theme-border rounded-2xl">
            <RefreshCw className="w-12 h-12 text-theme-tertiary mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-theme-primary mb-1">No active subscriptions</h3>
            <p className="text-theme-secondary text-sm px-4">
              Tap the + button to add a recurring subscription (like Rent or Netflix).
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeScheduled.map((st) => {
              const category = categories.find(c => c.id === st.categoryId);
              return (
                <SubscriptionListItem
                  key={st.id}
                  subscription={st}
                  category={category}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        )}

      </div>

      <BottomSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Subscription">
        <div className="flex flex-col gap-4 pb-8 px-4">
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
            <label className="block text-sm font-medium text-theme-secondary mb-2">Frequency</label>
            <DropdownMenu 
              align="left"
              trigger={
                <div className="w-full bg-theme-surface border border-theme-border rounded-xl px-4 py-3 text-theme-primary focus:border-theme-accent outline-none flex items-center justify-between">
                  <span className="capitalize">{frequency}</span>
                  <ChevronDown className="w-4 h-4 text-theme-tertiary" />
                </div>
              }
              items={[
                { label: 'Daily', onClick: () => setFrequency('daily') },
                { label: 'Weekly', onClick: () => setFrequency('weekly') },
                { label: 'Monthly', onClick: () => setFrequency('monthly') },
                { label: 'Yearly', onClick: () => setFrequency('yearly') },
              ]}
              className="w-full"
              menuClassName="w-full"
            />
          </div>

          <div className="z-40">
            <label className="block text-sm font-medium text-theme-secondary mb-2">Start Date</label>
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
