'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import { CURRENCY_SYMBOL } from '@/config/constants';

export function TopAppBar() {
  const { addToast, expenses, budget, categoriesMap } = useStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
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
        <Link href="/settings" className="text-theme-tertiary hover:text-theme-accent transition-colors cursor-pointer flex items-center">
          <span className="material-symbols-outlined text-3xl text-theme-accent">account_circle</span>
        </Link>
      </div>
    </header>
  );
}
