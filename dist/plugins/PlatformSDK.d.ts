import type { IPlatformSDK, IApiClient, IEventBus, IRouteConfig, ComponentDefinition, IStoreOptions, INavigationGuard } from './types';
interface I18nInstance {
    global: {
        mergeLocaleMessage(locale: string, messages: Record<string, unknown>): void;
    };
}
/**
 * Platform SDK Implementation
 * Provides core APIs to plugins during installation
 */
export declare class PlatformSDK implements IPlatformSDK {
    api: IApiClient;
    events: IEventBus;
    private routes;
    private components;
    private stores;
    private translations;
    private routerGuards;
    private i18n;
    constructor(i18n?: I18nInstance);
    /**
     * Register a Vue Router route
     */
    addRoute(route: IRouteConfig): void;
    /**
     * Get all registered routes
     */
    getRoutes(): IRouteConfig[];
    /**
     * Register a global Vue component
     */
    addComponent(name: string, component: ComponentDefinition): void;
    /**
     * Remove a registered component
     */
    removeComponent(name: string): void;
    /**
     * Get all registered components
     */
    getComponents(): Record<string, ComponentDefinition>;
    /**
     * Create a Pinia store
     */
    createStore(id: string, options: IStoreOptions): string;
    /**
     * Get all registered stores
     */
    getStores(): Record<string, IStoreOptions>;
    /**
     * Merge translations for a locale
     */
    addTranslations(locale: string, messages: Record<string, unknown>): void;
    /**
     * Get all collected translations
     */
    getTranslations(): Record<string, Record<string, unknown>>;
    /**
     * Register a router beforeEach guard. The host wires every registered
     * guard into the app router in plugin installation order.
     */
    addRouterGuard(guard: INavigationGuard): void;
    /**
     * Get all registered router guards. Returns a copy so external
     * mutation of the array cannot corrupt the internal registry.
     */
    getRouterGuards(): INavigationGuard[];
}
export {};
//# sourceMappingURL=PlatformSDK.d.ts.map