import { describe, it, expect, afterEach } from 'vitest';
import {
  roundToCents,
  formatMoney,
  isZeroTotal,
  getOperatingCurrency,
  setOperatingCurrency,
  convertForDisplay,
} from '@/utils/money';

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

describe('isZeroTotal', () => {
  it('is true when there is nothing to pay (zero)', () => {
    expect(isZeroTotal(0)).toBe(true);
  });

  it('is false for any positive cents amount', () => {
    expect(isZeroTotal(10)).toBe(false);
    expect(isZeroTotal(0.01)).toBe(false);
  });

  it('treats sub-cent / floating-point noise as zero (rounds to cents first)', () => {
    // A discount that lands a hair below zero, or binary-fraction noise.
    expect(isZeroTotal(0.004)).toBe(true);
    expect(isZeroTotal(0.000000001)).toBe(true);
    expect(isZeroTotal(29.99 - 29.99)).toBe(true);
  });

  it('is true for negative totals (still nothing to pay)', () => {
    expect(isZeroTotal(-5)).toBe(true);
  });

  it('a half-cent rounds up and is therefore payable', () => {
    expect(isZeroTotal(0.005)).toBe(false);
  });

  it('coerces null / undefined / NaN to zero (defensive)', () => {
    expect(isZeroTotal(null)).toBe(true);
    expect(isZeroTotal(undefined)).toBe(true);
    expect(isZeroTotal(Number.NaN)).toBe(true);
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

describe('operating currency (S99 — the single billing-currency accessor)', () => {
  afterEach(() => {
    // Module-level state — reset to the default so tests don't leak into each other.
    setOperatingCurrency('EUR');
  });

  it('defaults to EUR (matches the backend default_currency)', () => {
    expect(getOperatingCurrency()).toBe('EUR');
  });

  it('is settable (fed once at app boot from /config) and normalises to upper-case', () => {
    setOperatingCurrency('usd');
    expect(getOperatingCurrency()).toBe('USD');
  });

  it('ignores an empty/blank code (keeps the last good value)', () => {
    setOperatingCurrency('USD');
    setOperatingCurrency('');
    expect(getOperatingCurrency()).toBe('USD');
  });

  it('formatMoney with no explicit currency uses the operating currency', () => {
    setOperatingCurrency('EUR');
    expect(formatMoney(1.99, { locale: 'en-US' })).toBe('€1.99');
    setOperatingCurrency('USD');
    expect(formatMoney(1.99, { locale: 'en-US' })).toBe('$1.99');
  });
});

describe('formatMoney (S99 — symbol-correct for every currency, no USD special-case)', () => {
  it('carries the currency code + amount for a non-symbol currency (never a bare $ number)', () => {
    // Whether modern Intl prefixes the code ("XXZ 12.50") or the old-runtime
    // fallback path runs ("12.50 XXZ"), the output must carry the code + amount
    // and must NOT special-case a "$" (the pre-S99 fallback only symbolised USD).
    const out = formatMoney(12.5, { currency: 'XXZ', locale: 'en-US' });
    expect(out).toContain('XXZ');
    expect(out).toContain('12.50');
    expect(out).not.toContain('$');
  });
});

describe('convertForDisplay (S99 — view-only FX scaling, never persisted)', () => {
  it('scales an amount by a cross-rate (rounding happens later, at formatMoney)', () => {
    expect(convertForDisplay(10, 1.1)).toBe(11);
    // No premature rounding — the raw scaled value is returned.
    expect(convertForDisplay(9.99, 1.1)).toBeCloseTo(10.989, 6);
  });

  it('a rate of 1 is identity', () => {
    expect(convertForDisplay(42.42, 1)).toBe(42.42);
  });

  it('coerces null / NaN amount to 0 (defensive)', () => {
    expect(convertForDisplay(null as unknown as number, 1.2)).toBe(0);
    expect(convertForDisplay(Number.NaN, 1.2)).toBe(0);
  });
});
