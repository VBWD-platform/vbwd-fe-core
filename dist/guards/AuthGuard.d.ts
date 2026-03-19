/**
 * Authentication route guard.
 *
 * Protects routes requiring authentication and handles
 * guest-only routes (like login).
 */
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
export interface AuthGuardOptions {
    loginRoute?: string;
    dashboardRoute?: string;
}
/**
 * Create an authentication guard with custom options.
 *
 * @param options - Guard configuration options
 * @returns Navigation guard function
 */
export declare function createAuthGuard(options?: AuthGuardOptions): (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => void;
/**
 * Default authentication guard.
 *
 * Usage in router:
 * ```typescript
 * import { authGuard } from '@vbwd/view-component';
 * router.beforeEach(authGuard);
 * ```
 */
export declare const authGuard: (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => void;
//# sourceMappingURL=AuthGuard.d.ts.map