import { StateCreator } from 'zustand';
import type { AppStore } from './index';
import type { AccountDocument } from '@/types/firestore';
import { getAccounts } from '@/lib/accounts';

export interface AccountsSlice {
  accounts: AccountDocument[];
  isAccountsLoading: boolean;
  
  // Actions
  loadAccounts: (householdId: string) => Promise<void>;
  setAccounts: (accounts: AccountDocument[]) => void;
  updateAccountInStore: (accountId: string, amountChange: number) => void;
}

export const createAccountsSlice: StateCreator<
  AppStore,
  [['zustand/devtools', never]],
  [],
  AccountsSlice
> = (set, get) => ({
  accounts: [],
  isAccountsLoading: false,

  loadAccounts: async (householdId: string) => {
    set({ isAccountsLoading: true });
    try {
      const accounts = await getAccounts(householdId);
      set({ accounts });
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      set({ isAccountsLoading: false });
    }
  },

  setAccounts: (accounts: AccountDocument[]) => {
    set({ accounts });
  },

  updateAccountInStore: (accountId: string, amountChange: number) => {
    set((state) => ({
      accounts: state.accounts.map(acc => 
        acc.id === accountId 
          ? { ...acc, balance: acc.balance + amountChange } 
          : acc
      )
    }));
  }
});
