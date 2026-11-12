import { describe, expect, it } from 'vitest';
import {
  buildUpiDeepLink,
  computeNetBalances,
  computeRawDebts,
  computeShares,
  simplifyDebts,
  toPaise,
  validateSplitInputs,
} from '@/lib/splits/engine';

describe('splits engine integer-paise apportionment', () => {
  it('distributes odd-paise totals identically with Largest Remainder (zero dropped paise)', () => {
    const totalPaise = toPaise(100); // 10000 paise / 3 = 3334 + 3333 + 3333
    const shares = computeShares({
      totalPaise,
      memberIds: ['a', 'b', 'c'],
      mode: 'equal',
    });

    const sum = shares.reduce((s, item) => s + item.amountPaise, 0);
    expect(sum).toBe(10000);
    expect(shares.map((s) => s.amountPaise)).toEqual([3334, 3333, 3333]);
  });

  it('supports percentage and weighted shares modes while conserving totalPaise', () => {
    const pctShares = computeShares({
      totalPaise: 1001, // ₹10.01
      memberIds: ['u1', 'u2', 'u3'],
      mode: 'percentage',
      customInputs: { u1: 50, u2: 33.3, u3: 16.7 },
    });
    expect(pctShares.reduce((s, a) => s + a.amountPaise, 0)).toBe(1001);

    const weighted = computeShares({
      totalPaise: 10000,
      memberIds: ['u1', 'u2'],
      mode: 'shares',
      customInputs: { u1: 2, u2: 1 },
    });
    expect(weighted.reduce((s, a) => s + a.amountPaise, 0)).toBe(10000);
    expect(weighted[0].amountPaise).toBe(6667);
    expect(weighted[1].amountPaise).toBe(3333);
  });

  it('validates exact sum mismatch and invalid percentage totals', () => {
    const badExact = validateSplitInputs({
      totalPaise: toPaise(500),
      memberIds: ['a', 'b'],
      mode: 'exact',
      customInputs: { a: 200, b: 250 },
    });
    expect(badExact.valid).toBe(false);
    expect(badExact.error).toContain('remaining');

    const badPct = validateSplitInputs({
      totalPaise: toPaise(500),
      memberIds: ['a', 'b'],
      mode: 'percentage',
      customInputs: { a: 40, b: 40 },
    });
    expect(badPct.valid).toBe(false);
  });
});

describe('splits engine net balances & Min-Cash-Flow simplification', () => {
  const members = [
    { id: 'alice', name: 'Alice' },
    { id: 'bob', name: 'Bob' },
    { id: 'carol', name: 'Carol' },
  ];
  const names = { alice: 'Alice', bob: 'Bob', carol: 'Carol' };

  it('maintains zero-sum conservation and simplifies 3-way circular debts', () => {
    const expenses = [
      // Alice pays ₹900 split equally -> Alice +600, Bob -300, Carol -300
      {
        paidById: 'alice',
        totalPaise: 90000,
        isDeleted: false,
        allocations: [
          { memberId: 'alice', amountPaise: 30000 },
          { memberId: 'bob', amountPaise: 30000 },
          { memberId: 'carol', amountPaise: 30000 },
        ],
      },
      // Bob pays ₹300 for Carol -> Bob +300, Carol -300
      // Net balances: Alice +600, Bob 0, Carol -600!
      {
        paidById: 'bob',
        totalPaise: 30000,
        isDeleted: false,
        allocations: [{ memberId: 'carol', amountPaise: 30000 }],
      },
    ];

    const balances = computeNetBalances(members, expenses);
    const totalSum = Object.values(balances).reduce((a, b) => a + b, 0);
    expect(totalSum).toBe(0);
    expect(balances).toEqual({ alice: 60000, bob: 0, carol: -60000 });

    const simplified = simplifyDebts(balances, names);
    expect(simplified).toEqual([
      {
        fromId: 'carol',
        fromName: 'Carol',
        toId: 'alice',
        toName: 'Alice',
        amountPaise: 60000,
      },
    ]);

    const raw = computeRawDebts(expenses, names);
    expect(raw.length).toBe(3); // Alice<-Bob, Alice<-Carol, Bob<-Carol vs Simplified: 1 transfer!
  });

  it('ignores soft-deleted split expenses cleanly', () => {
    const balances = computeNetBalances(members, [
      {
        paidById: 'alice',
        totalPaise: 50000,
        isDeleted: true,
        allocations: [{ memberId: 'bob', amountPaise: 50000 }],
      },
    ]);
    expect(balances).toEqual({ alice: 0, bob: 0, carol: 0 });
  });
});

describe('buildUpiDeepLink', () => {
  it('builds a valid upi://pay link for verified VPA and rejects missing VPAs', () => {
    const uri = buildUpiDeepLink({
      payeeUpiId: 'rahul@okicici',
      payeeName: 'Rahul',
      amountPaise: 42550,
      note: 'Hostel mess',
    });
    expect(uri).toContain('upi://pay?');
    expect(uri).toContain('pa=rahul%40okicici');
    expect(uri).toContain('am=425.50');
    expect(uri).toContain('cu=INR');

    expect(
      buildUpiDeepLink({ payeeUpiId: 'not-a-vpa', payeeName: 'Test', amountPaise: 1000 })
    ).toBeNull();
  });
});

