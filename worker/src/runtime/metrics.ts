/**
 * Queue metrics — collects depth and processing stats per queue.
 *
 * Used by observability/health endpoints to surface queue backpressure.
 * Reads from BullMQ's `getJobCounts()` which returns a snapshot of job
 * counts by state.
 */

export interface QueueMetric {
  queue: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export interface QueueCountsSource {
  name: string;
  getJobCounts(): Promise<Record<string, number>>;
}

export async function collectQueueMetrics(
  queues: QueueCountsSource[],
): Promise<QueueMetric[]> {
  const results: QueueMetric[] = [];
  for (const queue of queues) {
    const counts = await queue.getJobCounts();
    results.push({
      queue: queue.name,
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
    });
  }
  return results;
}

export interface QueueMetricsWithTotals {
  perQueue: QueueMetric[];
  totals: Omit<QueueMetric, 'queue'>;
}

export async function collectQueueMetricsWithTotals(
  queues: QueueCountsSource[],
): Promise<QueueMetricsWithTotals> {
  const perQueue = await collectQueueMetrics(queues);
  const totals = perQueue.reduce(
    (acc, m) => ({
      waiting: acc.waiting + m.waiting,
      active: acc.active + m.active,
      completed: acc.completed + m.completed,
      failed: acc.failed + m.failed,
      delayed: acc.delayed + m.delayed,
    }),
    { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
  );
  return { perQueue, totals };
}
