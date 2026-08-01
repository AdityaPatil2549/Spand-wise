'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, BarChart2, Settings, Plus, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', href: '/dashboard', Icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', href: '/expenses', Icon: List },
  { id: 'analytics', label: 'Analytics', href: '/analytics', Icon: BarChart2 },
  { id: 'settings', label: 'Settings', href: '/settings', Icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const openBottomSheet = useStore((s) => s.openBottomSheet);

  return (
    <aside className={clsx("flex flex-col bg-[var(--surface-base)] shadow-[var(--shadow-3d-card)] z-10 relative rounded-r-3xl my-4 ml-4", className)}>
      {/* Brand / Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-[var(--shadow-3d-button)]">
          <Wallet className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">SpendWise</h1>
          <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Tracker</p>
        </div>
      </div>

      {/* Main Action (Add Expense) */}
      <div className="px-4 mb-6">
        <Button 
          variant="primary" 
          fullWidth 
          onClick={() => openBottomSheet()}
          className="py-4 text-base"
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Expense
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map(({ id, label, href, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={id}
              href={href}
              className={clsx(
                'flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-[box-shadow,color] duration-150 ease-out active:scale-[0.97]',
                isActive
                  ? 'text-violet-700 shadow-[var(--shadow-3d-inset)] dark:text-violet-300'
                  : 'text-[var(--text-secondary)] hover:shadow-[var(--shadow-3d-card-hover)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon 
                className={clsx(
                  "w-5 h-5 transition-transform duration-150",
                  isActive && "scale-110"
                )} 
              />
              <span className="text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer Area (Optional User info etc) */}
      <div className="p-4 border-t border-[var(--surface-secondary)]/30">
        <p className="text-xs text-center text-[var(--text-tertiary)]">
          &copy; {new Date().getFullYear()} SpendWise
        </p>
      </div>
    </aside>
  );
};
