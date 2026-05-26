<template>
  <section
    v-if="hasRows"
    class="vbwd-payment-information"
    data-testid="payment-information-block"
  >
    <h3 class="vbwd-payment-information__heading">{{ heading }}</h3>
    <table class="vbwd-payment-information__table">
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="`${row.namespace}-${row.label}-${index}`"
          :data-testid="`payment-information-${row.namespace}-${normalize(row.label)}`"
        >
          <th
            scope="row"
            class="vbwd-payment-information__label"
          >{{ row.label }}</th>
          <td class="vbwd-payment-information__value">
            <a
              v-if="row.link"
              :href="row.link"
              target="_blank"
              rel="noopener noreferrer"
              class="vbwd-payment-information__link"
            >{{ row.value }}</a>
            <template v-else>{{ row.value }}</template>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  getPaymentInformationContributor,
  getPaymentInformationContributors,
} from '../../registries/paymentInformationContributors';
import type { PaymentInformationRow } from '../../registries/paymentInformationContributors';

interface InvoiceMetadata {
  [namespace: string]: unknown;
}

interface Props {
  /** ``vbwd_user_invoice.metadata`` JSON — namespace -> plugin payload. */
  metadata?: InvoiceMetadata | null;
  /**
   * The invoice's ``payment_method`` — enables ``matchPaymentMethod`` fallbacks
   * so a plugin's rows still render when its namespace was never written.
   */
  paymentMethod?: string | null;
  /** Block heading. Pass the i18n string from the host app. */
  heading?: string;
}

const props = withDefaults(defineProps<Props>(), {
  metadata: () => ({}),
  paymentMethod: null,
  heading: 'Payment information',
});

interface CollectedRow extends PaymentInformationRow {
  namespace: string;
  contributorOrder: number;
}

const rows = computed<CollectedRow[]>(() => {
  const metadata = props.metadata ?? {};
  const method = (props.paymentMethod || '').toLowerCase();
  const seen = new Set<string>();
  const collected: CollectedRow[] = [];

  // Metadata-driven rows.
  for (const namespaceKey of Object.keys(metadata)) {
    const payload = metadata[namespaceKey];
    if (payload === null || payload === undefined) continue;
    seen.add(namespaceKey);
    const contributor = getPaymentInformationContributor(namespaceKey);
    if (!contributor) continue;
    for (const row of contributor.rows(payload)) {
      collected.push({
        ...row,
        namespace: namespaceKey,
        contributorOrder: contributor.order ?? 100,
      });
    }
  }

  // Payment-method fallback for contributors whose namespace was absent.
  if (method) {
    for (const [namespaceKey, contributor] of Object.entries(
      getPaymentInformationContributors(),
    )) {
      if (seen.has(namespaceKey)) continue;
      const matchers = contributor.matchPaymentMethod;
      const matcherList = Array.isArray(matchers) ? matchers : matchers ? [matchers] : [];
      if (matcherList.some((candidate) => candidate.toLowerCase() === method)) {
        for (const row of contributor.rows({})) {
          collected.push({
            ...row,
            namespace: namespaceKey,
            contributorOrder: contributor.order ?? 100,
          });
        }
      }
    }
  }

  // Stable sort: contributor order, then per-row order, then insertion.
  collected.sort((left, right) => {
    const contributorDelta = left.contributorOrder - right.contributorOrder;
    if (contributorDelta !== 0) return contributorDelta;
    return (left.order ?? 100) - (right.order ?? 100);
  });
  return collected;
});

const hasRows = computed(() => rows.value.length > 0);

function normalize(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
</script>

<style scoped>
/* Matches the host "Invoice Information" section card on fe-admin: white
   surface (provided by the surrounding ``.info-section``), simple
   borderless table, label/value rhythm consistent with the rest of the
   admin invoice-detail screen. */
.vbwd-payment-information {
  background: #ffffff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.vbwd-payment-information__heading {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.vbwd-payment-information__table {
  width: 100%;
  border-collapse: collapse;
}

.vbwd-payment-information__table th,
.vbwd-payment-information__table td {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.vbwd-payment-information__table tr:last-child th,
.vbwd-payment-information__table tr:last-child td {
  border-bottom: 0;
}

.vbwd-payment-information__label {
  text-align: left;
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  width: 40%;
  white-space: nowrap;
}

.vbwd-payment-information__value {
  text-align: right;
  color: #2c3e50;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  word-break: break-word;
}

.vbwd-payment-information__link {
  color: var(--vbwd-color-primary, #2563eb);
  text-decoration: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9rem;
}

.vbwd-payment-information__link:hover {
  text-decoration: underline;
}
</style>
