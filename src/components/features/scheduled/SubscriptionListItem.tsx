'use client';

import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Trash2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { CURRENCY_SYMBOL } from '@/config/constants';
import type { ScheduledTransactionDocument, CategoryDocument } from '@/types/firestore';
import { useHaptic } from '@/hooks/useHaptic';

interface SubscriptionListItemProps {
  subscription: ScheduledTransactionDocument;
  category?: CategoryDocument;
  onDelete: (subscription: ScheduledTransactionDocument) => void;
  onLogPaid?: (subscription: ScheduledTransactionDocument) => void;
}

export const SubscriptionListItem = ({ 
  subscription, 
  category, 
  onDelete,
  onLogPaid 
}: SubscriptionListItemProps) => {
  const controls = useAnimation();
  const haptic = useHaptic();

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = -80; // pixels swiped left
    if (info.offset.x < threshold) {
      haptic.heavy();
      await controls.start({ x: -100, opacity: 0, transition: { duration: 0.2 } });
      onDelete(subscription);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } });
    }
  };

  const dueDate = subscription.nextDueDate.toDate();
  const now = new Date();
  const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isDueToday = daysDiff === 0;
  const isDueSoon = daysDiff > 0 && daysDiff <= 7;
  const isPastDue = daysDiff < 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-3"
    >
      {/* Background Actions (Swipe to Delete) */}
      <div className="absolute inset-0 bg-rose-500 flex items-center justify-end px-6 rounded-2xl">
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Draggable Foreground */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.8, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-10 bg-theme-surface border border-theme-border/60 hover:border-theme-border rounded-2xl shadow-sm p-4 flex items-center justify-between gap-3 transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm flex-shrink-0"
            style={{ backgroundColor: `${category?.color || '#6366f1'}18` }}
            aria-hidden="true"
          >
            {category?.emoji || '🏷️'}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-theme-primary truncate text-sm sm:text-base">
              {category?.name || 'Subscription'}
            </h4>
            <div className="text-xs font-medium text-theme-secondary mt-1 flex flex-wrap items-center gap-1.5">
              <span className="capitalize text-indigo-400 font-semibold">{subscription.frequency}</span>
              <span className="text-theme-tertiary">•</span>
              <span className={`inline-flex items-center gap-1 font-medium ${
                isDueToday || isPastDue 
                  ? 'text-rose-400' 
                  : isDueSoon 
                    ? 'text-amber-400' 
                    : 'text-theme-secondary'
              }`}>
                {isPastDue && <AlertCircle className="w-3 h-3 text-rose-400" />}
                {isDueToday ? 'Due Today' : isPastDue ? `${Math.abs(daysDiff)}d Overdue` : isDueSoon ? `Due in ${daysDiff}d` : format(dueDate, 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="font-bold text-theme-primary text-base sm:text-lg tabular-nums tracking-tight">
              {CURRENCY_SYMBOL}{subscription.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
          </div>

          {onLogPaid && (
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                onLogPaid(subscription);
              }}
              title="Quick Log Payment to Expenses"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-theme-surface border border-theme-border/60 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-theme-secondary hover:text-emerald-500 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              aria-label={`Log payment of ${CURRENCY_SYMBOL}${subscription.amount} for ${category?.name || 'subscription'}`}
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
