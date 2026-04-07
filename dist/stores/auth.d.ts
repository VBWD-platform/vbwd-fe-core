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
/**
 * Configure the auth store before use.
 * Must be called in app's main.ts before using useAuthStore().
 */
export declare function configureAuthStore(config: AuthStoreConfig): void;
/**
 * Auth store definition
 */
export declare const useAuthStore: import("pinia").StoreDefinition<"auth", AuthState, {
    isAuthenticated: (state: {
        user: {
            id: string;
            email: string;
            name?: string | undefined;
            role?: string | undefined;
            is_admin?: boolean | undefined;
            access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            permissions?: string[] | undefined;
            user_access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            user_permissions?: string[] | undefined;
        } | null;
        token: string | null;
        refreshToken: string | null;
        error: string | null;
        loading: boolean;
    } & import("pinia").PiniaCustomStateProperties<AuthState>) => boolean;
    isAdmin: (state: {
        user: {
            id: string;
            email: string;
            name?: string | undefined;
            role?: string | undefined;
            is_admin?: boolean | undefined;
            access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            permissions?: string[] | undefined;
            user_access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            user_permissions?: string[] | undefined;
        } | null;
        token: string | null;
        refreshToken: string | null;
        error: string | null;
        loading: boolean;
    } & import("pinia").PiniaCustomStateProperties<AuthState>) => boolean;
    isSuperAdmin: (state: {
        user: {
            id: string;
            email: string;
            name?: string | undefined;
            role?: string | undefined;
            is_admin?: boolean | undefined;
            access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            permissions?: string[] | undefined;
            user_access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            user_permissions?: string[] | undefined;
        } | null;
        token: string | null;
        refreshToken: string | null;
        error: string | null;
        loading: boolean;
    } & import("pinia").PiniaCustomStateProperties<AuthState>) => boolean;
    hasRole: (state: {
        user: {
            id: string;
            email: string;
            name?: string | undefined;
            role?: string | undefined;
            is_admin?: boolean | undefined;
            access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            permissions?: string[] | undefined;
            user_access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            user_permissions?: string[] | undefined;
        } | null;
        token: string | null;
        refreshToken: string | null;
        error: string | null;
        loading: boolean;
    } & import("pinia").PiniaCustomStateProperties<AuthState>) => (role: string) => boolean;
    hasAnyRole: (state: {
        user: {
            id: string;
            email: string;
            name?: string | undefined;
            role?: string | undefined;
            is_admin?: boolean | undefined;
            access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            permissions?: string[] | undefined;
            user_access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            user_permissions?: string[] | undefined;
        } | null;
        token: string | null;
        refreshToken: string | null;
        error: string | null;
        loading: boolean;
    } & import("pinia").PiniaCustomStateProperties<AuthState>) => (roles: string[]) => boolean;
    hasPermission: (state: {
        user: {
            id: string;
            email: string;
            name?: string | undefined;
            role?: string | undefined;
            is_admin?: boolean | undefined;
            access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            permissions?: string[] | undefined;
            user_access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            user_permissions?: string[] | undefined;
        } | null;
        token: string | null;
        refreshToken: string | null;
        error: string | null;
        loading: boolean;
    } & import("pinia").PiniaCustomStateProperties<AuthState>) => (permission: string) => boolean;
    hasAnyPermission: (state: {
        user: {
            id: string;
            email: string;
            name?: string | undefined;
            role?: string | undefined;
            is_admin?: boolean | undefined;
            access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            permissions?: string[] | undefined;
            user_access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            user_permissions?: string[] | undefined;
        } | null;
        token: string | null;
        refreshToken: string | null;
        error: string | null;
        loading: boolean;
    } & import("pinia").PiniaCustomStateProperties<AuthState>) => (permissions: string[]) => boolean;
    /**
     * Check if user has a specific user-facing permission.
     * User permissions come from user access levels (fe-user).
     */
    hasUserPermission: (state: {
        user: {
            id: string;
            email: string;
            name?: string | undefined;
            role?: string | undefined;
            is_admin?: boolean | undefined;
            access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            permissions?: string[] | undefined;
            user_access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            user_permissions?: string[] | undefined;
        } | null;
        token: string | null;
        refreshToken: string | null;
        error: string | null;
        loading: boolean;
    } & import("pinia").PiniaCustomStateProperties<AuthState>) => (permission: string) => boolean;
    /**
     * Check if user has any of the specified user-facing permissions.
     */
    hasAnyUserPermission: (state: {
        user: {
            id: string;
            email: string;
            name?: string | undefined;
            role?: string | undefined;
            is_admin?: boolean | undefined;
            access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            permissions?: string[] | undefined;
            user_access_levels?: {
                id: string;
                slug: string;
                name: string;
            }[] | undefined;
            user_permissions?: string[] | undefined;
        } | null;
        token: string | null;
        refreshToken: string | null;
        error: string | null;
        loading: boolean;
    } & import("pinia").PiniaCustomStateProperties<AuthState>) => (permissions: string[]) => boolean;
}, {
    /**
     * Initialize auth state from localStorage.
     * Call this on app startup.
     */
    initAuth(): void;
    /**
     * Login with credentials.
     */
    login(credentials: LoginCredentials): Promise<LoginResponse>;
    /**
     * Logout and clear all auth state.
     */
    logout(): Promise<void>;
    /**
     * Refresh the access token.
     */
    refreshAccessToken(): Promise<string>;
    /**
     * Fetch current user profile.
     */
    fetchProfile(): Promise<AuthUser>;
    /**
     * Set user manually (for cases where login response includes user).
     */
    setUser(user: AuthUser | null): void;
    /**
     * Set token manually.
     */
    setToken(token: string | null): void;
    /**
     * Clear error state.
     */
    clearError(): void;
}>;
export type AuthStore = ReturnType<typeof useAuthStore>;
//# sourceMappingURL=auth.d.ts.map