/**
 * Health check endpoint.
 *
 * Probes the Redis connection (the worker's only infrastructure dependency)
 * and reports 200 when reachable, 503 when not. Exposed as a plain HTTP
 * handler compatible with Node's native `http` module (no framework).
 */

export interface HealthCheckResult {
  status: number;
  body: { healthy: boolean; error?: string; timestamp: string };
}

export interface HealthCheckDeps {
  ping: () => Promise<string>;
}

/** Minimal Node http.ServerResponse-like surface. */
export interface HttpServerResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
}

export interface HttpRequest {
  url?: string;
}

export function createHealthCheck(deps: HealthCheckDeps) {
  async function check(): Promise<HealthCheckResult> {
    try {
      await deps.ping();
      return {
        status: 200,
        body: { healthy: true, timestamp: new Date().toISOString() },
      };
    } catch (err) {
      return {
        status: 503,
        body: {
          healthy: false,
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  async function httpHandler(_req: HttpRequest, res: HttpServerResponse): Promise<void> {
    const result = await check();
    res.statusCode = result.status;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(result.body));
  }

  return { check, httpHandler };
}
