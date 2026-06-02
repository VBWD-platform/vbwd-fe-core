/**
 * Money formatting helpers.
 *
 * IEEE-754 doubles can't represent decimal currency exactly, so a literal
 * ``29.99 + 9.99 + 0.01`` may yield ``39.989999999999995``. Renderers MUST
 * round to cents before displaying — otherwise users see noise like
 * ``Pay $39.989999999999995`` on the checkout button.
 *
 * ``roundToCents`` rounds **half-up** at the third decimal place, matching
 * the user-facing rule:
 *   - ``1.974`` → ``1.97`` (third digit 4 → down)
 *   - ``1.975`` → ``1.98`` (third digit 5 → up)
 *
 * A small positive epsilon (``1e-9``) lifts values that landed just below the
 * boundary due to binary representation (e.g. ``1.975`` is stored as
 * ``1.9749999999999999556``) over the rounding threshold so they round up as
 * the user expects.
 */
export declare function roundToCents(value: number): number;
/**
 * Whether a checkout total represents "nothing to pay" — the **Pay Zero** case.
 *
 * The value is rounded to cents first, so both binary-fraction noise
 * (``0.000000001``) and a discount that lands a hair below zero are treated as
 * zero. A negative total (over-discounted) is also "nothing to pay". This is
 * the single source of truth shared by every checkout flow when deciding
 * whether to skip payment-method selection — mirrors the iOS
 * ``CheckoutViewModel.isZeroTotal``.
 *
 * Pass the **net** total (what the user actually pays, after discounts), not
 * the gross — a plan discounted to zero by a 100% coupon is still Pay Zero.
 */
export declare function isZeroTotal(value: number | null | undefined): boolean;
export interface FormatMoneyOptions {
    /** ISO-4217 currency code. Defaults to ``USD``. */
    currency?: string;
    /** Locale override; defaults to the user agent's locale via ``undefined``. */
    locale?: string;
}
/**
 * Format ``value`` as a currency string with cents rounded half-up.
 * Falls back to ``"$X.YY"`` if Intl currency formatting throws (very old
 * runtimes / unknown currency code).
 */
export declare function formatMoney(value: number | null | undefined, options?: FormatMoneyOptions): string;
//# sourceMappingURL=money.d.ts.map