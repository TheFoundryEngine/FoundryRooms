import { describe, it, expect, vi } from 'vitest';
import { collectQueueMetrics, collectQueueMetricsWithTotals } from './metrics';

describe('collectQueueMetrics', () => {
  it('reports waiting, active, completed, failed, and delayed counts per queue', async () => {
    const counts = {
      waiting: 5,
      active: 2,
      completed: 100,
      failed: 3,
      delayed: 1,
    };
    const queues = [
      { name: 'notifications', getJobCounts: vi.fn().mockResolvedValue(counts) },
      { name: 'commerce', getJobCounts: vi.fn().mockResolvedValue(counts) },
    ] as never;

    const metrics = await collectQueueMetrics(queues);

    expect(metrics).toHaveLength(2);
    expect(metrics[0]).toEqual({
      queue: 'notifications',
      waiting: 5,
      active: 2,
      completed: 100,
      failed: 3,
      delayed: 1,
    });
    expect(metrics[1]?.queue).toBe('commerce');
  });

  it('aggregates totals across all queues', async () => {
    const counts = {
      waiting: 1,
      active: 1,
      completed: 1,
      failed: 1,
      delayed: 1,
    };
    const queues = [
      { name: 'a', getJobCounts: vi.fn().mockResolvedValue(counts) },
      { name: 'b', getJobCounts: vi.fn().mockResolvedValue(counts) },
    ] as never;

    const { totals } = await collectQueueMetricsWithTotals(queues);
    expect(totals).toEqual({
      waiting: 2,
      active: 2,
      completed: 2,
      failed: 2,
      delayed: 2,
    });
  });
});
