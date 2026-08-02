'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store';
import { AnimatedBackground } from '@/components/ui/motion/animated-background';
import { AddExpenseMorph } from '@/components/features/expenses/AddExpenseMorph';
import { LayoutDashboard, Wallet, LineChart, Plus } from 'lucide-react';

const SIDEBAR_LINKS = [
  { label: 'Dashboard', path: '/dashboard', Icon: LayoutDashboard },
  { label: 'Expenses', path: '/expenses', Icon: Wallet },
  { label: 'Analytics', path: '/analytics', Icon: LineChart },
];

export function ExpensesSidebar() {
  const pathname = usePathname();
  const openBottomSheet = useStore((s) => s.openBottomSheet);

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#faf5ee] border-r border-[#d8d0c8]/60 shadow-sm py-8 px-6 z-50">
      <div className="mb-12">
        <h1 className="font-headline text-2xl font-bold text-[#c2652a] tracking-tight">SpendWise</h1>
        <p className="font-body text-sm text-[#605850] mt-1">Premium Finance</p>
      </div>
      
      <nav className="flex-1 space-y-2 relative">
        <AnimatedBackground
          defaultValue={pathname}
          className="rounded-lg bg-[#fbe8d8]/50"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        >
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.path}
                href={link.path}
                data-id={link.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors duration-200 active:scale-95 group relative z-10 no-underline ${isActive ? 'text-[#c2652a] font-bold' : 'text-[#605850] hover:text-[#c2652a]'}`}
              >
                <link.Icon 
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-[#c2652a]' : 'text-[#605850] group-hover:text-[#c2652a]'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="font-body text-sm mt-0.5">{link.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#c2652a] rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </AnimatedBackground>
      </nav>
      
      <div className="mt-auto mb-6">
        <AddExpenseMorph>
          <div className="w-full bg-[#c2652a] text-[#ffffff] py-3 px-4 rounded-lg font-body text-sm font-medium hover:bg-[#c2652a]/90 transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span>Add Expense</span>
          </div>
        </AddExpenseMorph>
      </div>
      
      <div className="border-t border-[#d8d0c8]/30 pt-4 space-y-1">
        <Link className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors duration-200 group active:scale-95 ${pathname === '/settings' ? 'text-[#c2652a] font-bold bg-[#fbe8d8]/50' : 'text-[#605850] hover:bg-[#ece6dc]'}`} href="/settings">
          <span className="material-symbols-outlined text-xl group-hover:text-[#c2652a] transition-colors">settings</span>
          <span className="font-body text-sm">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
