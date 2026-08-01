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
 * Displays an icon (or emoji fallback) + category name with a semi-transparent colored background.
 */
export const Badge = ({ emoji, icon, name, color, size = 'md', className }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        'whitespace-nowrap',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        className
      )}
      style={{
        backgroundColor: `${color}22`, // ~13% opacity
        color: color,
        border: `1px solid ${color}44`, // ~27% opacity
      }}
    >
      <span aria-hidden="true" className="flex items-center">
        {icon ? (
          <CategoryIcon iconName={icon} size={size === 'sm' ? 12 : 14} />
        ) : (
          emoji
        )}
      </span>
      {name}
    </span>
  );
};
