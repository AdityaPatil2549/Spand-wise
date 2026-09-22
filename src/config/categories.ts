import type { CategoryDocument } from '@/types/firestore';

/**
 * Preset categories for SpendWise MVP.
 * These are seeded to the user's Firestore categories subcollection on first login.
 * Colors map to CSS custom properties in tokens.css (--cat-*).
 */
export const PRESET_CATEGORIES: Omit<CategoryDocument, 'createdAt'>[] = [
  {
    id: 'food',
    name: 'Food',
    icon: 'Utensils',
    color: '#f97316',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: 'BusFront',
    color: '#3b82f6',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'rent',
    name: 'Hostel / Rent',
    icon: 'Home',
    color: '#8b5cf6',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: '#10b981',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'stationery',
    name: 'Stationery',
    icon: 'PenTool',
    color: '#eab308',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'books',
    name: 'Books',
    icon: 'BookOpen',
    color: '#f59e0b',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'tuition',
    name: 'Tuition',
    icon: 'GraduationCap',
    color: '#6366f1',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'snacks',
    name: 'Snacks & Chai',
    icon: 'Coffee',
    color: '#d97706',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#ec4899',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Gamepad2',
    color: '#a855f7',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'medical',
    name: 'Medical',
    icon: 'Pill',
    color: '#ef4444',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'recharge',
    name: 'Recharge',
    icon: 'Smartphone',
    color: '#06b6d4',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: 'BellRing',
    color: '#14b8a6',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: 'Plane',
    color: '#0ea5e9',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'emergency',
    name: 'Emergency',
    icon: 'Siren',
    color: '#dc2626',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'gifts',
    name: 'Gifts',
    icon: 'Gift',
    color: '#f43f5e',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
    icon: 'Package',
    color: '#6b7280',
    isDefault: true,
    type: 'expense'
  },
  {
    id: 'friend',
    name: 'Paid to Friend',
    icon: 'Users',
    color: '#f59e0b',
    isDefault: true,
    type: 'expense'
  },
  // Income Categories
  {
    id: 'allowance',
    name: 'Allowance',
    icon: 'Wallet',
    color: '#10b981',
    isDefault: true,
    type: 'income'
  },
  {
    id: 'salary',
    name: 'Salary',
    icon: 'Briefcase',
    color: '#3b82f6',
    isDefault: true,
    type: 'income'
  },
  {
    id: 'freelance',
    name: 'Freelance',
    icon: 'Laptop',
    color: '#8b5cf6',
    isDefault: true,
    type: 'income'
  },
  {
    id: 'gift_received',
    name: 'Gift Received',
    icon: 'Gift',
    color: '#f43f5e',
    isDefault: true,
    type: 'income'
  },
  {
    id: 'investment',
    name: 'Investment',
    icon: 'TrendingUp',
    color: '#eab308',
    isDefault: true,
    type: 'income'
  },
  {
    id: 'other_income',
    name: 'Other Income',
    icon: 'PlusCircle',
    color: '#6b7280',
    isDefault: true,
    type: 'income'
  }
];



export const DEFAULT_CATEGORY_ID = 'misc';
