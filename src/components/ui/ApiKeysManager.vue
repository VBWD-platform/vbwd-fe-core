<template>
  <div class="vbwd-api-keys">
    <!-- One-time plaintext reveal (shown right after a successful create). -->
    <div
      v-if="createdPlaintext"
      class="vbwd-api-keys__plaintext"
      data-testid="api-key-plaintext"
    >
      <p class="vbwd-api-keys__plaintext-note">{{ plaintextNote }}</p>
      <div class="vbwd-api-keys__plaintext-row">
        <code class="vbwd-api-keys__plaintext-value">{{ createdPlaintext }}</code>
        <button
          type="button"
          class="vbwd-api-keys__btn"
          data-testid="api-key-plaintext-copy"
          @click="copyPlaintext"
        >
          {{ copyLabel }}
        </button>
        <button
          type="button"
          class="vbwd-api-keys__btn vbwd-api-keys__btn--ghost"
          data-testid="api-key-plaintext-dismiss"
          @click="$emit('dismiss-plaintext')"
        >
          {{ dismissLabel }}
        </button>
      </div>
    </div>

    <p
      v-if="error"
      class="vbwd-api-keys__error"
      data-testid="api-key-error"
    >
      {{ error }}
    </p>

    <!-- Existing keys -->
    <table class="vbwd-api-keys__table">
      <thead>
        <tr>
          <th>{{ prefixHeader }}</th>
          <th>{{ labelHeader }}</th>
          <th>{{ scopesHeader }}</th>
          <th>{{ ipHeader }}</th>
          <th>{{ activeHeader }}</th>
          <th>{{ lastUsedHeader }}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="apiKey in keys"
          :key="apiKey.id"
          data-testid="api-key-row"
        >
          <td><code>{{ apiKey.key_prefix }}</code></td>
          <td>{{ apiKey.label }}</td>
          <td>{{ (apiKey.scopes || []).join(', ') || '—' }}</td>
          <td>{{ (apiKey.ip_whitelist || []).join(', ') || anyIpLabel }}</td>
          <td>{{ apiKey.is_active ? activeYes : activeNo }}</td>
          <td>{{ apiKey.last_used_at || neverLabel }}</td>
          <td class="vbwd-api-keys__actions">
            <button
              v-if="apiKey.is_active"
              type="button"
              class="vbwd-api-keys__btn vbwd-api-keys__btn--ghost"
              data-testid="api-key-revoke-btn"
              :disabled="loading"
              @click="$emit('revoke', apiKey.id)"
            >
              {{ revokeLabel }}
            </button>
            <button
              v-if="canDelete"
              type="button"
              class="vbwd-api-keys__btn vbwd-api-keys__btn--danger"
              data-testid="api-key-delete-btn"
              :disabled="loading"
              @click="$emit('delete', apiKey.id)"
            >
              {{ deleteLabel }}
            </button>
          </td>
        </tr>
        <tr v-if="keys.length === 0">
          <td
            colspan="7"
            class="vbwd-api-keys__empty"
          >
            {{ emptyLabel }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Create form -->
    <form
      class="vbwd-api-keys__form"
      @submit.prevent="onCreate"
    >
      <h4 class="vbwd-api-keys__form-title">{{ createTitle }}</h4>
      <label class="vbwd-api-keys__field">
        <span>{{ labelHeader }}</span>
        <input
          v-model="newLabel"
          type="text"
          class="vbwd-api-keys__input"
          data-testid="api-key-label-input"
          :placeholder="labelPlaceholder"
        >
      </label>

      <fieldset class="vbwd-api-keys__scopes">
        <legend>{{ scopesHeader }}</legend>
        <label
          v-for="scope in availableScopes"
          :key="scope.key"
          class="vbwd-api-keys__scope"
          data-testid="api-key-scope-option"
        >
          <input
            type="checkbox"
            :value="scope.key"
            :checked="selectedScopes.includes(scope.key)"
            @change="toggleScope(scope.key)"
          >
          <span>{{ scope.label }} <code>{{ scope.key }}</code></span>
        </label>
        <p
          v-if="availableScopes.length === 0"
          class="vbwd-api-keys__empty"
        >
          {{ noScopesLabel }}
        </p>
      </fieldset>

      <label class="vbwd-api-keys__field">
        <span>{{ ipHeader }}</span>
        <textarea
          v-model="ipWhitelistText"
          class="vbwd-api-keys__input"
          data-testid="api-key-ip-input"
          rows="3"
          :placeholder="ipPlaceholder"
        />
      </label>

      <button
        type="submit"
        class="vbwd-api-keys__btn"
        data-testid="api-key-create-btn"
        :disabled="loading"
        @click.prevent="onCreate"
      >
        {{ createLabel }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ApiKey, ApiScope } from './types';

const props = withDefaults(
  defineProps<{
    keys: ApiKey[];
    availableScopes: ApiScope[];
    canDelete?: boolean;
    loading?: boolean;
    error?: string | null;
    createdPlaintext?: string | null;
    // English defaults; the consuming view may translate via these props.
    prefixHeader?: string;
    labelHeader?: string;
    scopesHeader?: string;
    ipHeader?: string;
    activeHeader?: string;
    lastUsedHeader?: string;
    activeYes?: string;
    activeNo?: string;
    anyIpLabel?: string;
    neverLabel?: string;
    emptyLabel?: string;
    createTitle?: string;
    createLabel?: string;
    revokeLabel?: string;
    deleteLabel?: string;
    copyLabel?: string;
    dismissLabel?: string;
    plaintextNote?: string;
    labelPlaceholder?: string;
    ipPlaceholder?: string;
    noScopesLabel?: string;
  }>(),
  {
    canDelete: false,
    loading: false,
    error: null,
    createdPlaintext: null,
    prefixHeader: 'Prefix',
    labelHeader: 'Label',
    scopesHeader: 'Scopes',
    ipHeader: 'IP whitelist',
    activeHeader: 'Active',
    lastUsedHeader: 'Last used',
    activeYes: 'Yes',
    activeNo: 'No',
    anyIpLabel: 'Any',
    neverLabel: 'Never',
    emptyLabel: 'No API keys yet.',
    createTitle: 'Create API key',
    createLabel: 'Create key',
    revokeLabel: 'Revoke',
    deleteLabel: 'Delete',
    copyLabel: 'Copy',
    dismissLabel: 'Done',
    plaintextNote: 'Copy this key now — it will not be shown again.',
    labelPlaceholder: 'e.g. CI pipeline',
    ipPlaceholder: 'One IP or CIDR per line (empty = any)',
    noScopesLabel: 'No scopes available.',
  },
);

const emit = defineEmits<{
  (event: 'create', payload: { label: string; scopes: string[]; ipWhitelist: string[] }): void;
  (event: 'revoke', id: string): void;
  (event: 'delete', id: string): void;
  (event: 'dismiss-plaintext'): void;
}>();

const newLabel = ref('');
const selectedScopes = ref<string[]>([]);
const ipWhitelistText = ref('');

function toggleScope(scopeKey: string): void {
  const index = selectedScopes.value.indexOf(scopeKey);
  if (index === -1) {
    selectedScopes.value.push(scopeKey);
  } else {
    selectedScopes.value.splice(index, 1);
  }
}

function parseIpWhitelist(): string[] {
  return ipWhitelistText.value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function onCreate(): void {
  const label = newLabel.value.trim();
  if (!label || props.loading) {
    return;
  }
  emit('create', {
    label,
    scopes: [...selectedScopes.value],
    ipWhitelist: parseIpWhitelist(),
  });
  newLabel.value = '';
  selectedScopes.value = [];
  ipWhitelistText.value = '';
}

async function copyPlaintext(): Promise<void> {
  if (props.createdPlaintext && navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(props.createdPlaintext);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); silent no-op.
    }
  }
}
</script>

<style scoped>
.vbwd-api-keys {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.vbwd-api-keys__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.vbwd-api-keys__table th,
.vbwd-api-keys__table td {
  text-align: left;
  padding: 0.5rem 0.6rem;
  border-bottom: 1px solid var(--vbwd-border, #e5e7eb);
  color: var(--vbwd-text, #374151);
}

.vbwd-api-keys__empty {
  color: var(--vbwd-text-muted, #6b7280);
  font-style: italic;
}

.vbwd-api-keys__actions {
  display: flex;
  gap: 0.4rem;
}

.vbwd-api-keys__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--vbwd-border, #e5e7eb);
  border-radius: var(--vbwd-radius, 6px);
  background: var(--vbwd-surface, #fff);
}

.vbwd-api-keys__form-title {
  margin: 0;
  color: var(--vbwd-text, #374151);
}

.vbwd-api-keys__field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  color: var(--vbwd-text, #374151);
}

.vbwd-api-keys__input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vbwd-border, #d1d5db);
  border-radius: var(--vbwd-radius, 6px);
  background: var(--vbwd-surface, #fff);
  color: var(--vbwd-text, #374151);
  font-size: 0.9rem;
}

.vbwd-api-keys__input:focus {
  outline: none;
  border-color: var(--vbwd-primary, #4f46e5);
}

.vbwd-api-keys__scopes {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border: 1px solid var(--vbwd-border, #e5e7eb);
  border-radius: var(--vbwd-radius, 6px);
  padding: 0.6rem 0.8rem;
}

.vbwd-api-keys__scope {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vbwd-text, #374151);
  font-size: 0.9rem;
}

.vbwd-api-keys__btn {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  border-radius: var(--vbwd-radius, 6px);
  border: 1px solid var(--vbwd-primary, #4f46e5);
  background: var(--vbwd-primary, #4f46e5);
  color: var(--vbwd-on-primary, #fff);
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.vbwd-api-keys__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.vbwd-api-keys__btn--ghost {
  background: transparent;
  border-color: var(--vbwd-border, #d1d5db);
  color: var(--vbwd-text, #374151);
}

.vbwd-api-keys__btn--danger {
  background: var(--vbwd-danger, #dc2626);
  border-color: var(--vbwd-danger, #dc2626);
  color: var(--vbwd-on-primary, #fff);
}

.vbwd-api-keys__plaintext {
  padding: 0.8rem 1rem;
  border-radius: var(--vbwd-radius, 6px);
  background: var(--vbwd-success-soft, #ecfdf5);
  color: var(--vbwd-success, #047857);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vbwd-api-keys__plaintext-note {
  margin: 0;
  font-size: 0.85rem;
}

.vbwd-api-keys__plaintext-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.vbwd-api-keys__plaintext-value {
  flex: 1 1 auto;
  min-width: 0;
  word-break: break-all;
  font-size: 0.85rem;
}

.vbwd-api-keys__error {
  margin: 0;
  font-size: 0.85rem;
  color: var(--vbwd-danger, #dc2626);
}
</style>
