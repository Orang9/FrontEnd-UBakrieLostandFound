import { describe, expect, it } from 'vitest';
import { getScheduleDates } from '../../src/features/scheduling/lib/scheduleDates.js';

function datesFromJakartaNoon(value) {
  return getScheduleDates(new Date(`${value}T05:00:00.000Z`)).map(
    ({ date }) => date,
  );
}

describe('getScheduleDates', () => {
  it('shows only weekdays after tomorrow through Friday for Monday to Thursday', () => {
    expect(datesFromJakartaNoon('2026-10-26')).toEqual([
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
    ]);
    expect(datesFromJakartaNoon('2026-10-29')).toEqual(['2026-10-30']);
  });

  it('shows next week Monday to Friday when today is Friday, Saturday, or Sunday', () => {
    expect(datesFromJakartaNoon('2026-10-30')).toEqual([
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
    ]);
    expect(datesFromJakartaNoon('2026-10-24')).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
    ]);
    expect(datesFromJakartaNoon('2026-10-25')).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
    ]);
  });
});
