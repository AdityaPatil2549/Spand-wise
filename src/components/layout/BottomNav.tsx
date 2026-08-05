'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, BarChart2, Settings, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '@/store';

const NAV_ITEMS = [
 { id: 'dashboard', label: 'Home', href: '/dashboard', Icon: LayoutDashboard },
 { id: 'expenses', label: 'Expenses', href: '/expenses', Icon: List },
 { id: 'analytics', label: 'Analytics', href: '/analytics', Icon: BarChart2 },
 { id: 'settings', label: 'Settings', href: '/settings', Icon: Settings },
];

/**
 * Fixed bottom navigation bar.
 * Styled with flat tiles and sharp corners.
 */
export const BottomNav = () => {
 const pathname = usePathname();
 const openBottomSheet = useStore((s) => s.openBottomSheet);

  return (
  <nav
  className="fixed bottom-0 left-0 right-0 w-full z-[var(--z-nav)] safe-area-bottom md:hidden bg-theme-surface border-t border-theme-border/30"
  aria-label="Main navigation"
  >
  <div className="w-full">
  <ul className="flex items-center justify-around h-16">
  {NAV_ITEMS.map(({ id, label, href, Icon }, index) => {
  const isActive = pathname === href || pathname.startsWith(href + '/');
  const isMiddle = index === 2;

  return (
  <React.Fragment key={id}>
  {isMiddle && (
  <li className="flex flex-col items-center justify-center flex-1 h-full">
  <button
  onClick={() => openBottomSheet()}
  className="w-full h-full flex items-center justify-center bg-theme-accent hover:bg-theme-accent-hover text-theme-base active:scale-[0.98] transition-all"
  aria-label="Add Expense"
  >
  <Plus className="w-7 h-7" aria-hidden="true" />
  </button>
  </li>
  )}
  <li className="flex-1 h-full">
  <Link
  href={href}
  className={clsx(
  'flex flex-col items-center justify-center gap-1 w-full h-full',
  'transition-colors duration-150 ease-out active:scale-[0.98]',
  'focus-visible:outline-none focus-visible:bg-theme-surface-hover',
  isActive
  ? 'text-theme-accent bg-theme-accent/10'
  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover'
  )}
  aria-label={label}
  aria-current={isActive ? 'page' : undefined}
  >
  <Icon
  className={clsx(
  'w-5 h-5 transition-transform duration-150',
  isActive && 'scale-110'
  )}
  aria-hidden="true"
  />
  <span
  className={clsx(
  'text-[10px] font-mono tracking-widest uppercase',
  isActive ? 'text-theme-accent' : 'text-theme-secondary'
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
