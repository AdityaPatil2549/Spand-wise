import { writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { categoryDocRef, budgetDocRef, userDocRef } from '@/lib/firebase/firestore';
import { PRESET_CATEGORIES } from '@/config/categories';
import { getCurrentMonth } from '@/lib/utils/date';

/**
 * Atomically commits all onboarding writes in ONE single Firestore batch:
 * 1. Seeds all default categories
 * 2. Establishes the initial monthly budget
 * 3. Marks the user document with onboardingComplete: true
 *
 * This reduces 17 round-trips to 1 single atomic network request.
 */
export const completeOnboardingSetup = async (
  uid: string,
  householdId: string,
  budgetAmount: number
): Promise<void> => {
  const batch = writeBatch(db);
  const now = serverTimestamp() as Timestamp;
  const currentMonth = getCurrentMonth();

  // 1. Seed categories
  PRESET_CATEGORIES.forEach((cat) => {
    batch.set(
      categoryDocRef(householdId, cat.id),
      { ...cat, createdAt: now },
      { merge: true }
    );
  });

  // 2. Set initial budget
  batch.set(
    budgetDocRef(householdId, currentMonth),
    {
      id: currentMonth,
      budgetAmount,
      totalSpent: 0,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  // 3. Mark user doc complete
  batch.set(
    userDocRef(uid),
    {
      onboardingComplete: true,
      lastActive: now,
    },
    { merge: true }
  );

  await batch.commit();
};
