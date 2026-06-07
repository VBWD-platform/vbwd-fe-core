/**
 * Data Exchange — shared types for the generic import/export feature.
 *
 * These mirror the backend's VBWD-standard envelope manifest + ImportResult
 * (S46.0/S46.1). The fe-core surface is entity-agnostic: it only knows the
 * manifest shape, never any concrete entity.
 */

import type { Component } from 'vue';

/**
 * UI grouping an exchanger declares (manifest `cluster`). This is a free-form
 * string: core ships recognised values (`'sales'`, `'settings'`, `'content'`)
 * for preferred ordering and labels, but any exchanger may declare its own
 * cluster name and the page will group + Title-Case it generically (R9).
 */
export type DataExchangeCluster = 'sales' | 'settings' | 'content' | string;

/** Serialisation format for a single entity. */
export type DataExchangeFormat = 'json' | 'csv';

/** Import strategy. `replace_all` is superadmin-only (server-enforced). */
export type ImportMode = 'upsert' | 'replace_all';

/**
 * One row of `GET /api/v1/admin/data-exchange/manifest` — already
 * permission- and config-filtered by the backend for the calling user.
 */
export interface DataExchangeManifestEntry {
  entity_key: string;
  label: string;
  cluster: DataExchangeCluster;
  supported_formats: DataExchangeFormat[];
  supports_export: boolean;
  supports_import: boolean;
  /** Whether the current user may export this entity. */
  can_export: boolean;
  /** Whether the current user may import this entity. */
  can_import: boolean;
  /** Whether the current user may include PII in an export. */
  can_export_pii: boolean;
}

/** Selector for a single-entity export (D7). */
export interface ExportSelector {
  ids?: string[];
  filters?: Record<string, unknown>;
  all?: boolean;
  format?: DataExchangeFormat;
}

/** Per-record error reported by an import. */
export interface ImportError {
  row?: number;
  reason: string;
}

/** Uniform import result returned by every import endpoint. */
export interface ImportResult {
  entity: string;
  mode: ImportMode;
  dry_run: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: ImportError[];
}

/** Options passed to an import call. */
export interface ImportOptions {
  mode?: ImportMode;
  dryRun?: boolean;
}

/**
 * Narrow HTTP port the composable depends on (Interface Segregation).
 *
 * The host app (fe-admin) supplies an adapter over its own `ApiClient` so the
 * composable stays decoupled from any concrete client and is trivially
 * mockable in tests. Only the three shapes the feature actually uses are
 * declared here.
 */
export interface DataExchangeApi {
  /** GET a JSON body (manifest). */
  getJson<T = unknown>(url: string): Promise<T>;
  /** POST a JSON body and receive a binary file (export download). */
  postForBlob(url: string, body: unknown): Promise<Blob>;
  /** POST multipart form data and receive a JSON body (import result). */
  postFormForJson<T = unknown>(url: string, form: FormData): Promise<T>;
}

/**
 * An extension-contributed tab for {@link ImportExportPage} (the fe-admin
 * `dataExchangeTabs` slot, R7). Core ships the General tab; hosts/plugins
 * supply additional tabs.
 */
export interface DataExchangeTab {
  id: string;
  label: string;
  component: Component;
  props?: Record<string, unknown>;
  order?: number;
}
