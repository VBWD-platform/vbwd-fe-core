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

import { reactive } from 'vue';
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

class ExtensionRegistry {
  // reactive() makes computed() properties that read from this map
  // re-evaluate whenever entries are added or removed.
  private extensions: Map<string, AdminExtension> = reactive(new Map());

  /**
   * Register a plugin's admin extension.
   * Called from a plugin's install() or activate() hook.
   */
  register(pluginName: string, extension: AdminExtension): void {
    this.extensions.set(pluginName, extension);
  }

  /**
   * Remove a plugin's admin extension.
   * Call from a plugin's deactivate() hook so sidebar items disappear.
   */
  unregister(pluginName: string): void {
    this.extensions.delete(pluginName);
  }

  /**
   * Get all user-detail sections contributed by plugins.
   */
  getUserDetailsSections(): Component[] {
    const sections: Component[] = [];
    this.extensions.forEach((ext) => {
      if (ext.userDetailsSections) {
        sections.push(...ext.userDetailsSections);
      }
    });
    return sections;
  }

  /**
   * Get all nav sections registered by plugins.
   * Because extensions is reactive(), any computed() reading this
   * will re-run when the map is mutated.
   */
  getNavSections(): NavSection[] {
    const all: NavSection[] = [];
    this.extensions.forEach((ext) => {
      if (ext.navSections) {
        all.push(...ext.navSections);
      }
    });
    return all;
  }

  /**
   * Get all items to inject into the core Settings nav section.
   */
  getSettingsItems(): NavItem[] {
    const items: NavItem[] = [];
    this.extensions.forEach((ext) => {
      if (ext.settingsItems) {
        items.push(...ext.settingsItems);
      }
    });
    return items;
  }

  /**
   * Get all plan tab sections contributed by plugins.
   */
  getPlanTabSections(): PlanTabSection[] {
    const sections: PlanTabSection[] = [];
    this.extensions.forEach((ext) => {
      if (ext.planTabSections) {
        sections.push(...ext.planTabSections);
      }
    });
    return sections;
  }

  /**
   * Get extension by plugin name.
   */
  get(pluginName: string): AdminExtension | undefined {
    return this.extensions.get(pluginName);
  }

  /**
   * Check if extension exists.
   */
  has(pluginName: string): boolean {
    return this.extensions.has(pluginName);
  }

  /**
   * Clear all extensions.
   */
  clear(): void {
    this.extensions.clear();
  }
}

export const extensionRegistry = new ExtensionRegistry();
