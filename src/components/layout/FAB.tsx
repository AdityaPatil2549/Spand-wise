'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, TrendingUp } from 'lucide-react';
import { useStore } from '@/store';

/**
 * Expandable Floating Action Button.
 * Click main + to reveal two mini-buttons: Red Expense and Green Income.
 */
export const FAB = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const openBottomSheet = useStore((s) => s.openBottomSheet);

  const handleExpense = () => {
    setIsExpanded(false);
    openBottomSheet({ transactionType: 'expense' });
  };

  const handleIncome = () => {
    setIsExpanded(false);
    openBottomSheet({ transactionType: 'income' });
  };

  const miniButtonVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 0 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { delay: i * 0.06, type: 'spring' as const, stiffness: 400, damping: 22 },
    }),
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.15 } },
  };

  return (
    <>
      {/* Backdrop to close on outside click */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-fab)]"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-[5.5rem] left-0 right-0 w-full z-[var(--z-fab)] pointer-events-none md:hidden">
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          {/* Mini buttons */}
          <AnimatePresence>
            {isExpanded && (
              <div className="flex gap-4 items-center">
                {/* Income button (Green) */}
                <motion.div
                  custom={1}
                  variants={miniButtonVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col items-center gap-1.5"
                >
                  <motion.button
                    onClick={handleIncome}
                    whileTap={{ scale: 0.92 }}
                    className={clsx(
                      'w-14 h-14 rounded-[1.1rem] flex items-center justify-center',
                      'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
                      'hover:bg-emerald-400 transition-colors'
                    )}
                    aria-label="Add income"
                  >
                    <TrendingUp className="w-6 h-6" />
                  </motion.button>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Income
                  </span>
                </motion.div>

                {/* Expense button (Red) */}
                <motion.div
                  custom={0}
                  variants={miniButtonVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col items-center gap-1.5"
                >
                  <motion.button
                    onClick={handleExpense}
                    whileTap={{ scale: 0.92 }}
                    className={clsx(
                      'w-14 h-14 rounded-[1.1rem] flex items-center justify-center',
                      'bg-rose-500 text-white shadow-lg shadow-rose-500/30',
                      'hover:bg-rose-400 transition-colors'
                    )}
                    aria-label="Add expense"
                  >
                    <Minus className="w-6 h-6" />
                  </motion.button>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Expense
                  </span>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Main FAB */}
          <div className="relative">
            {/* Pulse only when not expanded */}
            {!isExpanded && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-theme-accent rounded-2xl blur-md -z-10"
              />
            )}

            <motion.button
              onClick={() => setIsExpanded((v) => !v)}
              className={clsx(
                'w-16 h-16 rounded-[1.25rem] flex items-center justify-center relative z-10',
                'bg-theme-accent hover:bg-theme-accent-hover text-theme-inverse shadow-lg',
                'transition-[background-color] duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2'
              )}
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              aria-label={isExpanded ? 'Close menu' : 'Add transaction'}
              aria-expanded={isExpanded}
            >
              <Plus className="w-8 h-8" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
};
