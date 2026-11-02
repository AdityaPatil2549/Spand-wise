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
  Users
} from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '@/store';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', Icon: LayoutGrid },
  { id: 'expenses', label: 'Budget & Overview', href: '/expenses', Icon: Wallet },
  { id: 'transactions', label: 'Transactions', href: '/transactions', Icon: ReceiptText },
  { id: 'analytics', label: 'Analytics', href: '/analytics', Icon: LineChart },
  { id: 'split', label: 'Split Bills', href: '/split', Icon: Users },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const openBottomSheet = useStore((s) => s.openBottomSheet);

  return (
    <aside 
      className={clsx(
        "flex flex-col bg-theme-base/95 backdrop-blur-md border-r border-theme-border/50 z-20 relative h-full select-none", 
        className
      )}
    >
      {/* Brand / Logo Area */}
      <div className="p-6 pb-5 pt-6 border-b border-theme-border/20">
        <Link href="/dashboard" className="group block">
          <h1 
            className="text-3xl leading-none text-theme-accent mb-1 group-hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-pacifico), cursive' }}
          >
            SpendWise
          </h1>
          <p className="text-[11px] text-theme-secondary font-semibold uppercase tracking-wider">
            Student Finance & Budget
          </p>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, href, Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={id}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-150',
                isActive
                  ? 'text-theme-inverse bg-theme-accent shadow-sm shadow-theme-accent/25 font-semibold'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover/80'
              )}
            >
              <Icon 
                className={clsx(
                  "w-4 h-4 shrink-0 transition-transform duration-150",
                  isActive ? "stroke-[2.2] scale-105" : "stroke-[1.75]"
                )} 
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Bottom Desktop Actions */}
      <div className="p-4 border-t border-theme-border/30 flex flex-col gap-2">
        <button 
          onClick={() => openBottomSheet()}
          className="flex items-center justify-between w-full px-3.5 py-2.5 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverse rounded-xl font-semibold transition-all shadow-sm shadow-theme-accent/20 active:scale-[0.98] text-sm"
          title="New Expense (Shortcut: N)"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Expense
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-black/20 text-theme-inverse/90 border border-white/20">
            N
          </kbd>
        </button>

        <Link
          href="/more"
          className={clsx(
            "flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl font-medium text-sm transition-colors",
            pathname.startsWith('/more')
              ? "bg-theme-surface-hover text-theme-primary font-semibold"
              : "text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover/60"
          )}
        >
          <MoreHorizontal className="w-4 h-4 stroke-[2]" />
          <span>More</span>
        </Link>

        <Link
          href="/settings"
          className={clsx(
            "flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl font-medium text-sm transition-colors",
            pathname.startsWith('/settings')
              ? "bg-theme-surface-hover text-theme-primary font-semibold"
              : "text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover/60"
          )}
        >
          <Settings className="w-4 h-4 stroke-[1.75]" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};
