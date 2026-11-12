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
  { id: 'transactions', label: 'Activity', href: '/transactions', Icon: ReceiptText },
  { id: 'expenses', label: 'Budget', href: '/expenses', Icon: Wallet },
  { id: 'more', label: 'More', href: '/more', Icon: MoreHorizontal },
];

/**
 * Fixed mobile navigation shell inspired by Cashew:
 * Symmetrical 4-tab bottom bar + thumb-reachable 56x56 bottom-right squircle FAB.
 */
export const BottomNav = () => {
  const pathname = usePathname();
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const haptic = useHaptic();

  return (
    <>
      {/* Thumb-First Bottom-Right Squircle FAB (56x56px) */}
      <button
        type="button"
        onClick={() => {
          haptic.medium();
          openBottomSheet();
        }}
        className="md:hidden fixed right-4 bottom-[5.5rem] z-[var(--z-fab)] w-14 h-14 rounded-2xl flex items-center justify-center bg-theme-accent hover:bg-theme-accent-hover text-theme-on-accent border border-theme-border/30 shadow-fab active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2"
        aria-label="Add Expense"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
      </button>

      {/* Symmetrical 4-Tab Bottom Dock */}
      <nav
        className="fixed bottom-0 left-0 right-0 w-full z-[var(--z-nav)] md:hidden pointer-events-none"
        aria-label="Main navigation"
      >
        <div
          className="mx-3 mb-2 sm:mx-5 sm:mb-3 rounded-[1.75rem] bg-theme-surface/95 backdrop-blur-xl border border-theme-border/60 shadow-2xl px-2 py-1.5 pointer-events-auto"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
        >
          <ul className="grid grid-cols-4 items-center gap-1">
            {NAV_ITEMS.map(({ id, label, href, Icon }) => {
              const isActive =
                pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));

              return (
                <li key={id}>
                  <Link
                    href={href}
                    onClick={() => haptic.light()}
                    className={clsx(
                      'flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl',
                      'transition-all duration-150 ease-out active:scale-95',
                      'min-h-[44px] w-full',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                      isActive
                        ? 'text-theme-accent bg-theme-accent/15 font-bold shadow-sm'
                        : 'text-theme-secondary hover:text-theme-primary active:bg-theme-elevated/40 font-medium'
                    )}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={clsx(
                        'w-5 h-5 transition-transform duration-150',
                        isActive && 'scale-105 stroke-[2.2]'
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={clsx(
                        'text-[11px] tracking-tight leading-none',
                        isActive ? 'text-theme-accent font-bold' : 'text-theme-secondary font-medium'
                      )}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
};
