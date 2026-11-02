'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Plus, Wallet, ReceiptText, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '@/store';
import { useHaptic } from '@/hooks/useHaptic';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', href: '/dashboard', Icon: LayoutGrid },
  { id: 'expenses', label: 'Budget', href: '/expenses', Icon: Wallet },
  { id: 'transactions', label: 'Activity', href: '/transactions', Icon: ReceiptText },
  { id: 'more', label: 'More', href: '/more', Icon: MoreHorizontal },
];

/**
 * Fixed bottom navigation bar optimized for Android & Mobile ergonomics.
 * Includes haptic tap feedback, safe-area offsets, and full touch targets.
 */
export const BottomNav = () => {
  const pathname = usePathname();
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const haptic = useHaptic();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full z-[var(--z-nav)] md:hidden pointer-events-none"
      aria-label="Main navigation"
    >
      {/* Subtle upward gradient fade */}
      <div className="h-6 bg-gradient-to-t from-theme-base/80 to-transparent pointer-events-none" />

      <div 
        className="mx-3 mb-2 sm:mx-5 sm:mb-3 rounded-[1.75rem] bg-theme-base/95 backdrop-blur-lg border border-theme-border/60 shadow-xl px-2 pt-1.5 pointer-events-auto"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        <ul className="flex items-center justify-around">
          {NAV_ITEMS.map(({ id, label, href, Icon }, index) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            const isMiddle = index === 2;

            return (
              <React.Fragment key={id}>
                {isMiddle && (
                  <li className="flex flex-col items-center justify-center flex-1 relative">
                    <button
                      onClick={() => {
                        haptic.medium();
                        openBottomSheet();
                      }}
                      className="absolute -top-7 w-14 h-14 rounded-2xl flex items-center justify-center bg-theme-accent hover:bg-theme-accent-hover text-theme-inverse shadow-lg shadow-theme-accent/30 active:scale-95 transition-transform"
                      aria-label="Add Expense"
                    >
                      <Plus className="w-7 h-7 stroke-[2.5]" aria-hidden="true" />
                    </button>
                  </li>
                )}
                <li className="flex-1">
                  <Link
                    href={href}
                    onClick={() => haptic.light()}
                    className={clsx(
                      'flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl',
                      'transition-all duration-150 ease-out active:scale-95',
                      'min-h-[48px] min-w-[48px] touch-target',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                      isActive
                        ? 'text-theme-inverse bg-theme-accent shadow-sm'
                        : 'text-theme-secondary hover:text-theme-primary active:bg-theme-elevated/50'
                    )}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={clsx(
                        'w-5 h-5 transition-transform duration-150',
                        isActive && 'scale-105'
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={clsx(
                        'text-[10px] font-semibold tracking-tight leading-none',
                        isActive ? 'text-theme-inverse' : 'text-theme-secondary'
                      )}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
