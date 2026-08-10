/**
 * Rate Limit Middleware Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { RateLimitGuard, InMemoryRateLimitStore } from './rate-limit.middleware';
import type { Request, Response } from 'express';

// ============================================================================
// Helpers
// ============================================================================

function createMockRequest(overrides: Record<string, unknown> = {}): Request {
  return {
    ip: '127.0.0.1',
    method: 'POST',
    path: '/auth/login',
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function createMockResponse(): Response {
  const res: Record<string, unknown> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.set = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as unknown as Response;
}

function createMockExecutionContext(request: Request, response?: Response): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response ?? createMockResponse(),
    }),
    getClass: vi.fn(),
    getHandler: vi.fn(),
    getArgs: vi.fn(),
    getArgByIndex: vi.fn(),
    switchToRpc: vi.fn(),
    switchToWs: vi.fn(),
    getType: vi.fn(),
  } as unknown as ExecutionContext;
}

// ============================================================================
// InMemoryRateLimitStore Tests
// ============================================================================

describe('InMemoryRateLimitStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should increment count for a key', () => {
    const store = new InMemoryRateLimitStore();
    const key = '127.0.0.1:/auth/login';

    const result = store.increment(key, 60000);

    expect(result.count).toBe(1);
  });

  it('should increment count multiple times for same key', () => {
    const store = new InMemoryRateLimitStore();
    const key = '127.0.0.1:/auth/login';

    store.increment(key, 60000);
    store.increment(key, 60000);
    const result = store.increment(key, 60000);

    expect(result.count).toBe(3);
  });

  it('should track reset time for a key', () => {
    const store = new InMemoryRateLimitStore();
    const key = '127.0.0.1:/auth/login';
    const now = new Date(2024, 0, 1, 0, 0, 0);
    vi.setSystemTime(now);

    const result = store.increment(key, 60000);

    const expectedReset = new Date(now.getTime() + 60000);
    expect(result.resetAt).toEqual(expectedReset);
  });

  it('should reset count after time window expires', () => {
    const store = new InMemoryRateLimitStore();
    const key = '127.0.0.1:/auth/login';
    const now = new Date(2024, 0, 1, 0, 0, 0);
    vi.setSystemTime(now);

    store.increment(key, 60000);
    store.increment(key, 60000);

    // Advance past the window
    vi.setSystemTime(new Date(now.getTime() + 61000));

    const result = store.increment(key, 60000);

    expect(result.count).toBe(1);
  });

  it('should track keys independently', () => {
    const store = new InMemoryRateLimitStore();

    store.increment('127.0.0.1:/auth/login', 60000);
    store.increment('127.0.0.1:/auth/login', 60000);
    store.increment('192.168.1.1:/auth/login', 60000);

    expect(store.increment('127.0.0.1:/auth/login', 60000).count).toBe(3);
    expect(store.increment('192.168.1.1:/auth/login', 60000).count).toBe(2);
  });

  it('should delete a key', () => {
    const store = new InMemoryRateLimitStore();
    const key = '127.0.0.1:/auth/login';

    store.increment(key, 60000);
    store.delete(key);

    const result = store.increment(key, 60000);
    expect(result.count).toBe(1);
  });
});

// ============================================================================
// RateLimitGuard Tests
// ============================================================================

describe('RateLimitGuard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests under the limit', async () => {
    const start = new Date(2024, 0, 1, 0, 0, 0);
    vi.setSystemTime(start);

    const guard = new RateLimitGuard(new InMemoryRateLimitStore(), {
      windowMs: 60000,
      maxRequests: 10,
    });

    for (let i = 0; i < 9; i++) {
      const req = createMockRequest();
      const context = createMockExecutionContext(req);
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    }
  });

  it('should allow request exactly at the limit', async () => {
    const start = new Date(2024, 0, 1, 0, 0, 0);
    vi.setSystemTime(start);

    const guard = new RateLimitGuard(new InMemoryRateLimitStore(), {
      windowMs: 60000,
      maxRequests: 5,
    });

    for (let i = 0; i < 5; i++) {
      const req = createMockRequest();
      const context = createMockExecutionContext(req);
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    }
  });

  it('should block requests over the limit with 429', async () => {
    const start = new Date(2024, 0, 1, 0, 0, 0);
    vi.setSystemTime(start);

    const guard = new RateLimitGuard(new InMemoryRateLimitStore(), {
      windowMs: 60000,
      maxRequests: 3,
    });

    // Use up the limit
    for (let i = 0; i < 3; i++) {
      const req = createMockRequest();
      const context = createMockExecutionContext(req);
      await guard.canActivate(context);
    }

    // This one should be blocked
    const req = createMockRequest();
    const res = createMockResponse();
    const context = createMockExecutionContext(req, res);

    let thrownError: unknown;
    try {
      await guard.canActivate(context);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(HttpException);
    expect((thrownError as HttpException).getStatus()).toBe(429);
  });

  it('should set Retry-After header when blocked', async () => {
    const start = new Date(2024, 0, 1, 0, 0, 0);
    vi.setSystemTime(start);

    const guard = new RateLimitGuard(new InMemoryRateLimitStore(), {
      windowMs: 60000,
      maxRequests: 2,
    });

    // Use up the limit
    for (let i = 0; i < 2; i++) {
      const req = createMockRequest();
      const context = createMockExecutionContext(req);
      await guard.canActivate(context);
    }

    const req = createMockRequest();
    const res = createMockResponse();
    const context = createMockExecutionContext(req, res);

    await expect(guard.canActivate(context)).rejects.toThrow();
    expect(res.set).toHaveBeenCalledWith(
      'Retry-After',
      expect.any(String)
    );
  });

  it('should reset after the time window passes', async () => {
    const start = new Date(2024, 0, 1, 0, 0, 0);
    vi.setSystemTime(start);

    const guard = new RateLimitGuard(new InMemoryRateLimitStore(), {
      windowMs: 60000,
      maxRequests: 3,
    });

    // Use up the limit
    for (let i = 0; i < 3; i++) {
      const req = createMockRequest();
      const context = createMockExecutionContext(req);
      await guard.canActivate(context);
    }

    // Advance past the window
    vi.setSystemTime(new Date(start.getTime() + 61000));

    // Should be allowed again
    const req = createMockRequest();
    const context = createMockExecutionContext(req);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should track per-IP independently', async () => {
    const start = new Date(2024, 0, 1, 0, 0, 0);
    vi.setSystemTime(start);

    const guard = new RateLimitGuard(new InMemoryRateLimitStore(), {
      windowMs: 60000,
      maxRequests: 2,
    });

    // IP 1 uses up its limit
    for (let i = 0; i < 2; i++) {
      const req = createMockRequest({ ip: '10.0.0.1' });
      const context = createMockExecutionContext(req);
      await guard.canActivate(context);
    }

    // IP 2 should still be allowed
    const req = createMockRequest({ ip: '10.0.0.2' });
    const context = createMockExecutionContext(req);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should track per-endpoint independently', async () => {
    const start = new Date(2024, 0, 1, 0, 0, 0);
    vi.setSystemTime(start);

    const guard = new RateLimitGuard(new InMemoryRateLimitStore(), {
      windowMs: 60000,
      maxRequests: 2,
    });

    // /auth/login uses up its limit
    for (let i = 0; i < 2; i++) {
      const req = createMockRequest({ ip: '10.0.0.1', path: '/auth/login' });
      const context = createMockExecutionContext(req);
      await guard.canActivate(context);
    }

    // /auth/register from same IP should still be allowed
    const req = createMockRequest({ ip: '10.0.0.1', path: '/auth/register' });
    const context = createMockExecutionContext(req);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should use default config when no options provided', async () => {
    const guard = new RateLimitGuard(new InMemoryRateLimitStore());

    // Default max is 10, so 5 requests should all pass
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest();
      const context = createMockExecutionContext(req);
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    }
  });
});
