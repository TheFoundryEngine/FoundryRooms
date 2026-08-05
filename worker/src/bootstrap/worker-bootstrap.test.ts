import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { createWorkerBootstrap } from './worker-bootstrap';
import { createHandlerRegistry } from '../runtime/handler-registry';
import type { JobHandler } from '../runtime/handler';
import { ALL_QUEUE_NAMES } from '../queues/queue-names';

// ---------------------------------------------------------------------------
// Fake worker runner — records lifecycle without needing Redis
// ---------------------------------------------------------------------------

interface FakeRunner {
  queueName: string;
  started: boolean;
  closed: boolean;
  close: () => Promise<void>;
}

describe('WorkerBootstrap', () => {
  let registry: ReturnType<typeof createHandlerRegistry>;
  let handlers: JobHandler[];

  beforeEach(() => {
    registry = createHandlerRegistry();
    handlers = [
      {
        name: 'notifications.send-welcome-email',
        schema: z.object({ userId: z.string().uuid() }),
        handle: vi.fn(),
      },
      {
        name: 'commerce.entitlement-sync',
        schema: z.object({ entitlementId: z.string().uuid() }),
        handle: vi.fn(),
      },
      {
        name: 'events.event-reminder',
        schema: z.object({ reminderId: z.string().uuid() }),
        handle: vi.fn(),
      },
      {
        name: 'identity-access.invite-expiration',
        schema: z.object({ inviteId: z.string().uuid() }),
        handle: vi.fn(),
      },
    ];
  });

  it('registers all handlers from all bounded contexts', () => {
    const runners: FakeRunner[] = [];
    const bootstrap = createWorkerBootstrap({
      registry,
      handlers,
      queueNames: ALL_QUEUE_NAMES,
      createRunner: (queueName) => {
        const runner: FakeRunner = {
          queueName,
          started: true,
          closed: false,
          close: vi.fn(async () => {
            runner.closed = true;
          }),
        };
        runners.push(runner);
        return runner;
      },
    });

    bootstrap.start();
    expect(registry.names().sort()).toEqual([
      'commerce.entitlement-sync',
      'events.event-reminder',
      'identity-access.invite-expiration',
      'notifications.send-welcome-email',
    ]);
  });

  it('starts a runner for every queue', () => {
    const runners: FakeRunner[] = [];
    const bootstrap = createWorkerBootstrap({
      registry,
      handlers,
      queueNames: ALL_QUEUE_NAMES,
      createRunner: (queueName) => {
        const runner: FakeRunner = {
          queueName,
          started: true,
          closed: false,
          close: vi.fn(async () => {
            runner.closed = true;
          }),
        };
        runners.push(runner);
        return runner;
      },
    });

    bootstrap.start();
    expect(runners).toHaveLength(4);
    expect(runners.map((r) => r.queueName).sort()).toEqual(
      ['commerce', 'events', 'identity-access', 'notifications'],
    );
    expect(runners.every((r) => r.started)).toBe(true);
  });

  it('gracefully shuts down (drains/closes all runners) on shutdown()', async () => {
    const runners: FakeRunner[] = [];
    const bootstrap = createWorkerBootstrap({
      registry,
      handlers,
      queueNames: ALL_QUEUE_NAMES,
      createRunner: (queueName) => {
        const runner: FakeRunner = {
          queueName,
          started: true,
          closed: false,
          close: vi.fn(async () => {
            runner.closed = true;
          }),
        };
        runners.push(runner);
        return runner;
      },
    });

    bootstrap.start();
    await bootstrap.shutdown();
    expect(runners.every((r) => r.closed)).toBe(true);
  });

  it('does not start twice', () => {
    const runners: FakeRunner[] = [];
    const bootstrap = createWorkerBootstrap({
      registry,
      handlers,
      queueNames: ALL_QUEUE_NAMES,
      createRunner: (queueName) => {
        const runner: FakeRunner = {
          queueName,
          started: true,
          closed: false,
          close: vi.fn(async () => {
            runner.closed = true;
          }),
        };
        runners.push(runner);
        return runner;
      },
    });

    bootstrap.start();
    expect(() => bootstrap.start()).toThrow(/already started/);
  });
});
