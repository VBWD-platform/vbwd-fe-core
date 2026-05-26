import { describe, it, expect } from 'vitest';
import { roundToCents, formatMoney } from '@/utils/money';

describe('roundToCents', () => {
  it('rounds the third decimal half-up (user spec)', () => {
    expect(roundToCents(1.974)).toBe(1.97);
    expect(roundToCents(1.975)).toBe(1.98);
  });

  it('snaps the canonical floating-point bug case (39.989999... → 39.99)', () => {
    expect(roundToCents(29.99 + 9.99 + 0.01)).toBe(39.99);
    expect(roundToCents(39.989999999999995)).toBe(39.99);
  });

  it('passes whole numbers through unchanged at 2dp', () => {
    expect(roundToCents(0)).toBe(0);
    expect(roundToCents(10)).toBe(10);
  });

  it('handles negative values symmetrically (away-from-zero on half)', () => {
    expect(roundToCents(-1.974)).toBe(-1.97);
  });

  it('coerces null / NaN to 0 (defensive)', () => {
    expect(roundToCents(null as unknown as number)).toBe(0);
    expect(roundToCents(Number.NaN)).toBe(0);
  });
});

describe('formatMoney', () => {
  it('formats with locale-neutral $X.YY for USD', () => {
    // Use a known locale so the assertion is deterministic in CI.
    expect(formatMoney(39.989999999999995, { currency: 'USD', locale: 'en-US' })).toBe('$39.99');
    expect(formatMoney(1.974, { currency: 'USD', locale: 'en-US' })).toBe('$1.97');
    expect(formatMoney(1.975, { currency: 'USD', locale: 'en-US' })).toBe('$1.98');
  });

  it('honors a non-default currency', () => {
    expect(formatMoney(1.99, { currency: 'EUR', locale: 'en-US' })).toBe('€1.99');
  });

  it('renders 0 cleanly', () => {
    expect(formatMoney(0, { currency: 'USD', locale: 'en-US' })).toBe('$0.00');
  });

  it('returns $0.00 for null/undefined/NaN inputs', () => {
    expect(formatMoney(null, { currency: 'USD', locale: 'en-US' })).toBe('$0.00');
    expect(formatMoney(undefined, { currency: 'USD', locale: 'en-US' })).toBe('$0.00');
    expect(formatMoney(Number.NaN, { currency: 'USD', locale: 'en-US' })).toBe('$0.00');
  });
});
