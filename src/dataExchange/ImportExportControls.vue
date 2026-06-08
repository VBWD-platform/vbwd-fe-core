<template>
  <div class="vbwd-iec">
    <div v-if="canExport" class="vbwd-iec-export">
      <button
        v-if="allowExportSelected"
        type="button"
        class="vbwd-iec-btn"
        data-test="export-selected"
        :disabled="selectedIds.length === 0 || busy"
        @click="exportSelected"
      >
        {{ labels.exportSelected }}
      </button>
      <button
        v-if="allowExportAll"
        type="button"
        class="vbwd-iec-btn"
        data-test="export-all"
        :disabled="busy"
        @click="exportAll"
      >
        {{ labels.exportAll }}
      </button>
      <select
        v-if="supportedFormats.length > 1"
        v-model="format"
        class="vbwd-iec-format"
        data-test="export-format"
      >
        <option v-for="fmt in supportedFormats" :key="fmt" :value="fmt">
          {{ fmt.toUpperCase() }}
        </option>
      </select>
    </div>

    <button
      v-if="canImport && allowImport"
      type="button"
      class="vbwd-iec-btn"
      data-test="import-open"
      @click="openImport"
    >
      {{ labels.import }}
    </button>

    <div
      v-if="importOpen"
      class="vbwd-iec-dialog"
      data-test="import-dialog"
      role="dialog"
      aria-modal="true"
    >
      <div class="vbwd-iec-dialog-body">
        <h4 class="vbwd-iec-dialog-title">{{ labels.importTitle }}</h4>

        <input
          type="file"
          accept=".json,.csv"
          class="vbwd-iec-file"
          data-test="import-file"
          @change="onFileChange"
        />

        <fieldset class="vbwd-iec-modes">
          <label class="vbwd-iec-mode" data-test="mode-upsert">
            <input v-model="mode" type="radio" value="upsert" />
            {{ labels.modeUpsert }}
          </label>
          <label
            v-if="isSuperadmin"
            class="vbwd-iec-mode vbwd-iec-mode-danger"
            data-test="mode-replace_all"
          >
            <input v-model="mode" type="radio" value="replace_all" />
            {{ labels.modeReplaceAll }}
          </label>
        </fieldset>

        <p v-if="error" class="vbwd-iec-error" data-test="import-error">
          {{ error }}
        </p>

        <div
          v-if="preview"
          class="vbwd-iec-preview"
          data-test="import-preview-result"
        >
          <span data-test="preview-created"
            >{{ labels.created }}: {{ preview.created }}</span
          >
          <span data-test="preview-updated"
            >{{ labels.updated }}: {{ preview.updated }}</span
          >
          <span data-test="preview-skipped"
            >{{ labels.skipped }}: {{ preview.skipped }}</span
          >
          <span data-test="preview-errors"
            >{{ labels.errors }}: {{ preview.errors.length }}</span
          >
        </div>

        <div class="vbwd-iec-dialog-actions">
          <button
            type="button"
            class="vbwd-iec-btn"
            data-test="import-cancel"
            @click="closeImport"
          >
            {{ labels.cancel }}
          </button>
          <button
            type="button"
            class="vbwd-iec-btn"
            data-test="import-preview"
            :disabled="!file || busy"
            @click="runPreview"
          >
            {{ labels.preview }}
          </button>
          <button
            type="button"
            class="vbwd-iec-btn vbwd-iec-btn-primary"
            data-test="import-confirm"
            :disabled="!file || busy"
            @click="runConfirm"
          >
            {{ labels.confirm }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDataExchange } from './useDataExchange';
import type {
  DataExchangeApi,
  DataExchangeFormat,
  ImportMode,
  ImportResult,
} from './types';

interface ControlLabels {
  exportSelected: string;
  exportAll: string;
  import: string;
  importTitle: string;
  modeUpsert: string;
  modeReplaceAll: string;
  preview: string;
  confirm: string;
  cancel: string;
  created: string;
  updated: string;
  skipped: string;
  errors: string;
  replaceAllConfirm: string;
}

const DEFAULT_LABELS: ControlLabels = {
  exportSelected: 'Export selected',
  exportAll: 'Export all',
  import: 'Import',
  importTitle: 'Import',
  modeUpsert: 'Upsert (add / update)',
  modeReplaceAll: 'Replace all (destructive)',
  preview: 'Dry-run / Preview',
  confirm: 'Confirm import',
  cancel: 'Cancel',
  created: 'Created',
  updated: 'Updated',
  skipped: 'Skipped',
  errors: 'Errors',
  replaceAllConfirm:
    'Replace all will DELETE every existing record for this entity before importing. Continue?',
};

const props = withDefaults(
  defineProps<{
    api: DataExchangeApi;
    entityKey: string;
    selectedIds?: string[];
    filterState?: Record<string, unknown>;
    canExport?: boolean;
    canImport?: boolean;
    canExportPii?: boolean;
    isSuperadmin?: boolean;
    supportedFormats?: DataExchangeFormat[];
    labels?: Partial<ControlLabels>;
    allowExportAll?: boolean;
    allowExportSelected?: boolean;
    allowImport?: boolean;
  }>(),
  {
    selectedIds: () => [],
    filterState: () => ({}),
    canExport: false,
    canImport: false,
    canExportPii: false,
    isSuperadmin: false,
    supportedFormats: () => ['json'],
    labels: () => ({}),
    allowExportAll: true,
    allowExportSelected: true,
    allowImport: true,
  },
);

const emit = defineEmits<{
  refresh: [];
}>();

const labels = computed<ControlLabels>(() => ({
  ...DEFAULT_LABELS,
  ...props.labels,
}));

const exchange = useDataExchange(props.api, props.entityKey);

const format = ref<DataExchangeFormat>(props.supportedFormats[0] ?? 'json');
const busy = ref(false);
const error = ref<string | null>(null);

const importOpen = ref(false);
const mode = ref<ImportMode>('upsert');
const file = ref<File | null>(null);
const preview = ref<ImportResult | null>(null);

watch(
  () => props.isSuperadmin,
  (value) => {
    if (!value && mode.value === 'replace_all') {
      mode.value = 'upsert';
    }
  },
);

function withFormat(): DataExchangeFormat {
  return format.value;
}

async function runExport(selector: Record<string, unknown>): Promise<void> {
  busy.value = true;
  error.value = null;
  try {
    await exchange.exportEntity({ ...selector, format: withFormat() });
  } catch (caught) {
    error.value = toMessage(caught);
  } finally {
    busy.value = false;
  }
}

function exportSelected(): void {
  void runExport({ ids: props.selectedIds });
}

function exportAll(): void {
  void runExport({ all: true });
}

function openImport(): void {
  importOpen.value = true;
  preview.value = null;
  error.value = null;
  file.value = null;
  mode.value = 'upsert';
}

function closeImport(): void {
  importOpen.value = false;
}

function onFileChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  file.value = target.files?.[0] ?? null;
  preview.value = null;
}

async function runImport(dryRun: boolean): Promise<ImportResult | null> {
  if (!file.value) {
    return null;
  }
  if (mode.value === 'replace_all' && !dryRun) {
    const confirmed =
      typeof window !== 'undefined'
        ? window.confirm(labels.value.replaceAllConfirm)
        : true;
    if (!confirmed) {
      return null;
    }
  }
  busy.value = true;
  error.value = null;
  try {
    return await exchange.importEntity(file.value, {
      mode: mode.value,
      dryRun,
    });
  } catch (caught) {
    error.value = toMessage(caught);
    return null;
  } finally {
    busy.value = false;
  }
}

async function runPreview(): Promise<void> {
  const result = await runImport(true);
  if (result) {
    preview.value = result;
  }
}

async function runConfirm(): Promise<void> {
  const result = await runImport(false);
  if (result) {
    importOpen.value = false;
    emit('refresh');
  }
}

function toMessage(caught: unknown): string {
  if (caught instanceof Error) {
    return caught.message;
  }
  return 'Operation failed';
}
</script>

<style scoped>
.vbwd-iec {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.vbwd-iec-export {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.vbwd-iec-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: var(--vbwd-btn-padding-y, 0.4rem) var(--vbwd-btn-padding-x, 0.75rem);
  font-size: var(--vbwd-font-size-sm, 0.875rem);
  font-family: inherit;
  color: var(--vbwd-color-text, #374151);
  background: var(--vbwd-color-surface, #f9fafb);
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-radius, 0.375rem);
  cursor: pointer;
}

.vbwd-iec-btn:hover:not(:disabled) {
  background: var(--vbwd-color-surface-hover, #f3f4f6);
}

.vbwd-iec-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vbwd-iec-btn-primary {
  color: var(--vbwd-color-on-primary, #ffffff);
  background: var(--vbwd-color-primary, #2563eb);
  border-color: var(--vbwd-color-primary, #2563eb);
}

.vbwd-iec-format {
  padding: 0.35rem 0.5rem;
  font-size: var(--vbwd-font-size-sm, 0.875rem);
  color: var(--vbwd-color-text, #374151);
  background: var(--vbwd-color-bg, #ffffff);
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-radius, 0.375rem);
}

.vbwd-iec-dialog {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.vbwd-iec-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 420px;
  padding: 1.25rem;
  background: var(--vbwd-color-bg, #ffffff);
  border-radius: var(--vbwd-modal-radius, 0.5rem);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.vbwd-iec-dialog-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vbwd-color-text, #374151);
}

.vbwd-iec-modes {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.vbwd-iec-mode {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--vbwd-font-size-sm, 0.875rem);
  color: var(--vbwd-color-text, #374151);
}

.vbwd-iec-mode-danger {
  color: var(--vbwd-color-danger, #dc2626);
}

.vbwd-iec-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: var(--vbwd-font-size-sm, 0.875rem);
  background: var(--vbwd-color-surface, #f9fafb);
  border-radius: var(--vbwd-radius, 0.375rem);
}

.vbwd-iec-error {
  margin: 0;
  font-size: var(--vbwd-font-size-sm, 0.875rem);
  color: var(--vbwd-color-danger, #dc2626);
}

.vbwd-iec-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
