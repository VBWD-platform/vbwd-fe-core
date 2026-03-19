interface ApiLike {
    post(url: string, data?: unknown): Promise<Record<string, unknown>>;
}
/**
 * Composable for payment redirect flow.
 *
 * Handles: read invoice from query -> POST create-session -> redirect to provider.
 * Reused by Stripe, PayPal, Amazon Pay, AliPay, etc.
 *
 * @param apiPrefix - Provider's API prefix (e.g. '/api/v1/plugins/stripe')
 * @param api - HTTP client instance with post() method
 */
export declare function usePaymentRedirect(apiPrefix: string, api: ApiLike): {
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    invoiceId: import("vue").Ref<string | null, string | null>;
    readInvoiceFromQuery: () => string | null;
    createAndRedirect: () => Promise<void>;
};
export {};
//# sourceMappingURL=usePaymentRedirect.d.ts.map