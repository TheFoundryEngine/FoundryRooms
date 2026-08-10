/**
 * Tests for the HTTP edge configuration (trust proxy + CORS).
 *
 * THE-64 / #25 — trust proxy resolution: only explicit hop counts or false;
 *   `true` is rejected because it makes X-Forwarded-For spoofable.
 * THE-66 / #27 — CORS: wildcard and credentials are never combined; unset
 *   origin in production fails at boot instead of serving a broken config.
 */

import { describe, it, expect } from 'vitest';
import { resolveTrustProxy, buildCorsOptions } from '../src/http-config';

describe('resolveTrustProxy', () => {
  it('defaults to 1 hop in production', () => {
    expect(resolveTrustProxy({ NODE_ENV: 'production' })).toBe(1);
  });

  it('defaults to false outside production', () => {
    expect(resolveTrustProxy({})).toBe(false);
    expect(resolveTrustProxy({ NODE_ENV: 'development' })).toBe(false);
    expect(resolveTrustProxy({ NODE_ENV: 'test' })).toBe(false);
  });

  it('accepts an explicit hop count', () => {
    expect(resolveTrustProxy({ TRUST_PROXY: '0' })).toBe(0);
    expect(resolveTrustProxy({ TRUST_PROXY: '2', NODE_ENV: 'production' })).toBe(2);
  });

  it('accepts an explicit false, overriding the production default', () => {
    expect(resolveTrustProxy({ TRUST_PROXY: 'false', NODE_ENV: 'production' })).toBe(false);
  });

  it('rejects TRUST_PROXY=true (spoofable X-Forwarded-For)', () => {
    expect(() => resolveTrustProxy({ TRUST_PROXY: 'true' })).toThrow(/spoof/i);
  });

  it('rejects non-integer and negative values', () => {
    expect(() => resolveTrustProxy({ TRUST_PROXY: 'loopback,1' })).toThrow(/hop count/i);
    expect(() => resolveTrustProxy({ TRUST_PROXY: '-1' })).toThrow(/hop count/i);
    expect(() => resolveTrustProxy({ TRUST_PROXY: '1.5' })).toThrow(/hop count/i);
  });

  it('treats an empty TRUST_PROXY as unset', () => {
    expect(resolveTrustProxy({ TRUST_PROXY: '  ', NODE_ENV: 'production' })).toBe(1);
  });
});

describe('buildCorsOptions', () => {
  it('uses an explicit origin with credentials', () => {
    expect(buildCorsOptions({ CORS_ORIGIN: 'https://app.example.com' })).toEqual({
      origin: ['https://app.example.com'],
      credentials: true,
    });
  });

  it('supports a comma-separated allowlist', () => {
    expect(
      buildCorsOptions({ CORS_ORIGIN: 'https://a.example.com, https://b.example.com' }),
    ).toEqual({
      origin: ['https://a.example.com', 'https://b.example.com'],
      credentials: true,
    });
  });

  it('never combines a wildcard origin with credentials', () => {
    expect(buildCorsOptions({ CORS_ORIGIN: '*' })).toEqual({
      origin: '*',
      credentials: false,
    });
    // ...even when mixed into a list
    expect(buildCorsOptions({ CORS_ORIGIN: 'https://a.example.com,*' })).toEqual({
      origin: '*',
      credentials: false,
    });
  });

  it('throws at boot when CORS_ORIGIN is unset in production', () => {
    expect(() => buildCorsOptions({ NODE_ENV: 'production' })).toThrow(/CORS_ORIGIN/);
  });

  it('reflects the request origin with credentials outside production', () => {
    expect(buildCorsOptions({})).toEqual({ origin: true, credentials: true });
    expect(buildCorsOptions({ NODE_ENV: 'development' })).toEqual({
      origin: true,
      credentials: true,
    });
  });
});
