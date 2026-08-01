'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, BarChart2, Settings } from 'lucide-react';
import { clsx } from 'clsx';

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

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full z-[var(--z-nav)] safe-area-bottom md:hidden"
      aria-label="Main navigation"
    >
      {/* Gradient fade */}
      <div className="h-6 bg-gradient-to-t from-[var(--surface-base)] to-transparent pointer-events-none" />

      <div className="mx-4 mb-4 rounded-3xl bg-[var(--surface-base)] shadow-[var(--shadow-3d-card)] px-2 py-2">
        <ul className="flex items-center justify-around">
          {NAV_ITEMS.map(({ id, label, href, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={id} className="flex-1">
                <Link
                  href={href}
                  className={clsx(
                    'flex flex-col items-center gap-1 py-2 px-3 rounded-2xl',
                    'transition-colors duration-150 ease-out active:scale-[0.97]',
                    'min-h-[44px] min-w-[44px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
                    isActive
                      ? 'text-violet-600 bg-violet-100/50 shadow-[var(--shadow-3d-button-active)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
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
                      isActive ? 'text-violet-600' : 'text-[var(--text-tertiary)]'
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
  );
};
