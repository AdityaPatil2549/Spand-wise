'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';

export function TopAppBar() {
  const addToast = useStore((s) => s.addToast);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-theme-base/80 backdrop-blur-md flex justify-end items-center px-6 md:px-12 h-20 border-b border-theme-border/30 md:border-none">
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={() => addToast({ type: 'info', message: 'Premium plans coming soon!' })}
          className="font-body text-sm font-medium text-theme-accent hover:opacity-80 transition-opacity"
        >
          Upgrade
        </button>
        <div className="h-6 w-px bg-theme-border/50"></div>
        
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="text-theme-tertiary hover:text-theme-accent transition-colors cursor-pointer flex items-center relative"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-theme-danger rounded-full"></span>
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
                  <div className="p-3 hover:bg-theme-surface-hover rounded-xl transition-colors cursor-pointer flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-theme-danger/10 flex items-center justify-center text-theme-danger shrink-0">
                      <span className="material-symbols-outlined text-sm">warning</span>
                    </div>
                    <div>
                      <p className="font-body text-sm text-theme-primary font-medium">Budget Alert</p>
                      <p className="font-body text-xs text-theme-secondary mt-0.5">You've used 85% of your food budget this month.</p>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-theme-surface-hover rounded-xl transition-colors cursor-pointer flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-theme-accent/10 flex items-center justify-center text-theme-accent shrink-0">
                      <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                    </div>
                    <div>
                      <p className="font-body text-sm text-theme-primary font-medium">New Feature</p>
                      <p className="font-body text-xs text-theme-secondary mt-0.5">Try our new analytics dashboard to spot trends!</p>
                    </div>
                  </div>
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
