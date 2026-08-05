import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/index';
import type { QuickAddPreset } from '@/types/firestore';

/**
 * Updates the user's custom Quick Add presets in Firestore.
 */
export async function updateQuickAddPresets(uid: string, presets: QuickAddPreset[]): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    quickAddPresets: presets,
  });
}
