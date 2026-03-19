/**
 * Plugin Manager CLI
 * Command-line interface for managing plugins in VBWD applications
 */
import type { IPluginRegistry } from '../plugins/types';
import type { PluginManagerOptions } from './types';
export declare class PluginManagerCLI {
    private registry;
    private options;
    constructor(registry: IPluginRegistry, options: PluginManagerOptions);
    /**
     * Run CLI with arguments
     */
    run(args: string[]): Promise<void>;
    /**
     * List all plugins with their status
     */
    list(): Promise<void>;
    /**
     * Install a plugin
     */
    install(name: string): Promise<void>;
    /**
     * Uninstall a plugin
     */
    uninstall(name: string): Promise<void>;
    /**
     * Activate a plugin
     */
    activate(name: string): Promise<void>;
    /**
     * Deactivate a plugin
     */
    deactivate(name: string): Promise<void>;
    /**
     * Show help
     */
    help(): void;
    /**
     * Show version
     */
    version(): void;
    /**
     * Helper: Pad string to fixed length
     */
    private padEnd;
    /**
     * Helper: Get plugin status string
     */
    private getPluginStatus;
}
//# sourceMappingURL=PluginManagerCLI.d.ts.map