import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import type { ExpenseDocument } from '@/types/firestore';
import type { ExpenseDayGroup } from '@/types/ui';

/**
 * Get the current month as a "YYYY-MM" string.
 * Example: "2026-07"
 */
export const getCurrentMonth = (): string => {
  return format(new Date(), 'yyyy-MM');
};

/**
 * Get a human-readable month label.
 * Example: "2026-07" → "July 2026"
 */
export const getMonthLabel = (month: string): string => {
  const date = parseISO(`${month}-01`);
  return format(date, 'MMMM yyyy');
};

/**
 * Get the last N months as MonthOption objects (most recent first).
 */
export const getRecentMonths = (count = 6): { value: string; label: string }[] => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = format(d, 'yyyy-MM');
    const label = format(d, 'MMMM yyyy');
    months.push({ value, label });
  }
  return months;
};

/**
 * Format a Firestore Timestamp or Date for display in the expense list.
 * Examples: "Today", "Yesterday", "Mon, 21 Jul"
 */
export const formatExpenseDate = (timestamp: Timestamp): string => {
  const date = timestamp.toDate();
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, d MMM');
};

/**
 * Format a Timestamp to a short time string.
 * Example: "2:45 PM"
 */
export const formatTime = (timestamp: Timestamp): string => {
  return format(timestamp.toDate(), 'h:mm a');
};

/**
 * Get a "YYYY-MM-DD" date key from a Firestore Timestamp.
 */
export const getDateKey = (timestamp: Timestamp): string => {
  return format(timestamp.toDate(), 'yyyy-MM-dd');
};

/**
 * Group a flat list of expenses into day groups for the timeline view.
 * Groups are sorted descending (most recent first).
 */
export const groupExpensesByDay = (expenses: ExpenseDocument[]): ExpenseDayGroup[] => {
  const groupMap = new Map<string, ExpenseDayGroup>();

  for (const expense of expenses) {
    const dateKey = getDateKey(expense.date);
    if (!groupMap.has(dateKey)) {
      groupMap.set(dateKey, {
        label: formatExpenseDate(expense.date),
        dateKey,
        expenses: [],
        totalAmount: 0,
      });
    }
    const group = groupMap.get(dateKey)!;
    group.expenses.push(expense);
    group.totalAmount += expense.amount;
  }

  // Sort by dateKey descending (most recent first)
  return Array.from(groupMap.values()).sort((a, b) =>
    b.dateKey.localeCompare(a.dateKey)
  );
};

/**
 * Convert a JS Date to an ISO string suitable for datetime-local inputs.
 * Example: new Date() → "2026-07-21T14:30"
 */
export const dateToInputValue = (date: Date = new Date()): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm");
};
