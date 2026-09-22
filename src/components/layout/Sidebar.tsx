'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Wallet, LineChart, Settings, Plus, PiggyBank } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '@/store';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', Icon: LayoutGrid },
  { id: 'expenses', label: 'Expenses', href: '/transactions', Icon: Wallet },
  { id: 'analytics', label: 'Analytics', href: '/analytics', Icon: LineChart },
  { id: 'accounts', label: 'Savings', href: '/accounts', Icon: PiggyBank },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const openBottomSheet = useStore((s) => s.openBottomSheet);

  return (
    <aside className={clsx("flex flex-col bg-theme-base border-r border-theme-border z-10 relative h-full", className)}>
      {/* Brand / Logo Area */}
      <div className="p-6 pt-10 pb-10">
        <h1 
          className="text-3xl leading-none text-theme-accent mb-1"
          style={{ fontFamily: 'var(--font-pacifico), cursive' }}
        >
          SpendWise
        </h1>
        <p className="text-[12px] text-theme-secondary font-medium uppercase tracking-wide">Premium Finance</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-8 space-y-6">
        {NAV_ITEMS.map(({ id, label, href, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={id}
              href={href}
              className={clsx(
                'flex flex-col items-start gap-1.5 font-medium transition-colors',
                isActive
                  ? 'text-theme-primary'
                  : 'text-theme-tertiary hover:text-theme-primary'
              )}
            >
              <Icon 
                className={clsx(
                  "w-6 h-6 stroke-[1.5]",
                )} 
              />
              <span className="text-[13px]">{label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Bottom Actions */}
      <div className="p-6 flex flex-col gap-4 mb-2">
        <button 
          onClick={() => openBottomSheet()}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-theme-accent hover:opacity-90 text-white rounded-xl font-medium transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>

        <div className="h-px w-full bg-theme-border"></div>

        <Link
          href="/settings"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20 rounded-xl font-medium transition-colors text-sm"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
};
