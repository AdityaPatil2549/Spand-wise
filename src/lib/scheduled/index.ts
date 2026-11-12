import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { db } from '../firebase/index';
import type { ScheduledTransactionDocument } from '@/types/firestore';

export function computeNextDueDate(
  fromDate: Date,
  frequency: ScheduledTransactionDocument['frequency']
): Date {
  switch (frequency) {
    case 'daily':
      return addDays(fromDate, 1);
    case 'weekly':
      return addWeeks(fromDate, 1);
    case 'monthly':
      return addMonths(fromDate, 1);
    case 'yearly':
      return addYears(fromDate, 1);
    default:
      return fromDate;
  }
}

export async function getScheduledTransactions(
  householdId: string
): Promise<ScheduledTransactionDocument[]> {
  const ref = collection(db, 'households', householdId, 'scheduled_transactions');
  const q = query(ref, orderBy('nextDueDate', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ScheduledTransactionDocument[];
}

export async function addScheduledTransaction(
  householdId: string,
  transaction: Omit<ScheduledTransactionDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ScheduledTransactionDocument> {
  const now = Timestamp.now();
  const data = {
    ...transaction,
    createdAt: now,
    updatedAt: now,
  };
  const collectionRef = collection(db, 'households', householdId, 'scheduled_transactions');
  const docRef = await addDoc(collectionRef, data);
  return {
    id: docRef.id,
    ...data,
  } as ScheduledTransactionDocument;
}

export async function updateScheduledTransaction(
  householdId: string,
  id: string,
  updates: Partial<ScheduledTransactionDocument>
): Promise<void> {
  const docRef = doc(db, 'households', householdId, 'scheduled_transactions', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteScheduledTransaction(
  householdId: string,
  id: string
): Promise<void> {
  const docRef = doc(db, 'households', householdId, 'scheduled_transactions', id);
  await deleteDoc(docRef);
}
