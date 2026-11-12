import { describe, expect, it } from 'vitest';
import { getLocalDateString, getLocalMonthString } from '@/lib/date-sharding';

describe('date-sharding local helpers', () => {
  it('formats local YYYY-MM without UTC day rollback at midnight IST boundary', () => {
    const firstOfMonthMidnight = new Date(2026, 10, 1, 0, 5, 0); // Nov 1, 2026 00:05 local
    expect(getLocalMonthString(firstOfMonthMidnight)).toBe('2026-11');
    expect(getLocalDateString(firstOfMonthMidnight)).toBe('2026-11-01');
  });

  it('pads single-digit months and days deterministically', () => {
    const earlyJan = new Date(2026, 0, 7, 23, 55, 0);
    expect(getLocalMonthString(earlyJan)).toBe('2026-01');
    expect(getLocalDateString(earlyJan)).toBe('2026-01-07');
  });
});

