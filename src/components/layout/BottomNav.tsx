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
 * Styled with subtle gradient fade into the background above it.
 */
export const BottomNav = () => {
 const pathname = usePathname();
 const openBottomSheet = useStore((s) => s.openBottomSheet);

 return (
 <nav
 className="fixed bottom-0 left-0 right-0 w-full z-[var(--z-nav)] safe-area-bottom md:hidden"
 aria-label="Main navigation"
 >
 {/* Gradient fade */}
 <div className="h-6 bg-gradient-to-t from-theme-base to-transparent pointer-events-none" />

 <div className="mx-4 mb-4 rounded-3xl bg-theme-base border border-theme-border/60 shadow-lg px-2 py-2">
 <ul className="flex items-center justify-around">
 {NAV_ITEMS.map(({ id, label, href, Icon }, index) => {
 const isActive = pathname === href || pathname.startsWith(href + '/');
 const isMiddle = index === 2;

 return (
 <React.Fragment key={id}>
 {isMiddle && (
 <li className="flex flex-col items-center justify-center flex-1 relative">
 <button
 onClick={() => openBottomSheet()}
 className="absolute -top-6 w-14 h-14 rounded-[1.25rem] flex items-center justify-center bg-theme-accent hover:bg-theme-accent-hover text-theme-inverse shadow-lg active:scale-95 transition-all"
 aria-label="Add Expense"
 >
 <Plus className="w-7 h-7" aria-hidden="true" />
 </button>
 </li>
 )}
 <li className="flex-1">
 <Link
 href={href}
 className={clsx(
 'flex flex-col items-center gap-1 py-2 px-3 rounded-2xl',
 'transition-colors duration-150 ease-out active:scale-[0.97]',
 'min-h-[52px] min-w-[52px]',
 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
 isActive
 ? 'text-theme-inverse bg-theme-accent shadow-md'
 : 'text-theme-secondary hover:text-theme-accent hover:bg-theme-elevated'
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
 'text-[10px] font-medium tracking-wide',
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
