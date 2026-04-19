/**
 * Runtime Plugin Manifest Loading
 *
 * Fetches plugins.json and config.json at runtime instead of importing
 * them at build time. This enables per-instance plugin configuration
 * via Docker volume mounts without rebuilding the frontend image.
 */
import type { PluginManifest } from './types';

const DEFAULT_MANIFEST_PATH = '/plugins.json';
const DEFAULT_CONFIG_PATH = '/config.json';

/**
 * Fetch the plugin manifest at runtime.
 *
 * In production, the mounted plugins.json file is served by nginx
 * at the root path. In dev mode, the build-time fallback is used
 * when the fetch fails (no mounted file on dev server).
 *
 * @param path - URL to fetch the manifest from (default: /plugins.json)
 * @param fallback - Build-time manifest to use when fetch fails
 * @returns Parsed plugin manifest
 */
export async function fetchPluginManifest(
  path: string = DEFAULT_MANIFEST_PATH,
  fallback?: PluginManifest,
): Promise<PluginManifest> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (!data || typeof data !== 'object' || !data.plugins) {
      throw new Error('Invalid manifest: missing "plugins" key');
    }
    return data as PluginManifest;
  } catch (error) {
    console.warn(
      `[PluginManifest] Failed to fetch ${path}, using fallback:`,
      error,
    );
    if (fallback) return fallback;
    return { plugins: {} };
  }
}

/**
 * Fetch saved plugin configs at runtime.
 *
 * @param path - URL to fetch configs from (default: /config.json)
 * @returns Parsed config object keyed by plugin name
 */
export async function fetchPluginConfigs(
  path: string = DEFAULT_CONFIG_PATH,
): Promise<Record<string, Record<string, unknown>>> {
  try {
    const response = await fetch(path);
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}
