/**
 * Auth Store - Pinia store for authentication state management.
 *
 * Configurable storage key allows different apps (admin, user) to use
 * different localStorage keys for tokens.
 */
import { defineStore } from 'pinia';
import type { ApiClient } from '../api/ApiClient';

export interface AccessLevel {
  id: string;
  slug: string;
  name: string;
}

export interface UserAccessLevel {
  id: string;
  slug: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  is_admin?: boolean;
  access_levels?: AccessLevel[];
  permissions?: string[];
  user_access_levels?: UserAccessLevel[];
  user_permissions?: string[];
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  error: string | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh_token?: string;
  user: AuthUser;
}

export interface AuthStoreConfig {
  storageKey: string;
  refreshStorageKey?: string;
  apiClient: ApiClient;
  loginEndpoint?: string;
  logoutEndpoint?: string;
  refreshEndpoint?: string;
  profileEndpoint?: string;
}

// Store configuration - set via configureAuthStore()
let storeConfig: AuthStoreConfig | null = null;

/**
 * Configure the auth store before use.
 * Must be called in app's main.ts before using useAuthStore().
 */
export function configureAuthStore(config: AuthStoreConfig): void {
  storeConfig = {
    loginEndpoint: '/auth/login',
    logoutEndpoint: '/auth/logout',
    refreshEndpoint: '/auth/refresh',
    profileEndpoint: '/auth/me',
    ...config,
    refreshStorageKey: config.refreshStorageKey || `${config.storageKey}_refresh`,
  };
}

/**
 * Get current store configuration.
 * Throws if not configured.
 */
function getConfig(): AuthStoreConfig {
  if (!storeConfig) {
    throw new Error(
      'Auth store not configured. Call configureAuthStore() in main.ts before using useAuthStore().'
    );
  }
  return storeConfig;
}

/**
 * Auth store definition
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    error: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token && !!state.user,

    isAdmin: (state): boolean => {
      const role = state.user?.role;
      if (role) {
        return role === 'SUPER_ADMIN' || role === 'ADMIN';
      }
      return !!state.user?.is_admin;
    },

    isSuperAdmin: (state): boolean => {
      return state.user?.role === 'SUPER_ADMIN';
    },

    hasRole: (state) => {
      return (role: string): boolean => {
        return state.user?.role === role;
      };
    },

    hasAnyRole: (state) => {
      return (roles: string[]): boolean => {
        return roles.includes(state.user?.role || '');
      };
    },

    hasPermission: (state) => {
      return (permission: string): boolean => {
        const perms = state.user?.permissions ?? [];
        if (perms.includes('*')) return true;
        if (perms.includes(permission)) return true;
        // Wildcard: "shop.*" matches "shop.products.view"
        return perms.some(p => p.endsWith('.*') && permission.startsWith(p.slice(0, -1)));
      };
    },

    hasAnyPermission: (state) => {
      return (permissions: string[]): boolean => {
        const perms = state.user?.permissions ?? [];
        if (perms.includes('*')) return true;
        return permissions.some(p => {
          if (perms.includes(p)) return true;
          return perms.some(up => up.endsWith('.*') && p.startsWith(up.slice(0, -1)));
        });
      };
    },

    /**
     * Check if user has a specific user-facing permission.
     * User permissions come from user access levels (fe-user).
     */
    hasUserPermission: (state) => {
      return (permission: string): boolean => {
        const perms = state.user?.user_permissions ?? [];
        if (perms.includes('*')) return true;
        if (perms.includes(permission)) return true;
        return perms.some(p => p.endsWith('.*') && permission.startsWith(p.slice(0, -1)));
      };
    },

    /**
     * Check if user has any of the specified user-facing permissions.
     */
    hasAnyUserPermission: (state) => {
      return (permissions: string[]): boolean => {
        const perms = state.user?.user_permissions ?? [];
        if (perms.includes('*')) return true;
        return permissions.some(p => {
          if (perms.includes(p)) return true;
          return perms.some(up => up.endsWith('.*') && p.startsWith(up.slice(0, -1)));
        });
      };
    },
  },

  actions: {
    /**
     * Initialize auth state from localStorage.
     * Call this on app startup.
     */
    initAuth(): void {
      const config = getConfig();
      const token = localStorage.getItem(config.storageKey);
      const refreshToken = localStorage.getItem(config.refreshStorageKey!);

      if (token) {
        this.token = token;
        this.refreshToken = refreshToken;
        config.apiClient.setToken(token);

        // Restore user data from localStorage
        const userJson = localStorage.getItem(`${config.storageKey}_user`);
        if (userJson) {
          try {
            this.user = JSON.parse(userJson);
          } catch {
            // Corrupted data — will be refreshed on next login
          }
        }
      }
    },

    /**
     * Login with credentials.
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      const config = getConfig();
      this.error = null;
      this.loading = true;

      try {
        const rawResponse = await config.apiClient.post<any>(
          config.loginEndpoint!,
          credentials
        );

        // The response should directly contain token and user
        // The backend response format is: { success, token, user, user_id, error }
        const response = rawResponse;

        // Extract and set the token first
        this.token = response.token;
        this.refreshToken = response.refresh_token || null;
        this.user = response.user;

        // Debug logging
        if (typeof window !== 'undefined') {
          (window as any).__AUTH_DEBUG__ = {
            responseUser: response.user,
            stateUser: this.user,
            stateUserRole: this.user?.role,
            timestamp: new Date().toISOString(),
          };
        }

        // Set token in API client
        if (this.token) {
          config.apiClient.setToken(this.token);

          // Persist to localStorage
          localStorage.setItem(config.storageKey, this.token);

          // Persist user data (roles + permissions) for page refresh
          if (this.user) {
            localStorage.setItem(`${config.storageKey}_user`, JSON.stringify(this.user));
          }
        }
        if (this.refreshToken) {
          localStorage.setItem(config.refreshStorageKey!, this.refreshToken);
        }

        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Login failed';
        // Debug: log the error
        if (typeof window !== 'undefined') {
          (window as any).__AUTH_ERROR__ = {
            message: this.error,
            error: String(error),
            timestamp: new Date().toISOString(),
          };
          console.error('[AUTH STORE ERROR]', this.error, error);
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Logout and clear all auth state.
     */
    async logout(): Promise<void> {
      const config = getConfig();

      try {
        // Call logout endpoint if token exists
        if (this.token) {
          await config.apiClient.post(config.logoutEndpoint!).catch(() => {
            // Ignore logout endpoint errors
          });
        }
      } finally {
        // Clear state
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        this.error = null;

        // Clear API client token
        config.apiClient.clearToken();

        // Clear localStorage
        localStorage.removeItem(config.storageKey);
        localStorage.removeItem(config.refreshStorageKey!);
        localStorage.removeItem(`${config.storageKey}_user`);
      }
    },

    /**
     * Refresh the access token.
     */
    async refreshAccessToken(): Promise<string> {
      const config = getConfig();

      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        const response = await config.apiClient.post<{ token: string }>(
          config.refreshEndpoint!,
          { refresh_token: this.refreshToken }
        );

        this.token = response.token;
        config.apiClient.setToken(this.token);
        localStorage.setItem(config.storageKey, this.token);

        return this.token;
      } catch (error) {
        // Refresh failed, logout
        await this.logout();
        throw error;
      }
    },

    /**
     * Fetch current user profile.
     */
    async fetchProfile(): Promise<AuthUser> {
      const config = getConfig();
      this.loading = true;

      try {
        const user = await config.apiClient.get<AuthUser>(config.profileEndpoint!);
        this.user = user;
        return user;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch profile';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Set user manually (for cases where login response includes user).
     */
    setUser(user: AuthUser | null): void {
      this.user = user;
    },

    /**
     * Set token manually.
     */
    setToken(token: string | null): void {
      const config = getConfig();
      this.token = token;

      if (token) {
        config.apiClient.setToken(token);
        localStorage.setItem(config.storageKey, token);
      } else {
        config.apiClient.clearToken();
        localStorage.removeItem(config.storageKey);
      }
    },

    /**
     * Clear error state.
     */
    clearError(): void {
      this.error = null;
    },
  },
});

// Export type for use in other modules
export type AuthStore = ReturnType<typeof useAuthStore>;
