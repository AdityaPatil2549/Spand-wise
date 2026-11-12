import type { SplitExpenseDocument, SplitGroupMember, SplitMode, SplitShareAllocation } from '@/types/firestore';

export interface SplitInputSpec {
  totalPaise: number;
  memberIds: string[];
  mode: SplitMode;
  customInputs?: Record<string, number>;
}

export interface SplitValidationResult {
  valid: boolean;
  error?: string;
  allocatedPaise: number;
}

export interface DebtTransfer {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amountPaise: number;
}

/** Convert rupees to integer paise using nearest-cent rounding. */
export function toPaise(rupees: number): number {
  if (!Number.isFinite(rupees) || rupees <= 0) return 0;
  return Math.round(rupees * 100);
}

/** Convert integer paise back to rupee float (2 decimals). */
export function fromPaise(paise: number): number {
  return Math.round(paise) / 100;
}

/** Format integer paise cleanly as INR string without trailing .00 when exact. */
export function formatPaise(paise: number, symbol = '₹'): string {
  const abs = Math.abs(Math.round(paise));
  const rupees = abs / 100;
  const isWhole = abs % 100 === 0;
  const formatted = rupees.toLocaleString('en-IN', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${paise < 0 ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Largest Remainder (Hamilton) apportionment over weighted integers.
 * Guarantees sum(allocated) === totalPaise strictly with zero rounding loss.
 */
function apportionByWeights(
  totalPaise: number,
  memberIds: string[],
  weights: number[]
): SplitShareAllocation[] {
  const sumWeights = weights.reduce((acc, w) => acc + w, 0);
  if (memberIds.length === 0 || totalPaise <= 0 || sumWeights <= 0) {
    return memberIds.map((memberId) => ({ memberId, amountPaise: 0 }));
  }

  const raw = memberIds.map((memberId, idx) => {
    const exactNumerator = totalPaise * weights[idx];
    const floored = Math.floor(exactNumerator / sumWeights);
    const remainderNumerator = exactNumerator % sumWeights;
    return {
      memberId,
      idx,
      floored,
      remainderNumerator,
      weight: weights[idx],
    };
  });

  const baseSum = raw.reduce((s, r) => s + r.floored, 0);
  const remaining = totalPaise - baseSum;

  const sortedByRemainder = [...raw].sort((a, b) => {
    if (b.remainderNumerator !== a.remainderNumerator) {
      return b.remainderNumerator - a.remainderNumerator;
    }
    return a.idx - b.idx;
  });

  const extra = new Map<string, number>();
  for (let i = 0; i < remaining; i++) {
    const target = sortedByRemainder[i % sortedByRemainder.length];
    extra.set(target.memberId, (extra.get(target.memberId) ?? 0) + 1);
  }

  return raw.map((item) => ({
    memberId: item.memberId,
    amountPaise: item.floored + (extra.get(item.memberId) ?? 0),
    inputVal: item.weight,
  }));
}

/** Validate split inputs before persisting a shared expense. */
export function validateSplitInputs(spec: SplitInputSpec): SplitValidationResult {
  const { totalPaise, memberIds, mode, customInputs = {} } = spec;

  if (!Number.isInteger(totalPaise) || totalPaise <= 0) {
    return { valid: false, error: 'Total amount must be greater than ₹0.', allocatedPaise: 0 };
  }
  if (memberIds.length === 0) {
    return { valid: false, error: 'Select at least 1 member in the split.', allocatedPaise: 0 };
  }

  if (mode === 'equal') {
    return { valid: true, allocatedPaise: totalPaise };
  }

  if (mode === 'exact') {
    let sumExact = 0;
    for (const id of memberIds) {
      const val = customInputs[id] ?? 0;
      if (!Number.isFinite(val) || val < 0) {
        return { valid: false, error: 'Exact shares cannot be negative.', allocatedPaise: 0 };
      }
      sumExact += toPaise(val);
    }
    const diff = totalPaise - sumExact;
    if (Math.abs(diff) > 0) {
      const label = diff > 0 ? `${formatPaise(diff)} remaining` : `${formatPaise(Math.abs(diff))} over total`;
      return {
        valid: false,
        error: `Exact amounts must equal ${formatPaise(totalPaise)} (${label}).`,
        allocatedPaise: sumExact,
      };
    }
    return { valid: true, allocatedPaise: sumExact };
  }

  if (mode === 'percentage') {
    let sumPct = 0;
    for (const id of memberIds) {
      const val = customInputs[id] ?? 0;
      if (!Number.isFinite(val) || val < 0) {
        return { valid: false, error: 'Percentages cannot be negative.', allocatedPaise: 0 };
      }
      sumPct += val;
    }
    if (Math.abs(sumPct - 100) > 0.05) {
      return {
        valid: false,
        error: `Percentages must sum to 100% (currently ${sumPct.toFixed(1)}%).`,
        allocatedPaise: totalPaise,
      };
    }
    return { valid: true, allocatedPaise: totalPaise };
  }

  // shares mode
  let sumShares = 0;
  for (const id of memberIds) {
    const val = customInputs[id] ?? 1;
    if (!Number.isFinite(val) || val < 0) {
      return { valid: false, error: 'Share weights cannot be negative.', allocatedPaise: 0 };
    }
    sumShares += val;
  }
  if (sumShares <= 0) {
    return { valid: false, error: 'At least one person must hold > 0 shares.', allocatedPaise: 0 };
  }
  return { valid: true, allocatedPaise: totalPaise };
}

/**
 * Compute deterministic integer-paise allocations summing identically to totalPaise.
 */
export function computeShares(spec: SplitInputSpec): SplitShareAllocation[] {
  const { totalPaise, memberIds, mode, customInputs = {} } = spec;
  if (memberIds.length === 0 || totalPaise <= 0) {
    return memberIds.map((memberId) => ({ memberId, amountPaise: 0 }));
  }

  if (mode === 'equal') {
    return apportionByWeights(
      totalPaise,
      memberIds,
      memberIds.map(() => 1)
    );
  }

  if (mode === 'exact') {
    return memberIds.map((memberId) => {
      const rupees = Math.max(0, Number(customInputs[memberId] ?? 0) || 0);
      return {
        memberId,
        amountPaise: toPaise(rupees),
        inputVal: rupees,
      };
    });
  }

  if (mode === 'percentage') {
    const weights = memberIds.map((id) => Math.max(0, Number(customInputs[id] ?? 0) || 0));
    return apportionByWeights(totalPaise, memberIds, weights);
  }

  // shares mode
  const weights = memberIds.map((id) => {
    const raw = customInputs[id];
    if (raw === undefined) return 1;
    return Math.max(0, Number(raw) || 0);
  });
  return apportionByWeights(totalPaise, memberIds, weights);
}

/**
 * Aggregate net balances in integer paise across active split expenses.
 * Positive balance = group owes member; negative = member owes group.
 * Conservation invariant: sum of all balances equals 0 (within exact allocations).
 */
export function computeNetBalances(
  members: Array<Pick<SplitGroupMember, 'id'>>,
  expenses: Array<Pick<SplitExpenseDocument, 'paidById' | 'totalPaise' | 'allocations' | 'isDeleted'>>
): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const m of members) {
    balances[m.id] = 0;
  }

  for (const exp of expenses) {
    if (exp.isDeleted || exp.totalPaise <= 0) continue;

    // Credit payer by sum of valid allocations so zero-sum invariant holds even for partial member edits
    const allocSum = exp.allocations.reduce((s, a) => s + a.amountPaise, 0);
    const credit = allocSum > 0 ? allocSum : exp.totalPaise;
    balances[exp.paidById] = (balances[exp.paidById] ?? 0) + credit;

    for (const alloc of exp.allocations) {
      balances[alloc.memberId] = (balances[alloc.memberId] ?? 0) - alloc.amountPaise;
    }
  }

  return balances;
}

/**
 * Splitwise Min-Cash-Flow debt simplifier.
 * Pairs largest creditor with largest debtor deterministically until all settle to zero.
 */
export function simplifyDebts(
  netBalances: Record<string, number>,
  memberNames: Record<string, string>
): DebtTransfer[] {
  const creditors: Array<{ id: string; amount: number }> = [];
  const debtors: Array<{ id: string; amount: number }> = [];

  for (const [id, bal] of Object.entries(netBalances)) {
    const rounded = Math.round(bal);
    if (rounded > 0) creditors.push({ id, amount: rounded });
    else if (rounded < 0) debtors.push({ id, amount: -rounded });
  }

  const byDescAmountThenId = (a: { id: string; amount: number }, b: { id: string; amount: number }) =>
    b.amount !== a.amount ? b.amount - a.amount : a.id.localeCompare(b.id);

  const transfers: DebtTransfer[] = [];

  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort(byDescAmountThenId);
    debtors.sort(byDescAmountThenId);

    const cred = creditors[0];
    const debt = debtors[0];
    const settled = Math.min(cred.amount, debt.amount);

    if (settled > 0) {
      transfers.push({
        fromId: debt.id,
        fromName: memberNames[debt.id] || debt.id,
        toId: cred.id,
        toName: memberNames[cred.id] || cred.id,
        amountPaise: settled,
      });
    }

    cred.amount -= settled;
    debt.amount -= settled;

    if (cred.amount === 0) creditors.shift();
    if (debt.amount === 0) debtors.shift();
  }

  return transfers;
}

/**
 * Pairwise (non-simplified) net obligations directly between payers and participants.
 */
export function computeRawDebts(
  expenses: Array<Pick<SplitExpenseDocument, 'paidById' | 'allocations' | 'isDeleted'>>,
  memberNames: Record<string, string>
): DebtTransfer[] {
  const pairLedger = new Map<string, number>();

  for (const exp of expenses) {
    if (exp.isDeleted) continue;
    for (const alloc of exp.allocations) {
      if (alloc.memberId === exp.paidById || alloc.amountPaise <= 0) continue;
      const forwardKey = `${alloc.memberId}::${exp.paidById}`;
      pairLedger.set(forwardKey, (pairLedger.get(forwardKey) ?? 0) + alloc.amountPaise);
    }
  }

  const seenPairs = new Set<string>();
  const transfers: DebtTransfer[] = [];

  for (const [key, val] of Array.from(pairLedger.entries())) {
    const [a, b] = key.split('::');
    const canonical = a < b ? `${a}::${b}` : `${b}::${a}`;
    if (seenPairs.has(canonical)) continue;
    seenPairs.add(canonical);

    const reverseVal = pairLedger.get(`${b}::${a}`) ?? 0;
    const net = val - reverseVal;
    if (net > 0) {
      transfers.push({
        fromId: a,
        fromName: memberNames[a] || a,
        toId: b,
        toName: memberNames[b] || b,
        amountPaise: net,
      });
    } else if (net < 0) {
      transfers.push({
        fromId: b,
        fromName: memberNames[b] || b,
        toId: a,
        toName: memberNames[a] || a,
        amountPaise: -net,
      });
    }
  }

  return transfers.sort((x, y) => y.amountPaise - x.amountPaise);
}

/**
 * Generates an RFC-compliant UPI deep link when the recipient has a valid VPA (e.g. name@okicici).
 */
export function buildUpiDeepLink(params: {
  payeeUpiId?: string;
  payeeName: string;
  amountPaise: number;
  note?: string;
}): string | null {
  const vpa = params.payeeUpiId?.trim();
  if (!vpa || !/^[\w.-]+@[\w.-]+$/.test(vpa) || params.amountPaise <= 0) {
    return null;
  }

  const amountStr = (params.amountPaise / 100).toFixed(2);
  const query = new URLSearchParams({
    pa: vpa,
    pn: params.payeeName.trim() || 'Friend',
    am: amountStr,
    cu: 'INR',
    tn: params.note?.trim() || 'SpendWise settlement',
  });

  return `upi://pay?${query.toString()}`;
}
