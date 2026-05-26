/**
 * paymentInformationContributors — multi-row registry consumed by the
 * ``PaymentInformationBlock`` (a peer of the host's "Invoice Information"
 * section, primarily used on fe-admin).
 *
 * Distinct from ``paymentDataContributors`` (single-row, in-line with
 * "Currency / Payment Method / …" inside the Invoice Information list):
 * here each plugin emits **multiple rows** for its own table block —
 * e.g. Stripe contributes Payment type / Authorised / Captured / Refunded.
 *
 * The block iterates the invoice's ``metadata`` namespaces and asks each
 * contributor for the rows it wants to render given the payload. A
 * payment-method fallback lets a contributor still emit rows when its
 * namespace was never written (zero-price / legacy invoices).
 */

export interface PaymentInformationRow {
  /** Cell shown in the left column (e.g. ``Payment type``, ``Tokens paid``). */
  label: string;
  /** Cell shown in the right column. */
  value: string;
  /** Optional dashboard link wrapped around the value (Stripe etc.). */
  link?: string | null;
  /** Display ordering within the contributor's rows (ascending). */
  order?: number;
}

export interface PaymentInformationContributor {
  /**
   * Return the rows this contributor wants to render given the namespace
   * payload (``{}`` when fired through the payment-method fallback).
   * Return ``[]`` to silently opt out.
   */
  rows: (data: unknown) => PaymentInformationRow[];
  /** Display ordering across contributors (ascending). Default 100. */
  order?: number;
  /**
   * Payment-method fallback: render this contributor even if its namespace
   * key is absent from ``invoice.metadata``, when the invoice's
   * ``payment_method`` matches one of these (case-insensitive).
   */
  matchPaymentMethod?: string | string[];
}

const registry: Record<string, PaymentInformationContributor> = {};

/** Last-write-wins on the same key — standard plugin-override semantics. */
export function registerPaymentInformationContributor(
  key: string,
  contributor: PaymentInformationContributor,
): void {
  registry[key] = contributor;
}

export function getPaymentInformationContributor(
  key: string,
): PaymentInformationContributor | undefined {
  return registry[key];
}

export function getPaymentInformationContributors(): Record<string, PaymentInformationContributor> {
  return { ...registry };
}

/** Test helper — wipes the registry between specs. Not for production use. */
export function _resetPaymentInformationContributors(): void {
  for (const key of Object.keys(registry)) {
    delete registry[key];
  }
}
