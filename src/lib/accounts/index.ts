import { collection, doc, getDocs, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/index';
import type { AccountDocument } from '@/types/firestore';

/**
 * Fetches all accounts for a given household.
 */
export async function getAccounts(householdId: string): Promise<AccountDocument[]> {
  try {
    const accountsRef = collection(db, 'households', householdId, 'accounts');
    const snapshot = await getDocs(accountsRef);
    
    let fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccountDocument));
    
    // Ensure default accounts exist even if some accounts are present but not the defaults
    const hasCash = fetchedAccounts.some(a => a.type === 'cash' || (typeof a.name === 'string' && a.name.toLowerCase().includes('cash')));
    const hasBank = fetchedAccounts.some(a => a.type === 'bank' || (typeof a.name === 'string' && a.name.toLowerCase().includes('bank')));

    try {
      if (!hasCash) {
        const cashAccount = await createAccount(householdId, {
          name: 'Cash',
          type: 'cash',
          balance: 0
        });
        fetchedAccounts.push(cashAccount);
      }

      if (!hasBank) {
        const bankAccount = await createAccount(householdId, {
          name: 'UPI',
          type: 'bank',
          balance: 0
        });
        fetchedAccounts.push(bankAccount);
      }
    } catch (createError) {
      console.error("Failed to create default accounts, returning existing:", createError);
      if (!hasCash) {
        fetchedAccounts.push({ id: 'fallback-cash', name: 'Cash', type: 'cash', balance: 0, createdAt: new Date() as any });
      }
      if (!hasBank) {
        fetchedAccounts.push({ id: 'fallback-bank', name: 'UPI', type: 'bank', balance: 0, createdAt: new Date() as any });
      }
    }

    return fetchedAccounts;
  } catch (error) {
    console.error("Fatal error in getAccounts:", error);
    return [
      { id: 'fallback-bank', name: 'UPI', type: 'bank', balance: 0, createdAt: new Date() as any },
      { id: 'fallback-cash', name: 'Cash', type: 'cash', balance: 0, createdAt: new Date() as any }
    ];
  }
}

/**
 * Creates a new account in Firestore.
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
    createdAt: serverTimestamp() as any
  };

  await setDoc(accountRef, newAccount);
  return newAccount;
}

/**
 * Adjusts the balance of a specific account.
 */
export async function updateAccountBalance(
  householdId: string,
  accountId: string,
  amountChange: number
): Promise<void> {
  const accountRef = doc(db, 'households', householdId, 'accounts', accountId);
  
  // Try to use setDoc with merge to avoid 'not found' errors on missing docs
  // Also recreate the basic structure just in case it's a fallback ID
  let updateData: any = { balance: increment(amountChange) };
  
  if (accountId === 'fallback-cash') {
    updateData = { ...updateData, name: 'Cash', type: 'cash', createdAt: serverTimestamp() };
  } else if (accountId === 'fallback-bank') {
    updateData = { ...updateData, name: 'UPI', type: 'bank', createdAt: serverTimestamp() };
  }

  await setDoc(accountRef, updateData, { merge: true });
}
