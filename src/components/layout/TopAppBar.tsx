'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

export function TopAppBar() {
  const { addToast, expenses, budget, categoriesMap, user } = useStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    const newAlerts: Array<{ id: string, title: string, message: string, icon: string, color: string }> = [];
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
          color: 'theme-danger'
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
              color: 'theme-accent'
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
        message: 'Try our new analytics dashboard to spot trends!',
        icon: 'tips_and_updates',
        color: 'theme-accent'
      }
    ];
  }, [alerts]);

  const visibleNotifications = showAllNotifications 
    ? allNotifications 
    : allNotifications.slice(0, 3);

  // If we have actual dynamic alerts, show the red dot
  const hasUnread = alerts.length > 0;

  return (
    <header className="fixed top-0 right-0 z-40 flex items-center px-6 md:px-12 h-20">
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="text-theme-tertiary hover:text-theme-accent transition-colors cursor-pointer flex items-center relative"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {hasUnread && <span className="absolute -top-1 -right-1 w-2 h-2 bg-theme-danger rounded-full"></span>}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-4 w-80 bg-theme-white border border-theme-border/50 shadow-2xl rounded-2xl overflow-hidden origin-top-right"
              >
                <div className="p-4 border-b border-theme-border/30 flex justify-between items-center bg-theme-surface/30">
                  <h4 className="font-headline font-medium text-theme-primary">Notifications</h4>
                  <button 
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      addToast({ type: 'success', message: 'All notifications marked as read' });
                    }}
                    className="text-xs text-theme-accent hover:opacity-80"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                  {visibleNotifications.map((alert) => (
                    <div key={alert.id} className="p-3 hover:bg-theme-surface-hover rounded-xl transition-colors cursor-pointer flex gap-3">
                      <div className={`w-8 h-8 rounded-full bg-${alert.color}/10 flex items-center justify-center text-${alert.color} shrink-0`}>
                        <span className="material-symbols-outlined text-sm">{alert.icon}</span>
                      </div>
                      <div>
                        <p className="font-body text-sm text-theme-primary font-medium">{alert.title}</p>
                        <p className="font-body text-xs text-theme-secondary mt-0.5">{alert.message}</p>
                      </div>
                    </div>
                  ))}

                  {allNotifications.length > 3 && (
                    <button 
                      onClick={() => setShowAllNotifications(!showAllNotifications)}
                      className="w-full mt-2 py-2 text-center text-sm font-medium text-theme-accent hover:bg-theme-accent/5 rounded-lg transition-colors"
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
            className="text-theme-tertiary hover:text-theme-accent transition-colors cursor-pointer flex items-center"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-theme-border/50" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-theme-accent/10 flex items-center justify-center border border-theme-accent/20">
                <span className="material-symbols-outlined text-theme-accent text-xl">account_circle</span>
              </div>
            )}
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-4 w-72 bg-theme-white border border-theme-border/50 shadow-2xl rounded-2xl overflow-hidden origin-top-right"
              >
                {/* ID Card Header */}
                <div className="p-5 border-b border-theme-border/30 bg-theme-surface/30">
                  <div className="flex items-center gap-3">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border border-theme-border/50" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-theme-accent/10 flex items-center justify-center border border-theme-accent/20">
                        <span className="font-headline text-lg text-theme-accent">
                          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-headline text-theme-primary font-medium truncate">
                        {user?.displayName || 'Welcome back'}
                      </p>
                      <p className="font-body text-xs text-theme-secondary truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Snapshot */}
                {budget && budget.budgetAmount > 0 && (
                  <div className="p-4 border-b border-theme-border/30">
                    <p className="text-xs font-medium text-theme-secondary uppercase tracking-widest mb-2">Monthly Budget</p>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-headline text-sm text-theme-primary">
                        {CURRENCY_SYMBOL}{budget.totalSpent.toLocaleString()}
                      </span>
                      <span className="text-xs text-theme-tertiary">
                        of {CURRENCY_SYMBOL}{budget.budgetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-theme-surface rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${(budget.totalSpent / budget.budgetAmount) > 0.85 ? 'bg-theme-danger' : 'bg-theme-accent'}`} 
                        style={{ width: `${Math.min(100, (budget.totalSpent / budget.budgetAmount) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="p-2 space-y-1">
                  <Link 
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-theme-surface-hover text-theme-primary transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-[20px] text-theme-tertiary">settings</span>
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
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-theme-danger/10 hover:text-theme-danger text-theme-primary transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-[20px] text-theme-danger/70">logout</span>
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
