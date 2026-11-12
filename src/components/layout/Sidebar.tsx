'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Wallet,
  ReceiptText,
  LineChart,
  MoreHorizontal,
  Settings,
  Plus,
  Users,
  Target,
  PiggyBank,
  Calendar,
  Repeat,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '@/store';
import { BrandLogo } from '@/components/ui/BrandLogo';

const CORE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', href: '/dashboard', Icon: LayoutGrid },
  { id: 'transactions', label: 'Activity', href: '/transactions', Icon: ReceiptText },
  { id: 'expenses', label: 'Budgets', href: '/expenses', Icon: Wallet },
  { id: 'accounts', label: 'Wallets', href: '/accounts', Icon: PiggyBank },
  { id: 'goals', label: 'Goals', href: '/goals', Icon: Target },
  { id: 'split', label: 'Split Bills', href: '/split', Icon: Users },
];

const PLANNING_NAV_ITEMS = [
  { id: 'analytics', label: 'Analytics', href: '/analytics', Icon: LineChart },
  { id: 'calendar', label: 'Calendar', href: '/calendar', Icon: Calendar },
  { id: 'scheduled', label: 'Recurring', href: '/scheduled', Icon: Repeat },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const openBottomSheet = useStore((s) => s.openBottomSheet);

  const renderLink = ({
    id,
    label,
    href,
    Icon,
  }: {
    id: string;
    label: string;
    href: string;
    Icon: React.ComponentType<{ className?: string }>;
  }) => {
    const isActive =
      pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
    return (
      <Link
        key={id}
        href={href}
        className={clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98]',
          isActive
            ? 'text-theme-primary bg-theme-surface border border-theme-border/60 shadow-sm font-semibold'
            : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover/70'
        )}
      >
        <Icon
          className={clsx(
            'w-4 h-4 shrink-0 transition-transform duration-150',
            isActive ? 'stroke-[2.2] text-theme-accent' : 'stroke-[1.75]'
          )}
        />
        <span className="truncate flex-1">{label}</span>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-theme-accent shrink-0" />}
      </Link>
    );
  };

  return (
    <aside
      className={clsx(
        'flex flex-col bg-theme-base/95 backdrop-blur-md border-r border-theme-border/50 z-20 relative h-full select-none',
        className
      )}
    >
      {/* Brand / Logo Area */}
      <div className="p-5 pb-4 pt-5 border-b border-theme-border/30">
        <Link href="/dashboard" className="group block focus:outline-none">
          <BrandLogo size="md" showText={true} subtitle="Personal Treasury" />
        </Link>
      </div>

      {/* 2-Zone Grouped Navigation */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-theme-tertiary">
            Core
          </p>
          <div className="space-y-1">{CORE_NAV_ITEMS.map(renderLink)}</div>
        </div>

        <div>
          <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-theme-tertiary">
            Insights &amp; Plan
          </p>
          <div className="space-y-1">{PLANNING_NAV_ITEMS.map(renderLink)}</div>
        </div>
      </div>

      {/* Bottom Desktop Actions */}
      <div className="p-4 border-t border-theme-border/30 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => openBottomSheet()}
          className="flex items-center justify-between w-full px-3.5 py-2.5 bg-theme-accent hover:bg-theme-accent-hover text-theme-on-accent rounded-xl font-semibold transition-all shadow-sm shadow-theme-accent/20 active:scale-[0.98] text-sm cursor-pointer"
          title="New Expense (Shortcut: N)"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Expense
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-black/15 text-theme-on-accent border border-current/20">
            N
          </kbd>
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href="/more"
            className={clsx(
              'flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl font-medium text-xs transition-colors',
              pathname.startsWith('/more')
                ? 'bg-theme-surface-hover text-theme-primary font-semibold'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover/60'
            )}
          >
            <MoreHorizontal className="w-3.5 h-3.5 stroke-[2]" />
            <span>Tools</span>
          </Link>

          <Link
            href="/settings"
            className={clsx(
              'flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl font-medium text-xs transition-colors',
              pathname.startsWith('/settings')
                ? 'bg-theme-surface-hover text-theme-primary font-semibold'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover/60'
            )}
          >
            <Settings className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
