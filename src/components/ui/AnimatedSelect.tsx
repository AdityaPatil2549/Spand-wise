'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

interface AnimatedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export const AnimatedSelect = React.forwardRef<HTMLDivElement, AnimatedSelectProps>(
  ({ value, onChange, options, label, error, className, disabled }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Close when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div className={cn('relative w-full', className)} ref={containerRef}>
        {label && (
          <label className="text-sm font-medium text-theme-secondary mb-2 block font-body">
            {label}
          </label>
        )}
        
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between bg-theme-surface border rounded-xl px-4 py-3 text-theme-primary font-medium focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            isOpen ? 'border-theme-accent ring-1 ring-theme-accent/20 shadow-sm rounded-b-none' : 'border-theme-border hover:border-theme-border/80',
            error ? 'border-red-500 ring-red-500/20' : '',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : 'Select an option'}
          </span>
          <div className="flex h-6 w-6 items-center justify-center">
            <ChevronDown 
              className={cn(
                "w-5 h-5 text-theme-secondary transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isOpen ? "rotate-180" : "rotate-0"
              )} 
            />
          </div>
        </button>

        {/* CSS Grid Animation Dropdown */}
        <div
          className={cn(
            "absolute z-50 w-full bg-theme-elevated border-x border-b border-theme-border/50 shadow-xl overflow-hidden rounded-b-xl grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 border-transparent shadow-none"
          )}
        >
          <div className="overflow-hidden">
            <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    value === option.value
                      ? 'bg-theme-accent/10 text-theme-accent font-medium'
                      : 'text-theme-primary hover:bg-theme-surface-hover',
                    isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                  )}
                  style={{
                    transitionDelay: isOpen ? `${index * 30}ms` : "0ms",
                  }}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-theme-accent shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AnimatedSelect.displayName = 'AnimatedSelect';
