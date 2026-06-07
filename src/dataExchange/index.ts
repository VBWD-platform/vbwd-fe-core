/**
 * Data Exchange — generic, entity-agnostic import/export surface (S46.3).
 *
 * fe-admin (and CMS, plugins) consume `ImportExportPage`, `ImportExportControls`,
 * the `useDataExchange` composable, and the download/read helpers. Core stays
 * agnostic: nothing here names a concrete entity.
 */

export { default as ImportExportPage } from './ImportExportPage.vue';
export { default as ImportExportControls } from './ImportExportControls.vue';
export { useDataExchange } from './useDataExchange';
export { downloadBlob, readImportFile } from './helpers';
export type {
  DataExchangeApi,
  DataExchangeCluster,
  DataExchangeFormat,
  DataExchangeManifestEntry,
  DataExchangeTab,
  ExportSelector,
  ImportError,
  ImportMode,
  ImportOptions,
  ImportResult,
} from './types';
