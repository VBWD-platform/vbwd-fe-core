/**
 * paymentDataContributors — agnostic registry consumed by ``PaymentDataBlock``.
 *
 * Payment plugins (token-payment, stripe, paypal, …) register a contributor
 * under their own ``vbwd_user_invoice.metadata`` top-level key. The block
 * iterates the invoice's metadata namespaces and asks this registry how to
 * render each one. Core has no knowledge of any provider's data shape — that
 * lives entirely in the plugin's contributor.
 *
 * A contributor can describe its rendering three ways, simplest-first:
 *   - ``label`` + ``format(data) -> string`` — one-line summary.
 *   - ``label`` + ``format`` + ``link(data) -> string | null`` — same one-line,
 *     wrapped in an external ``<a>``. Used e.g. by stripe to make the
 *     payment-intent id a clickable link to the Stripe dashboard.
 *   - ``component`` — a Vue component receiving ``{ data }`` props for
 *     richer renderings; wins over ``format``/``link`` when present.
 *
 * Order: lower ``order`` first; default 100.
 */
import type { Component } from 'vue';

export interface PaymentDataContributor {
  /** Human-readable label rendered next to the formatted value. */
  label?: string;
  /** Format the raw namespace payload into a one-line summary string. */
  format?: (data: unknown) => string;
  /**
   * If returned, wraps the formatted value in an external ``<a target="_blank">``
   * link. Return ``null`` to render the value as plain text.
   */
  link?: (data: unknown) => string | null;
  /** Richer renderer; wins over ``label``/``format``/``link`` when present. Receives ``{ data }`` props. */
  component?: Component;
  /** Display ordering (ascending). Default 100. */
  order?: number;
  /**
   * Fallback hook: when the invoice's ``payment_method`` matches one of these
   * (case-insensitive) AND this contributor's namespace key is NOT in
   * ``invoice.metadata`` (e.g. zero-price short-circuit, legacy invoices), the
   * block still renders the row with an empty payload (``{}``) so the plugin's
   * ``format()`` can output its zero/placeholder representation.
   */
  matchPaymentMethod?: string | string[];
}

const registry: Record<string, PaymentDataContributor> = {};

/**
 * Register a contributor for a metadata namespace key.
 *
 * Last-write-wins on the same key, which is the standard plugin-override
 * semantics across the project's other registries.
 */
export function registerPaymentDataContributor(
  key: string,
  contributor: PaymentDataContributor,
): void {
  registry[key] = contributor;
}

export function getPaymentDataContributor(key: string): PaymentDataContributor | undefined {
  return registry[key];
}

export function getPaymentDataContributors(): Record<string, PaymentDataContributor> {
  return { ...registry };
}

/** Test helper — wipes the registry between specs. Not for production use. */
export function _resetPaymentDataContributors(): void {
  for (const key of Object.keys(registry)) {
    delete registry[key];
  }
}
