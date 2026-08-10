/**
 * InMemoryRateLimitStore eviction tests (THE-65 / #26).
 *
 * The store previously retained every ip:path key forever — expired windows
 * were reset in place on re-access but never removed, so memory grew
 * unbounded with the number of distinct clients. These tests pin the
 * eviction behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InMemoryRateLimitStore } from './rate-limit.middleware';

describe('InMemoryRateLimitStore eviction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sweep removes expired windows', () => {
    const store = new InMemoryRateLimitStore();
    store.increment('1.1.1.1:/auth/login', 1000);
    store.increment('2.2.2.2:/auth/login', 1000);
    expect(store.size).toBe(2);

    vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 2)); // both windows expired
    store.sweep();

    expect(store.size).toBe(0);
    store.onModuleDestroy();
  });

  it('sweep keeps windows that are still active', () => {
    const store = new InMemoryRateLimitStore();
    store.increment('short:/auth/login', 1000);
    store.increment('long:/auth/login', 60_000);

    vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 2)); // only 'short' expired
    store.sweep();

    expect(store.size).toBe(1);
    // The surviving window keeps its count
    expect(store.increment('long:/auth/login', 60_000).count).toBe(2);
    store.onModuleDestroy();
  });

  it('expired entries are evicted by the periodic timer without any access', () => {
    const store = new InMemoryRateLimitStore();
    store.increment('a:/auth/login', 1000);
    store.increment('b:/auth/login', 1000);

    // Nothing touches the store again; the interval alone must evict.
    vi.advanceTimersByTime(61_000);

    expect(store.size).toBe(0);
    store.onModuleDestroy();
  });

  it('does not accumulate distinct keys past their expiry', () => {
    const store = new InMemoryRateLimitStore();
    for (let i = 0; i < 1000; i++) {
      store.increment(`10.0.${Math.floor(i / 256)}.${i % 256}:/auth/login`, 1000);
    }
    expect(store.size).toBe(1000);

    vi.advanceTimersByTime(61_000);

    expect(store.size).toBe(0);
    store.onModuleDestroy();
  });

  it('onModuleDestroy stops the sweep timer', () => {
    const store = new InMemoryRateLimitStore();
    store.increment('a:/auth/login', 1000);
    store.onModuleDestroy();

    // Timer cleared: advancing time no longer sweeps.
    vi.advanceTimersByTime(120_000);
    expect(store.size).toBe(1);

    // Manual sweep still works.
    store.sweep();
    expect(store.size).toBe(0);
  });
});
