'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { signOut } from '@/lib/firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  AlertTriangle, 
  PieChart, 
  Sparkles, 
  CalendarClock, 
  Check, 
  X, 
  TrendingDown, 
  ArrowRight 
} from 'lucide-react';
import { differenceInDays, getDaysInMonth, getDate } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { addExpense } from '@/lib/expenses';
import { updateScheduledTransaction } from '@/lib/scheduled';
import { triggerHaptic } from '@/lib/haptics';
import type { ScheduledTransactionDocument } from '@/types/firestore';

export function TopAppBar() {
  const { 
    addToast, 
    expenses, 
    budget, 
    categoriesMap, 
    user, 
    scheduledTransactions, 
    removeScheduledOptimistic, 
    householdId 
  } = useStore();
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifTab, setNotifTab] = useState<'all' | 'actionable'>('all');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [readAlerts, setReadAlerts] = useState<string[]>([]);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  
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

  const markAlertsAsRead = (ids: string[]) => {
    const updated = Array.from(new Set([...readAlerts, ...ids]));
    setReadAlerts(updated);
    try {
      localStorage.setItem('spendwise_read_alerts', JSON.stringify(updated));
    } catch (e) {}
  };

  const dismissAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAlertsAsRead([id]);
    triggerHaptic('light');
  };

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

  // 1-Tap Pay handler directly from notification drawer
  const handleQuickPayBill = async (bill: ScheduledTransactionDocument, alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    triggerHaptic('medium');
    setPayingBillId(bill.id);

    try {
      const cat = categoriesMap.get(bill.categoryId);
      const title = bill.note || cat?.name || 'Bill';
      
      await addExpense(householdId || user.uid, user.uid, {
        amount: bill.amount,
        categoryId: bill.categoryId,
        note: `${title} (${bill.frequency === 'one-time' ? 'Bill Paid' : 'Scheduled'})`,
        date: new Date().toISOString(),
      });

      if (bill.frequency === 'one-time') {
        removeScheduledOptimistic(bill.id);
        updateScheduledTransaction(householdId || user.uid, bill.id, { isActive: false }).catch(() => {});
      }

      markAlertsAsRead([alertId]);
      triggerHaptic('heavy');
      addToast({
        type: 'success',
        message: `Marked "${title}" as paid (${formatCurrency(bill.amount)})`,
      });
    } catch (err) {
      console.error('Failed to log bill payment from notification:', err);
      addToast({ type: 'error', message: 'Failed to record bill payment.' });
    } finally {
      setPayingBillId(null);
    }
  };

  const allNotifications = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      message: string;
      icon: 'warning' | 'pie_chart' | 'sparkles' | 'calendar' | 'runway';
      color: string;
      isActionable?: boolean;
      billItem?: ScheduledTransactionDocument;
      actionUrl?: string;
    }> = [];

    const now = new Date();

    // 1. Upcoming and Overdue Bills / IOUs
    scheduledTransactions
      .filter((b) => b.isActive)
      .forEach((b) => {
        try {
          const dueDate = b.nextDueDate.toDate();
          const diff = differenceInDays(dueDate, now);
          const cat = categoriesMap.get(b.categoryId);
          const title = b.note || cat?.name || 'Bill';

          if (diff <= 3 && diff >= -7) {
            const isDueToday = diff === 0;
            const isPastDue = diff < 0;
            
            items.push({
              id: `bill-${b.id}`,
              title: isDueToday 
                ? `Due Today: ${title}` 
                : isPastDue 
                ? `Overdue (${Math.abs(diff)}d): ${title}` 
                : `Due in ${diff}d: ${title}`,
              message: `${formatCurrency(b.amount)} • Tap 'Mark Paid' to record directly to ledger.`,
              icon: 'calendar',
              color: isDueToday || isPastDue ? 'text-rose-500 bg-rose-500/10' : 'text-amber-500 bg-amber-500/10',
              isActionable: true,
              billItem: b,
              actionUrl: '/scheduled'
            });
          }
        } catch {}
      });

    // 2. Daily Runway Alert
    if (budget && budget.budgetAmount > 0) {
      const daysInMonth = getDaysInMonth(now);
      const currentDay = getDate(now);
      const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);
      const safeDailySpend = Math.max(0, (budget.budgetAmount - budget.totalSpent) / daysRemaining);

      if (safeDailySpend < 200 && budget.totalSpent > 0) {
        items.push({
          id: 'alert-runway-tight',
          title: 'Tight Daily Runway',
          message: `Safe spend is at ${formatCurrency(safeDailySpend)}/day with ${daysRemaining}d left. Consider slowing velocity.`,
          icon: 'runway',
          color: 'text-amber-500 bg-amber-500/10',
          isActionable: true,
          actionUrl: '/analytics'
        });
      }
    }

    // 3. Overall Monthly Budget Alert
    if (budget && budget.budgetAmount > 0) {
      const percent = (budget.totalSpent / budget.budgetAmount) * 100;
      if (percent >= 85) {
        items.push({
          id: 'overall-budget-threshold',
          title: 'Overall Budget Warning',
          message: `You've utilized ${percent.toFixed(0)}% of your total budget limit for this month.`,
          icon: 'warning',
          color: 'text-rose-500 bg-rose-500/10',
          isActionable: true,
          actionUrl: '/budget'
        });
      }
    }

    // 4. Category Budget Alerts
    if (budget?.categoryBudgets) {
      const catTotals: Record<string, number> = {};
      expenses.forEach((e) => {
        catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + e.amount;
      });

      Object.entries(budget.categoryBudgets).forEach(([catId, amount]) => {
        if (amount > 0 && catTotals[catId]) {
          const percent = (catTotals[catId] / amount) * 100;
          if (percent >= 85) {
            const catName = categoriesMap.get(catId)?.name || 'Category';
            items.push({
              id: `cat-${catId}`,
              title: `${catName} Limit Reached`,
              message: `You've used ${percent.toFixed(0)}% of your ${catName} allocation.`,
              icon: 'pie_chart',
              color: 'text-amber-500 bg-amber-500/10',
              isActionable: true,
              actionUrl: '/budget'
            });
          }
        }
      });
    }

    // 5. System feature tip
    items.push({
      id: 'tip-1-tap-fast-log',
      title: 'Fast Log Elevated',
      message: 'Tap Chai, Coffee, or Custom on your dashboard to instantly log in 1 second.',
      icon: 'sparkles',
      color: 'text-theme-accent bg-theme-accent/10',
      actionUrl: '/dashboard'
    });

    return items;
  }, [scheduledTransactions, budget, expenses, categoriesMap]);

  const unreadAlerts = useMemo(() => {
    return allNotifications.filter((a) => !readAlerts.includes(a.id));
  }, [allNotifications, readAlerts]);

  const actionableCount = useMemo(() => {
    return unreadAlerts.filter((a) => a.isActionable).length;
  }, [unreadAlerts]);

  const displayedNotifications = useMemo(() => {
    const list = notifTab === 'actionable'
      ? allNotifications.filter((a) => a.isActionable)
      : allNotifications;
    return showAllNotifications ? list : list.slice(0, 4);
  }, [allNotifications, notifTab, showAllNotifications]);

  const unreadCount = unreadAlerts.length;

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
        {/* Notifications Center */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer flex items-center justify-center w-9 h-9 rounded-full hover:bg-theme-surface-hover/80 active:scale-95 relative"
            aria-label={`View notifications (${unreadCount} unread)`}
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-3 w-88 sm:w-96 bg-theme-surface border border-theme-border/60 shadow-2xl rounded-2xl overflow-hidden origin-top-right z-50"
              >
                {/* Header & Tabs */}
                <div className="p-3.5 border-b border-theme-border/30 bg-theme-surface/70 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans font-bold text-sm text-theme-primary">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-theme-accent/10 text-theme-accent text-[10px] font-bold font-mono">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                          const allIds = allNotifications.map((a) => a.id);
                          markAlertsAsRead(allIds);
                          addToast({ type: 'success', message: 'All notifications marked as read' });
                        }}
                        className="text-xs text-theme-accent hover:underline font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-theme-base/60 border border-theme-border/40 text-xs">
                    <button
                      onClick={() => setNotifTab('all')}
                      className={`flex-1 py-1 rounded-lg font-semibold transition-all cursor-pointer text-center ${
                        notifTab === 'all'
                          ? 'bg-theme-surface text-theme-primary shadow-2xs'
                          : 'text-theme-secondary hover:text-theme-primary'
                      }`}
                    >
                      All ({allNotifications.length})
                    </button>
                    <button
                      onClick={() => setNotifTab('actionable')}
                      className={`flex-1 py-1 rounded-lg font-semibold transition-all cursor-pointer text-center ${
                        notifTab === 'actionable'
                          ? 'bg-theme-surface text-theme-primary shadow-2xs'
                          : 'text-theme-secondary hover:text-theme-primary'
                      }`}
                    >
                      Action Required ({actionableCount})
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[360px] overflow-y-auto p-2 divide-y divide-theme-border/15">
                  {displayedNotifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-theme-secondary">
                      No notifications in this tab
                    </div>
                  ) : (
                    displayedNotifications.map((alert) => {
                      const isRead = readAlerts.includes(alert.id);
                      return (
                        <div 
                          key={alert.id} 
                          onClick={() => {
                            if (!isRead) markAlertsAsRead([alert.id]);
                            if (alert.actionUrl) {
                              setIsNotificationsOpen(false);
                              router.push(alert.actionUrl);
                            }
                          }}
                          className={`p-3 rounded-xl transition-all cursor-pointer flex gap-3 relative group ${
                            isRead ? 'opacity-70 hover:opacity-100 hover:bg-theme-surface-hover/50' : 'bg-theme-base/40 hover:bg-theme-surface-hover/80'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl ${alert.color} flex items-center justify-center shrink-0 mt-0.5`}>
                            {alert.icon === 'warning' ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : alert.icon === 'pie_chart' ? (
                              <PieChart className="w-4 h-4" />
                            ) : alert.icon === 'calendar' ? (
                              <CalendarClock className="w-4 h-4" />
                            ) : alert.icon === 'runway' ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1">
                              <p className={`font-sans text-xs font-bold text-theme-primary ${!isRead && 'text-theme-accent'}`}>
                                {alert.title}
                              </p>
                              <button
                                onClick={(e) => dismissAlert(alert.id, e)}
                                className="opacity-0 group-hover:opacity-100 text-theme-secondary hover:text-theme-primary p-0.5 transition-opacity"
                                title="Dismiss notification"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            <p className="font-sans text-xs text-theme-secondary mt-0.5 leading-relaxed">
                              {alert.message}
                            </p>

                            {/* 1-Tap Mark Paid Button for Bills */}
                            {alert.billItem && (
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickPayBill(alert.billItem!, alert.id, e)}
                                  disabled={payingBillId === alert.billItem.id}
                                  className="px-2.5 py-1 rounded-lg bg-theme-primary text-theme-inverse text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-2xs hover:opacity-90 cursor-pointer"
                                >
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                  <span>{payingBillId === alert.billItem.id ? 'Recording...' : 'Mark as Paid'}</span>
                                </button>
                                <Link
                                  href="/scheduled"
                                  onClick={() => setIsNotificationsOpen(false)}
                                  className="text-[11px] text-theme-accent hover:underline flex items-center gap-0.5 font-semibold"
                                >
                                  <span>View Bills</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {allNotifications.length > 4 && (
                    <button 
                      onClick={() => setShowAllNotifications(!showAllNotifications)}
                      className="w-full mt-2 py-2 text-center text-xs font-semibold text-theme-accent hover:bg-theme-accent/5 rounded-lg transition-colors cursor-pointer"
                    >
                      {showAllNotifications ? 'Show less' : `Show ${allNotifications.length - 4} more`}
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
