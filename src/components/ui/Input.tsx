'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  prefix?: string;
}

/**
 * Labeled input field with error and helper text support.
 * Uses design tokens for all color values.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, prefix, className, id, ...props }, ref) => {
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#605850] font-body"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-4 text-[#605850] font-semibold text-lg select-none pointer-events-none">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full rounded-xl bg-[#eae2da] text-[#3a302a] border-none font-body',
              'text-base placeholder:text-[#78706a]',
              'transition-[border-color,box-shadow,background-color] duration-150 ease-out',
              'min-h-[44px]',
              'focus:outline-none focus:ring-2 focus:ring-[#c2652a] focus:border-transparent',
              prefix ? 'pl-10 pr-4 py-3' : 'px-4 py-3',
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'focus:border-[#c2652a]',
              props.disabled && 'opacity-50 cursor-not-allowed bg-[#d8d0c8]',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
            {...props}
          />
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
            className="text-xs text-[#78706a] font-body"
          >
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
