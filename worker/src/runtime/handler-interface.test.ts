import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { createHandlerRegistry, HandlerNotFoundError } from './handler-registry';
import { validatePayload } from './handler';
import type { JobHandler, HandlerContext } from './handler';

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

const welcomeSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
});

type WelcomePayload = z.infer<typeof welcomeSchema>;

interface WelcomeService {
  sendWelcomeEmail(input: WelcomePayload): Promise<{ delivered: boolean }>;
}

function createWelcomeHandler(service: WelcomeService): JobHandler<WelcomePayload, { delivered: boolean }> {
  return {
    name: 'notifications.send-welcome-email',
    schema: welcomeSchema,
    async handle(payload, _ctx) {
      const result = await service.sendWelcomeEmail(payload);
      return result;
    },
  };
}

describe('JobHandler contract', () => {
  let service: WelcomeService;
  let handler: JobHandler;
  let ctx: HandlerContext;

  beforeEach(() => {
    service = { sendWelcomeEmail: vi.fn().mockResolvedValue({ delivered: true }) };
    handler = createWelcomeHandler(service);
    ctx = { logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } };
  });

  it('processes a valid payload successfully', async () => {
    const payload = {
      userId: '11111111-1111-1111-1111-111111111111',
      email: 'user@example.com',
      displayName: 'Alice',
    };
    // Runtime validates first, then delegates to handle.
    const validated = validatePayload<WelcomePayload>(handler, payload);
    const result = await handler.handle(validated, ctx);
    expect(result).toEqual({ delivered: true });
    expect(service.sendWelcomeEmail).toHaveBeenCalledWith(payload);
  });

  it('throws before processing when the payload is invalid (validation rejects)', () => {
    const badPayload = { userId: 'not-a-uuid', email: 'nope', displayName: '' };
    // The runtime validates BEFORE calling handle, so the service is never touched.
    expect(() => validatePayload(handler, badPayload)).toThrow();
    expect(service.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('calls the application service (mock), not adapters directly', async () => {
    const payload = {
      userId: '11111111-1111-1111-1111-111111111111',
      email: 'user@example.com',
      displayName: 'Alice',
    };
    const validated = validatePayload<WelcomePayload>(handler, payload);
    await handler.handle(validated, ctx);
    // The handler must delegate to the injected service, not call SMTP/DB itself.
    expect(service.sendWelcomeEmail).toHaveBeenCalledTimes(1);
  });
});

describe('HandlerRegistry', () => {
  it('registers and looks up a handler by name', () => {
    const service = { sendWelcomeEmail: vi.fn() };
    const handler = createWelcomeHandler(service);
    const registry = createHandlerRegistry();
    registry.register(handler);
    expect(registry.get(handler.name)).toBe(handler);
  });

  it('throws HandlerNotFoundError for an unknown name', () => {
    const registry = createHandlerRegistry();
    expect(() => registry.get('does.not.exist')).toThrow(HandlerNotFoundError);
  });

  it('lists all registered handler names', () => {
    const registry = createHandlerRegistry();
    const h1 = createWelcomeHandler({ sendWelcomeEmail: vi.fn() });
    const h2: JobHandler = {
      name: 'commerce.entitlement-sync',
      schema: z.object({ entitlementId: z.string().uuid() }),
      handle: vi.fn(),
    };
    registry.register(h1);
    registry.register(h2);
    expect(registry.names().sort()).toEqual([
      'commerce.entitlement-sync',
      'notifications.send-welcome-email',
    ]);
  });

  it('rejects duplicate registration of the same handler name', () => {
    const registry = createHandlerRegistry();
    const h1 = createWelcomeHandler({ sendWelcomeEmail: vi.fn() });
    registry.register(h1);
    expect(() => registry.register(h1)).toThrow(/already registered/);
  });
});
