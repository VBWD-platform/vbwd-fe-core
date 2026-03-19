/**
 * Plugin Configuration File Utilities
 * Handles reading/writing plugins.json
 */
import type { PluginsJson, PluginConfig } from './types';
/**
 * Load plugin configuration from file
 */
export declare function loadPluginConfig(configPath: string): PluginsJson;
/**
 * Save plugin configuration to file
 */
export declare function savePluginConfig(configPath: string, config: PluginsJson): void;
/**
 * Get a specific plugin config
 */
export declare function getPluginConfig(config: PluginsJson, name: string): PluginConfig | undefined;
/**
 * Set a plugin config
 */
export declare function setPluginConfig(config: PluginsJson, name: string, pluginConfig: PluginConfig): PluginsJson;
/**
 * Remove a plugin config
 */
export declare function removePluginConfig(config: PluginsJson, name: string): PluginsJson;
/**
 * Check if plugin directory exists
 */
export declare function pluginDirExists(pluginsDir: string, name: string): boolean;
/**
 * Create plugins directory if it doesn't exist
 */
export declare function ensurePluginsDir(pluginsDir: string): void;
//# sourceMappingURL=config.d.ts.map