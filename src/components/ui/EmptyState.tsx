'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { CircleDashed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  emoji?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Empty state component for when lists have no content.
 * Used in ExpenseList, Analytics, etc.
 */
export const EmptyState = ({
  emoji,
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center px-6 py-16 gap-3',
        className
      )}
    >
      {Icon ? (
        <div className="w-20 h-20 bg-[var(--surface-secondary)] rounded-full flex items-center justify-center mb-2 shadow-sm">
          <Icon className="w-10 h-10 text-[var(--text-secondary)]" />
        </div>
      ) : emoji ? (
        <span className="text-5xl mb-2" role="img" aria-label={title}>
          {emoji}
        </span>
      ) : (
        <div className="w-20 h-20 bg-[var(--surface-secondary)] rounded-full flex items-center justify-center mb-2 shadow-sm">
          <CircleDashed className="w-10 h-10 text-[var(--text-secondary)]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
