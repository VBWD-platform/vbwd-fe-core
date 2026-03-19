import { type FeatureUsage } from '../stores/subscription';
/**
 * Feature access composable.
 *
 * Usage:
 * ```typescript
 * const { canAccess, getUsage, isWithinLimit } = useFeatureAccess();
 *
 * if (canAccess('premium_analytics')) {
 *   // Show premium analytics
 * }
 *
 * const usage = getUsage('api_calls');
 * console.log(`${usage.used} / ${usage.limit} API calls used`);
 * ```
 */
export declare function useFeatureAccess(): {
    canAccess: (featureName: string) => boolean;
    getUsage: (featureName: string) => FeatureUsage;
    isWithinLimit: (featureName: string, amount?: number) => boolean;
    features: import("vue").ComputedRef<string[]>;
    usage: import("vue").ComputedRef<Record<string, FeatureUsage>>;
    hasActiveSubscription: import("vue").ComputedRef<boolean>;
    planName: import("vue").ComputedRef<string | null>;
};
//# sourceMappingURL=useFeatureAccess.d.ts.map