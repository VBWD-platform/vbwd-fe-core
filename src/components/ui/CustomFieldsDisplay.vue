<template>
  <dl
    v-if="rows.length"
    class="vbwd-custom-fields-display"
    data-testid="custom-fields-display"
  >
    <div
      v-for="row in rows"
      :key="row.key"
      class="vbwd-custom-field-row"
      data-testid="custom-field-row"
    >
      <dt class="vbwd-custom-field-label">{{ row.label }}</dt>
      <dd class="vbwd-custom-field-value">{{ row.display }}</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CustomFieldDef } from './types';

const props = withDefaults(defineProps<{
  customFields?: Record<string, unknown> | null;
  fieldDefs?: CustomFieldDef[] | null;
}>(), {
  customFields: () => ({}),
  fieldDefs: () => [],
});

const BOOLEAN_YES = 'Yes';
const BOOLEAN_NO = 'No';
const EMPTY_PLACEHOLDER = '-';

function formatValue(type: string, value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return EMPTY_PLACEHOLDER;
  }
  switch (type) {
    case 'bool':
      return value ? BOOLEAN_YES : BOOLEAN_NO;
    case 'date':
      return formatDate(value);
    case 'multiselect':
      return Array.isArray(value) ? value.join(', ') : String(value);
    default:
      return String(value);
  }
}

function formatDate(value: unknown): string {
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleDateString();
}

const rows = computed(() => {
  const values = props.customFields ?? {};
  const defs = props.fieldDefs ?? [];
  if (defs.length) {
    // Driven by the schema: ordered, labelled, type-formatted.
    return [...defs]
      .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
      .filter((def) => def.key in values)
      .map((def) => ({
        key: def.key,
        label: def.label,
        display: formatValue(def.type, values[def.key]),
      }));
  }
  // No defs supplied: fall back to raw key/value pairs (best-effort).
  return Object.entries(values).map(([key, value]) => ({
    key,
    label: key,
    display: formatValue('text', value),
  }));
});
</script>

<style scoped>
.vbwd-custom-fields-display {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
  margin: 0;
}

.vbwd-custom-field-row {
  display: contents;
}

.vbwd-custom-field-label {
  font-size: 0.85rem;
  color: var(--vbwd-color-text-secondary, #666);
}

.vbwd-custom-field-value {
  margin: 0;
  font-weight: 500;
  color: var(--vbwd-color-text-primary, #2c3e50);
}
</style>
