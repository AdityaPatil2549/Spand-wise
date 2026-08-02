import { StateCreator } from 'zustand';
import { getCategories, addCustomCategory, updateCustomCategory, deleteCustomCategory } from '@/lib/categories/index';
import type { CategoryDocument } from '@/types/firestore';
import type { AppStore } from './index';
import { PRESET_CATEGORIES } from '@/config/categories';

export interface CategoriesSlice {
  categories: CategoryDocument[];
  categoriesMap: Map<string, CategoryDocument>;
  isCategoriesLoading: boolean;
  categoriesError: string | null;

  loadCategories: (householdId: string) => Promise<void>;
  addCategoryOptimistic: (category: CategoryDocument) => void;
  updateCategoryOptimistic: (category: CategoryDocument) => void;
  removeCategoryOptimistic: (categoryId: string) => void;
}

export const createCategoriesSlice: StateCreator<
  AppStore,
  [['zustand/devtools', never]],
  [],
  CategoriesSlice
> = (set, get) => ({
  categories: [...PRESET_CATEGORIES] as CategoryDocument[],
  categoriesMap: new Map((PRESET_CATEGORIES as CategoryDocument[]).map(c => [c.id, c])),
  isCategoriesLoading: false,
  categoriesError: null,

  loadCategories: async (householdId: string) => {
    set({ isCategoriesLoading: true, categoriesError: null }, false, 'categories/loadCategories/start');
    try {
      const fetched = await getCategories(householdId);
      // Merge fetched categories (which should include seeded presets + any custom ones)
      // We will create a map from fetched, but just in case, we can ensure preset defaults are present.
      const map = new Map<string, CategoryDocument>();
      (PRESET_CATEGORIES as CategoryDocument[]).forEach(c => map.set(c.id, c));
      fetched.forEach(c => map.set(c.id, c));

      const mergedCategories = Array.from(map.values());

      set(
        {
          categories: mergedCategories,
          categoriesMap: map,
          isCategoriesLoading: false,
        },
        false,
        'categories/loadCategories/success'
      );
    } catch (err: any) {
      set(
        { categoriesError: err.message, isCategoriesLoading: false },
        false,
        'categories/loadCategories/error'
      );
    }
  },

  addCategoryOptimistic: (category: CategoryDocument) => {
    const { categories, categoriesMap } = get();
    const newMap = new Map(categoriesMap);
    newMap.set(category.id, category);
    set(
      {
        categories: [...categories, category],
        categoriesMap: newMap,
      },
      false,
      'categories/addOptimistic'
    );
  },

  updateCategoryOptimistic: (category: CategoryDocument) => {
    const { categories, categoriesMap } = get();
    const newMap = new Map(categoriesMap);
    newMap.set(category.id, category);
    set(
      {
        categories: categories.map(c => (c.id === category.id ? category : c)),
        categoriesMap: newMap,
      },
      false,
      'categories/updateOptimistic'
    );
  },

  removeCategoryOptimistic: (categoryId: string) => {
    const { categories, categoriesMap } = get();
    const newMap = new Map(categoriesMap);
    newMap.delete(categoryId);
    set(
      {
        categories: categories.filter(c => c.id !== categoryId),
        categoriesMap: newMap,
      },
      false,
      'categories/removeOptimistic'
    );
  },
});
