'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const OfflineIndicator = () => {
 const [isOffline, setIsOffline] = useState(false);

 useEffect(() => {
 // Initial check
 setIsOffline(!navigator.onLine);

 const handleOnline = () => setIsOffline(false);
 const handleOffline = () => setIsOffline(true);

 window.addEventListener('online', handleOnline);
 window.addEventListener('offline', handleOffline);

 return () => {
 window.removeEventListener('online', handleOnline);
 window.removeEventListener('offline', handleOffline);
 };
 }, []);

 return (
 <AnimatePresence>
 {isOffline && (
 <motion.div
 initial={{ y: -50, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 exit={{ y: -50, opacity: 0 }}
 className="fixed top-0 left-0 right-0 z-[var(--z-toast)] flex justify-center p-2 pointer-events-none"
 >
 <div className="bg-amber-500 text-theme-inverse text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
 <WifiOff className="w-3.5 h-3.5" />
 <span>You&apos;re offline. Changes are saved locally.</span>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 );
};
