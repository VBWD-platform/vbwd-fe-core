<template>
  <div class="vbwd-coupon">
    <template v-if="appliedCode">
      <div
        class="vbwd-coupon__applied"
        data-testid="coupon-applied"
      >
        <span class="vbwd-coupon__applied-label">{{ appliedLabel }} {{ appliedCode }}</span>
        <button
          type="button"
          class="vbwd-coupon__clear"
          data-testid="coupon-clear"
          :disabled="loading"
          @click="$emit('clear')"
        >
          {{ removeLabel }}
        </button>
      </div>
    </template>

    <template v-else>
      <div class="vbwd-coupon__row">
        <input
          v-model="code"
          type="text"
          class="vbwd-coupon__input"
          data-testid="coupon-input"
          :placeholder="placeholder"
          :disabled="loading"
          autocomplete="off"
          @keyup.enter="onApply"
        >
        <button
          type="button"
          class="vbwd-coupon__apply"
          data-testid="coupon-apply"
          :disabled="loading || !code.trim()"
          @click="onApply"
        >
          {{ loading ? '…' : applyLabel }}
        </button>
      </div>
    </template>

    <p
      v-if="error"
      class="vbwd-coupon__error"
      data-testid="coupon-error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// i18n-agnostic (fe-core names no host keys): English defaults, overridable
// by the consuming view via label props.
const props = withDefaults(
  defineProps<{
    appliedCode?: string | null;
    error?: string | null;
    loading?: boolean;
    placeholder?: string;
    applyLabel?: string;
    removeLabel?: string;
    appliedLabel?: string;
  }>(),
  {
    appliedCode: null,
    error: null,
    loading: false,
    placeholder: 'Coupon code',
    applyLabel: 'Apply',
    removeLabel: 'Remove',
    appliedLabel: 'Coupon applied:',
  },
);

const emit = defineEmits<{
  (event: 'apply', code: string): void;
  (event: 'clear'): void;
}>();

const code = ref('');

function onApply(): void {
  const trimmed = code.value.trim();
  if (!trimmed || props.loading) {
    return;
  }
  emit('apply', trimmed);
}
</script>

<style scoped>
.vbwd-coupon {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.vbwd-coupon__row {
  display: flex;
  gap: 0.5rem;
}

.vbwd-coupon__input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vbwd-border, #d1d5db);
  border-radius: var(--vbwd-radius, 6px);
  background: var(--vbwd-surface, #fff);
  color: var(--vbwd-text, #374151);
  font-size: 0.9rem;
}

.vbwd-coupon__input:focus {
  outline: none;
  border-color: var(--vbwd-primary, #4f46e5);
}

.vbwd-coupon__apply,
.vbwd-coupon__clear {
  padding: 0.5rem 1rem;
  border-radius: var(--vbwd-radius, 6px);
  border: 1px solid var(--vbwd-primary, #4f46e5);
  background: var(--vbwd-primary, #4f46e5);
  color: var(--vbwd-on-primary, #fff);
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.vbwd-coupon__apply:disabled,
.vbwd-coupon__clear:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.vbwd-coupon__applied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--vbwd-radius, 6px);
  background: var(--vbwd-success-soft, #ecfdf5);
  color: var(--vbwd-success, #047857);
  font-size: 0.9rem;
}

.vbwd-coupon__clear {
  background: transparent;
  border-color: transparent;
  color: var(--vbwd-success, #047857);
  text-decoration: underline;
  padding: 0.25rem 0.5rem;
}

.vbwd-coupon__error {
  margin: 0;
  font-size: 0.825rem;
  color: var(--vbwd-danger, #dc2626);
}
</style>
