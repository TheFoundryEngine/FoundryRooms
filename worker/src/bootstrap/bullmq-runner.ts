/**
 * BullMQ runner adapter — wires a BullMQ Worker to the handler registry.
 *
 * This is the production runner used by the bootstrap. It creates a Worker
 * per queue that dispatches incoming jobs to registered handlers via
 * `dispatchJob`. Failed jobs that exhaust retries are moved to the
 * dead-letter queue.
 */
import { Worker, WorkerOptions } from 'bullmq';
import type { QueueName } from '../queues/queue-names';
import { dispatchJob, type QueueRunner, type CreateRunnerDeps } from './worker-bootstrap';
import { createDeadLetterQueue } from '../runtime/dead-letter';
import { DEFAULT_RETRY_CONFIG, toBullMQRetry } from '../runtime/retry-config';

export interface BullMQRunnerOptions {
  connection: WorkerOptions['connection'];
  concurrency?: number;
}

export function createBullMQRunner(
  queueName: QueueName,
  deps: CreateRunnerDeps,
  opts: BullMQRunnerOptions,
): QueueRunner {
  const dlq = createDeadLetterQueue(queueName, { connection: opts.connection });
  const retry = toBullMQRetry(DEFAULT_RETRY_CONFIG);

  const worker = new Worker(
    queueName,
    async (job) => {
      return dispatchJob(deps.registry, job, deps.createContext);
    },
    {
      connection: opts.connection,
      concurrency: opts.concurrency ?? 8,
    },
  );

  worker.on('failed', async (job, err) => {
    if (job && job.attemptsMade >= retry.attempts) {
      await dlq.moveFailedJob({
        id: job.id ?? '',
        name: job.name,
        data: job.data,
        attemptsMade: job.attemptsMade,
        failedReason: err.message,
        stacktrace: job.stacktrace ?? undefined,
      });
    }
  });

  return {
    queueName,
    async close() {
      await worker.close();
      await dlq.close();
    },
  };
}
