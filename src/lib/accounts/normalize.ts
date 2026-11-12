import type { AccountDocument } from '@/types/firestore';

const BANK_SLOT_NAMES = new Set(['bank', 'bank account', 'upi', 'upi / bank', 'upi account']);
const CASH_SLOT_NAMES = new Set(['cash', 'cash wallet']);

function normalizeLabel(name: unknown): string {
  return typeof name === 'string' ? name.trim().toLowerCase() : '';
}

function resolveAccountSlot(account: AccountDocument): 'bank' | 'cash' | `custom:${string}` {
  const label = normalizeLabel(account.name);
  if (account.id === 'bank' || BANK_SLOT_NAMES.has(label)) {
    return 'bank';
  }
  if (account.id === 'cash' || CASH_SLOT_NAMES.has(label)) {
    return 'cash';
  }
  return `custom:${account.type || 'other'}:${label || account.id}`;
}

/**
 * Deduplicates legacy auto-ID Cash/Bank wallet documents while preserving every
 * non-zero balance, and orders default accounts consistently (`bank`, `cash`, then custom).
 */
export function normalizeAccounts(rawAccounts: AccountDocument[]): AccountDocument[] {
  const seenIds = new Set<string>();
  const uniqueById: AccountDocument[] = [];

  for (const acc of rawAccounts) {
    if (!acc || !acc.id || seenIds.has(acc.id)) continue;
    seenIds.add(acc.id);
    uniqueById.push(acc);
  }

  const bySlot = new Map<string, AccountDocument[]>();
  for (const acc of uniqueById) {
    const slot = resolveAccountSlot(acc);
    const list = bySlot.get(slot) ?? [];
    list.push(acc);
    bySlot.set(slot, list);
  }

  const result: AccountDocument[] = [];
  for (const [slot, group] of Array.from(bySlot.entries())) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }

    const canonicalId = slot === 'bank' ? 'bank' : slot === 'cash' ? 'cash' : null;
    const nonZero = group.filter((a) => (Number(a.balance) || 0) !== 0);

    if (nonZero.length > 0) {
      // Keep every distinct non-zero wallet so real funds are never hidden, preferring canonical ID first
      nonZero.sort((a, b) => {
        if (canonicalId) {
          if (a.id === canonicalId) return -1;
          if (b.id === canonicalId) return 1;
        }
        return a.id.localeCompare(b.id);
      });
      result.push(...nonZero);
    } else {
      // All duplicates have zero balance — keep a single representative (prefer canonical 'bank'/'cash')
      const canonical = (canonicalId && group.find((a) => a.id === canonicalId)) || group[0];
      result.push(canonical);
    }
  }

  return result.sort((a, b) => {
    const rank = (acc: AccountDocument) => {
      const slot = resolveAccountSlot(acc);
      if (slot === 'bank') return 0;
      if (slot === 'cash') return 1;
      return 2;
    };
    const rDiff = rank(a) - rank(b);
    if (rDiff !== 0) return rDiff;
    return (a.name || '').localeCompare(b.name || '');
  });
}
