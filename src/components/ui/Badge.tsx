'use client';

import { clsx } from 'clsx';
import { CategoryIcon } from '@/components/shared/CategoryIcon';

interface BadgeProps {
  emoji?: string;
  icon?: string;
  name: string;
  color: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Category badge/chip component.
 * Displays a refined neutral pill with a crisp category color dot/icon indicator.
 */
export const Badge = ({ emoji, icon, name, color, size = 'md', className }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-sans font-medium rounded-full',
        'bg-theme-surface/90 border border-theme-border/60 text-theme-primary',
        'whitespace-nowrap shadow-xs',
        size === 'sm' && 'px-2 py-0.5 text-[11px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="flex items-center" style={{ color }}>
          <CategoryIcon iconName={icon} size={size === 'sm' ? 12 : 14} />
        </span>
      ) : emoji ? (
        <span aria-hidden="true" className="text-xs">{emoji}</span>
      ) : (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      <span>{name}</span>
    </span>
  );
};
