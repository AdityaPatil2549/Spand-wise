'use client';

import { type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Surface container card component.
 * Used for dashboard cards, expense items, and modal containers.
 */
export const Card = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) => {
  return (
    <div
      className={clsx(
        'rounded-3xl overflow-hidden transition-[box-shadow,transform] duration-300',
        variant === 'default' && 'bg-[var(--surface-base)] shadow-[var(--shadow-3d-card)] hover:shadow-[var(--shadow-3d-card-hover)] hover:-translate-y-1',
        variant === 'elevated' && 'bg-[var(--surface-primary)] shadow-[var(--shadow-lg)]',
        variant === 'glass' && 'glass',
        padding === 'none' && '',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-4',
        padding === 'lg' && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
