'use client';

import { useCallback } from 'react';

/**
 * useHaptic
 * A simple hook to trigger device vibrations on supported mobile devices.
 * Great for adding tactile feedback to UI interactions like saving, deleting, or errors.
 */
export const useHaptic = () => {
  const trigger = useCallback((pattern: number | number[] = 50) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silently ignore errors (e.g. if user hasn't interacted with page yet)
      }
    }
  }, []);

  return {
    /** A very light, quick tap (good for simple toggles/buttons) */
    light: () => trigger(10),
    /** A solid tap (good for primary actions like saving) */
    medium: () => trigger(40),
    /** A heavier thud (good for destructive actions like delete) */
    heavy: () => trigger(80),
    /** Two quick taps (good for success states or level ups) */
    success: () => trigger([30, 60, 40]),
    /** A harsh buzz (good for errors or warnings) */
    error: () => trigger([50, 100, 150])
  };
};
