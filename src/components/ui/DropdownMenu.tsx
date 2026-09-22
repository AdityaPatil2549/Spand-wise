'use client';
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export type DropdownMenuItem = {
  label: string;
  icon?: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
};

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
}

export function DropdownMenu({ trigger, items, align = 'right', className, menuClassName }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={menuRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer select-none outline-none"
        role="button"
        tabIndex={0}
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              "absolute z-50 mt-2 rounded-2xl bg-theme-surface border border-theme-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] glass overflow-hidden",
              align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
              menuClassName || 'w-56'
            )}
          >
            <div className="py-1 flex flex-col">
              {items.map((item, idx) => {
                const commonClasses = cn(
                  "w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors outline-none",
                  item.danger 
                    ? "text-theme-danger hover:bg-theme-danger/10" 
                    : "text-theme-primary hover:bg-theme-surface-hover"
                );

                const innerContent = (
                  <>
                    {item.icon && (
                      <span className="material-symbols-outlined text-[18px]">
                        {item.icon}
                      </span>
                    )}
                    <span className="font-medium">{item.label}</span>
                  </>
                );

                if (item.href) {
                  return (
                    <Link 
                      key={idx} 
                      href={item.href} 
                      className={commonClasses} 
                      onClick={() => setIsOpen(false)}
                    >
                      {innerContent}
                    </Link>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setIsOpen(false);
                    }}
                    className={commonClasses}
                  >
                    {innerContent}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
