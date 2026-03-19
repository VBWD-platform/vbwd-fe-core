/**
 * Semver validation and comparison utilities
 * Supports basic semantic versioning checks
 */
/**
 * Validate if a string is a valid semver version
 * Accepts: 1.0.0, 1.0.0-alpha, 1.0.0-beta.1, etc.
 */
export declare function isValidSemver(version: string): boolean;
/**
 * Check if version satisfies a constraint
 * Supports: ^1.0.0 (caret), ~1.0.0 (tilde), >=1.0.0, >1.0.0, <=1.0.0, <1.0.0, 1.0.0 (exact)
 */
export declare function satisfiesVersion(version: string, constraint: string): boolean;
//# sourceMappingURL=semver.d.ts.map