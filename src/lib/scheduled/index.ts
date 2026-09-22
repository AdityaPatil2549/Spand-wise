import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/index';
import type { ScheduledTransactionDocument } from '@/types/firestore';

/**
 * Fetches all scheduled transactions for a household.
 */
export async function getScheduledTransactions(householdId: string): Promise<ScheduledTransactionDocument[]> {
  const ref = collection(db, `users/${householdId}/scheduled_transactions`);
  const snap = await getDocs(ref);
  return snap.docs.map(doc => doc.data() as ScheduledTransactionDocument);
}

/**
 * Creates a new scheduled transaction.
 */
export async function addScheduledTransaction(
  householdId: string,
  data: Omit<ScheduledTransactionDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ScheduledTransactionDocument> {
  const collectionRef = collection(db, `users/${householdId}/scheduled_transactions`);
  const docRef = doc(collectionRef);
  const id = docRef.id;
  const now = Timestamp.now();
  
  const payload: ScheduledTransactionDocument = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(docRef, payload);
  return payload;
}

/**
 * Updates an existing scheduled transaction.
 */
export async function updateScheduledTransaction(
  householdId: string,
  id: string,
  data: Partial<Omit<ScheduledTransactionDocument, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, `users/${householdId}/scheduled_transactions/${id}`);
  const payload = { ...data, updatedAt: Timestamp.now() };
  await updateDoc(docRef, payload);
}

/**
 * Deletes a scheduled transaction.
 */
export async function deleteScheduledTransaction(
  householdId: string,
  id: string
): Promise<void> {
  const docRef = doc(db, `users/${householdId}/scheduled_transactions/${id}`);
  await deleteDoc(docRef);
}
