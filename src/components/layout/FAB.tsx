'use client';

import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useStore } from '@/store';

/**
 * Floating Action Button (FAB) — primary trigger for adding expenses.
 * Multi-layer shadow + pulse animation.
 */
export const FAB = () => {
  const openBottomSheet = useStore((s) => s.openBottomSheet);

  const handleMainClick = () => {
    openBottomSheet();
  };

  return (
    <div className="fixed bottom-[5.5rem] left-0 right-0 w-full z-[var(--z-fab)] pointer-events-none md:hidden">
      <div className="absolute right-5 flex flex-col items-center gap-3 pointer-events-auto">
      {/* Main FAB with Pulse and Glow */}
      <div className="relative">
        {/* Pulse animation behind the button */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-violet-500 rounded-2xl blur-md -z-10"
        />

        <motion.button
          onClick={handleMainClick}
          className={clsx(
            'w-14 h-14 rounded-2xl flex items-center justify-center relative z-10',
            'bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-[var(--shadow-3d-fab)]',
            'transition-[transform,box-shadow,opacity] duration-200 ease-[var(--ease-out)]',
            'hover:shadow-[0_8px_30px_rgb(124,58,237,0.5)] hover:-translate-y-1',
            'active:shadow-[var(--shadow-3d-fab-active)] active:translate-y-[2px]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2'
          )}
          aria-label="Add new expense"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2, type: 'spring' }}
          >
            <Plus className="w-7 h-7" aria-hidden="true" />
          </motion.div>
        </motion.button>
      </div>
      </div>
    </div>
  );
};

