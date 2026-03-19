/**
 * API Client Implementation
 * Type-safe HTTP client built on Axios
 */
import { type AxiosResponse } from 'axios';
import type { ApiClientConfig, RequestConfig, RefreshTokenHandler, EventListener, ApiEvent } from './types';
/**
 * API Client class
 * Provides HTTP methods with interceptors and error handling
 */
export declare class ApiClient {
    private axiosInstance;
    private token?;
    private refreshTokenHandler?;
    private eventListeners;
    readonly baseURL: string;
    readonly timeout: number;
    readonly headers: Record<string, string>;
    constructor(config: ApiClientConfig);
    /**
     * Setup request and response interceptors
     */
    private setupInterceptors;
    /**
     * GET request
     */
    get<T = unknown>(url: string, config?: Partial<RequestConfig>): Promise<T>;
    /**
     * POST request
     */
    post<T = unknown>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<T>;
    /**
     * PUT request
     */
    put<T = unknown>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<T>;
    /**
     * PATCH request
     */
    patch<T = unknown>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<T>;
    /**
     * DELETE request
     */
    delete<T = unknown>(url: string, config?: Partial<RequestConfig>): Promise<T>;
    /**
     * Set authentication token
     */
    setToken(token: string): void;
    /**
     * Get authentication token
     */
    getToken(): string | undefined;
    /**
     * Clear authentication token
     */
    clearToken(): void;
    /**
     * Set refresh token handler
     */
    setRefreshTokenHandler(handler: RefreshTokenHandler): void;
    /**
     * Get refresh token handler
     */
    getRefreshTokenHandler(): RefreshTokenHandler | undefined;
    /**
     * Add event listener
     */
    on(event: ApiEvent, listener: EventListener): void;
    /**
     * Remove event listener
     */
    off(event: ApiEvent, listener: EventListener): void;
    /**
     * Emit event
     */
    private emit;
    /**
     * Get request configuration (for testing)
     */
    getRequestConfig(url: string, config?: Partial<RequestConfig>): RequestConfig;
    /**
     * Handle response (for testing)
     */
    handleResponse<T>(response: AxiosResponse<T>): T;
}
//# sourceMappingURL=ApiClient.d.ts.map