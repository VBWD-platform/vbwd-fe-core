export interface FeatureUsage {
    limit: number;
    used: number;
    remaining: number;
}
export interface SubscriptionState {
    planName: string | null;
    features: string[];
    usage: Record<string, FeatureUsage>;
    isActive: boolean;
}
/**
 * Subscription store composable.
 *
 * Provides subscription state and feature access methods.
 * Apps should sync this store with their API responses.
 */
export declare function useSubscriptionStore(): {
    planName: import("vue").ComputedRef<string | null>;
    features: import("vue").ComputedRef<string[]>;
    usage: import("vue").ComputedRef<Record<string, FeatureUsage>>;
    isActive: import("vue").ComputedRef<boolean>;
    hasFeature: (featureName: string) => boolean;
    getUsage: (featureName: string) => FeatureUsage | null;
    isWithinLimit: (featureName: string, amount?: number) => boolean;
    setSubscription: (data: {
        planName?: string | null;
        features?: string[];
        usage?: Record<string, FeatureUsage>;
        isActive?: boolean;
    }) => void;
    updateUsage: (featureName: string, newUsage: FeatureUsage) => void;
    clearSubscription: () => void;
};
export type SubscriptionStore = ReturnType<typeof useSubscriptionStore>;
//# sourceMappingURL=subscription.d.ts.map