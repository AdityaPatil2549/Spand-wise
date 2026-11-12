import { collection, doc, getDocs, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/index';
import { normalizeAccounts } from './normalize';
import type { AccountDocument } from '@/types/firestore';

export { normalizeAccounts };
export const DEFAULT_CASH_ACCOUNT_ID = 'cash';
export const DEFAULT_BANK_ACCOUNT_ID = 'bank';

/**
 * Fetches all accounts for a given household and ensures deterministic default
 * 'cash' and 'bank' documents exist so ledger debits/credits target the same docs.
 */
export async function getAccounts(householdId: string): Promise<AccountDocument[]> {
  try {
    const accountsRef = collection(db, 'households', householdId, 'accounts');
    const snapshot = await getDocs(accountsRef);

    const fetchedAccounts = snapshot.docs.map(
      (d) => ({ ...d.data(), id: d.id } as AccountDocument)
    );

    const hasCash = fetchedAccounts.some(
      (a) =>
        a.id === DEFAULT_CASH_ACCOUNT_ID ||
        a.type === 'cash' ||
        (typeof a.name === 'string' && a.name.toLowerCase().includes('cash'))
    );
    const hasBank = fetchedAccounts.some(
      (a) =>
        a.id === DEFAULT_BANK_ACCOUNT_ID ||
        a.type === 'bank' ||
        (typeof a.name === 'string' &&
          (a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('upi')))
    );

    try {
      if (!hasCash) {
        const cashAccount = await createAccountWithId(householdId, DEFAULT_CASH_ACCOUNT_ID, {
          name: 'Cash',
          type: 'cash',
          balance: 0,
        });
        fetchedAccounts.push(cashAccount);
      }

      if (!hasBank) {
        const bankAccount = await createAccountWithId(householdId, DEFAULT_BANK_ACCOUNT_ID, {
          name: 'UPI',
          type: 'bank',
          balance: 0,
        });
        fetchedAccounts.push(bankAccount);
      }
    } catch (createError) {
      console.error('Failed to ensure default accounts, returning existing:', createError);
      if (!hasCash) {
        fetchedAccounts.push({
          id: DEFAULT_CASH_ACCOUNT_ID,
          name: 'Cash',
          type: 'cash',
          balance: 0,
          createdAt: new Date() as unknown as AccountDocument['createdAt'],
        });
      }
      if (!hasBank) {
        fetchedAccounts.push({
          id: DEFAULT_BANK_ACCOUNT_ID,
          name: 'UPI',
          type: 'bank',
          balance: 0,
          createdAt: new Date() as unknown as AccountDocument['createdAt'],
        });
      }
    }

    return normalizeAccounts(fetchedAccounts);
  } catch (error) {
    console.error('Fatal error in getAccounts:', error);
    return [
      {
        id: DEFAULT_BANK_ACCOUNT_ID,
        name: 'UPI',
        type: 'bank',
        balance: 0,
        createdAt: new Date() as unknown as AccountDocument['createdAt'],
      },
      {
        id: DEFAULT_CASH_ACCOUNT_ID,
        name: 'Cash',
        type: 'cash',
        balance: 0,
        createdAt: new Date() as unknown as AccountDocument['createdAt'],
      },
    ];
  }
}

async function createAccountWithId(
  householdId: string,
  accountId: string,
  data: Omit<AccountDocument, 'id' | 'createdAt'>
): Promise<AccountDocument> {
  const accountRef = doc(db, 'households', householdId, 'accounts', accountId);
  const newAccount: AccountDocument = {
    ...data,
    id: accountId,
    createdAt: serverTimestamp() as unknown as AccountDocument['createdAt'],
  };

  await setDoc(accountRef, newAccount, { merge: true });
  return newAccount;
}

/**
 * Creates a custom account in Firestore.
 */
export async function createAccount(
  householdId: string,
  data: Omit<AccountDocument, 'id' | 'createdAt'>
): Promise<AccountDocument> {
  const accountsRef = collection(db, 'households', householdId, 'accounts');
  const accountRef = doc(accountsRef);
  const accountId = accountRef.id;

  const newAccount: AccountDocument = {
    ...data,
    id: accountId,
    createdAt: serverTimestamp() as unknown as AccountDocument['createdAt'],
  };

  await setDoc(accountRef, newAccount);
  return newAccount;
}

/**
 * Adjusts the balance of a specific account using deterministic default metadata if creating on the fly.
 */
export async function updateAccountBalance(
  householdId: string,
  accountId: string,
  amountChange: number
): Promise<void> {
  const normalizedId =
    accountId === 'fallback-cash'
      ? DEFAULT_CASH_ACCOUNT_ID
      : accountId === 'fallback-bank'
      ? DEFAULT_BANK_ACCOUNT_ID
      : accountId;

  const accountRef = doc(db, 'households', householdId, 'accounts', normalizedId);

  const updateData: Record<string, unknown> = {
    balance: increment(amountChange),
  };

  if (normalizedId === DEFAULT_CASH_ACCOUNT_ID) {
    updateData.id = DEFAULT_CASH_ACCOUNT_ID;
    updateData.name = 'Cash';
    updateData.type = 'cash';
  } else if (normalizedId === DEFAULT_BANK_ACCOUNT_ID) {
    updateData.id = DEFAULT_BANK_ACCOUNT_ID;
    updateData.name = 'UPI';
    updateData.type = 'bank';
  }

  await setDoc(accountRef, updateData, { merge: true });
}
