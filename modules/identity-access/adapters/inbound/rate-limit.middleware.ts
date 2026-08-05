/**
 * Rate Limit Middleware
 *
 * Provides rate limiting for auth endpoints (login, register, refresh,
 * password reset) to prevent brute-force attacks.
 *
 * Uses an in-memory Map-based store. Configurable window size and max requests.
 * Returns 429 with a Retry-After header when the limit is exceeded.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Optional,
  Inject,
} from '@nestjs/common';
import type { Request, Response } from 'express';

// ============================================================================
// Rate Limit Store
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

/**
 * In-memory rate limit store using a Map.
 * Tracks request counts per key with a sliding window.
 */
@Injectable()
export class InMemoryRateLimitStore {
  private readonly entries = new Map<string, RateLimitEntry>();

  /**
   * Increments the count for a key, resetting if the window has expired.
   *
   * @param key - The rate limit key (e.g. "ip:endpoint")
   * @param windowMs - The window duration in milliseconds
   * @returns The current count and reset time for the key
   */
  increment(key: string, windowMs: number): { count: number; resetAt: Date } {
    const now = new Date();
    const entry = this.entries.get(key);

    if (!entry || now >= entry.resetAt) {
      // Start a new window
      const resetAt = new Date(now.getTime() + windowMs);
      const newEntry: RateLimitEntry = { count: 1, resetAt };
      this.entries.set(key, newEntry);
      return { count: 1, resetAt };
    }

    entry.count += 1;
    return { count: entry.count, resetAt: entry.resetAt };
  }

  /**
   * Deletes a key from the store.
   *
   * @param key - The rate limit key to remove
   */
  delete(key: string): void {
    this.entries.delete(key);
  }

  /**
   * Clears all entries from the store.
   */
  clear(): void {
    this.entries.clear();
  }
}

// ============================================================================
// Configuration
// ============================================================================

export interface RateLimitOptions {
  /** Time window in milliseconds (default: 60000 = 60s) */
  windowMs?: number;
  /** Maximum requests per window (default: 10 for auth endpoints) */
  maxRequests?: number;
}

const DEFAULT_OPTIONS: Required<RateLimitOptions> = {
  windowMs: 60 * 1000,
  maxRequests: 10,
};

// ============================================================================
// Injection Tokens
// ============================================================================

export const RATE_LIMIT_OPTIONS = Symbol('RATE_LIMIT_OPTIONS');

// ============================================================================
// Rate Limit Guard
// ============================================================================

/**
 * NestJS guard that enforces rate limiting per IP and per endpoint.
 *
 * Apply to auth endpoints (login, register, refresh, password reset)
 * to prevent brute-force attacks.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store: InMemoryRateLimitStore;
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(
    store: InMemoryRateLimitStore,
    @Optional() @Inject(RATE_LIMIT_OPTIONS) options?: RateLimitOptions,
  ) {
    this.store = store;
    this.windowMs = options?.windowMs ?? DEFAULT_OPTIONS.windowMs;
    this.maxRequests = options?.maxRequests ?? DEFAULT_OPTIONS.maxRequests;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const ip = request.ip ?? 'unknown';
    const path = request.path ?? request.url ?? 'unknown';
    const key = `${ip}:${path}`;

    const { count, resetAt } = this.store.increment(key, this.windowMs);

    // Set rate limit headers
    const remaining = Math.max(0, this.maxRequests - count);
    response.set('X-RateLimit-Limit', String(this.maxRequests));
    response.set('X-RateLimit-Remaining', String(remaining));
    response.set('X-RateLimit-Reset', String(Math.ceil(resetAt.getTime() / 1000)));

    if (count > this.maxRequests) {
      const retryAfterSec = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
      response.set('Retry-After', String(Math.max(1, retryAfterSec)));

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }
}
