'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

/**
 * SpendWise primary button component.
 * All variants respect the design token system.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          // Base styles
          'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
          'transition-[transform,color,background-color,border-color,box-shadow] duration-150 ease-out active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
          'min-h-[44px] min-w-[44px]', // Accessibility: minimum touch target
          'select-none',

          // Size variants
          size === 'sm' && 'px-3 py-2 text-sm',
          size === 'md' && 'px-5 py-3 text-sm',
          size === 'lg' && 'px-6 py-4 text-base',

          // Color variants
          variant === 'primary' && [
            'bg-violet-600 text-white',
            'hover:bg-violet-500',
            'shadow-[var(--shadow-3d-button)] hover:shadow-[var(--shadow-3d-button)] active:shadow-[var(--shadow-3d-button-active)] active:translate-y-[2px]',
          ],
          variant === 'secondary' && [
            'bg-violet-100 text-violet-700',
            'hover:bg-violet-200',
            'shadow-[var(--shadow-3d-button-secondary)] hover:shadow-[var(--shadow-3d-button-secondary)] active:shadow-[var(--shadow-3d-button-secondary-active)] active:translate-y-[2px]',
          ],
          variant === 'ghost' && [
            'text-[var(--text-secondary)]',
            'hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]',
            'active:scale-[0.97]',
          ],
          variant === 'danger' && [
            'border-2 border-red-500 text-red-500 bg-transparent',
            'shadow-[var(--shadow-3d-button-danger)] active:shadow-[var(--shadow-3d-button-danger-active)] active:translate-y-[2px]',
          ],
          variant === 'outline' && [
            'border-2 border-violet-300 text-violet-600 bg-transparent',
            'hover:bg-violet-50 active:scale-[0.97]',
          ],

          // Disabled state
          isDisabled && 'opacity-50 cursor-not-allowed active:scale-100',

          // Full width
          fullWidth && 'w-full',

          className
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
