/**
 * Job handler interface.
 *
 * A handler is the worker-side analogue of an application use-case caller.
 * It validates the job payload with a zod schema, then delegates to an
 * injected application service port — never to adapters directly.
 *
 * Handlers must be idempotent: re-running a job with the same payload must
 * produce the same result without side-effect duplication.
 */
import type { ZodTypeAny } from 'zod';

export interface HandlerLogger {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

export interface HandlerContext {
  logger: HandlerLogger;
  /** Correlation id propagated from the producing event, if any. */
  correlationId?: string;
}

export interface JobHandler<
  TPayload = unknown,
  TResult = unknown,
> {
  /** Stable, unique handler name (e.g. "notifications.send-welcome-email"). */
  readonly name: string;
  /** Zod schema used to validate the job payload before processing. */
  readonly schema: ZodTypeAny;
  /** Processes a validated payload via an injected application service. */
  handle(payload: TPayload, ctx: HandlerContext): Promise<TResult>;
}

/**
 * Validates a raw payload against a handler's schema, returning the typed
 * payload or throwing a ZodError. Centralises validation so the runtime can
 * reject bad jobs before touching application services.
 */
export function validatePayload<T = unknown>(
  handler: JobHandler,
  raw: unknown,
): T {
  return handler.schema.parse(raw) as T;
}
