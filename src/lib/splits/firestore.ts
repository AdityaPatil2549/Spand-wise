import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type CollectionReference,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/index';
import type {
  SplitExpenseDocument,
  SplitGroupDocument,
  SplitGroupMember,
  SplitMode,
  SplitShareAllocation,
} from '@/types/firestore';

export const splitGroupsColRef = (householdId: string) =>
  collection(db, 'households', householdId, 'split_groups') as CollectionReference<SplitGroupDocument>;

export const splitExpensesColRef = (householdId: string) =>
  collection(db, 'households', householdId, 'split_expenses') as CollectionReference<SplitExpenseDocument>;

export function subscribeSplitGroups(
  householdId: string,
  onData: (groups: SplitGroupDocument[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(splitGroupsColRef(householdId), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      onData(items);
    },
    (err) => {
      onError?.(err);
    }
  );
}

export function subscribeSplitExpenses(
  householdId: string,
  onData: (expenses: SplitExpenseDocument[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  // Single-field orderBy avoids composite index requirements; soft-deleted docs are filtered in memory
  const q = query(splitExpensesColRef(householdId), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs
        .map((d) => ({ ...d.data(), id: d.id }))
        .filter((item) => !item.isDeleted);
      onData(items);
    },
    (err) => {
      onError?.(err);
    }
  );
}

export async function createSplitGroup(
  householdId: string,
  userId: string,
  payload: {
    name: string;
    emoji?: string;
    isDirect?: boolean;
    simplifyDebts?: boolean;
    members: SplitGroupMember[];
  }
): Promise<string> {
  const sanitizedMembers: SplitGroupMember[] = payload.members.map((m) => ({
    id: m.id,
    name: m.name.trim(),
    ...(m.upiId?.trim() ? { upiId: m.upiId.trim() } : {}),
    ...(m.isSelf ? { isSelf: true } : {}),
  }));

  const docRef = await addDoc(splitGroupsColRef(householdId), {
    name: payload.name.trim(),
    emoji: payload.emoji || (payload.isDirect ? '🤝' : '🏠'),
    isDirect: !!payload.isDirect,
    simplifyDebts: payload.simplifyDebts ?? true,
    members: sanitizedMembers,
    createdBy: userId,
    createdAt: serverTimestamp() as SplitGroupDocument['createdAt'],
    updatedAt: serverTimestamp() as SplitGroupDocument['updatedAt'],
  } as Omit<SplitGroupDocument, 'id'> as SplitGroupDocument);

  return docRef.id;
}

export async function updateSplitGroupSimplify(
  householdId: string,
  groupId: string,
  simplifyDebts: boolean
): Promise<void> {
  await updateDoc(doc(db, 'households', householdId, 'split_groups', groupId), {
    simplifyDebts,
    updatedAt: serverTimestamp(),
  });
}

export async function addSplitExpense(
  householdId: string,
  userId: string,
  payload: {
    groupId: string;
    description: string;
    totalPaise: number;
    paidById: string;
    paidByName: string;
    mode: SplitMode;
    allocations: SplitShareAllocation[];
    categoryId?: string;
    isSettlement?: boolean;
  }
): Promise<string> {
  const docData: Record<string, unknown> = {
    groupId: payload.groupId,
    description: payload.description.trim(),
    totalPaise: payload.totalPaise,
    paidById: payload.paidById,
    paidByName: payload.paidByName,
    mode: payload.mode,
    allocations: payload.allocations,
    isSettlement: !!payload.isSettlement,
    isDeleted: false,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (payload.categoryId) {
    docData.categoryId = payload.categoryId;
  }

  const docRef = await addDoc(
    splitExpensesColRef(householdId),
    docData as unknown as SplitExpenseDocument
  );

  await updateDoc(doc(db, 'households', householdId, 'split_groups', payload.groupId), {
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function softDeleteSplitExpense(
  householdId: string,
  splitExpenseId: string
): Promise<void> {
  await updateDoc(doc(db, 'households', householdId, 'split_expenses', splitExpenseId), {
    isDeleted: true,
    updatedAt: serverTimestamp(),
  });
}
