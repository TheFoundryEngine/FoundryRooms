/**
 * HTTP edge configuration — trust proxy and CORS.
 *
 * Extracted from main.ts so the resolution logic is unit-testable
 * (tests/http-config.test.ts) and the failure modes are explicit:
 *
 * - trust proxy (THE-64 / #25): behind Render's proxy, req.ip is the proxy
 *   address unless Express is told how many hops to trust. A blanket `true`
 *   would let clients spoof X-Forwarded-For and evade per-IP rate limiting,
 *   so only `false` or an explicit hop count is accepted.
 * - CORS (THE-66 / #27): the spec forbids Access-Control-Allow-Origin '*'
 *   together with credentials. Auth is cookie-based, so silently emitting
 *   that combination breaks every browser client. Production requires an
 *   explicit CORS_ORIGIN allowlist and fails at boot without one.
 */

type Env = Record<string, string | undefined>;

export type TrustProxySetting = number | false;

/**
 * Resolve Express's `trust proxy` setting from the environment.
 *
 * TRUST_PROXY may be `false` (direct connections, e.g. local dev) or a
 * non-negative integer hop count (Render terminates TLS one hop out → 1).
 * `true` is deliberately rejected: it trusts the entire X-Forwarded-For
 * chain, letting any client choose its own IP for rate-limit keying.
 *
 * Default: 1 in production, false elsewhere.
 */
export function resolveTrustProxy(env: Env): TrustProxySetting {
  const raw = env.TRUST_PROXY?.trim();

  if (raw !== undefined && raw !== '') {
    if (raw === 'false') {
      return false;
    }
    if (raw === 'true') {
      throw new Error(
        'TRUST_PROXY=true is not allowed: it trusts the whole X-Forwarded-For chain, ' +
          'so clients can spoof their IP and evade rate limiting. ' +
          'Set an explicit hop count (e.g. TRUST_PROXY=1) or TRUST_PROXY=false.',
      );
    }
    const hops = Number(raw);
    if (!Number.isInteger(hops) || hops < 0) {
      throw new Error(
        `TRUST_PROXY must be 'false' or a non-negative integer hop count, got: ${raw}`,
      );
    }
    return hops;
  }

  return env.NODE_ENV === 'production' ? 1 : false;
}

export interface CorsSettings {
  origin: string[] | string | boolean;
  credentials: boolean;
}

/**
 * Build CORS options from the environment.
 *
 * - CORS_ORIGIN set: comma-separated allowlist, credentials enabled.
 * - CORS_ORIGIN contains '*': wildcard without credentials — the two can
 *   never be combined (browsers reject the response outright).
 * - Unset in production: fail at boot. A cookie-authenticated API with no
 *   configured origin cannot serve any browser client; crashing loudly
 *   beats serving a config that looks fine and fails in every frontend.
 * - Unset elsewhere: reflect the request origin with credentials, so local
 *   frontends on any port can authenticate during development.
 */
export function buildCorsOptions(env: Env): CorsSettings {
  const raw = env.CORS_ORIGIN?.trim();

  if (raw) {
    const origins = raw
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (origins.includes('*')) {
      return { origin: '*', credentials: false };
    }
    return { origin: origins, credentials: true };
  }

  if (env.NODE_ENV === 'production') {
    throw new Error(
      'CORS_ORIGIN must be set in production (comma-separated allowlist of origins). ' +
        'Auth is cookie-based, so a wildcard origin with credentials is rejected by browsers; ' +
        'refusing to boot instead of serving a config that cannot work.',
    );
  }

  return { origin: true, credentials: true };
}
