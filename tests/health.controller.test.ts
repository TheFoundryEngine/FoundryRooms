/**
 * Health controller tests (THE-70 / #31).
 *
 * The previous health endpoint returned `ok` unconditionally — a DB-less
 * instance stayed in Render's rotation. These tests pin the readiness
 * contract: db reachable → 200 shape, db failing or hanging → 503.
 */

import { describe, it, expect, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController, type Queryable } from '../src/health.controller';

function controllerWith(db: Queryable, timeoutMs?: number): HealthController {
  return new HealthController(db, timeoutMs);
}

describe('HealthController', () => {
  describe('live', () => {
    it('reports ok without touching the database', () => {
      const execute = vi.fn();
      const result = controllerWith({ execute }).live();

      expect(result.status).toBe('ok');
      expect(execute).not.toHaveBeenCalled();
    });
  });

  describe('ready', () => {
    it('reports ok when the database answers', async () => {
      const db: Queryable = { execute: vi.fn().mockResolvedValue([{ '?column?': 1 }]) };

      const result = await controllerWith(db).ready();

      expect(result.status).toBe('ok');
      expect(result.db).toBe('ok');
      expect(db.execute).toHaveBeenCalledTimes(1);
    });

    it('throws 503 when the database query fails', async () => {
      const db: Queryable = { execute: vi.fn().mockRejectedValue(new Error('connection refused')) };

      await expect(controllerWith(db).ready()).rejects.toThrow(ServiceUnavailableException);
    });

    it('throws 503 when the database hangs past the timeout', async () => {
      const db: Queryable = { execute: vi.fn().mockReturnValue(new Promise(() => {})) };

      // 50ms probe timeout so the test stays fast
      await expect(controllerWith(db, 50).ready()).rejects.toThrow(ServiceUnavailableException);
    });

    it('does not leak database error details in the 503 body', async () => {
      const db: Queryable = {
        execute: vi.fn().mockRejectedValue(new Error('password authentication failed for user "foundry"')),
      };

      try {
        await controllerWith(db).ready();
        expect.unreachable('ready() should have thrown');
      } catch (err) {
        const body = JSON.stringify((err as ServiceUnavailableException).getResponse());
        expect(body).not.toContain('password');
        expect(body).toContain('unreachable');
      }
    });
  });
});
