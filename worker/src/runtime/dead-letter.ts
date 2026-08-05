/**
 * Dead-letter queue (DLQ) support.
 *
 * When a job exhausts its retry attempts, it is moved to a per-source
 * dead-letter queue for inspection/replay. This keeps the primary queue
 * healthy while preserving failed jobs for diagnosis.
 */
import { Queue, QueueOptions } from 'bullmq';

export const DEAD_LETTER_SUFFIX = '-dlq';

export function deadLetterQueueName(sourceQueue: string): string {
  return `${sourceQueue}${DEAD_LETTER_SUFFIX}`;
}

export interface FailedJobInfo {
  id: string;
  name: string;
  data: unknown;
  attemptsMade: number;
  failedReason: string;
  stacktrace?: string[];
}

/** Minimal enqueuer abstraction so moveFailedJob is testable without Redis. */
export interface DeadLetterEnqueuer {
  add(
    name: string,
    data: unknown,
    opts: { jobId: string },
  ): Promise<unknown>;
}

export interface DeadLetterQueue {
  readonly name: string;
  moveFailedJob(job: FailedJobInfo): Promise<void>;
  close(): Promise<void>;
}

/**
 * Pure helper: builds the DLQ payload and enqueues it. Exported so it can
 * be unit-tested without a live Redis connection.
 */
export async function moveFailedJobToDLQ(
  enqueuer: DeadLetterEnqueuer,
  job: FailedJobInfo,
): Promise<void> {
  await enqueuer.add(
    job.name,
    {
      originalData: job.data,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      movedAt: new Date().toISOString(),
    },
    { jobId: job.id },
  );
}

export function createDeadLetterQueue(
  sourceQueue: string,
  opts: { connection: QueueOptions['connection'] },
): DeadLetterQueue {
  const name = deadLetterQueueName(sourceQueue);
  const queue = new Queue(name, { connection: opts.connection });

  return {
    name,
    moveFailedJob: (job) => moveFailedJobToDLQ(queue, job),
    close: () => queue.close(),
  };
}
