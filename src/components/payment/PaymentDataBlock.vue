<template>
  <div
    v-if="hasRenderableEntries"
    class="vbwd-payment-data"
    data-testid="payment-data-block"
  >
    <div
      v-for="entry in renderableEntries"
      :key="entry.key"
      class="vbwd-payment-data__row"
      :class="{ 'vbwd-payment-data__row--fallback': entry.fromPaymentMethodFallback }"
      :data-testid="`payment-data-${entry.key}`"
    >
      <span class="vbwd-payment-data__label">{{ entry.label }}</span>
      <span class="vbwd-payment-data__value">
        <component
          :is="entry.component"
          v-if="entry.component"
          :data="entry.data"
        />
        <a
          v-else-if="entry.link"
          :href="entry.link"
          target="_blank"
          rel="noopener noreferrer"
          class="vbwd-payment-data__link"
        >
          {{ entry.text }}
          <svg
            class="vbwd-payment-data__link-icon"
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M14 4h6v6" />
            <path d="M10 14L20 4" />
            <path d="M19 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h6" />
          </svg>
        </a>
        <template v-else>{{ entry.text }}</template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import {
  getPaymentDataContributor,
  getPaymentDataContributors,
  type PaymentDataContributor,
} from '../../registries/paymentDataContributors';

interface InvoiceMetadata {
  [namespace: string]: unknown;
}

interface Props {
  /** ``vbwd_user_invoice.metadata`` JSON — namespace -> plugin payload. */
  metadata?: InvoiceMetadata | null;
  /**
   * The invoice's ``payment_method`` — enables ``matchPaymentMethod`` fallbacks
   * so a plugin's row still renders for legacy/zero-price flows that never
   * wrote into ``invoice.metadata``.
   */
  paymentMethod?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  metadata: () => ({}),
  paymentMethod: null,
});

interface RenderableEntry {
  key: string;
  component?: Component;
  label: string;
  text: string;
  link: string | null;
  data: unknown;
  order: number;
  fromPaymentMethodFallback: boolean;
}

function buildEntry(
  namespaceKey: string,
  payload: unknown,
  contributor: PaymentDataContributor | undefined,
  fromFallback: boolean,
): RenderableEntry {
  const label = contributor?.label ?? namespaceKey;
  const text = contributor?.component
    ? ''
    : contributor?.format
      ? contributor.format(payload)
      : JSON.stringify(payload);
  const link = contributor?.component
    ? null
    : contributor?.link
      ? contributor.link(payload)
      : null;
  return {
    key: namespaceKey,
    component: contributor?.component,
    label,
    text,
    link,
    data: payload,
    order: contributor?.order ?? 100,
    fromPaymentMethodFallback: fromFallback,
  };
}

const renderableEntries = computed<RenderableEntry[]>(() => {
  const metadata = props.metadata ?? {};
  const method = (props.paymentMethod || '').toLowerCase();
  const seen = new Set<string>();
  const entries: RenderableEntry[] = [];

  // Pass 1: every metadata namespace gets its row (the canonical path).
  for (const namespaceKey of Object.keys(metadata)) {
    const payload = metadata[namespaceKey];
    if (payload === null || payload === undefined) continue;
    seen.add(namespaceKey);
    entries.push(buildEntry(namespaceKey, payload, getPaymentDataContributor(namespaceKey), false));
  }

  // Pass 2: payment-method-matched fallbacks for contributors whose namespace
  // was absent from metadata (zero-price short-circuit, legacy invoices).
  if (method) {
    for (const [namespaceKey, contributor] of Object.entries(getPaymentDataContributors())) {
      if (seen.has(namespaceKey)) continue;
      const matchers = contributor.matchPaymentMethod;
      const matcherList = Array.isArray(matchers) ? matchers : matchers ? [matchers] : [];
      if (matcherList.some((candidate) => candidate.toLowerCase() === method)) {
        entries.push(buildEntry(namespaceKey, {}, contributor, true));
      }
    }
  }

  entries.sort((left, right) => left.order - right.order || left.key.localeCompare(right.key));
  return entries;
});

const hasRenderableEntries = computed(() => renderableEntries.value.length > 0);
</script>

<style scoped>
/* The wrapper renders transparently so its children inherit the host's
   block-level rhythm (the parent ``.invoice-info``/``.info-grid``).
   ``display: contents`` keeps the host's layout untouched while still
   anchoring the scoped CSS data-v attribute on the children. */
.vbwd-payment-data {
  display: contents;
}

/* 1-for-1 copy of the host's ``.detail-row`` layout so plugin-contributed
   rows are visually indistinguishable from "Currency / Payment Method / …"
   above. Same colour palette, no extra padding, value pushed right by
   ``justify-content: space-between``. */
.vbwd-payment-data__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vbwd-payment-data__label {
  color: #666;
}

.vbwd-payment-data__value {
  color: #2c3e50;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  word-break: break-word;
}

.vbwd-payment-data__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--vbwd-color-primary, #2563eb);
  text-decoration: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.vbwd-payment-data__link:hover {
  text-decoration: underline;
}

.vbwd-payment-data__link-icon {
  opacity: 0.65;
}
</style>
