import { describe, expect, it } from 'vitest';
import { formatShortDate } from '../../src/lib/format.js';

describe('formatShortDate', () => {
  it('formats ISO date values with an abbreviated Indonesian month and year', () => {
    expect(formatShortDate('2026-10-21T00:00:00.000Z')).toBe('21 Okt 2026');
    expect(formatShortDate('2026-10-21')).toBe('21 Okt 2026');
  });

  it('uses a dash for missing dates', () => {
    expect(formatShortDate(null)).toBe('-');
    expect(formatShortDate('-')).toBe('-');
  });
});
