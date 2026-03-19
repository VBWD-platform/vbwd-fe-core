interface ApiLike {
    get(url: string): Promise<Record<string, unknown>>;
}
/**
 * Composable for polling payment status.
 *
 * Handles: read session_id from query -> poll status endpoint -> determine completion.
 * Reused by Stripe, PayPal, Amazon Pay, AliPay, etc.
 *
 * @param apiPrefix - Provider's API prefix (e.g. '/api/v1/plugins/stripe')
 * @param api - HTTP client instance with get() method
 * @param options - Polling options
 */
export declare function usePaymentStatus(apiPrefix: string, api: ApiLike, options?: {
    intervalMs?: number;
    maxAttempts?: number;
}): {
    polling: import("vue").Ref<boolean, boolean>;
    confirmed: import("vue").Ref<boolean, boolean>;
    timedOut: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    statusData: import("vue").Ref<Record<string, unknown> | null, Record<string, unknown> | null>;
    sessionId: import("vue").Ref<string | null, string | null>;
    readSessionFromQuery: () => string | null;
    startPolling: () => Promise<void>;
    stopPolling: () => void;
};
export {};
//# sourceMappingURL=usePaymentStatus.d.ts.map