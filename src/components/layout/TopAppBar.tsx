'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { signOut } from '@/lib/firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, User, Settings, LogOut, AlertTriangle, PieChart, Sparkles } from 'lucide-react';

export function TopAppBar() {
  const { addToast, expenses, budget, categoriesMap, user } = useStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [readAlerts, setReadAlerts] = useState<string[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('spendwise_read_alerts');
      if (stored) setReadAlerts(JSON.parse(stored));
    } catch (e) {}
  }, []);

  // Close notifications and profile on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const alerts = useMemo(() => {
    const newAlerts: Array<{ id: string; title: string; message: string; icon: 'warning' | 'pie_chart' | 'sparkles'; color: string }> = [];
    if (!budget) return newAlerts;

    // Check overall budget
    if (budget.budgetAmount > 0) {
      const percent = (budget.totalSpent / budget.budgetAmount) * 100;
      if (percent >= 85) {
        newAlerts.push({
          id: 'overall',
          title: 'Overall Budget Alert',
          message: `You've used ${percent.toFixed(0)}% of your total budget this month.`,
          icon: 'warning',
          color: 'text-rose-500 bg-rose-500/10'
        });
      }
    }

    // Check category budgets
    if (budget.categoryBudgets) {
      const catTotals: Record<string, number> = {};
      expenses.forEach(e => {
        catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + e.amount;
      });

      Object.entries(budget.categoryBudgets).forEach(([catId, amount]) => {
        if (amount > 0 && catTotals[catId]) {
          const percent = (catTotals[catId] / amount) * 100;
          if (percent >= 85) {
            const catName = categoriesMap.get(catId)?.name || 'Category';
            newAlerts.push({
              id: `cat-${catId}`,
              title: `${catName} Budget Alert`,
              message: `You've used ${percent.toFixed(0)}% of your ${catName} budget.`,
              icon: 'pie_chart',
              color: 'text-amber-500 bg-amber-500/10'
            });
          }
        }
      });
    }

    return newAlerts;
  }, [budget, expenses, categoriesMap]);

  const allNotifications = useMemo(() => {
    return [
      ...alerts,
      {
        id: 'static-feature',
        title: 'New Feature',
        message: 'Explore our refreshed analysis dashboard to spot velocity trends.',
        icon: 'sparkles' as const,
        color: 'text-theme-accent bg-theme-accent/10'
      }
    ];
  }, [alerts]);

  const visibleNotifications = showAllNotifications 
    ? allNotifications 
    : allNotifications.slice(0, 3);

  // If we have actual dynamic alerts that haven't been read, show the indicator dot
  const hasUnread = allNotifications.some((a) => !readAlerts.includes(a.id));

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full px-4 sm:px-6 md:px-8 h-16 md:h-18 bg-theme-base/90 backdrop-blur-md border-b border-theme-border/30 transition-colors select-none">
      {/* Left: Mobile Branding or Desktop Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="md:hidden flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-theme-primary text-theme-inverse flex items-center justify-center font-display font-extrabold text-xs tracking-tight shadow-xs group-hover:scale-105 transition-transform">
            SW
          </div>
          <span className="font-display text-base font-extrabold tracking-[-0.035em] text-theme-primary leading-none">
            SpendWise
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-wider text-theme-secondary font-semibold">
          <span className="text-theme-secondary/80">SpendWise</span>
          <span className="text-theme-border font-bold">/</span>
          <span className="text-theme-primary font-bold capitalize">
            {pathname.split('/')[1] ? pathname.split('/')[1].replace('-', ' ') : 'Dashboard'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer flex items-center justify-center w-9 h-9 rounded-full hover:bg-theme-surface-hover/80 active:scale-95 relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            {hasUnread && <span className="absolute 1 top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-3 w-80 bg-theme-surface border border-theme-border/60 shadow-xl rounded-2xl overflow-hidden origin-top-right z-50"
              >
                <div className="p-4 border-b border-theme-border/30 flex justify-between items-center bg-theme-surface/50">
                  <h4 className="font-sans font-semibold text-sm text-theme-primary">Notifications</h4>
                  <button 
                    onClick={() => {
                      const allIds = allNotifications.map(a => a.id);
                      setReadAlerts(allIds);
                      try {
                        localStorage.setItem('spendwise_read_alerts', JSON.stringify(allIds));
                      } catch(e) {}
                      setIsNotificationsOpen(false);
                      addToast({ type: 'success', message: 'All notifications marked as read' });
                    }}
                    className="text-xs text-theme-accent hover:opacity-80 font-medium"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2 divide-y divide-theme-border/15">
                  {visibleNotifications.map((alert) => (
                    <div key={alert.id} className="p-3 hover:bg-theme-surface-hover/70 rounded-xl transition-colors cursor-pointer flex gap-3">
                      <div className={`w-8 h-8 rounded-xl ${alert.color} flex items-center justify-center shrink-0`}>
                        {alert.icon === 'warning' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : alert.icon === 'pie_chart' ? (
                          <PieChart className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans text-xs font-semibold text-theme-primary">{alert.title}</p>
                        <p className="font-sans text-xs text-theme-secondary mt-0.5 leading-relaxed">{alert.message}</p>
                      </div>
                    </div>
                  ))}

                  {allNotifications.length > 3 && (
                    <button 
                      onClick={() => setShowAllNotifications(!showAllNotifications)}
                      className="w-full mt-2 py-2 text-center text-xs font-semibold text-theme-accent hover:bg-theme-accent/5 rounded-lg transition-colors"
                    >
                      {showAllNotifications ? 'Show less' : `Show ${allNotifications.length - 3} more`}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer flex items-center"
            aria-label="Open user profile menu"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-theme-border/50 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-theme-surface border border-theme-border/60 flex items-center justify-center text-theme-secondary">
                <User className="w-4 h-4 stroke-[2]" />
              </div>
            )}
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-3 w-72 bg-theme-surface border border-theme-border/60 shadow-xl rounded-2xl overflow-hidden origin-top-right z-50"
              >
                {/* ID Card Header */}
                <div className="p-4 border-b border-theme-border/30 bg-theme-surface/50">
                  <div className="flex items-center gap-3">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border border-theme-border/50 object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-theme-accent/10 flex items-center justify-center border border-theme-accent/20">
                        <span className="font-sans font-semibold text-sm text-theme-accent">
                          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-sans font-semibold text-sm text-theme-primary truncate">
                        {user?.displayName || 'SpendWise Student'}
                      </p>
                      <p className="font-sans text-xs text-theme-secondary truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Snapshot */}
                {budget && budget.budgetAmount > 0 && (
                  <div className="p-4 border-b border-theme-border/30">
                    <p className="text-[11px] font-semibold text-theme-secondary uppercase tracking-wider mb-2">Monthly Budget</p>
                    <div className="flex justify-between items-baseline mb-1 text-xs tabular-nums font-mono">
                      <span className="font-semibold text-theme-primary">
                        {CURRENCY_SYMBOL}{budget.totalSpent.toLocaleString()}
                      </span>
                      <span className="text-theme-tertiary">
                        of {CURRENCY_SYMBOL}{budget.budgetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-theme-elevated/70 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${(budget.totalSpent / budget.budgetAmount) > 0.85 ? 'bg-rose-500' : 'bg-theme-accent'}`} 
                        style={{ width: `${Math.min(100, (budget.totalSpent / budget.budgetAmount) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="p-2 space-y-1">
                  <Link 
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-theme-surface-hover/80 text-theme-primary transition-colors text-xs font-semibold"
                  >
                    <Settings className="w-4 h-4 text-theme-secondary" />
                    Account Settings
                  </Link>
                  <button 
                    onClick={async () => {
                      setIsProfileOpen(false);
                      try {
                        await signOut();
                        router.push('/login');
                      } catch {
                        addToast({ type: 'error', message: 'Failed to sign out.' });
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors text-xs font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
