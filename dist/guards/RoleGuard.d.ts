/**
 * Role-based route guard.
 *
 * Restricts access to routes based on user roles.
 */
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
export interface RoleGuardOptions {
    forbiddenRoute?: string;
}
/**
 * Create a role guard with custom options.
 *
 * @param options - Guard configuration options
 * @returns Navigation guard function
 */
export declare function createRoleGuard(options?: RoleGuardOptions): (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => void;
/**
 * Default role guard.
 *
 * Usage in router:
 * ```typescript
 * import { roleGuard } from '@vbwd/view-component';
 *
 * // Apply after authGuard
 * router.beforeEach((to, from, next) => {
 *   authGuard(to, from, (result) => {
 *     if (result !== undefined) { next(result); return; }
 *     roleGuard(to, from, next);
 *   });
 * });
 * ```
 *
 * Route configuration:
 * ```typescript
 * {
 *   path: '/admin',
 *   meta: { requiresAuth: true, roles: ['admin'] }
 * }
 * ```
 */
export declare const roleGuard: (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => void;
//# sourceMappingURL=RoleGuard.d.ts.map