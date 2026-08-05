'use client';

import { useState } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Edit2, Trash2, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { useStore } from '@/store';
import { softDeleteExpense, restoreExpense } from '@/lib/expenses/index';
import { formatCurrency } from '@/lib/utils/format';
import { formatTime } from '@/lib/utils/date';
import { UNDO_TOAST_DURATION_MS } from '@/config/constants';
import type { ExpenseDocument } from '@/types/firestore';

interface ExpenseListItemProps {
 expense: ExpenseDocument;
 onEdit: (expense: ExpenseDocument) => void;
}

/**
 * Single row in the expense timeline.
 * Swipe left to delete.
 * Tapping expands to show the note and exact time.
 */
export const ExpenseListItem = ({ expense, onEdit }: ExpenseListItemProps) => {
 const [isExpanded, setIsExpanded] = useState(false);
 const controls = useAnimation();
 
 const { user, householdId, addToast, removeExpenseOptimistic, restoreExpenseOptimistic, adjustTotalSpentOptimistic } =
 useStore();

 const storeCategories = useStore((s) => s.categories);
 const category =
 storeCategories.find((c) => c.id === expense.categoryId) ??
 useStore.getState().categoriesMap.get(expense.categoryId) ?? {
 name: 'Misc',
 emoji: '📦',
 icon: 'Package',
 color: '#6b7280',
 };

 const handleDelete = async () => {
 if (!user) return;
 
 // Animate out to the left
 await controls.start({ x: -100, opacity: 0, transition: { duration: 0.2 } });
 
 // Optimistic UI: remove from list immediately
 removeExpenseOptimistic(expense.id);
 adjustTotalSpentOptimistic(-expense.amount);

 addToast({
 type: 'warning',
 message: 'Expense deleted.',
 duration: UNDO_TOAST_DURATION_MS,
 actionLabel: 'Undo',
 onAction: async () => {
 // Restore optimistically
 restoreExpenseOptimistic(expense);
 adjustTotalSpentOptimistic(expense.amount);
 try {
 await restoreExpense(householdId || user.uid, expense.id, expense.amount, expense.month);
 } catch {
 addToast({ type: 'error', message: 'Failed to restore expense.' });
 }
 },
 });

 // After undo timeout, commit the delete
 setTimeout(async () => {
 try {
 await softDeleteExpense(householdId || user.uid, expense.id, expense.amount, expense.month);
 } catch {
 // Silently fail — if Firestore offline, it will sync later
 }
 }, UNDO_TOAST_DURATION_MS);
 };

 const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
 const threshold = -80; // pixels swiped left
 if (info.offset.x < threshold) {
 handleDelete();
 } else {
 // snap back
 controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } });
 }
 };

 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, height: 0, marginBottom: 0 }}
 transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
 className="relative mb-2"
 >
 {/* Background Actions (Swipe to Delete) */}
 <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 rounded-2xl">
 <Trash2 className="w-6 h-6 text-theme-inverse" />
 </div>

 {/* Draggable Foreground */}
 <motion.div
 drag="x"
 dragConstraints={{ left: 0, right: 0 }}
 dragElastic={{ left: 0.8, right: 0 }} // harder to drag right, easy to drag left
 onDragEnd={handleDragEnd}
 animate={controls}
 className="relative z-10 bg-[var(--surface-base)] rounded-2xl shadow-sm"
 >
 <button
 className="w-full text-left"
 onClick={() => setIsExpanded((p) => !p)}
 aria-expanded={isExpanded}
 aria-label={`${category.name} expense: ${formatCurrency(expense.amount)}`}
 >
 <div className="flex items-center gap-3 py-3 px-4">
 {/* Category icon bubble */}
 <div
 className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-lg"
 style={{ backgroundColor: `${category.color}22`, color: category.color }}
 aria-hidden="true"
 >
 {category.icon ? (
 <CategoryIcon iconName={category.icon} size={20} />
 ) : (
 category.emoji
 )}
 </div>

 {/* Text content */}
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
 {category.name}
 </p>
 {expense.note && (
 <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
 {expense.note}
 </p>
 )}
 </div>

 {/* Amount */}
 <div className="flex items-center gap-1 flex-shrink-0">
 <ArrowDownRight className="w-4 h-4 text-red-500" />
 <span className="text-base font-bold text-[var(--text-primary)]">
 {formatCurrency(expense.amount)}
 </span>
 </div>
 </div>
 </button>

 {/* Expanded details */}
 {isExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden bg-[var(--surface-secondary)] rounded-b-2xl border-t border-[var(--border-subtle)]"
 >
 <div className="flex items-center justify-between px-4 pb-3 pt-2">
 <div className="flex items-center gap-2">
 <Badge
 emoji={category.emoji}
 icon={category.icon}
 name={category.name}
 color={category.color}
 size="sm"
 />
 <span className="text-xs text-[var(--text-tertiary)]">
 {formatTime(expense.date)}
 </span>
 </div>

 <div className="flex items-center gap-1">
 <button
 onClick={() => onEdit(expense)}
 className="p-2 rounded-full hover:bg-[var(--surface-primary)] transition-colors touch-target shadow-sm"
 aria-label="Edit expense inline"
 >
 <Edit2 className="w-4 h-4 text-[var(--text-secondary)]" />
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </motion.div>
 </motion.div>
 );
};
