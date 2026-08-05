/**
 * Handler registry — maps handler names to JobHandler instances.
 *
 * The bootstrap registers every handler from every bounded context once,
 * then the worker runtime looks handlers up by job name when dispatching.
 */
import type { JobHandler } from './handler';

export class HandlerNotFoundError extends Error {
  constructor(name: string) {
    super(`No handler registered for job "${name}"`);
    this.name = 'HandlerNotFoundError';
  }
}

export interface HandlerRegistry {
  register(handler: JobHandler<unknown, unknown>): void;
  get(name: string): JobHandler<unknown, unknown>;
  names(): string[];
  all(): JobHandler<unknown, unknown>[];
}

export function createHandlerRegistry(): HandlerRegistry {
  const handlers = new Map<string, JobHandler<unknown, unknown>>();

  function register(handler: JobHandler): void {
    if (handlers.has(handler.name)) {
      throw new Error(
        `Handler "${handler.name}" is already registered. Handler names must be unique.`,
      );
    }
    handlers.set(handler.name, handler);
  }

  function get(name: string): JobHandler {
    const handler = handlers.get(name);
    if (!handler) {
      throw new HandlerNotFoundError(name);
    }
    return handler;
  }

  function names(): string[] {
    return Array.from(handlers.keys());
  }

  function all(): JobHandler[] {
    return Array.from(handlers.values());
  }

  return { register, get, names, all };
}
