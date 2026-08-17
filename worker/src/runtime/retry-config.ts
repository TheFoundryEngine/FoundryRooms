/**
 * Retry configuration with exponential backoff.
 *
 * Failed jobs are retried with exponentially increasing delays so that
 * transient failures (Redis blips, downstream 503s) self-heal without
 * hammering dependencies. After exhausting attempts, jobs move to the
 * dead-letter queue for inspection.
 */
export interface RetryConfig {
  /** Maximum number of attempts (including the first try). */
  attempts: number;
  /** Backoff strategy. */
  type: 'exponential' | 'fixed';
  /** Base delay in ms for the first retry. */
  baseDelayMs: number;
  /** Upper bound on a single backoff delay in ms. */
  maxDelayMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: 3,
  type: 'exponential',
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
};

/**
 * Computes the backoff delay for a given 1-based attempt number.
 * Exponential: base * 2^(attempt-1), capped at maxDelayMs.
 */
export function backoffDelayMs(attempt: number, cfg: RetryConfig): number {
  if (cfg.type === 'fixed') {
    return Math.min(cfg.baseDelayMs, cfg.maxDelayMs);
  }
  const delay = cfg.baseDelayMs * Math.pow(2, attempt - 1);
  return Math.min(delay, cfg.maxDelayMs);
}

/** Converts the config into the shape BullMQ's `retry` option expects. */
export function toBullMQRetry(cfg: RetryConfig): {
  attempts: number;
  backoff: { type: 'exponential' | 'fixed'; delay: number };
} {
  return {
    attempts: cfg.attempts,
    backoff: { type: cfg.type, delay: cfg.baseDelayMs },
  };
}
