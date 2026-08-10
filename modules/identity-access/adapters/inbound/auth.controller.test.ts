/**
 * Auth Controller Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import type { RegisterUserUseCase, RegisterUserOutput } from '../../application/use-cases/register-user.use-case';
import type { LoginUseCase, LoginOutput } from '../../application/use-cases/login.use-case';
import type { LogoutUseCase, LogoutOutput } from '../../application/use-cases/logout.use-case';
import type { RefreshSessionUseCase, RefreshSessionOutput } from '../../application/use-cases/refresh-session.use-case';
import {
  EmailAlreadyExistsError,
  InvalidPasswordError,
} from '../../application/use-cases/register-user.use-case';
import {
  InvalidCredentialsError,
  AccountDeactivatedError,
} from '../../application/use-cases/login.use-case';
import {
  SessionNotFoundError,
  SessionExpiredError,
} from '../../application/use-cases/refresh-session.use-case';
import type { ActorId, Email, SessionToken } from '../../domain';
import type { Response } from 'express';

// ============================================================================
// Mocks
// ============================================================================

function createMockRegisterUserUseCase(): RegisterUserUseCase {
  return {
    execute: vi.fn(),
  } as unknown as RegisterUserUseCase;
}

function createMockLoginUseCase(): LoginUseCase {
  return {
    execute: vi.fn(),
  } as unknown as LoginUseCase;
}

function createMockLogoutUseCase(): LogoutUseCase {
  return {
    execute: vi.fn(),
  } as unknown as LogoutUseCase;
}

function createMockRefreshSessionUseCase(): RefreshSessionUseCase {
  return {
    execute: vi.fn(),
  } as unknown as RefreshSessionUseCase;
}

function createMockResponse(): Response {
  return {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  } as unknown as Response;
}

// ============================================================================
// Tests
// ============================================================================

describe('AuthController', () => {
  let controller: AuthController;
  let registerUserUseCase: RegisterUserUseCase;
  let loginUseCase: LoginUseCase;
  let logoutUseCase: LogoutUseCase;
  let refreshSessionUseCase: RefreshSessionUseCase;

  beforeEach(() => {
    registerUserUseCase = createMockRegisterUserUseCase();
    loginUseCase = createMockLoginUseCase();
    logoutUseCase = createMockLogoutUseCase();
    refreshSessionUseCase = createMockRefreshSessionUseCase();
    controller = new AuthController(
      registerUserUseCase,
      loginUseCase,
      logoutUseCase,
      refreshSessionUseCase,
    );
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      const output: RegisterUserOutput = {
        userId: 'user-id-123' as ActorId,
        email: 'test@example.com' as Email,
        displayName: 'Test User',
      };

      vi.mocked(registerUserUseCase.execute).mockResolvedValue(output);

      const result = await controller.register(input);

      expect(result.userId).toBe('user-id-123');
      expect(result.email).toBe('test@example.com');
      expect(result.displayName).toBe('Test User');
      expect(registerUserUseCase.execute).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      });
    });

    it('should throw BadRequestException for invalid email', async () => {
      const input = {
        email: 'invalid-email',
        password: 'password123',
        displayName: 'Test User',
      };

      await expect(controller.register(input)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for short password', async () => {
      const input = {
        email: 'test@example.com',
        password: 'short',
        displayName: 'Test User',
      };

      await expect(controller.register(input)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty display name', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        displayName: '',
      };

      await expect(controller.register(input)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when email already exists', async () => {
      const input = {
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      vi.mocked(registerUserUseCase.execute).mockRejectedValue(
        new EmailAlreadyExistsError(input.email)
      );

      await expect(controller.register(input)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for invalid password from use case', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      vi.mocked(registerUserUseCase.execute).mockRejectedValue(
        new InvalidPasswordError('Password too weak')
      );

      await expect(controller.register(input)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login successfully and set cookie', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expiresAt = new Date(Date.now() + 86400000); // 24 hours
      const output: LoginOutput = {
        sessionToken: 'session-token-xyz' as SessionToken,
        userId: 'user-id-123' as ActorId,
        displayName: 'Test User',
        email: 'test@example.com' as Email,
        expiresAt,
      };

      vi.mocked(loginUseCase.execute).mockResolvedValue(output);
      const res = createMockResponse();

      const result = await controller.login(input, res);

      expect(result.token).toBe('session-token-xyz');
      expect(result.actor.id).toBe('user-id-123');
      expect(result.actor.displayName).toBe('Test User');
      expect(res.cookie).toHaveBeenCalledWith(
        'fr_session',
        'session-token-xyz',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      );
    });

    it('should throw BadRequestException for invalid email format', async () => {
      const input = {
        email: 'not-an-email',
        password: 'password123',
      };
      const res = createMockResponse();

      await expect(controller.login(input, res)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty password', async () => {
      const input = {
        email: 'test@example.com',
        password: '',
      };
      const res = createMockResponse();

      await expect(controller.login(input, res)).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      vi.mocked(loginUseCase.execute).mockRejectedValue(new InvalidCredentialsError());
      const res = createMockResponse();

      await expect(controller.login(input, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for deactivated account', async () => {
      const input = {
        email: 'deactivated@example.com',
        password: 'password123',
      };

      vi.mocked(loginUseCase.execute).mockRejectedValue(new AccountDeactivatedError());
      const res = createMockResponse();

      await expect(controller.login(input, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout successfully with session token', async () => {
      const actor = {
        actorId: 'user-id-123' as ActorId,
        actorType: 'user' as const,
        sessionToken: 'session-token-xyz' as SessionToken,
      };

      const output: LogoutOutput = { success: true };
      vi.mocked(logoutUseCase.execute).mockResolvedValue(output);
      const res = createMockResponse();

      const result = await controller.logout(actor, res);

      expect(result.success).toBe(true);
      expect(res.clearCookie).toHaveBeenCalledWith('fr_session', expect.any(Object));
      expect(logoutUseCase.execute).toHaveBeenCalledWith({
        sessionToken: 'session-token-xyz',
      });
    });

    it('should logout successfully without session token (API key auth)', async () => {
      const actor = {
        actorId: 'agent-id-123' as ActorId,
        actorType: 'agent' as const,
        // No sessionToken for API key auth
      };

      const res = createMockResponse();

      const result = await controller.logout(actor, res);

      expect(result.success).toBe(true);
      expect(res.clearCookie).toHaveBeenCalled();
      expect(logoutUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should refresh session successfully and set new cookie', async () => {
      const input = {
        refreshToken: 'a'.repeat(32),
      };

      const expiresAt = new Date(Date.now() + 86400000); // 24 hours
      const output: RefreshSessionOutput = {
        sessionToken: 'new-session-token-xyz' as SessionToken,
        actorId: 'user-id-123' as ActorId,
        actorType: 'user',
        expiresAt,
      };

      vi.mocked(refreshSessionUseCase.execute).mockResolvedValue(output);
      const res = createMockResponse();

      const result = await controller.refresh(input, res);

      expect(result.token).toBe('new-session-token-xyz');
      expect(result.actor.id).toBe('user-id-123');
      expect(result.actor.type).toBe('user');
      expect(res.cookie).toHaveBeenCalledWith(
        'fr_session',
        'new-session-token-xyz',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      );
    });

    it('should throw BadRequestException for missing refreshToken', async () => {
      const input = { refreshToken: '' };
      const res = createMockResponse();

      await expect(controller.refresh(input, res)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for short refreshToken', async () => {
      const input = { refreshToken: 'short' };
      const res = createMockResponse();

      await expect(controller.refresh(input, res)).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException when session not found', async () => {
      const input = { refreshToken: 'a'.repeat(32) };

      vi.mocked(refreshSessionUseCase.execute).mockRejectedValue(new SessionNotFoundError());
      const res = createMockResponse();

      await expect(controller.refresh(input, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when session expired', async () => {
      const input = { refreshToken: 'a'.repeat(32) };

      vi.mocked(refreshSessionUseCase.execute).mockRejectedValue(new SessionExpiredError());
      const res = createMockResponse();

      await expect(controller.refresh(input, res)).rejects.toThrow(UnauthorizedException);
    });
  });
});
