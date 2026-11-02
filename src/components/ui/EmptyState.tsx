'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { ReceiptText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  emoji?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * High-fidelity theme-aware EmptyState component.
 * Adheres to $10M design standards with clean glass paneling, subtle radial blur,
 * and high-contrast typography.
 */
export const EmptyState = ({
  emoji,
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={clsx(
        'glass-panel rounded-3xl p-8 sm:p-12 border border-theme-border/30 flex flex-col items-center justify-center text-center relative overflow-hidden',
        className
      )}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-theme-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm">
        {Icon ? (
          <div className="w-16 h-16 rounded-2xl bg-theme-elevated/60 text-theme-secondary flex items-center justify-center mb-4 shadow-sm border border-theme-border/30">
            <Icon className="w-8 h-8 stroke-[1.8]" />
          </div>
        ) : emoji ? (
          <span className="text-4xl mb-3" role="img" aria-label={title}>
            {emoji}
          </span>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-theme-elevated/60 text-theme-secondary flex items-center justify-center mb-4 shadow-sm border border-theme-border/30">
            <ReceiptText className="w-8 h-8 stroke-[1.8]" />
          </div>
        )}

        <h3 className="font-headline font-bold text-xl text-theme-primary mb-1.5">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed mb-6">
            {description}
          </p>
        )}

        {action ? (
          <div>{action}</div>
        ) : actionLabel && onAction ? (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-full bg-theme-accent text-white font-semibold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-theme-accent/20"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
};
