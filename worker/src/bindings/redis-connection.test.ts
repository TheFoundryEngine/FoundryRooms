import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRedisConnection, RedisUrlMissingError } from './redis-connection';

describe('createRedisConnection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.REDIS_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('reads REDIS_URL from env', () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    const conn = createRedisConnection();
    expect(conn.options.host).toBe('localhost');
    expect(conn.options.port).toBe(6379);
    conn.disconnect();
  });

  it('throws a clear error if REDIS_URL is missing', () => {
    expect(() => createRedisConnection()).toThrow(RedisUrlMissingError);
    expect(() => createRedisConnection()).toThrow(/REDIS_URL/);
  });

  it('accepts an explicit url override', () => {
    const conn = createRedisConnection('redis://redis:6380');
    expect(conn.options.host).toBe('redis');
    expect(conn.options.port).toBe(6380);
    conn.disconnect();
  });

  it('prefers explicit url over env', () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    const conn = createRedisConnection('redis://override:6390');
    expect(conn.options.host).toBe('override');
    conn.disconnect();
  });
});
