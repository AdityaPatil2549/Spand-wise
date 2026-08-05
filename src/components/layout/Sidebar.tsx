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
 <aside className={clsx("flex flex-col bg-theme-surface shadow-none z-10 relative rounded-sm border border-theme-border/30 my-4 ml-4", className)}>
 {/* Brand / Logo Area */}
 <div className="p-6 flex items-center gap-3">
 <div className="w-10 h-10 rounded-sm bg-theme-accent flex items-center justify-center text-theme-base">
 <Wallet className="w-6 h-6" aria-hidden="true" />
 </div>
 <div>
 <h1 className="text-xl font-bold tracking-tight text-theme-primary font-display">SpendWise</h1>
 <p className="text-xs text-theme-secondary font-medium font-mono uppercase tracking-widest">Tracker</p>
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
 'flex items-center gap-4 px-4 py-3 rounded-sm font-medium transition-all duration-150 ease-out active:scale-[0.98]',
 isActive
 ? 'text-theme-accent bg-theme-accent/10 border-l-2 border-theme-accent'
 : 'text-theme-secondary hover:bg-theme-surface-hover hover:text-theme-primary border-l-2 border-transparent'
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
 <div className="p-4 border-t border-theme-border/30">
 <p className="text-[11px] font-mono text-center text-theme-tertiary">
 &copy; {new Date().getFullYear()} SpendWise
 </p>
 </div>
 </aside>
 );
};
