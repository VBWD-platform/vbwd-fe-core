/**
 * API Error Classes
 * Custom error types for HTTP and network failures
 */
/**
 * Base API Error
 */
export declare class ApiError extends Error {
    status: number;
    constructor(message: string, status?: number);
    /**
     * Check if error is retryable
     * 5xx errors and network errors are retryable
     */
    isRetryable(): boolean;
    /**
     * Create ApiError from Axios error
     */
    static fromAxiosError(error: {
        response?: {
            status: number;
            data?: {
                error?: string;
                message?: string;
                errors?: Record<string, string[]>;
            };
            statusText: string;
        };
        request?: unknown;
        message: string;
    }): ApiError;
}
/**
 * Network Error (connection failures, timeouts)
 */
export declare class NetworkError extends ApiError {
    isNetworkError: boolean;
    constructor(message: string);
    /**
     * Network errors are always retryable
     */
    isRetryable(): boolean;
}
/**
 * Validation Error (422 Unprocessable Entity)
 */
export declare class ValidationError extends ApiError {
    errors: Record<string, string[]>;
    constructor(message: string, errors: Record<string, string[]>);
    /**
     * Validation errors are not retryable
     */
    isRetryable(): boolean;
}
//# sourceMappingURL=errors.d.ts.map