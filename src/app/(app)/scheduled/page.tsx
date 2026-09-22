'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { CalendarClock, Plus, ArrowRight, ChevronDown } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { format } from 'date-fns';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { CategoryPicker } from '@/components/shared/CategoryPicker';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { addScheduledTransaction } from '@/lib/scheduled';
import { Timestamp } from 'firebase/firestore';

export default function ScheduledPage() {
  const isHydrated = useHydrated();
  const scheduledTransactions = useStore((s) => s.scheduledTransactions);
  const categories = useStore((s) => s.categories);
  const user = useStore(s => s.user);
  const addScheduledOptimistic = useStore(s => s.addScheduledOptimistic);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  if (!isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-theme-border border-t-theme-accent animate-spin" />
      </div>
    );
  }

  const handleAdd = async () => {
    if (!amount || !categoryId || !user) return;
    const now = new Date();
    
    // Default next due date to today
    const nextDueDate = Timestamp.fromDate(now);

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
    
    await addScheduledTransaction(user.uid, payload);
  };

  const activeScheduled = scheduledTransactions.filter(t => t.isActive);

  return (
    <div className="min-h-screen pb-32 pt-24 animate-fade-in">
      <div className="px-4 md:px-8 max-w-4xl mx-auto">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2 tracking-tight">
              <CalendarClock className="w-6 h-6 text-indigo-500" />
              Scheduled
            </h1>
            <p className="text-sm text-theme-secondary mt-2">
              Manage your recurring expenses.
            </p>
          </div>
          <button onClick={() => setIsAddOpen(true)} className="p-3 bg-theme-accent text-white rounded-xl shadow-sm hover:opacity-90 transition-opacity">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {activeScheduled.length === 0 ? (
          <div className="text-center py-12 bg-theme-surface border border-theme-border rounded-2xl">
            <CalendarClock className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-theme-primary mb-1">No scheduled expenses</h3>
            <p className="text-theme-secondary text-sm px-4">
              Tap the + button to add a recurring daily, weekly, or monthly expense (like Rent or Netflix).
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeScheduled.map((st) => {
              const category = categories.find(c => c.id === st.categoryId);
              return (
                <div key={st.id} className="bg-theme-surface border border-theme-border rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm"
                      style={{ backgroundColor: `${category?.color || '#ccc'}20` }}
                    >
                      {category?.emoji || '🏷️'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-theme-primary">{category?.name}</h4>
                      <div className="text-xs font-medium text-theme-secondary mt-1 flex items-center gap-1">
                        <span className="capitalize text-indigo-500">{st.frequency}</span>
                        <ArrowRight className="w-3 h-3" />
                        Next: {format(st.nextDueDate.toDate(), 'MMM do, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-theme-primary">
                      {CURRENCY_SYMBOL} {st.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <BottomSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Scheduled Expense">
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
