import { describe, it, expect } from 'vitest';
import {
  DEFAULT_RETRY_CONFIG,
  backoffDelayMs,
  toBullMQRetry,
} from './retry-config';

describe('DEFAULT_RETRY_CONFIG', () => {
  it('defaults to 3 attempts', () => {
    expect(DEFAULT_RETRY_CONFIG.attempts).toBe(3);
  });

  it('uses exponential backoff with a base of 1000ms', () => {
    expect(DEFAULT_RETRY_CONFIG.type).toBe('exponential');
    expect(DEFAULT_RETRY_CONFIG.baseDelayMs).toBe(1000);
  });

  it('caps backoff at 30 seconds', () => {
    expect(DEFAULT_RETRY_CONFIG.maxDelayMs).toBe(30_000);
  });
});

describe('backoffDelayMs', () => {
  it('returns base delay for attempt 1', () => {
    expect(backoffDelayMs(1, DEFAULT_RETRY_CONFIG)).toBe(1000);
  });

  it('doubles the delay for each subsequent attempt (exponential)', () => {
    expect(backoffDelayMs(2, DEFAULT_RETRY_CONFIG)).toBe(2000);
    expect(backoffDelayMs(3, DEFAULT_RETRY_CONFIG)).toBe(4000);
    expect(backoffDelayMs(4, DEFAULT_RETRY_CONFIG)).toBe(8000);
  });

  it('never exceeds the max delay cap', () => {
    // 2^15 * 1000 would be huge, but cap is 30s
    expect(backoffDelayMs(15, DEFAULT_RETRY_CONFIG)).toBe(30_000);
  });
});

describe('toBullMQRetry', () => {
  it('produces a BullMQ-compatible retry object', () => {
    const retry = toBullMQRetry(DEFAULT_RETRY_CONFIG);
    expect(retry.attempts).toBe(3);
    expect(retry.backoff).toEqual({
      type: 'exponential',
      delay: 1000,
    });
  });
});
