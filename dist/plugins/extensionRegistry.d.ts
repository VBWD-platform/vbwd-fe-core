/**
 * Admin Extension Registry
 *
 * Generic system for loading and accessing plugin extensions.
 * Keeps the core admin app agnostic to specific plugins.
 *
 * The internal map is wrapped with Vue's reactive() so that any computed()
 * reading from getNavSections() / getUserDetailsSections() re-evaluates
 * automatically when plugins register or unregister.
 */
import type { Component } from 'vue';
export interface NavItem {
    /** Display label */
    label: string;
    /** Absolute route path (e.g. '/admin/cms/pages') */
    to: string;
}
export interface NavSection {
    /** Unique ID (used as key and for active-state detection) */
    id: string;
    /** Section header label */
    label: string;
    /** Child nav items */
    items: NavItem[];
}
export interface PlanTabSection {
    /** Tab label */
    label: string;
    /** Component to render as tab content */
    component: Component;
    /** Optional: only show when plan has a category with one of these slugs */
    requiredCategorySlugs?: string[];
}
export interface AdminExtension {
    userDetailsSections?: Component[];
    /** Nav sections added to the admin sidebar by this plugin */
    navSections?: NavSection[];
    /** Items injected into the core Settings nav section */
    settingsItems?: NavItem[];
    /** Plan edit page tab sections contributed by this plugin */
    planTabSections?: PlanTabSection[];
}
declare class ExtensionRegistry {
    private extensions;
    /**
     * Register a plugin's admin extension.
     * Called from a plugin's install() or activate() hook.
     */
    register(pluginName: string, extension: AdminExtension): void;
    /**
     * Remove a plugin's admin extension.
     * Call from a plugin's deactivate() hook so sidebar items disappear.
     */
    unregister(pluginName: string): void;
    /**
     * Get all user-detail sections contributed by plugins.
     */
    getUserDetailsSections(): Component[];
    /**
     * Get all nav sections registered by plugins.
     * Because extensions is reactive(), any computed() reading this
     * will re-run when the map is mutated.
     */
    getNavSections(): NavSection[];
    /**
     * Get all items to inject into the core Settings nav section.
     */
    getSettingsItems(): NavItem[];
    /**
     * Get all plan tab sections contributed by plugins.
     */
    getPlanTabSections(): PlanTabSection[];
    /**
     * Get extension by plugin name.
     */
    get(pluginName: string): AdminExtension | undefined;
    /**
     * Check if extension exists.
     */
    has(pluginName: string): boolean;
    /**
     * Clear all extensions.
     */
    clear(): void;
}
export declare const extensionRegistry: ExtensionRegistry;
export {};
//# sourceMappingURL=extensionRegistry.d.ts.map