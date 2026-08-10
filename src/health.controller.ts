/**
 * Health endpoints (THE-70 / #31).
 *
 * Liveness and readiness are different questions:
 * - `GET /health/live`  — is the process up? No dependencies touched.
 * - `GET /health/ready` — can this instance actually serve? Probes the
 *   database with a cheap `SELECT 1` under a short timeout and returns
 *   503 when it fails.
 *
 * Render's health check must point at readiness: the previous endpoint
 * returned `ok` unconditionally, so an instance that lost its database
 * stayed in rotation — combined with auth middleware behavior that meant
 * a DB outage presented as "everyone got logged out" with green health.
 *
 * `GET /auth/health` is kept as an alias for readiness so existing
 * monitors and the currently-deployed Render health check keep working
 * while render.yaml migrates to /health/ready.
 */

import {
  Controller,
  Get,
  Inject,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';

/** Minimal surface this controller needs from the database handle. */
export interface Queryable {
  execute(query: unknown): Promise<unknown>;
}

/** Injection token for overriding the probe timeout (tests). */
export const READINESS_TIMEOUT_MS = Symbol('READINESS_TIMEOUT_MS');

const DEFAULT_READINESS_TIMEOUT_MS = 2_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`readiness probe timed out after ${ms}ms`)),
      ms,
    );
    timer.unref?.();
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

@Controller()
export class HealthController {
  private readonly timeoutMs: number;

  constructor(
    @Inject('PG_POOL') private readonly db: Queryable,
    @Optional() @Inject(READINESS_TIMEOUT_MS) timeoutMs?: number,
  ) {
    this.timeoutMs = timeoutMs ?? DEFAULT_READINESS_TIMEOUT_MS;
  }

  /** Process is up. Never touches dependencies. */
  @Get('health/live')
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Instance can serve: database reachable within the timeout.
   * `auth/health` is a compatibility alias (previous health path, still
   * referenced by the deployed Render config).
   */
  @Get(['health/ready', 'auth/health'])
  async ready() {
    try {
      await withTimeout(this.db.execute(sql`select 1`), this.timeoutMs);
    } catch {
      // Non-200 takes the instance out of rotation; details stay in logs,
      // not in the public response.
      throw new ServiceUnavailableException({
        status: 'unavailable',
        db: 'unreachable',
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'ok',
      db: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
