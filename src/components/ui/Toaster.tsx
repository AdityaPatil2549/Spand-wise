'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
 CheckCircle2,
 XCircle,
 AlertTriangle,
 Info,
 X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '@/store';
import type { Toast } from '@/types/ui';

const TOAST_ICONS = {
 success: CheckCircle2,
 error: XCircle,
 warning: AlertTriangle,
 info: Info,
};

const TOAST_COLORS = {
 success: {
 bg: 'bg-emerald-50 border-emerald-200',
 icon: 'text-emerald-500',
 text: 'text-emerald-900',
 },
 error: {
 bg: 'bg-red-50 border-red-200',
 icon: 'text-red-500',
 text: 'text-red-900',
 },
 warning: {
 bg: 'bg-amber-50 border-amber-200',
 icon: 'text-amber-500',
 text: 'text-amber-900',
 },
 info: {
 bg: 'bg-blue-50 border-blue-200',
 icon: 'text-blue-500',
 text: 'text-blue-900',
 },
};

interface ToastItemProps {
 toast: Toast;
}

const ToastItem = ({ toast }: ToastItemProps) => {
 const removeToast = useStore((s) => s.removeToast);
 const Icon = TOAST_ICONS[toast.type];
 const colors = TOAST_COLORS[toast.type];

 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 16, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -8, scale: 0.95 }}
 transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
 className={clsx(
 'flex items-start gap-3 p-3 pr-4 rounded-2xl border shadow-lg max-w-sm',
 'pointer-events-auto',
 colors.bg
 )}
 role="alert"
 >
 <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', colors.icon)} aria-hidden="true" />

 <div className="flex-1 min-w-0">
 <p className={clsx('text-sm font-medium leading-snug', colors.text)}>
 {toast.message}
 </p>
 {toast.actionLabel && toast.onAction && (
 <button
 onClick={() => {
 toast.onAction?.();
 removeToast(toast.id);
 }}
 className={clsx('mt-1 text-xs font-bold underline', colors.icon)}
 >
 {toast.actionLabel}
 </button>
 )}
 </div>

 <button
 onClick={() => removeToast(toast.id)}
 className={clsx('p-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity', colors.icon)}
 aria-label="Dismiss notification"
 >
 <X className="w-4 h-4" />
 </button>
 </motion.div>
 );
};

/**
 * Toaster — renders the global toast notification queue.
 * Place this once in the AppShell.
 */
export const Toaster = () => {
 const toasts = useStore((s) => s.toasts);

 return (
 <div
 className="fixed bottom-24 left-0 right-0 z-[var(--z-toast)] flex flex-col items-center gap-2 px-4 pointer-events-none"
 aria-live="polite"
 aria-label="Notifications"
 >
 <AnimatePresence mode="popLayout">
 {toasts.map((toast) => (
 <ToastItem key={toast.id} toast={toast} />
 ))}
 </AnimatePresence>
 </div>
 );
};
