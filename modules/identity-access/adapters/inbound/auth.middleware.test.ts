/**
 * Auth Middleware Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException, ServiceUnavailableException, ExecutionContext, Logger } from '@nestjs/common';
import { AuthMiddleware, AuthGuard } from './auth.middleware';
import { RequestAuthenticator, TOUCH_INTERVAL_MS } from './request-authenticator';
import type { AuthenticatedRequest } from './auth.middleware';
import type { Response, NextFunction } from 'express';

// Silence Nest logger output for the infra-failure tests
Logger.overrideLogger(false);
import type { SessionRepository } from '../../application/ports/session.repository';
import type { AgentRepository } from '../../application/ports/agent.repository';
import type { ApiKeyGeneratorPort } from '../../application/ports/api-key-generator.port';
import {
  Session,
  Agent,
  createApiKeyHash,
  createSessionId,
  createActorId,
  createExpirationDate,
  SESSION_DURATIONS,
} from '../../domain';
import type { ActorId } from '../../domain';

// ============================================================================
// Mocks
// ============================================================================

function createMockSessionRepository(): SessionRepository {
  return {
    findById: vi.fn(),
    findByToken: vi.fn(),
    findByActorId: vi.fn(),
    save: vi.fn(),
    deleteByToken: vi.fn(),
    deleteByActorId: vi.fn(),
  };
}

function createMockAgentRepository(): AgentRepository {
  return {
    findById: vi.fn(),
    findByApiKeyPrefix: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  };
}

function createMockApiKeyGenerator(): ApiKeyGeneratorPort {
  return {
    generate: vi.fn(),
    hash: vi.fn(),
    extractPrefix: vi.fn(),
    isValid: vi.fn(),
  };
}

function createMockRequest(overrides: Record<string, unknown> = {}): AuthenticatedRequest {
  return {
    cookies: {},
    headers: {},
    ...overrides,
  } as unknown as AuthenticatedRequest;
}

function createMockResponse(): Response {
  return {} as Response;
}

function createMockNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

function createMockExecutionContext(request: AuthenticatedRequest): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
    }),
    getClass: vi.fn(),
    getHandler: vi.fn(),
    getArgs: vi.fn(),
    getArgByIndex: vi.fn(),
    switchToRpc: vi.fn(),
    switchToWs: vi.fn(),
    getType: vi.fn(),
  } as unknown as ExecutionContext;
}

function createMockSession(props: {
  actorId: ActorId;
  actorType: 'user' | 'agent';
  isExpired?: boolean;
  lastAccessedAt?: Date;
}): Session {
  const now = new Date();
  const expiresAt = props.isExpired
    ? new Date(now.getTime() - 1000) // Past
    : createExpirationDate(SESSION_DURATIONS.DEFAULT);

  return Session.fromPersistence({
    id: createSessionId('550e8400-e29b-41d4-a716-446655440000'),
    actorId: props.actorId,
    actorType: props.actorType,
    tokenHash: 'abc123hash',
    expiresAt,
    createdAt: now,
    lastAccessedAt: props.lastAccessedAt ?? now,
    userAgent: null,
    ipAddress: null,
  });
}

function createMockAgent(props: {
  id: ActorId;
  apiKeyHash: string;
  isActive?: boolean;
}): Agent {
  const now = new Date();
  return Agent.fromPersistence({
    id: props.id,
    type: 'agent',
    displayName: 'Test Agent',
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
    isActive: props.isActive ?? true,
    apiKeyHash: createApiKeyHash(props.apiKeyHash),
    ownerActorId: null,
    description: null,
    metadata: {},
  });
}

// ============================================================================
// AuthMiddleware Tests
// ============================================================================

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let sessionRepository: SessionRepository;
  let agentRepository: AgentRepository;
  let apiKeyGenerator: ApiKeyGeneratorPort;

  beforeEach(() => {
    sessionRepository = createMockSessionRepository();
    agentRepository = createMockAgentRepository();
    apiKeyGenerator = createMockApiKeyGenerator();
    middleware = new AuthMiddleware(
      new RequestAuthenticator(sessionRepository, agentRepository, apiKeyGenerator),
    );
  });

  it('should authenticate via session cookie', async () => {
    const actorId = createActorId('550e8400-e29b-41d4-a716-446655440001');
    const session = createMockSession({
      actorId,
      actorType: 'user',
    });

    vi.mocked(sessionRepository.findByToken).mockResolvedValue(session);

    const req = createMockRequest({
      cookies: { fr_session: 'valid-session-token-that-is-at-least-32-characters-long' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(req.actor).toBeDefined();
    expect(req.actor?.actorId).toBe(actorId);
    expect(req.actor?.actorType).toBe('user');
    expect(next).toHaveBeenCalled();
    // Freshly-touched session: within TOUCH_INTERVAL_MS, so no write (THE-69)
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should touch the session when lastAccessedAt is stale', async () => {
    const actorId = createActorId('550e8400-e29b-41d4-a716-446655440001');
    const session = createMockSession({
      actorId,
      actorType: 'user',
      lastAccessedAt: new Date(Date.now() - TOUCH_INTERVAL_MS - 1000),
    });

    vi.mocked(sessionRepository.findByToken).mockResolvedValue(session);

    const req = createMockRequest({
      cookies: { fr_session: 'valid-session-token-that-is-at-least-32-characters-long' },
    });

    await middleware.use(req, createMockResponse(), createMockNext());

    expect(req.actor?.actorId).toBe(actorId);
    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should still authenticate when the touch write fails', async () => {
    const actorId = createActorId('550e8400-e29b-41d4-a716-446655440001');
    const session = createMockSession({
      actorId,
      actorType: 'user',
      lastAccessedAt: new Date(Date.now() - TOUCH_INTERVAL_MS - 1000),
    });

    vi.mocked(sessionRepository.findByToken).mockResolvedValue(session);
    vi.mocked(sessionRepository.save).mockRejectedValue(new Error('write timeout'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const req = createMockRequest({
      cookies: { fr_session: 'valid-session-token-that-is-at-least-32-characters-long' },
    });

    await middleware.use(req, createMockResponse(), createMockNext());

    // Auth succeeded despite the bookkeeping write failing
    expect(req.actor?.actorId).toBe(actorId);
    consoleError.mockRestore();
  });

  it('should log and continue unauthenticated on a session lookup infrastructure failure', async () => {
    vi.mocked(sessionRepository.findByToken).mockRejectedValue(
      new Error('connection refused'),
    );

    const req = createMockRequest({
      cookies: { fr_session: 'valid-session-token-that-is-at-least-32-characters-long' },
    });
    const next = createMockNext();

    // Must not throw: middleware annotates, guards enforce
    await middleware.use(req, createMockResponse(), next);

    expect(req.actor).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should not authenticate with expired session', async () => {
    const actorId = createActorId('550e8400-e29b-41d4-a716-446655440001');
    const session = createMockSession({
      actorId,
      actorType: 'user',
      isExpired: true,
    });

    vi.mocked(sessionRepository.findByToken).mockResolvedValue(session);

    const req = createMockRequest({
      cookies: { fr_session: 'expired-session-token-that-is-at-least-32-characters' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(req.actor).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should authenticate via API key header', async () => {
    const agentId = createActorId('550e8400-e29b-41d4-a716-446655440002');
    const apiKeyHash = 'a'.repeat(64);
    const agent = createMockAgent({
      id: agentId,
      apiKeyHash,
    });

    vi.mocked(apiKeyGenerator.isValid).mockReturnValue(true);
    vi.mocked(apiKeyGenerator.extractPrefix).mockReturnValue('fr_live');
    vi.mocked(apiKeyGenerator.hash).mockReturnValue(apiKeyHash);
    vi.mocked(agentRepository.findByApiKeyPrefix).mockResolvedValue(agent);

    const req = createMockRequest({
      headers: { authorization: 'Bearer fr_live_validkey123' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(req.actor).toBeDefined();
    expect(req.actor?.actorId).toBe(agentId);
    expect(req.actor?.actorType).toBe('agent');
    expect(next).toHaveBeenCalled();
  });

  it('should not authenticate with invalid API key', async () => {
    vi.mocked(apiKeyGenerator.isValid).mockReturnValue(false);

    const req = createMockRequest({
      headers: { authorization: 'Bearer invalid-key' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(req.actor).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should not authenticate with deactivated agent', async () => {
    const agentId = createActorId('550e8400-e29b-41d4-a716-446655440002');
    const apiKeyHash = 'a'.repeat(64);
    const agent = createMockAgent({
      id: agentId,
      apiKeyHash,
      isActive: false,
    });

    vi.mocked(apiKeyGenerator.isValid).mockReturnValue(true);
    vi.mocked(apiKeyGenerator.extractPrefix).mockReturnValue('fr_live');
    vi.mocked(apiKeyGenerator.hash).mockReturnValue(apiKeyHash);
    vi.mocked(agentRepository.findByApiKeyPrefix).mockResolvedValue(agent);

    const req = createMockRequest({
      headers: { authorization: 'Bearer fr_live_validkey123' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(req.actor).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should continue without authentication when no credentials', async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(req.actor).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should prefer session cookie over API key', async () => {
    const userId = createActorId('550e8400-e29b-41d4-a716-446655440001');
    const session = createMockSession({
      actorId: userId,
      actorType: 'user',
    });

    vi.mocked(sessionRepository.findByToken).mockResolvedValue(session);

    const req = createMockRequest({
      cookies: { fr_session: 'valid-session-token-that-is-at-least-32-characters-long' },
      headers: { authorization: 'Bearer some-api-key' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware.use(req, res, next);

    expect(req.actor?.actorId).toBe(userId);
    expect(req.actor?.actorType).toBe('user');
    // API key should not be checked
    expect(agentRepository.findByApiKeyPrefix).not.toHaveBeenCalled();
  });
});

// ============================================================================
// AuthGuard Tests
// ============================================================================

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let sessionRepository: SessionRepository;
  let agentRepository: AgentRepository;
  let apiKeyGenerator: ApiKeyGeneratorPort;

  beforeEach(() => {
    sessionRepository = createMockSessionRepository();
    agentRepository = createMockAgentRepository();
    apiKeyGenerator = createMockApiKeyGenerator();
    guard = new AuthGuard(
      new RequestAuthenticator(sessionRepository, agentRepository, apiKeyGenerator),
    );
  });

  it('should allow request with valid session cookie', async () => {
    const actorId = createActorId('550e8400-e29b-41d4-a716-446655440001');
    const session = createMockSession({
      actorId,
      actorType: 'user',
    });

    vi.mocked(sessionRepository.findByToken).mockResolvedValue(session);

    const req = createMockRequest({
      cookies: { fr_session: 'valid-session-token-that-is-at-least-32-characters-long' },
    });
    const context = createMockExecutionContext(req);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(req.actor).toBeDefined();
    expect(req.actor?.actorId).toBe(actorId);
  });

  it('should allow request with valid API key', async () => {
    const agentId = createActorId('550e8400-e29b-41d4-a716-446655440002');
    const apiKeyHash = 'b'.repeat(64);
    const agent = createMockAgent({
      id: agentId,
      apiKeyHash,
    });

    vi.mocked(apiKeyGenerator.isValid).mockReturnValue(true);
    vi.mocked(apiKeyGenerator.extractPrefix).mockReturnValue('fr_live');
    vi.mocked(apiKeyGenerator.hash).mockReturnValue(apiKeyHash);
    vi.mocked(agentRepository.findByApiKeyPrefix).mockResolvedValue(agent);

    const req = createMockRequest({
      headers: { authorization: 'Bearer fr_live_key123' },
    });
    const context = createMockExecutionContext(req);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(req.actor).toBeDefined();
    expect(req.actor?.actorId).toBe(agentId);
  });

  it('should return true if already authenticated by middleware', async () => {
    const req = createMockRequest({
      actor: {
        actorId: createActorId('550e8400-e29b-41d4-a716-446655440001'),
        actorType: 'user',
      },
    });
    const context = createMockExecutionContext(req);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    // No repository calls needed
    expect(sessionRepository.findByToken).not.toHaveBeenCalled();
    expect(agentRepository.findByApiKeyPrefix).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException without credentials', async () => {
    const req = createMockRequest();
    const context = createMockExecutionContext(req);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException with invalid session', async () => {
    vi.mocked(sessionRepository.findByToken).mockResolvedValue(null);

    const req = createMockRequest({
      cookies: { fr_session: 'invalid-session-token-that-is-at-least-32-characters' },
    });
    const context = createMockExecutionContext(req);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException with invalid API key', async () => {
    vi.mocked(apiKeyGenerator.isValid).mockReturnValue(false);

    const req = createMockRequest({
      headers: { authorization: 'Bearer invalid-key' },
    });
    const context = createMockExecutionContext(req);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException with expired session', async () => {
    const session = createMockSession({
      actorId: createActorId('550e8400-e29b-41d4-a716-446655440001'),
      actorType: 'user',
      isExpired: true,
    });

    vi.mocked(sessionRepository.findByToken).mockResolvedValue(session);

    const req = createMockRequest({
      cookies: { fr_session: 'expired-session-token-that-is-at-least-32-characters' },
    });
    const context = createMockExecutionContext(req);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ServiceUnavailableException (not 401) on session lookup infrastructure failure', async () => {
    // A database outage is not "you are not logged in" (THE-67 / #28)
    vi.mocked(sessionRepository.findByToken).mockRejectedValue(
      new Error('connection refused'),
    );

    const req = createMockRequest({
      cookies: { fr_session: 'valid-session-token-that-is-at-least-32-characters-long' },
    });
    const context = createMockExecutionContext(req);

    await expect(guard.canActivate(context)).rejects.toThrow(ServiceUnavailableException);
    await expect(guard.canActivate(context)).rejects.not.toThrow(UnauthorizedException);
  });

  it('should throw ServiceUnavailableException on agent lookup infrastructure failure', async () => {
    vi.mocked(apiKeyGenerator.isValid).mockReturnValue(true);
    vi.mocked(apiKeyGenerator.extractPrefix).mockReturnValue('fr_live');
    vi.mocked(agentRepository.findByApiKeyPrefix).mockRejectedValue(
      new Error('pool exhausted'),
    );

    const req = createMockRequest({
      headers: { authorization: 'Bearer fr_live_key123' },
    });
    const context = createMockExecutionContext(req);

    await expect(guard.canActivate(context)).rejects.toThrow(ServiceUnavailableException);
  });
});
