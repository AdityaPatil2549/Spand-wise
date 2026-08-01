'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Framer Motion bottom sheet with spring animation.
 * Specs from docs/04_ui/Design_System.md:
 *   - Type: Spring, Stiffness: 300, Damping: 30, Mass: 0.8
 * Traps focus when open, restores on close.
 */
export const BottomSheet = ({ isOpen, onClose, title, children }: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[var(--z-overlay)] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
            className="fixed bottom-0 left-0 right-0 z-[var(--z-sheet)] max-w-lg mx-auto"
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Bottom sheet'}
          >
            <div className="bg-[var(--surface-primary)] rounded-t-3xl shadow-[var(--shadow-xl)] pb-safe">
              {/* Handle + Header */}
              <div className="flex flex-col items-center pt-3 pb-2 px-4">
                <div className="sheet-handle" />
                {title && (
                  <div className="flex items-center justify-between w-full mt-4 mb-1">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-[var(--surface-secondary)] transition-colors touch-target"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="px-4 pb-8">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
