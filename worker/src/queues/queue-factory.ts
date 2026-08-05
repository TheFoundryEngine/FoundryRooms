/**
 * Queue factory — creates and caches BullMQ Queue instances per queue name.
 */
import { Queue, QueueOptions } from 'bullmq';
import { QueueName, ALL_QUEUE_NAMES } from './queue-names';

export interface QueueFactoryOptions {
  connection: QueueOptions['connection'];
  defaultJobOptions?: QueueOptions['defaultJobOptions'];
}

export interface QueueFactory {
  getQueue(name: QueueName): Queue;
  allQueues(): Queue[];
  close(): Promise<void>;
}

export function createQueueFactory(opts: QueueFactoryOptions): QueueFactory {
  const queues = new Map<QueueName, Queue>();

  function getQueue(name: QueueName): Queue {
    let queue = queues.get(name);
    if (!queue) {
      queue = new Queue(name, {
        connection: opts.connection,
        defaultJobOptions: opts.defaultJobOptions,
      });
      queues.set(name, queue);
    }
    return queue;
  }

  function allQueues(): Queue[] {
    return ALL_QUEUE_NAMES.map((n) => getQueue(n));
  }

  async function close(): Promise<void> {
    await Promise.all(
      Array.from(queues.values()).map((q) => q.close()),
    );
    queues.clear();
  }

  return { getQueue, allQueues, close };
}
