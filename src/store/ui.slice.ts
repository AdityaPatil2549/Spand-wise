import type { StateCreator } from 'zustand';
import type { AppStore } from './index';
import type { Toast, BottomSheetState } from '@/types/ui';

import { DEFAULT_TOAST_DURATION_MS } from '@/config/constants';

let toastIdCounter = 0;

export interface UISlice {
  toasts: Toast[];
  bottomSheet: BottomSheetState;
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  openBottomSheet: (options?: { editingExpenseId?: string; initialCategoryId?: string }) => void;
  closeBottomSheet: () => void;
}

export const createUISlice: StateCreator<AppStore, [], [], UISlice> = (set) => ({
  toasts: [],
  bottomSheet: { isOpen: false, editingExpenseId: null, initialCategoryId: null },

  addToast: (toastData) => {
    const id = `toast-${++toastIdCounter}`;
    const duration = toastData.duration ?? DEFAULT_TOAST_DURATION_MS;
    const toast: Toast = { ...toastData, id, duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));
    // Auto-dismiss after duration
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
    return id;
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  openBottomSheet: (options) =>
    set({
      bottomSheet: {
        isOpen: true,
        editingExpenseId: options?.editingExpenseId ?? null,
        initialCategoryId: options?.initialCategoryId ?? null,
      },
    }),

  closeBottomSheet: () =>
    set({ bottomSheet: { isOpen: false, editingExpenseId: null, initialCategoryId: null } }),
});
