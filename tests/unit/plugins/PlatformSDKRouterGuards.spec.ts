import { describe, it, expect, vi } from 'vitest';
import { PlatformSDK } from '../../../src/plugins/PlatformSDK';
import type { INavigationGuard } from '../../../src/plugins/types';

describe('PlatformSDK — router guards', () => {
  it('starts with an empty guard list', () => {
    const sdk = new PlatformSDK();
    expect(sdk.getRouterGuards()).toEqual([]);
  });

  it('registers a guard via addRouterGuard', () => {
    const sdk = new PlatformSDK();
    const guard: INavigationGuard = () => undefined;
    sdk.addRouterGuard(guard);
    expect(sdk.getRouterGuards()).toEqual([guard]);
  });

  it('preserves registration order across plugins', () => {
    const sdk = new PlatformSDK();
    const first: INavigationGuard = vi.fn(() => undefined);
    const second: INavigationGuard = vi.fn(() => undefined);
    const third: INavigationGuard = vi.fn(() => undefined);
    sdk.addRouterGuard(first);
    sdk.addRouterGuard(second);
    sdk.addRouterGuard(third);
    expect(sdk.getRouterGuards()).toEqual([first, second, third]);
  });

  it('returns a copy so external mutation does not corrupt the registry', () => {
    const sdk = new PlatformSDK();
    const guard: INavigationGuard = () => undefined;
    sdk.addRouterGuard(guard);
    const snapshot = sdk.getRouterGuards();
    snapshot.length = 0;
    expect(sdk.getRouterGuards()).toEqual([guard]);
  });
});
