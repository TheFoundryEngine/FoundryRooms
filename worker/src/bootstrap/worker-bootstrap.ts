/**
 * Worker bootstrap — orchestrates worker startup and graceful shutdown.
 *
 * Responsibilities:
 *  - register every handler from every bounded context into the registry
 *  - start one runner per queue
 *  - drain/close all runners on shutdown (SIGTERM/SIGINT)
 *
 * The runner factory is injected so the bootstrap is testable without a
 * live Redis connection. In production the runner is a BullMQ Worker that
 * dispatches jobs to handlers via the registry.
 */
import type { HandlerRegistry } from '../runtime/handler-registry';
import type { JobHandler, HandlerContext } from '../runtime/handler';
import { validatePayload } from '../runtime/handler';
import type { QueueName } from '../queues/queue-names';

/** A runner consumes one queue. Injected so tests can fake it. */
export interface QueueRunner {
  readonly queueName: string;
  close(): Promise<void>;
}

export interface CreateRunnerDeps {
  registry: HandlerRegistry;
  createContext: (job: { id?: string; name: string }) => HandlerContext;
}

export interface WorkerBootstrapOptions {
  registry: HandlerRegistry;
  handlers: JobHandler<unknown, unknown>[];
  queueNames: readonly QueueName[];
  /** Creates a runner for a queue. Injected for testability. */
  createRunner: (queueName: QueueName, deps: CreateRunnerDeps) => QueueRunner;
  createContext?: (job: { id?: string; name: string }) => HandlerContext;
}

export interface WorkerBootstrap {
  start(): void;
  shutdown(): Promise<void>;
  isRunning(): boolean;
}

export function createWorkerBootstrap(
  opts: WorkerBootstrapOptions,
): WorkerBootstrap {
  const { registry, handlers, queueNames, createRunner } = opts;
  const createContext =
    opts.createContext ??
    (() => ({
      logger: console as unknown as HandlerContext['logger'],
    }));

  let runners: QueueRunner[] = [];
  let started = false;

  function start(): void {
    if (started) {
      throw new Error('Worker bootstrap has already started.');
    }
    // Register all handlers from every bounded context.
    for (const handler of handlers) {
      registry.register(handler);
    }
    // Start one runner per queue.
    runners = queueNames.map((queueName) =>
      createRunner(queueName, { registry, createContext }),
    );
    started = true;
  }

  async function shutdown(): Promise<void> {
    if (!started) {
      return;
    }
    await Promise.all(runners.map((r) => r.close()));
    runners = [];
    started = false;
  }

  return {
    start,
    shutdown,
    isRunning: () => started,
  };
}

/**
 * Dispatches a single job to its registered handler.
 *
 * Validates the payload with the handler's zod schema before delegating to
 * the application service. Used by the BullMQ runner adapter.
 */
export async function dispatchJob(
  registry: HandlerRegistry,
  job: { id?: string; name: string; data: unknown },
  createContext: (job: { id?: string; name: string }) => HandlerContext,
): Promise<unknown> {
  const handler = registry.get(job.name);
  const payload = validatePayload(handler, job.data);
  const ctx = createContext(job);
  return handler.handle(payload, ctx);
}
