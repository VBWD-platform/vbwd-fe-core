/**
 * Plugin System Types
 * Defines interfaces and types for the VBWD Core SDK plugin architecture
 */
export declare enum PluginStatus {
    REGISTERED = "REGISTERED",
    INSTALLED = "INSTALLED",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    ERROR = "ERROR"
}
/**
 * Core plugin interface
 * All plugins must implement at minimum name and version
 */
export interface IPlugin {
    /** Unique plugin identifier */
    name: string;
    /** Semantic version (e.g., "1.0.0") */
    version: string;
    /** Human-readable description */
    description?: string;
    /** Author name or organization */
    author?: string;
    /** Homepage or documentation URL */
    homepage?: string;
    /** Keywords for discoverability */
    keywords?: string[];
    /**
     * Plugin dependencies
     * Can be array of plugin names or object with version constraints
     * Examples:
     *   ['plugin-a', 'plugin-b']
     *   { 'plugin-a': '^1.0.0', 'plugin-b': '>=2.0.0' }
     */
    dependencies?: string[] | Record<string, string>;
    /**
     * Plugin-bundled translations
     * Key = locale code (e.g. 'en', 'de'), Value = translation messages object
     */
    translations?: Record<string, Record<string, unknown>>;
    /**
     * Install hook - called when plugin is installed
     * Receives PlatformSDK instance for registering routes, components, stores, etc.
     */
    install?(sdk: IPlatformSDK): void | Promise<void>;
    /**
     * Activate hook - called when plugin is activated
     * Use for starting background tasks, event listeners, etc.
     */
    activate?(): void | Promise<void>;
    /**
     * Deactivate hook - called when plugin is deactivated
     * Use for cleanup, stopping background tasks, etc.
     */
    deactivate?(): void | Promise<void>;
    /**
     * Uninstall hook - called when plugin is uninstalled
     * Use for removing registered routes, components, stores, etc.
     */
    uninstall?(): void | Promise<void>;
    /** Internal active state for plugin lifecycle tracking */
    _active?: boolean;
}
/**
 * Plugin metadata with runtime status
 */
export interface IPluginMetadata extends IPlugin {
    /** Current plugin status */
    status: PluginStatus;
    /** Timestamp when plugin was installed */
    installedAt?: Date;
    /** Timestamp when plugin was activated */
    activatedAt?: Date;
    /** Error message if status is ERROR */
    error?: string;
}
/**
 * Plugin Registry interface
 * Manages plugin registration, lifecycle, and dependencies
 */
export interface IPluginRegistry {
    /**
     * Register a plugin
     * @throws Error if plugin name already registered or validation fails
     */
    register(plugin: IPlugin): void;
    /**
     * Get plugin metadata by name
     * @returns Plugin metadata or undefined if not found
     */
    get(name: string): IPluginMetadata | undefined;
    /**
     * Get all registered plugins
     */
    getAll(): IPluginMetadata[];
    /**
     * Install a specific plugin
     * @throws Error if plugin not found or installation fails
     */
    install(name: string, sdk: IPlatformSDK): Promise<void>;
    /**
     * Install all registered plugins in dependency order
     * @throws Error if circular dependencies or missing dependencies
     */
    installAll(sdk: IPlatformSDK): Promise<void>;
    /**
     * Activate a plugin
     * @throws Error if plugin not installed or activation fails
     */
    activate(name: string): Promise<void>;
    /**
     * Deactivate a plugin
     * @throws Error if plugin not found or deactivation fails
     */
    deactivate(name: string): Promise<void>;
    /**
     * Uninstall a plugin
     * @throws Error if plugin not found or uninstall fails
     */
    uninstall(name: string): Promise<void>;
}
/**
 * Plugin manifest entry — describes a plugin's registration state.
 * Used in plugins.json to control which plugins are activated at runtime.
 */
export interface PluginManifestEntry {
    enabled: boolean;
    version: string;
    installedAt?: string;
    source: string;
}
/**
 * Plugin manifest — the top-level plugins.json structure.
 */
export interface PluginManifest {
    plugins: Record<string, PluginManifestEntry>;
}
/** API client interface (Sprint 2) */
export interface IApiClient {
    [key: string]: unknown;
}
/** Event bus interface (Sprint 4) */
export interface IEventBus {
    [key: string]: unknown;
}
/** Vue Router route configuration (Sprint 5) */
export interface IRouteConfig {
    path: string;
    name: string;
    component: () => Promise<{
        default: unknown;
    }>;
    meta?: Record<string, unknown>;
    [key: string]: unknown;
}
/** Vue component definition (Sprint 5) */
export type ComponentDefinition = () => Promise<{
    default: unknown;
}>;
/** Pinia store options (Sprint 6) */
export interface IStoreOptions {
    state?: () => Record<string, unknown>;
    getters?: Record<string, unknown>;
    actions?: Record<string, unknown>;
    [key: string]: unknown;
}
/**
 * Minimal route-location shape passed to navigation guards.
 *
 * Intentionally narrower than vue-router's RouteLocationNormalized so the
 * SDK does not pull vue-router into its public API surface — plugins
 * receive the fields they actually need (path, name, params, query) and
 * are free to cast to the host router's richer type if they need more.
 */
export interface IRouteLocation {
    path: string;
    fullPath: string;
    name: string | symbol | null | undefined;
    params: Record<string, string | string[]>;
    query: Record<string, string | string[] | null>;
    meta: Record<string, unknown>;
}
/**
 * Navigation guard return — either a redirect target (path or location),
 * `false` to cancel, or `undefined`/`void` to continue. Matches vue-router's
 * NavigationGuardReturn but kept SDK-local for the same isolation reason
 * as IRouteLocation above.
 */
export type INavigationGuardResult = void | undefined | false | string | {
    path: string;
    replace?: boolean;
};
/**
 * Router navigation guard registered by a plugin via `sdk.addRouterGuard`.
 *
 * The host wires every registered guard into the app's `router.beforeEach`
 * in plugin-installation order. Plugins must NOT perform expensive work
 * inside a guard — fetch once on install, cache, and read from the cache
 * here.
 */
export type INavigationGuard = (to: IRouteLocation, from: IRouteLocation) => INavigationGuardResult | Promise<INavigationGuardResult>;
/**
 * Platform SDK interface
 * Provides core APIs to plugins during installation
 */
export interface IPlatformSDK {
    /** API client instance */
    api: IApiClient;
    /** Event bus instance */
    events: IEventBus;
    /**
     * Register a route
     * @param route Vue Router route configuration
     */
    addRoute(route: IRouteConfig): void;
    /**
     * Get all registered routes
     */
    getRoutes(): IRouteConfig[];
    /**
     * Register a global component
     * @param name Component name
     * @param component Component definition or async loader
     */
    addComponent(name: string, component: ComponentDefinition): void;
    /**
     * Remove a registered component
     * @param name Component name
     */
    removeComponent(name: string): void;
    /**
     * Get all registered components
     */
    getComponents(): Record<string, ComponentDefinition>;
    /**
     * Create a Pinia store
     * @param id Store identifier
     * @param options Store options (state, getters, actions)
     * @returns Store ID
     */
    createStore(id: string, options: IStoreOptions): string;
    /**
     * Get all registered stores
     */
    getStores(): Record<string, IStoreOptions>;
    /**
     * Merge translations into the app's i18n instance
     * @param locale Locale code (e.g. 'en', 'de')
     * @param messages Translation messages object
     */
    addTranslations(locale: string, messages: Record<string, unknown>): void;
    /**
     * Get all collected translations
     */
    getTranslations(): Record<string, Record<string, unknown>>;
    /**
     * Register a Vue Router `beforeEach` guard.
     *
     * Each registered guard is wired into the host app's router in plugin
     * installation order. Use this for cross-cutting navigation concerns
     * the plugin owns (CMS routing-rule middleware, auth on plugin pages,
     * feature-flag redirects, etc.). Do NOT perform expensive work inside
     * the guard — fetch once on install + cache; the guard runs on every
     * navigation.
     */
    addRouterGuard(guard: INavigationGuard): void;
    /**
     * Get all registered router guards in installation order.
     * The host iterates this list and wires each into `router.beforeEach`.
     */
    getRouterGuards(): INavigationGuard[];
}
//# sourceMappingURL=types.d.ts.map