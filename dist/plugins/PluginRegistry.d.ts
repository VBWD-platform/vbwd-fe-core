import type { IPlugin, IPluginMetadata, IPluginRegistry, IPlatformSDK } from './types';
/**
 * Plugin Registry Implementation
 * Manages plugin registration, lifecycle, and dependency resolution
 */
export declare class PluginRegistry implements IPluginRegistry {
    private plugins;
    /**
     * Register a plugin
     * @throws Error if validation fails or plugin already registered
     */
    register(plugin: IPlugin): void;
    /**
     * Get plugin by name
     */
    get(name: string): IPluginMetadata | undefined;
    /**
     * Get all registered plugins
     */
    getAll(): IPluginMetadata[];
    /**
     * Install a specific plugin
     */
    install(name: string, sdk: IPlatformSDK): Promise<void>;
    /**
     * Install all plugins in dependency order
     */
    installAll(sdk: IPlatformSDK): Promise<void>;
    /**
     * Activate a plugin
     */
    activate(name: string): Promise<void>;
    /**
     * Deactivate a plugin
     * @throws Error if active dependents exist
     */
    deactivate(name: string): Promise<void>;
    /**
     * Uninstall a plugin
     */
    uninstall(name: string): Promise<void>;
    /**
     * Find active plugins that depend on the given plugin
     */
    private getActiveDependents;
    /**
     * Resolve dependency order using topological sort
     * @returns Array of plugin names in installation order
     * @throws Error if circular dependencies or missing dependencies
     */
    private resolveDependencyOrder;
    /**
     * Normalize dependencies to Record<string, string> format
     */
    private normalizeDependencies;
}
//# sourceMappingURL=PluginRegistry.d.ts.map