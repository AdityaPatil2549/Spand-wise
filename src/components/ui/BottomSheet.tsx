'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useViewport } from '@/hooks/useViewport';
import { useHaptic } from '@/hooks/useHaptic';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Responsive BottomSheet & Modal:
 * - Mobile / Android: Native-feeling bottom sheet with drag-down to dismiss and safe-area offsets.
 * - Desktop: Centered modal dialog with backdrop blur, focus handling, and Escape key dismissal.
 */
export const BottomSheet = ({ isOpen, onClose, title, children }: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const { viewportHeight } = useViewport();
  const haptic = useHaptic();

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
      haptic.light();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, haptic]);

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

          {/* Sheet / Desktop Modal Dialog */}
          <div className="fixed inset-0 z-[var(--z-sheet)] flex items-end md:items-center justify-center p-0 md:p-6 pointer-events-none">
            <motion.div
              key="sheet"
              ref={sheetRef}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 400) {
                  onClose();
                }
              }}
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 340,
                damping: 32,
                mass: 0.8,
              }}
              className="w-full max-w-lg md:max-w-xl pointer-events-auto outline-none"
              role="dialog"
              aria-modal="true"
              aria-label={title ?? 'Transaction modal'}
            >
              <div 
                className="bg-theme-base rounded-t-[2rem] md:rounded-3xl shadow-2xl md:border md:border-theme-border/50 pb-safe md:pb-0 overflow-hidden flex flex-col"
                style={{ maxHeight: viewportHeight ? `${viewportHeight * 0.9}px` : '90dvh' }}
              >
                {/* Drag Handle (Mobile only) */}
                <div className="flex flex-col items-center pt-2.5 pb-1 md:hidden cursor-grab active:cursor-grabbing">
                  <div className="w-12 h-1.5 rounded-full bg-theme-border/80" />
                </div>

                {/* Header */}
                {title && (
                  <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-theme-border/20">
                    <h2 className="text-lg font-bold text-theme-primary">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 -mr-2 rounded-full hover:bg-theme-elevated transition-colors touch-target"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-theme-secondary" />
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className="px-6 py-4 overflow-y-auto flex-1">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
