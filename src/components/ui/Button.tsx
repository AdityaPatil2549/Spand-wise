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
 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2',
 'min-h-[44px] min-w-[44px]', // Accessibility: minimum touch target
 'select-none',

 // Size variants
 size === 'sm' && 'px-3 py-2 text-sm',
 size === 'md' && 'px-5 py-3 text-sm',
 size === 'lg' && 'px-6 py-4 text-base',

 // Color variants
 variant === 'primary' && [
 'bg-theme-accent text-theme-white font-body',
 'hover:bg-theme-accent-hover',
 'shadow-sm hover:shadow-md active:translate-y-[2px]',
 ],
 variant === 'secondary' && [
 'bg-theme-accent-light text-theme-accent font-body',
 'hover:bg-theme-surface-hover',
 'shadow-sm hover:shadow-md active:translate-y-[2px]',
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
 'border-2 border-theme-border text-theme-accent font-body bg-transparent',
 'hover:bg-theme-base active:scale-[0.97]',
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
