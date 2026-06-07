/**
 * useDataExchange — composable wrapping the generic data-exchange REST API.
 *
 * Entity-agnostic: it only speaks the manifest/envelope contract. The host app
 * injects a narrow {@link DataExchangeApi} adapter (DI, mirrors
 * `usePaymentStatus`) so the composable never imports a concrete HTTP client.
 */

import { downloadBlob } from './helpers';
import type {
  DataExchangeApi,
  DataExchangeFormat,
  DataExchangeManifestEntry,
  ExportSelector,
  ImportOptions,
  ImportResult,
} from './types';

const BASE = '/api/v1/admin/data-exchange';
const DEFAULT_FORMAT: DataExchangeFormat = 'json';
const BUNDLE_FILENAME = 'data-exchange.zip';

function manifestUrl(): string {
  return `${BASE}/manifest`;
}

function entityExportUrl(entityKey: string): string {
  return `${BASE}/${entityKey}/export`;
}

function entityImportUrl(entityKey: string): string {
  return `${BASE}/${entityKey}/import`;
}

function bundleExportUrl(): string {
  return `${BASE}/export`;
}

function bundleImportUrl(): string {
  return `${BASE}/import`;
}

function buildImportForm(file: File, options?: ImportOptions): FormData {
  const form = new FormData();
  form.append('file', file);
  form.append('mode', options?.mode ?? 'upsert');
  form.append('dry_run', String(options?.dryRun ?? false));
  return form;
}

/**
 * @param api - narrow HTTP port the host app supplies.
 * @param entityKey - optional default entity for the per-entity calls.
 */
export function useDataExchange(api: DataExchangeApi, entityKey?: string) {
  function requireEntityKey(explicit?: string): string {
    const key = explicit ?? entityKey;
    if (!key) {
      throw new Error('useDataExchange: entityKey is required for this call');
    }
    return key;
  }

  async function fetchManifest(): Promise<DataExchangeManifestEntry[]> {
    const response = await api.getJson<
      DataExchangeManifestEntry[] | { entities: DataExchangeManifestEntry[] }
    >(manifestUrl());
    return Array.isArray(response) ? response : response.entities;
  }

  async function exportEntity(
    selector: ExportSelector,
    explicitEntityKey?: string,
  ): Promise<void> {
    const key = requireEntityKey(explicitEntityKey);
    const format = selector.format ?? DEFAULT_FORMAT;
    const blob = await api.postForBlob(entityExportUrl(key), selector);
    downloadBlob(blob, `${key}.${format}`);
  }

  async function exportBundle(
    entityKeys: string[],
    format: DataExchangeFormat = DEFAULT_FORMAT,
  ): Promise<void> {
    const blob = await api.postForBlob(bundleExportUrl(), {
      entities: entityKeys,
      format,
    });
    downloadBlob(blob, BUNDLE_FILENAME);
  }

  async function importEntity(
    file: File,
    options?: ImportOptions,
    explicitEntityKey?: string,
  ): Promise<ImportResult> {
    const key = requireEntityKey(explicitEntityKey);
    const form = buildImportForm(file, options);
    return api.postFormForJson<ImportResult>(entityImportUrl(key), form);
  }

  async function importBundle(
    file: File,
    options?: ImportOptions,
  ): Promise<ImportResult[]> {
    const form = buildImportForm(file, options);
    const response = await api.postFormForJson<
      ImportResult[] | { results: ImportResult[] }
    >(bundleImportUrl(), form);
    return Array.isArray(response) ? response : response.results;
  }

  return {
    fetchManifest,
    exportEntity,
    exportBundle,
    importEntity,
    importBundle,
  };
}
