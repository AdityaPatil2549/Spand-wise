'use client';

import { useEffect } from 'react';
import { getCategories } from '@/lib/categories/index';
import { useStore } from '@/store';
import type { CategoryDocument } from '@/types/firestore';
import { PRESET_CATEGORIES } from '@/config/categories';

/**
 * useCategoriesLoader — Loads categories from Firestore into the Zustand store.
 * Categories are loaded once per session (not real-time — they rarely change).
 */
export const useCategoriesLoader = (householdId: string | null): void => {
  const { setCategories, setCategoriesLoading } = useStore();

  useEffect(() => {
    if (!householdId) {
      setCategories([]);
      setCategoriesLoading(false);
      return;
    }

    let cancelled = false;
    setCategoriesLoading(true);

    getCategories(householdId)
      .then((cats) => {
        if (!cancelled) {
          if (cats.length === 0) {
            setCategories(PRESET_CATEGORIES as CategoryDocument[]);
            // Seed them in the background
            import('@/lib/categories/index').then(m => m.seedCategories(householdId));
          } else {
            setCategories(cats);
          }
          setCategoriesLoading(false);
        }
      })
      .catch((error) => {
        console.error('[useCategoriesLoader]', error);
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [householdId, setCategories, setCategoriesLoading]);
};

/**
 * Get a category by ID from the store.
 * Falls back to a default placeholder if the category is not found.
 */
export const useCategoryById = (categoryId: string): CategoryDocument | undefined => {
  const categories = useStore((s) => s.categories);
  return categories.find((c) => c.id === categoryId);
};
