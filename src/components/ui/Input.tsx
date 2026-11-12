'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
 helper?: string;
 prefix?: string;
 leftIcon?: React.ReactNode;
 rightElement?: React.ReactNode;
}

/**
 * Labeled input field with error and helper text support.
 * Uses design tokens for all color values.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
 ({ label, error, helper, prefix, leftIcon, rightElement, className, id, ...props }, ref) => {
 const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

 return (
 <div className="flex flex-col gap-1.5">
 {label && (
 <label
 htmlFor={inputId}
 className="text-sm font-medium text-theme-secondary font-body"
 >
 {label}
 </label>
 )}

 <div className="relative flex items-center">
 {prefix && (
 <span className="absolute left-4 text-theme-secondary font-semibold text-lg select-none pointer-events-none">
 {prefix}
 </span>
 )}

 {leftIcon && !prefix && (
 <span className="absolute left-3.5 flex items-center pointer-events-none text-theme-tertiary">
 {leftIcon}
 </span>
 )}

 <input
 ref={ref}
 id={inputId}
 className={clsx(
 'w-full rounded-xl bg-theme-elevated text-theme-primary border border-transparent font-body',
 'text-base placeholder:text-theme-tertiary',
 'transition-[border-color,box-shadow,background-color] duration-150 ease-out',
 'min-h-[46px]',
 'focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent',
 prefix ? 'pl-10' : leftIcon ? 'pl-10' : 'pl-4',
 rightElement ? 'pr-11' : 'pr-4',
 'py-3',
 error
 ? 'border-red-400 focus:ring-red-400'
 : 'focus:border-theme-accent',
 props.disabled && 'opacity-50 cursor-not-allowed bg-theme-border',
 className
 )}
 aria-invalid={!!error}
 aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
 {...props}
 />

 {rightElement && (
 <div className="absolute right-3 flex items-center">
 {rightElement}
 </div>
 )}
 </div>

 {error && (
 <p
 id={`${inputId}-error`}
 className="text-xs text-red-500 flex items-center gap-1"
 role="alert"
 >
 {error}
 </p>
 )}

 {helper && !error && (
 <p
 id={`${inputId}-helper`}
 className="text-xs text-theme-tertiary font-body"
 >
 {helper}
 </p>
 )}
 </div>
 );
 }
);

Input.displayName = 'Input';
