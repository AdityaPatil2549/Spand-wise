import { describe, it, expect } from 'vitest';
import { normalizeAccounts } from '@/lib/accounts/normalize';
import type { AccountDocument } from '@/types/firestore';

function makeAccount(
  id: string,
  name: string,
  type: 'cash' | 'bank',
  balance = 0
): AccountDocument {
  return {
    id,
    name,
    type,
    balance,
    createdAt: new Date() as unknown as AccountDocument['createdAt'],
  };
}

describe('normalizeAccounts', () => {
  it('collapses duplicate zero-balance legacy Cash accounts into a single Cash entry', () => {
    const raw: AccountDocument[] = [
      makeAccount('legacy-cash-1', 'Cash', 'cash', 0),
      makeAccount('bank', 'Bank Account', 'bank', 4200),
      makeAccount('cash', 'Cash', 'cash', 0),
      makeAccount('legacy-cash-2', 'Cash', 'cash', 0),
    ];

    const normalized = normalizeAccounts(raw);
    expect(normalized.map((a) => [a.id, a.name, a.balance])).toEqual([
      ['bank', 'Bank Account', 4200],
      ['cash', 'Cash', 0],
    ]);
  });

  it('preserves non-zero balances when a legacy cash account holds real money', () => {
    const raw: AccountDocument[] = [
      makeAccount('legacy-cash-1', 'Cash', 'cash', 750),
      makeAccount('cash', 'Cash', 'cash', 0),
      makeAccount('bank', 'UPI', 'bank', 1200),
    ];

    const normalized = normalizeAccounts(raw);
    expect(normalized.map((a) => [a.id, a.balance])).toEqual([
      ['bank', 1200],
      ['legacy-cash-1', 750],
    ]);
  });

  it('keeps distinct custom wallets alongside canonical Bank and Cash accounts', () => {
    const raw: AccountDocument[] = [
      makeAccount('cash', 'Cash', 'cash', 200),
      makeAccount('bank', 'UPI', 'bank', 1500),
      makeAccount('savings-hdfc', 'HDFC Savings', 'bank', 9000),
    ];

    const normalized = normalizeAccounts(raw);
    // HDFC Savings has type 'bank' with non-canonical custom name — normalizeAccounts should keep it distinct!
    expect(normalized.length).toBe(3);
  });
});

