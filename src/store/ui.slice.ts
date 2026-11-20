import type { StateCreator } from 'zustand';
import type { AppStore } from './index';
import type { Toast, BottomSheetState } from '@/types/ui';
import { toast as sonnerToast } from 'sonner';
import { DEFAULT_TOAST_DURATION_MS } from '@/config/constants';

let toastIdCounter = 0;

export interface UISlice {
  toasts: Toast[];
  bottomSheet: BottomSheetState;
  isDownloadSheetOpen: boolean;
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  openBottomSheet: (options?: { editingExpenseId?: string; initialCategoryId?: string }) => void;
  closeBottomSheet: () => void;
  openDownloadSheet: () => void;
  closeDownloadSheet: () => void;
}

export const createUISlice: StateCreator<AppStore, [], [], UISlice> = (set) => ({
  toasts: [],
  bottomSheet: { isOpen: false, editingExpenseId: null, initialCategoryId: null },
  isDownloadSheetOpen: false,

  addToast: (toastData) => {
    const id = `toast-${++toastIdCounter}`;
    const duration = toastData.duration ?? DEFAULT_TOAST_DURATION_MS;
    const toast: Toast = { ...toastData, id, duration };

    // Synchronize to internal store state for backward compatibility
    set((state) => ({ toasts: [...state.toasts, toast] }));

    const action =
      toastData.actionLabel && toastData.onAction
        ? {
            label: toastData.actionLabel,
            onClick: () => {
              toastData.onAction?.();
            },
          }
        : undefined;

    // Trigger Sonner notification with native action button
    switch (toastData.type) {
      case 'success':
        sonnerToast.success(toastData.message, { id, duration, action });
        break;
      case 'error':
        sonnerToast.error(toastData.message, { id, duration, action });
        break;
      case 'warning':
        sonnerToast.warning(toastData.message, { id, duration, action });
        break;
      case 'info':
      default:
        sonnerToast.info(toastData.message, { id, duration, action });
        break;
    }

    return id;
  },

  removeToast: (id) => {
    sonnerToast.dismiss(id);
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

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

  openDownloadSheet: () => set({ isDownloadSheetOpen: true }),
  closeDownloadSheet: () => set({ isDownloadSheetOpen: false }),
});
