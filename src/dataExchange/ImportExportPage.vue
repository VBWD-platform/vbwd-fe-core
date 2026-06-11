<template>
  <div class="vbwd-iep">
    <nav class="vbwd-iep-tabs" role="tablist">
      <button
        type="button"
        class="vbwd-iep-tab"
        :class="{ 'vbwd-iep-tab-active': activeTab === GENERAL_TAB_ID }"
        data-test="tab-general"
        role="tab"
        @click="activeTab = GENERAL_TAB_ID"
      >
        {{ labels.generalTab }}
      </button>
      <button
        v-for="tab in sortedTabs"
        :key="tab.id"
        type="button"
        class="vbwd-iep-tab"
        :class="{ 'vbwd-iep-tab-active': activeTab === tab.id }"
        :data-test="`tab-${tab.id}`"
        role="tab"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section v-if="activeTab === GENERAL_TAB_ID" class="vbwd-iep-panel">
      <p v-if="loading" class="vbwd-iep-status" data-test="loading">
        {{ labels.loading }}
      </p>
      <p v-else-if="error" class="vbwd-iep-error" data-test="manifest-error">
        {{ error }}
      </p>

      <template v-else>
        <!-- EXPORT BLOCK -->
        <div class="vbwd-iep-block" data-test="export-block">
          <h3 class="vbwd-iep-block-title">{{ labels.exportTitle }}</h3>

          <label class="vbwd-iep-toggle">
            <input v-model="exportEverything" type="checkbox" />
            {{ labels.exportEverything }}
          </label>

          <div
            v-for="cluster in clusters"
            :key="`exp-${cluster}`"
            class="vbwd-iep-cluster"
            :data-test="`cluster-${cluster}`"
          >
            <h4 class="vbwd-iep-cluster-title">{{ clusterLabel(cluster) }}</h4>
            <div
              v-for="entry in exportableByCluster[cluster]"
              :key="entry.entity_key"
              class="vbwd-iep-row"
              :data-test="`export-entity-${entry.entity_key}`"
            >
              <label class="vbwd-iep-entity">
                <input
                  v-model="selectedExportKeys"
                  type="checkbox"
                  :value="entry.entity_key"
                  :disabled="exportEverything"
                />
                {{ entry.label }}
              </label>
              <select
                v-model="exportFormats[entry.entity_key]"
                class="vbwd-iep-format"
                :data-test="`format-${entry.entity_key}`"
              >
                <option
                  v-for="fmt in entry.supported_formats"
                  :key="fmt"
                  :value="fmt"
                >
                  {{ fmt.toUpperCase() }}
                </option>
              </select>
            </div>
          </div>

          <button
            type="button"
            class="vbwd-iep-btn vbwd-iep-btn-primary"
            data-test="export-run"
            :disabled="busy || !canRunExport"
            @click="runExport"
          >
            {{ labels.exportRun }}
          </button>
        </div>

        <!-- IMPORT BLOCK -->
        <div class="vbwd-iep-block" data-test="import-block">
          <h3 class="vbwd-iep-block-title">{{ labels.importTitle }}</h3>

          <input
            type="file"
            accept=".json,.csv,.zip"
            class="vbwd-iep-file"
            data-test="import-file"
            @change="onFileChange"
          />

          <fieldset class="vbwd-iep-modes">
            <label class="vbwd-iep-mode" data-test="import-mode-upsert">
              <input v-model="importMode" type="radio" value="upsert" />
              {{ labels.modeUpsert }}
            </label>
            <label
              v-if="isSuperadmin"
              class="vbwd-iep-mode vbwd-iep-mode-danger"
              data-test="import-mode-replace_all"
            >
              <input v-model="importMode" type="radio" value="replace_all" />
              {{ labels.modeReplaceAll }}
            </label>
          </fieldset>

          <p v-if="importError" class="vbwd-iep-error" data-test="import-error">
            {{ importError }}
          </p>

          <table
            v-if="importResults.length"
            class="vbwd-iep-preview"
            data-test="import-preview"
          >
            <thead>
              <tr>
                <th>{{ labels.entity }}</th>
                <th>{{ labels.created }}</th>
                <th>{{ labels.updated }}</th>
                <th>{{ labels.skipped }}</th>
                <th>{{ labels.errors }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="result in importResults"
                :key="result.entity"
                :data-test="`import-result-${result.entity}`"
              >
                <td>{{ result.entity }}</td>
                <td>{{ result.created }}</td>
                <td>{{ result.updated }}</td>
                <td>{{ result.skipped }}</td>
                <td>{{ result.errors.length }}</td>
              </tr>
            </tbody>
          </table>

          <div class="vbwd-iep-actions">
            <button
              type="button"
              class="vbwd-iep-btn"
              data-test="import-preview-run"
              :disabled="!importFile || busy"
              @click="runImport(true)"
            >
              {{ labels.preview }}
            </button>
            <button
              type="button"
              class="vbwd-iep-btn vbwd-iep-btn-primary"
              data-test="import-confirm"
              :disabled="!importFile || busy"
              @click="runImport(false)"
            >
              {{ labels.confirm }}
            </button>
          </div>
        </div>
      </template>
    </section>

    <section
      v-for="tab in sortedTabs"
      v-show="activeTab === tab.id"
      :key="`panel-${tab.id}`"
      class="vbwd-iep-panel"
      :data-test="`panel-${tab.id}`"
      role="tabpanel"
    >
      <component :is="tab.component" v-bind="tab.props || {}" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useDataExchange } from './useDataExchange';
import { readImportFile } from './helpers';
import type {
  DataExchangeApi,
  DataExchangeCluster,
  DataExchangeFormat,
  DataExchangeManifestEntry,
  DataExchangeTab,
  ImportMode,
  ImportResult,
} from './types';

interface PageLabels {
  generalTab: string;
  loading: string;
  exportTitle: string;
  exportEverything: string;
  exportRun: string;
  importTitle: string;
  modeUpsert: string;
  modeReplaceAll: string;
  preview: string;
  confirm: string;
  entity: string;
  created: string;
  updated: string;
  skipped: string;
  errors: string;
  salesCluster: string;
  settingsCluster: string;
  contentCluster: string;
  replaceAllConfirm: string;
}

const DEFAULT_LABELS: PageLabels = {
  generalTab: 'General',
  loading: 'Loading…',
  exportTitle: 'Export',
  exportEverything: 'Everything',
  exportRun: 'Export',
  importTitle: 'Import',
  modeUpsert: 'Upsert (add / update)',
  modeReplaceAll: 'Replace all (destructive)',
  preview: 'Dry-run / Preview',
  confirm: 'Confirm import',
  entity: 'Entity',
  created: 'Created',
  updated: 'Updated',
  skipped: 'Skipped',
  errors: 'Errors',
  salesCluster: 'Sales',
  settingsCluster: 'Settings',
  contentCluster: 'Content',
  replaceAllConfirm:
    'Replace all will DELETE existing records before importing. Continue?',
};

const GENERAL_TAB_ID = '__general__';

/**
 * Recognised clusters render first, in this order. Any other cluster an
 * exchanger declares is appended after these in first-seen order (R9).
 */
const PREFERRED_CLUSTER_ORDER: DataExchangeCluster[] = [
  'sales',
  'settings',
  'content',
];

/** Static labels for the recognised clusters (key → PageLabels field). */
const KNOWN_CLUSTER_LABEL_KEYS: Record<string, keyof PageLabels> = {
  sales: 'salesCluster',
  settings: 'settingsCluster',
  content: 'contentCluster',
};

const props = withDefaults(
  defineProps<{
    api: DataExchangeApi;
    isSuperadmin?: boolean;
    tabs?: DataExchangeTab[];
    labels?: Partial<PageLabels>;
  }>(),
  {
    isSuperadmin: false,
    tabs: () => [],
    labels: () => ({}),
  },
);

const labels = computed<PageLabels>(() => ({
  ...DEFAULT_LABELS,
  ...props.labels,
}));

const exchange = useDataExchange(props.api);

const activeTab = ref<string>(GENERAL_TAB_ID);
const loading = ref(true);
const error = ref<string | null>(null);
const manifest = ref<DataExchangeManifestEntry[]>([]);

const exportEverything = ref(false);
const selectedExportKeys = ref<string[]>([]);
const exportFormats = reactive<Record<string, DataExchangeFormat>>({});

const importFile = ref<File | null>(null);
const importMode = ref<ImportMode>('upsert');
const importResults = ref<ImportResult[]>([]);
const importError = ref<string | null>(null);
const busy = ref(false);

const sortedTabs = computed<DataExchangeTab[]>(() =>
  [...props.tabs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
);

const exportable = computed(() =>
  manifest.value.filter((entry) => entry.can_export),
);

const exportableByCluster = computed<
  Record<string, DataExchangeManifestEntry[]>
>(() => {
  const grouped: Record<string, DataExchangeManifestEntry[]> = {};
  for (const entry of exportable.value) {
    grouped[entry.cluster] = grouped[entry.cluster] ?? [];
    grouped[entry.cluster].push(entry);
  }
  return grouped;
});

const clusters = computed<DataExchangeCluster[]>(() => {
  const present = Object.keys(exportableByCluster.value);
  const preferred = PREFERRED_CLUSTER_ORDER.filter((cluster) =>
    present.includes(cluster),
  );
  const rest = present.filter(
    (cluster) => !PREFERRED_CLUSTER_ORDER.includes(cluster),
  );
  return [...preferred, ...rest];
});

const canRunExport = computed(
  () => exportEverything.value || selectedExportKeys.value.length > 0,
);

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function clusterLabel(cluster: DataExchangeCluster): string {
  const labelKey = KNOWN_CLUSTER_LABEL_KEYS[cluster];
  return labelKey ? labels.value[labelKey] : titleCase(cluster);
}

async function loadManifest(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    const entries = await exchange.fetchManifest();
    manifest.value = entries;
    for (const entry of entries) {
      exportFormats[entry.entity_key] = entry.supported_formats[0] ?? 'json';
    }
  } catch (caught) {
    error.value = toMessage(caught);
  } finally {
    loading.value = false;
  }
}

async function runExport(): Promise<void> {
  busy.value = true;
  error.value = null;
  try {
    const keys = exportEverything.value
      ? exportable.value.map((entry) => entry.entity_key)
      : selectedExportKeys.value;
    if (keys.length === 1 && !exportEverything.value) {
      const key = keys[0];
      await exchange.exportEntity(
        { all: true, format: exportFormats[key] },
        key,
      );
    } else {
      await exchange.exportBundle(keys, 'json');
    }
  } catch (caught) {
    error.value = toMessage(caught);
  } finally {
    busy.value = false;
  }
}

function onFileChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  importFile.value = target.files?.[0] ?? null;
  importResults.value = [];
}

function isZip(file: File): boolean {
  return file.name.toLowerCase().endsWith('.zip');
}

// A single-entity import targets one entity_key endpoint, so derive it from the
// uploaded envelope (the top-level key whose value is the rows array — the
// reliable source regardless of the file name); fall back to the file name
// (exports are named ``<entity_key>.<format>``) for CSV / unparsable files.
async function deriveEntityKey(file: File): Promise<string> {
  const fromName = file.name.replace(/\.[^.]+$/, '');
  if (file.name.toLowerCase().endsWith('.json')) {
    try {
      const parsed = JSON.parse(await readImportFile(file)) as Record<string, unknown>;
      const key = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
      if (key) {
        return key;
      }
    } catch {
      // fall through to the file-name heuristic
    }
  }
  return fromName;
}

async function runImport(dryRun: boolean): Promise<void> {
  const file = importFile.value;
  if (!file) {
    return;
  }
  if (importMode.value === 'replace_all' && !dryRun) {
    const confirmed =
      typeof window !== 'undefined'
        ? window.confirm(labels.value.replaceAllConfirm)
        : true;
    if (!confirmed) {
      return;
    }
  }
  busy.value = true;
  importError.value = null;
  try {
    if (isZip(file)) {
      importResults.value = await exchange.importBundle(file, {
        mode: importMode.value,
        dryRun,
      });
    } else {
      const entityKey = await deriveEntityKey(file);
      const result = await exchange.importEntity(
        file,
        { mode: importMode.value, dryRun },
        entityKey,
      );
      importResults.value = [result];
    }
  } catch (caught) {
    importError.value = toMessage(caught);
  } finally {
    busy.value = false;
  }
}

function toMessage(caught: unknown): string {
  if (caught instanceof Error) {
    return caught.message;
  }
  return 'Operation failed';
}

onMounted(loadManifest);
</script>

<style scoped>
.vbwd-iep {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vbwd-iep-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  border-bottom: 1px solid var(--vbwd-color-border, #e5e7eb);
}

.vbwd-iep-tab {
  padding: 0.5rem 1rem;
  font-family: inherit;
  font-size: var(--vbwd-font-size-sm, 0.875rem);
  color: var(--vbwd-color-text-muted, #6b7280);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.vbwd-iep-tab-active {
  color: var(--vbwd-color-primary, #2563eb);
  border-bottom-color: var(--vbwd-color-primary, #2563eb);
}

.vbwd-iep-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.vbwd-iep-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--vbwd-color-surface, #f9fafb);
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-radius, 0.5rem);
}

.vbwd-iep-block-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vbwd-color-text, #374151);
}

.vbwd-iep-cluster {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.vbwd-iep-cluster-title {
  margin: 0;
  font-size: var(--vbwd-font-size-sm, 0.875rem);
  font-weight: 600;
  color: var(--vbwd-color-text-muted, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.vbwd-iep-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.vbwd-iep-entity,
.vbwd-iep-mode,
.vbwd-iep-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--vbwd-font-size-sm, 0.875rem);
  color: var(--vbwd-color-text, #374151);
}

.vbwd-iep-mode-danger {
  color: var(--vbwd-color-danger, #dc2626);
}

.vbwd-iep-format {
  padding: 0.3rem 0.5rem;
  font-size: var(--vbwd-font-size-sm, 0.875rem);
  color: var(--vbwd-color-text, #374151);
  background: var(--vbwd-color-bg, #ffffff);
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-radius, 0.375rem);
}

.vbwd-iep-modes {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.vbwd-iep-preview {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--vbwd-font-size-sm, 0.875rem);
}

.vbwd-iep-preview th,
.vbwd-iep-preview td {
  padding: 0.4rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--vbwd-color-border, #e5e7eb);
}

.vbwd-iep-actions {
  display: flex;
  gap: 0.5rem;
}

.vbwd-iep-btn {
  display: inline-flex;
  align-items: center;
  padding: var(--vbwd-btn-padding-y, 0.45rem) var(--vbwd-btn-padding-x, 0.9rem);
  font-family: inherit;
  font-size: var(--vbwd-font-size-sm, 0.875rem);
  color: var(--vbwd-color-text, #374151);
  background: var(--vbwd-color-bg, #ffffff);
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-radius, 0.375rem);
  cursor: pointer;
}

.vbwd-iep-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vbwd-iep-btn-primary {
  color: var(--vbwd-color-on-primary, #ffffff);
  background: var(--vbwd-color-primary, #2563eb);
  border-color: var(--vbwd-color-primary, #2563eb);
}

.vbwd-iep-status,
.vbwd-iep-error {
  margin: 0;
  font-size: var(--vbwd-font-size-sm, 0.875rem);
}

.vbwd-iep-error {
  color: var(--vbwd-color-danger, #dc2626);
}
</style>
