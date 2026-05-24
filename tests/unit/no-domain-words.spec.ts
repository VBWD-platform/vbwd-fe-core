/**
 * Sprint 06 — the shared library is domain-agnostic.
 *
 * vbwd-view-component must expose NO subscription-specific public API. The
 * subscription store, useFeatureAccess composable, FeatureGate/UsageLimit
 * components, and SUBSCRIPTION_* events were dead (zero org-wide consumers)
 * and were removed. This fence keeps the public surface subscription-free.
 */
import { describe, it, expect } from 'vitest'

import * as lib from '../../src/index'

const FORBIDDEN = [
  'useSubscriptionStore',
  'useFeatureAccess',
  'FeatureGate',
  'UsageLimit',
  'SubscriptionPayload',
  'SubscriptionState',
  'SubscriptionStore',
  'FeatureUsage',
]

describe('vbwd-view-component public API — domain-agnostic', () => {
  it.each(FORBIDDEN)('does not export %s', (name) => {
    expect(name in lib).toBe(false)
  })

  it('AppEvents has no SUBSCRIPTION_* constants', () => {
    const events = (lib as Record<string, unknown>).AppEvents as
      | Record<string, string>
      | undefined
    expect(events).toBeTruthy()
    const subKeys = Object.keys(events ?? {}).filter((k) =>
      k.startsWith('SUBSCRIPTION_'),
    )
    expect(subKeys).toEqual([])
  })
})
