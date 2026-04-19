import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchPluginManifest, fetchPluginConfigs } from '../../../src/plugins/manifest';
import type { PluginManifest } from '../../../src/plugins/types';

const VALID_MANIFEST: PluginManifest = {
  plugins: {
    'plugin-a': { enabled: true, version: '1.0.0', source: 'local' },
    'plugin-b': { enabled: false, version: '2.0.0', source: 'git' },
  },
};

const FALLBACK_MANIFEST: PluginManifest = {
  plugins: {
    fallback: { enabled: true, version: '0.1.0', source: 'local' },
  },
};

function mockFetchSuccess(data: unknown): void {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);
}

function mockFetchHttpError(status: number): void {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.reject(new Error('should not be called')),
  } as Response);
}

function mockFetchNetworkError(): void {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
}

describe('fetchPluginManifest', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and parses valid manifest from URL', async () => {
    mockFetchSuccess(VALID_MANIFEST);

    const result = await fetchPluginManifest('/plugins.json');

    expect(fetch).toHaveBeenCalledWith('/plugins.json');
    expect(result).toEqual(VALID_MANIFEST);
    expect(result.plugins['plugin-a'].enabled).toBe(true);
    expect(result.plugins['plugin-b'].enabled).toBe(false);
  });

  it('returns fallback when fetch returns 404', async () => {
    mockFetchHttpError(404);

    const result = await fetchPluginManifest('/plugins.json', FALLBACK_MANIFEST);

    expect(result).toEqual(FALLBACK_MANIFEST);
  });

  it('returns fallback when fetch throws network error', async () => {
    mockFetchNetworkError();

    const result = await fetchPluginManifest('/plugins.json', FALLBACK_MANIFEST);

    expect(result).toEqual(FALLBACK_MANIFEST);
  });

  it('returns empty manifest when no fallback provided and fetch fails', async () => {
    mockFetchNetworkError();

    const result = await fetchPluginManifest('/plugins.json');

    expect(result).toEqual({ plugins: {} });
  });

  it('rejects manifest without "plugins" key and returns fallback', async () => {
    mockFetchSuccess({ version: '1.0.0' });

    const result = await fetchPluginManifest('/plugins.json', FALLBACK_MANIFEST);

    expect(result).toEqual(FALLBACK_MANIFEST);
  });

  it('rejects non-object response and returns fallback', async () => {
    mockFetchSuccess('not an object');

    const result = await fetchPluginManifest('/plugins.json', FALLBACK_MANIFEST);

    expect(result).toEqual(FALLBACK_MANIFEST);
  });

  it('rejects null response and returns fallback', async () => {
    mockFetchSuccess(null);

    const result = await fetchPluginManifest('/plugins.json', FALLBACK_MANIFEST);

    expect(result).toEqual(FALLBACK_MANIFEST);
  });

  it('handles manifest with zero plugins', async () => {
    mockFetchSuccess({ plugins: {} });

    const result = await fetchPluginManifest('/plugins.json');

    expect(result).toEqual({ plugins: {} });
  });

  it('handles manifest with mixed enabled/disabled plugins', async () => {
    mockFetchSuccess(VALID_MANIFEST);

    const result = await fetchPluginManifest('/plugins.json');

    const enabled = Object.entries(result.plugins).filter(([, entry]) => entry.enabled);
    const disabled = Object.entries(result.plugins).filter(([, entry]) => !entry.enabled);
    expect(enabled).toHaveLength(1);
    expect(disabled).toHaveLength(1);
  });

  it('uses custom path when provided', async () => {
    mockFetchSuccess(VALID_MANIFEST);

    await fetchPluginManifest('/custom/path/manifest.json');

    expect(fetch).toHaveBeenCalledWith('/custom/path/manifest.json');
  });
});

describe('fetchPluginConfigs', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and parses valid config from URL', async () => {
    const configs = { 'plugin-a': { key: 'value' }, 'plugin-b': { count: 42 } };
    mockFetchSuccess(configs);

    const result = await fetchPluginConfigs('/config.json');

    expect(fetch).toHaveBeenCalledWith('/config.json');
    expect(result).toEqual(configs);
  });

  it('returns empty object on 404', async () => {
    mockFetchHttpError(404);

    const result = await fetchPluginConfigs('/config.json');

    expect(result).toEqual({});
  });

  it('returns empty object on network error', async () => {
    mockFetchNetworkError();

    const result = await fetchPluginConfigs('/config.json');

    expect(result).toEqual({});
  });

  it('returns empty object on invalid JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    } as Response);

    const result = await fetchPluginConfigs('/config.json');

    expect(result).toEqual({});
  });
});
