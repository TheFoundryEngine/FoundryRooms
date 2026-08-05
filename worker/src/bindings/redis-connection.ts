/**
 * Redis connection binding.
 *
 * Reads REDIS_URL from the environment and returns an ioredis instance
 * suitable for use as a BullMQ connection. Throws a clear, typed error
 * when REDIS_URL is missing rather than failing opaquely later.
 */
import IORedis, { type RedisOptions } from 'ioredis';

export class RedisUrlMissingError extends Error {
  constructor() {
    super(
      'REDIS_URL environment variable is required but was not set. ' +
        'Set REDIS_URL (e.g. redis://localhost:6379) and try again.',
    );
    this.name = 'RedisUrlMissingError';
  }
}

export function createRedisConnection(url?: string, opts?: RedisOptions): IORedis {
  const resolvedUrl = url ?? process.env.REDIS_URL;
  if (!resolvedUrl) {
    throw new RedisUrlMissingError();
  }
  return new IORedis(resolvedUrl, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
    ...opts,
  });
}
