'use client';

import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Trash2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { CURRENCY_SYMBOL } from '@/config/constants';
import type { ScheduledTransactionDocument, CategoryDocument } from '@/types/firestore';
import { useHaptic } from '@/hooks/useHaptic';

interface SubscriptionListItemProps {
  subscription: ScheduledTransactionDocument;
  category?: CategoryDocument;
  onDelete: (subscription: ScheduledTransactionDocument) => void;
}

export const SubscriptionListItem = ({ subscription, category, onDelete }: SubscriptionListItemProps) => {
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
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 rounded-2xl">
        <Trash2 className="w-6 h-6 text-theme-inverse" />
      </div>

      {/* Draggable Foreground */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.8, right: 0 }} // hard to drag right, easy to drag left
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-10 bg-theme-surface border border-theme-border rounded-2xl shadow-sm p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm"
            style={{ backgroundColor: `${category?.color || '#ccc'}20` }}
            aria-hidden="true"
          >
            {category?.emoji || '🏷️'}
          </div>
          <div>
            <h4 className="font-semibold text-theme-primary">{category?.name || 'Subscription'}</h4>
            <div className="text-xs font-medium text-theme-secondary mt-1 flex items-center gap-1">
              <span className="capitalize text-indigo-500">{subscription.frequency}</span>
              <ArrowRight className="w-3 h-3" />
              Next: {format(subscription.nextDueDate.toDate(), 'MMM do, yyyy')}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div className="font-bold text-theme-primary text-lg">
            {CURRENCY_SYMBOL} {subscription.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
