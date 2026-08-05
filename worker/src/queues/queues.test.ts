import { describe, it, expect } from 'vitest';
import { QueueNames, ALL_QUEUE_NAMES } from './queue-names';
import { createQueueFactory } from './queue-factory';

describe('QueueNames', () => {
  it('defines each queue name as a constant (no magic strings)', () => {
    expect(QueueNames.NOTIFICATIONS).toBe('notifications');
    expect(QueueNames.COMMERCE).toBe('commerce');
    expect(QueueNames.EVENTS).toBe('events');
    expect(QueueNames.IDENTITY_ACCESS).toBe('identity-access');
  });

  it('defines exactly 4 queues', () => {
    expect(ALL_QUEUE_NAMES).toHaveLength(4);
    expect(ALL_QUEUE_NAMES).toEqual(
      expect.arrayContaining([
        'notifications',
        'commerce',
        'events',
        'identity-access',
      ]),
    );
  });

  it('queue name constants are readonly string literals', () => {
    // Each value is a primitive string, not an object or symbol
    for (const name of ALL_QUEUE_NAMES) {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });
});

describe('createQueueFactory', () => {
  it('creates a BullMQ Queue for each queue name', () => {
    const factory = createQueueFactory({
      connection: { host: 'localhost', port: 6379 },
    });

    const notifications = factory.getQueue(QueueNames.NOTIFICATIONS);
    const commerce = factory.getQueue(QueueNames.COMMERCE);

    expect(notifications).toBeDefined();
    expect(notifications.name).toBe(QueueNames.NOTIFICATIONS);
    expect(commerce).toBeDefined();
    expect(commerce.name).toBe(QueueNames.COMMERCE);
  });

  it('returns the same instance for repeated calls (cached)', () => {
    const factory = createQueueFactory({
      connection: { host: 'localhost', port: 6379 },
    });

    const a = factory.getQueue(QueueNames.EVENTS);
    const b = factory.getQueue(QueueNames.EVENTS);
    expect(a).toBe(b);
  });

  it('creates queues for all defined queue names', () => {
    const factory = createQueueFactory({
      connection: { host: 'localhost', port: 6379 },
    });

    for (const name of ALL_QUEUE_NAMES) {
      const queue = factory.getQueue(name);
      expect(queue.name).toBe(name);
    }
  });
});
