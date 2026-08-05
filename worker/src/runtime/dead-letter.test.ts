import { describe, it, expect, vi } from 'vitest';
import {
  createDeadLetterQueue,
  deadLetterQueueName,
  moveFailedJobToDLQ,
  DEAD_LETTER_SUFFIX,
  type DeadLetterEnqueuer,
  type FailedJobInfo,
} from './dead-letter';

describe('Dead-letter queue naming', () => {
  it('derives a DLQ name by suffixing the source queue', () => {
    expect(deadLetterQueueName('notifications')).toBe('notifications-dlq');
  });

  it('uses the -dlq suffix constant', () => {
    expect(DEAD_LETTER_SUFFIX).toBe('-dlq');
  });
});

describe('moveFailedJobToDLQ', () => {
  it('enqueues the failed job data onto the DLQ with the original jobId', async () => {
    const add = vi.fn().mockResolvedValue({});
    const enqueuer: DeadLetterEnqueuer = { add };

    const job: FailedJobInfo = {
      id: 'job-1',
      name: 'notifications.send-welcome-email',
      data: { userId: 'abc' },
      attemptsMade: 3,
      failedReason: 'boom',
      stacktrace: ['line1'],
    };

    await moveFailedJobToDLQ(enqueuer, job);

    expect(add).toHaveBeenCalledTimes(1);
    const call = add.mock.calls[0];
    expect(call).toBeDefined();
    const [name, data, opts] = call as [string, unknown, { jobId: string }];
    expect(name).toBe('notifications.send-welcome-email');
    expect(opts).toEqual({ jobId: 'job-1' });
    expect(data).toMatchObject({
      originalData: { userId: 'abc' },
      attemptsMade: 3,
      failedReason: 'boom',
      stacktrace: ['line1'],
    });
    expect((data as { movedAt: string }).movedAt).toEqual(expect.any(String));
  });
});

describe('createDeadLetterQueue', () => {
  it('creates a DLQ with the derived name', () => {
    // Construction does not connect to Redis eagerly in BullMQ.
    const dlq = createDeadLetterQueue('events', {
      connection: { host: 'localhost', port: 6379 },
    });
    expect(dlq.name).toBe('events-dlq');
  });
});
