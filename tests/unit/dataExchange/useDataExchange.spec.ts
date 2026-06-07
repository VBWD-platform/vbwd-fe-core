import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDataExchange } from '@/dataExchange/useDataExchange';
import type { DataExchangeApi, ImportResult } from '@/dataExchange/types';

function makeApi(overrides: Partial<DataExchangeApi> = {}): DataExchangeApi {
  return {
    getJson: vi.fn(),
    postForBlob: vi.fn(async () => new Blob(['x'])),
    postFormForJson: vi.fn(),
    ...overrides,
  };
}

// Spy on the download helper so export* triggers a download.
vi.mock('@/dataExchange/helpers', async () => {
  const actual = await vi.importActual<typeof import('@/dataExchange/helpers')>(
    '@/dataExchange/helpers',
  );
  return {
    ...actual,
    downloadBlob: vi.fn(),
  };
});

import { downloadBlob } from '@/dataExchange/helpers';

const MANIFEST = [
  {
    entity_key: 'users',
    label: 'Users',
    cluster: 'sales',
    supported_formats: ['json', 'csv'],
    supports_export: true,
    supports_import: true,
    can_export: true,
    can_import: true,
    can_export_pii: false,
  },
];

describe('useDataExchange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchManifest GETs the manifest endpoint and returns entries', async () => {
    const api = makeApi({
      getJson: vi.fn(async () => ({ entities: MANIFEST })),
    });
    const { fetchManifest } = useDataExchange(api);

    const entries = await fetchManifest();

    expect(api.getJson).toHaveBeenCalledWith(
      '/api/v1/admin/data-exchange/manifest',
    );
    expect(entries).toEqual(MANIFEST);
  });

  it('fetchManifest tolerates a bare array response', async () => {
    const api = makeApi({ getJson: vi.fn(async () => MANIFEST) });
    const { fetchManifest } = useDataExchange(api);
    expect(await fetchManifest()).toEqual(MANIFEST);
  });

  it('exportEntity posts the selector to the per-entity export endpoint and downloads', async () => {
    const blob = new Blob(['data']);
    const api = makeApi({ postForBlob: vi.fn(async () => blob) });
    const { exportEntity } = useDataExchange(api, 'users');

    await exportEntity({ ids: ['a', 'b'], format: 'csv' });

    expect(api.postForBlob).toHaveBeenCalledWith(
      '/api/v1/admin/data-exchange/users/export',
      { ids: ['a', 'b'], format: 'csv' },
    );
    expect(downloadBlob).toHaveBeenCalledTimes(1);
    expect((downloadBlob as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
      blob,
    );
    // filename uses entity + format extension
    expect((downloadBlob as ReturnType<typeof vi.fn>).mock.calls[0][1]).toBe(
      'users.csv',
    );
  });

  it('exportEntity supports the all selector and defaults format to json', async () => {
    const api = makeApi();
    const { exportEntity } = useDataExchange(api, 'countries');

    await exportEntity({ all: true });

    expect(api.postForBlob).toHaveBeenCalledWith(
      '/api/v1/admin/data-exchange/countries/export',
      { all: true },
    );
    expect((downloadBlob as ReturnType<typeof vi.fn>).mock.calls[0][1]).toBe(
      'countries.json',
    );
  });

  it('exportEntity uses an explicit entityKey argument over the bound one', async () => {
    const api = makeApi();
    const { exportEntity } = useDataExchange(api, 'users');

    await exportEntity({ all: true }, 'invoices');

    expect(api.postForBlob).toHaveBeenCalledWith(
      '/api/v1/admin/data-exchange/invoices/export',
      { all: true },
    );
  });

  it('exportBundle posts the entity list to the bundle endpoint and downloads a zip', async () => {
    const api = makeApi();
    const { exportBundle } = useDataExchange(api);

    await exportBundle(['users', 'countries'], 'json');

    expect(api.postForBlob).toHaveBeenCalledWith(
      '/api/v1/admin/data-exchange/export',
      { entities: ['users', 'countries'], format: 'json' },
    );
    expect((downloadBlob as ReturnType<typeof vi.fn>).mock.calls[0][1]).toBe(
      'data-exchange.zip',
    );
  });

  it('importEntity posts file + mode + dry_run as multipart and returns the result', async () => {
    const result: ImportResult = {
      entity: 'users',
      mode: 'upsert',
      dry_run: true,
      created: 3,
      updated: 1,
      skipped: 0,
      errors: [],
    };
    const api = makeApi({ postFormForJson: vi.fn(async () => result) });
    const { importEntity } = useDataExchange(api, 'users');

    const file = new File(['{}'], 'users.json');
    const returned = await importEntity(file, { mode: 'upsert', dryRun: true });

    expect(api.postFormForJson).toHaveBeenCalledTimes(1);
    const [url, form] = (api.postFormForJson as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe('/api/v1/admin/data-exchange/users/import');
    expect(form).toBeInstanceOf(FormData);
    expect((form as FormData).get('file')).toBe(file);
    expect((form as FormData).get('mode')).toBe('upsert');
    expect((form as FormData).get('dry_run')).toBe('true');
    expect(returned).toEqual(result);
  });

  it('importEntity defaults mode to upsert and dry_run to false', async () => {
    const api = makeApi({
      postFormForJson: vi.fn(async () => ({}) as ImportResult),
    });
    const { importEntity } = useDataExchange(api, 'users');

    await importEntity(new File(['{}'], 'u.json'));

    const [, form] = (api.postFormForJson as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect((form as FormData).get('mode')).toBe('upsert');
    expect((form as FormData).get('dry_run')).toBe('false');
  });

  it('importBundle posts a zip to the bundle import endpoint and returns per-entity results', async () => {
    const results: ImportResult[] = [
      {
        entity: 'users',
        mode: 'upsert',
        dry_run: false,
        created: 1,
        updated: 0,
        skipped: 0,
        errors: [],
      },
    ];
    const api = makeApi({ postFormForJson: vi.fn(async () => ({ results })) });
    const { importBundle } = useDataExchange(api);

    const file = new File(['zip'], 'data-exchange.zip');
    const returned = await importBundle(file, {
      mode: 'replace_all',
      dryRun: false,
    });

    const [url, form] = (api.postFormForJson as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe('/api/v1/admin/data-exchange/import');
    expect((form as FormData).get('mode')).toBe('replace_all');
    expect(returned).toEqual(results);
  });
});
