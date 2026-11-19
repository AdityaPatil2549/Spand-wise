import { Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { AppStore } from '@/store';
import type { ExpenseDocument, BudgetDocument, AccountDocument } from '@/types/firestore';

export const GUEST_USER_ID = 'guest_demo_user';
export const GUEST_HOUSEHOLD_ID = 'guest_demo_household';

export const createGuestUser = (): User => {
  return {
    uid: GUEST_USER_ID,
    email: 'alex.campus@spendwise.demo',
    displayName: 'Alex Sharma',
    photoURL: null,
    emailVerified: true,
    isAnonymous: true,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'demo-token',
    getIdTokenResult: async () => ({
      token: 'demo-token',
      claims: {},
      authTime: '',
      issuedAtTime: '',
      expirationTime: '',
      signInProvider: null,
      signInSecondFactor: null,
    }),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    providerId: 'demo',
  } as unknown as User;
};

export const activateGuestDemo = (store: AppStore): void => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const guestUser = createGuestUser();

  const mockBudget: BudgetDocument = {
    id: currentMonth,
    budgetAmount: 8000,
    totalSpent: 3420,
    totalIncome: 10000,
    categoryBudgets: {
      'food-dining': 3500,
      'groceries': 2000,
      'transit': 1000,
      'utilities': 1500,
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const mockAccounts: AccountDocument[] = [
    {
      id: 'acc_sbi',
      name: 'SBI Student Campus Account',
      type: 'bank',
      balance: 4250,
      createdAt: Timestamp.now(),
    },
    {
      id: 'acc_upi',
      name: 'UPI Pocket (GPay)',
      type: 'bank',
      balance: 1980,
      createdAt: Timestamp.now(),
    },
    {
      id: 'acc_cash',
      name: 'Cash in Wallet',
      type: 'cash',
      balance: 350,
      createdAt: Timestamp.now(),
    },
  ];

  const mockExpenses: ExpenseDocument[] = [
    {
      id: 'demo_exp_1',
      amount: 45,
      categoryId: 'food-dining',
      note: 'Chai & bun maska at Canteen',
      date: Timestamp.fromDate(new Date(now.getTime() - 2 * 3600 * 1000)),
      month: currentMonth,
      isDeleted: false,
      type: 'expense',
      createdAt: Timestamp.now(),
      createdBy: GUEST_USER_ID,
      accountId: 'acc_upi',
    },
    {
      id: 'demo_exp_2',
      amount: 420,
      categoryId: 'groceries',
      note: 'Hostel snacks & milk via Blinkit',
      date: Timestamp.fromDate(new Date(now.getTime() - 24 * 3600 * 1000)),
      month: currentMonth,
      isDeleted: false,
      type: 'expense',
      createdAt: Timestamp.now(),
      createdBy: GUEST_USER_ID,
      accountId: 'acc_upi',
    },
    {
      id: 'demo_exp_3',
      amount: 350,
      categoryId: 'utilities',
      note: 'Flat Wi-Fi split (with Rohan & Aarav)',
      date: Timestamp.fromDate(new Date(now.getTime() - 2 * 24 * 3600 * 1000)),
      month: currentMonth,
      isDeleted: false,
      type: 'expense',
      createdAt: Timestamp.now(),
      createdBy: GUEST_USER_ID,
      accountId: 'acc_sbi',
    },
    {
      id: 'demo_exp_4',
      amount: 290,
      categoryId: 'food-dining',
      note: 'Swiggy biryani dinner with roommates',
      date: Timestamp.fromDate(new Date(now.getTime() - 3 * 24 * 3600 * 1000)),
      month: currentMonth,
      isDeleted: false,
      type: 'expense',
      createdAt: Timestamp.now(),
      createdBy: GUEST_USER_ID,
      accountId: 'acc_upi',
    },
    {
      id: 'demo_exp_5',
      amount: 200,
      categoryId: 'transit',
      note: 'Metro card top-up for college commute',
      date: Timestamp.fromDate(new Date(now.getTime() - 4 * 24 * 3600 * 1000)),
      month: currentMonth,
      isDeleted: false,
      type: 'expense',
      createdAt: Timestamp.now(),
      createdBy: GUEST_USER_ID,
      accountId: 'acc_sbi',
    },
    {
      id: 'demo_exp_6',
      amount: 140,
      categoryId: 'education',
      note: 'Lab manual printouts & practical file',
      date: Timestamp.fromDate(new Date(now.getTime() - 5 * 24 * 3600 * 1000)),
      month: currentMonth,
      isDeleted: false,
      type: 'expense',
      createdAt: Timestamp.now(),
      createdBy: GUEST_USER_ID,
      accountId: 'acc_cash',
    },
  ];

  // Set all states in the store
  store.setUser(guestUser);
  store.setHouseholdId(GUEST_HOUSEHOLD_ID);
  store.setOnboardingComplete(true);
  store.setAuthLoading(false);

  store.setBudget(mockBudget);
  store.setBudgetLoading(false);

  store.setAccounts(mockAccounts);
  
  store.setExpenses(mockExpenses);
  store.setExpensesLoading(false);
  store.setSelectedMonth(currentMonth);
};
