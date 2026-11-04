'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { addExpense } from '@/lib/expenses/index';
import { format, differenceInDays } from 'date-fns';
import {
  CalendarClock,
  Check,
  Users,
  Share2,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { ScheduledTransactionDocument } from '@/types/firestore';

export const BentoUpcomingSplits: React.FC = () => {
  const { user, householdId, scheduledTransactions, addToast, categoriesMap } = useStore();
  const [payingId, setPayingId] = useState<string | null>(null);

  // Filter scheduled items due within the next 7 days
  const now = new Date();
  const upcomingBills = scheduledTransactions.filter((bill) => {
    if (!bill.isActive) return false;
    try {
      const dueDate = bill.nextDueDate.toDate();
      const diff = differenceInDays(dueDate, now);
      return diff >= 0 && diff <= 7;
    } catch {
      return false;
    }
  });

  const handleMarkPaid = async (bill: ScheduledTransactionDocument) => {
    if (!user) return;
    triggerHaptic('medium');
    setPayingId(bill.id);

    try {
      await addExpense(householdId || user.uid, user.uid, {
        amount: bill.amount,
        categoryId: bill.categoryId,
        note: `Recurring: ${bill.note || 'Subscription'}`,
        date: new Date().toISOString(),
      });

      triggerHaptic('heavy');
      addToast({
        type: 'success',
        message: `Marked "${bill.note || 'Bill'}" as paid today (${formatCurrency(bill.amount)})`,
      });
    } catch (err) {
      console.error('Failed to log recurring bill:', err);
      addToast({ type: 'error', message: 'Failed to record bill payment.' });
    } finally {
      setPayingId(null);
    }
  };

  const handleWhatsAppReminder = () => {
    triggerHaptic('light');
    const text = encodeURIComponent(
      'Hey! Friendly reminder to check and settle our shared expenses on SpendWise.'
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="w-full rounded-[28px] p-6 sm:p-7 bg-theme-surface/70 border border-theme-border/60 shadow-sm flex flex-col justify-between min-h-[350px]">
      {/* Top Header */}
      <div className="flex justify-between items-center pb-3 border-b border-theme-border/30">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-theme-accent" />
          <h3 className="font-sans text-base font-bold text-theme-primary tracking-tight">
            Upcoming Commitments
          </h3>
        </div>
        <Link
          href="/scheduled"
          className="text-theme-accent text-xs font-semibold hover:underline flex items-center gap-1"
        >
          <span>All</span>
          <ArrowRight className="w-3 h-3 stroke-[2]" />
        </Link>
      </div>

      {/* Section 1: Upcoming Subscriptions (Next 7 Days) */}
      <div className="space-y-2.5 my-3 flex-1">
        {upcomingBills.length === 0 ? (
          <div className="p-4 rounded-2xl bg-theme-base/50 border border-theme-border/30 text-center space-y-1.5 my-auto">
            <Sparkles className="w-4 h-4 text-theme-accent mx-auto" />
            <p className="text-xs font-semibold text-theme-primary">No bills due this week</p>
            <p className="text-[11px] text-theme-secondary">
              All monthly subscriptions and rent commitments are clear.
            </p>
          </div>
        ) : (
          upcomingBills.slice(0, 2).map((bill) => {
            const cat = categoriesMap.get(bill.categoryId);
            const dueDate = bill.nextDueDate.toDate();
            const daysLeft = differenceInDays(dueDate, now);
            const isBusy = payingId === bill.id;

            return (
              <div
                key={bill.id}
                className="p-3 rounded-2xl bg-theme-base/70 border border-theme-border/40 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-theme-primary truncate">
                    {bill.note || cat?.name || 'Recurring Bill'}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-theme-secondary">
                      {daysLeft === 0
                        ? 'Due Today'
                        : daysLeft === 1
                        ? 'Due Tomorrow'
                        : `Due in ${daysLeft}d`}
                    </span>
                    <span className="text-xs font-semibold text-theme-primary tabular-nums">
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleMarkPaid(bill)}
                  disabled={isBusy}
                  className="px-2.5 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-surface-hover border border-theme-border/50 text-[11px] font-semibold text-theme-primary flex items-center gap-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3 h-3 text-emerald-500 stroke-[2.5]" />
                  <span>{isBusy ? 'Saving...' : 'Paid'}</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Section 2: Roommate Split Settlements Hub */}
      <div className="pt-3 border-t border-theme-border/30">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-theme-base/80 to-theme-surface border border-theme-border/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-theme-accent/10 text-theme-accent flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-theme-primary">Hostel & Room Splits</span>
            </div>
            <Link
              href="/split"
              className="text-[11px] text-theme-accent font-semibold hover:underline"
            >
              Open Hub
            </Link>
          </div>

          <p className="text-[11px] text-theme-secondary leading-tight">
            Keep campus dining and rent balances settled without awkward conversations.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleWhatsAppReminder}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-theme-surface border border-theme-border/50 hover:border-emerald-500/40 hover:bg-emerald-500/5 text-theme-primary text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3 h-3 text-emerald-500" />
              <span>Remind</span>
            </button>

            <Link
              href="/split"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-theme-primary text-theme-inverse text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
            >
              <span>+ Split Bill</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
