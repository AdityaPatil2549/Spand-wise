import {
 getDocs,
 setDoc,
 serverTimestamp,
 Timestamp,
 deleteDoc,
 doc,
 writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { categoriesColRef, categoryDocRef } from '@/lib/firebase/firestore';
import { PRESET_CATEGORIES } from '@/config/categories';
import type { CategoryDocument } from '@/types/firestore';

/**
 * Seed preset categories into the user's categories subcollection.
 * Called once during onboarding. Uses writeBatch for a single atomic fast write.
 */
export const seedCategories = async (householdId: string): Promise<void> => {
 const batch = writeBatch(db);
 const now = serverTimestamp() as Timestamp;
 PRESET_CATEGORIES.forEach((cat) => {
  batch.set(
   categoryDocRef(householdId, cat.id),
   { ...cat, createdAt: now },
   { merge: true }
  );
 });
 await batch.commit();
};

/**
 * Fetch all categories for a user.
 */
export const getCategories = async (householdId: string): Promise<CategoryDocument[]> => {
 const snap = await getDocs(categoriesColRef(householdId));
 return snap.docs.map((d) => ({ ...d.data(), id: d.id } as CategoryDocument));
};

/**
 * Add a new custom category
 */
export const addCustomCategory = async (
 householdId: string,
 categoryData: Omit<CategoryDocument, 'id' | 'createdAt' | 'isDefault'>
): Promise<CategoryDocument> => {
 const newRef = doc(categoriesColRef(householdId));
 const newCat: CategoryDocument = {
 ...categoryData,
 id: newRef.id,
 isDefault: false,
 createdAt: serverTimestamp() as Timestamp,
 };
 await setDoc(newRef, newCat);
 return newCat;
};

/**
 * Update an existing custom category
 */
export const updateCustomCategory = async (
 householdId: string,
 categoryId: string,
 updates: Partial<Omit<CategoryDocument, 'id' | 'createdAt' | 'isDefault'>>
): Promise<void> => {
 const ref = categoryDocRef(householdId, categoryId);
 await setDoc(ref, updates, { merge: true });
};

/**
 * Delete a custom category
 */
export const deleteCustomCategory = async (householdId: string, categoryId: string): Promise<void> => {
 const ref = categoryDocRef(householdId, categoryId);
 await deleteDoc(ref);
};
