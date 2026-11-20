'use client';

import * as React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

/**
 * Modern Linear-grade stacked notification manager powered by Sonner.
 * Replaces legacy custom toasts with spring-physics swipe gestures,
 * interactive 1-click Undo action buttons, and automatic theme adaptation.
 */
export const Toaster = () => {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        className:
          'rounded-2xl border border-theme-border/60 bg-theme-surface/95 text-theme-primary shadow-2xl backdrop-blur-md font-sans text-sm',
      }}
    />
  );
};
