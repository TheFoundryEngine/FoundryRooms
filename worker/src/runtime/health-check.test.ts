import { describe, it, expect, vi } from 'vitest';
import { createHealthCheck } from './health-check';

describe('HealthCheck', () => {
  it('returns 200 (healthy) when Redis ping succeeds', async () => {
    const ping = vi.fn().mockResolvedValue('PONG');
    const health = createHealthCheck({ ping });

    const result = await health.check();
    expect(result.status).toBe(200);
    expect(result.body.healthy).toBe(true);
  });

  it('returns 503 (unhealthy) when Redis ping fails', async () => {
    const ping = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const health = createHealthCheck({ ping });

    const result = await health.check();
    expect(result.status).toBe(503);
    expect(result.body.healthy).toBe(false);
    expect(result.body.error).toMatch(/ECONNREFUSED/);
  });

  it('exposes an HTTP handler compatible with Node http.ServerResponse', async () => {
    const ping = vi.fn().mockResolvedValue('PONG');
    const health = createHealthCheck({ ping });

    const received: { statusCode?: number; body?: string } = {};
    const res = {
      statusCode: 0,
      setHeader: vi.fn(),
      end: vi.fn((body?: string) => {
        received.statusCode = res.statusCode;
        received.body = body;
      }),
    };

    await health.httpHandler({} as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.setHeader).toHaveBeenCalledWith('content-type', 'application/json');
    expect(received.body).toBeDefined();
    const parsed = JSON.parse(received.body as string);
    expect(parsed.healthy).toBe(true);
  });
});
