import { describe, it, expect } from 'vitest';
import { IdentityAccessApi } from '@foundry/contracts';

describe('Auth Contract Tests', () => {
  describe('POST /auth/register', () => {
    describe('RegisterRequest', () => {
      it('should accept valid registration request', () => {
        const validRequest = {
          email: 'newuser@example.com',
          password: 'securePassword123',
          displayName: 'New User',
        };
        const result = IdentityAccessApi.RegisterRequest.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should reject request with invalid email', () => {
        const invalidRequest = {
          email: 'not-an-email',
          password: 'securePassword123',
          displayName: 'New User',
        };
        const result = IdentityAccessApi.RegisterRequest.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject request with short password', () => {
        const invalidRequest = {
          email: 'newuser@example.com',
          password: 'short',
          displayName: 'New User',
        };
        const result = IdentityAccessApi.RegisterRequest.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject request with empty displayName', () => {
        const invalidRequest = {
          email: 'newuser@example.com',
          password: 'securePassword123',
          displayName: '',
        };
        const result = IdentityAccessApi.RegisterRequest.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject request with displayName exceeding max length', () => {
        const invalidRequest = {
          email: 'newuser@example.com',
          password: 'securePassword123',
          displayName: 'A'.repeat(101),
        };
        const result = IdentityAccessApi.RegisterRequest.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
    });

    describe('RegisterResponse', () => {
      it('should accept valid registration response with user actor', () => {
        const validResponse = {
          token: 'a'.repeat(32),
          actor: {
            id: '11111111-1111-1111-1111-111111111111',
            type: 'user',
            displayName: 'New User',
            avatarUrl: null,
          },
          expiresAt: '2024-01-15T12:00:00Z',
        };
        const result = IdentityAccessApi.RegisterResponse.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should reject response with invalid token', () => {
        const invalidResponse = {
          token: 'short',
          actor: {
            id: '11111111-1111-1111-1111-111111111111',
            type: 'user',
            displayName: 'New User',
            avatarUrl: null,
          },
          expiresAt: '2024-01-15T12:00:00Z',
        };
        const result = IdentityAccessApi.RegisterResponse.safeParse(invalidResponse);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('POST /auth/login', () => {
    describe('LoginRequest', () => {
      it('should accept valid login request', () => {
        const validRequest = {
          email: 'user@example.com',
          password: 'password123',
        };
        const result = IdentityAccessApi.LoginRequest.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should reject request with invalid email', () => {
        const invalidRequest = {
          email: 'invalid-email',
          password: 'password123',
        };
        const result = IdentityAccessApi.LoginRequest.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject request with empty password', () => {
        const invalidRequest = {
          email: 'user@example.com',
          password: '',
        };
        const result = IdentityAccessApi.LoginRequest.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
    });

    describe('LoginResponse', () => {
      it('should accept valid login response for user', () => {
        const validResponse = {
          token: 'x'.repeat(32),
          actor: {
            id: '11111111-1111-1111-1111-111111111111',
            type: 'user',
            displayName: 'Alice Johnson',
            avatarUrl: 'https://example.com/avatars/alice.png',
          },
          expiresAt: '2024-01-15T12:00:00Z',
        };
        const result = IdentityAccessApi.LoginResponse.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should accept valid login response for agent', () => {
        const validResponse = {
          token: 'y'.repeat(32),
          actor: {
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            type: 'agent',
            displayName: 'Community Bot',
            avatarUrl: null,
          },
          expiresAt: '2024-01-15T12:00:00Z',
        };
        const result = IdentityAccessApi.LoginResponse.safeParse(validResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('POST /auth/logout', () => {
    describe('LogoutRequest', () => {
      it('should accept empty logout request', () => {
        const validRequest = {};
        const result = IdentityAccessApi.LogoutRequest.safeParse(validRequest);
        expect(result.success).toBe(true);
      });
    });

    describe('LogoutResponse', () => {
      it('should accept valid logout response', () => {
        const validResponse = {
          message: 'Logged out successfully',
        };
        const result = IdentityAccessApi.LogoutResponse.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should reject response without message', () => {
        const invalidResponse = {};
        const result = IdentityAccessApi.LogoutResponse.safeParse(invalidResponse);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('POST /auth/password-reset', () => {
    describe('PasswordResetRequestSchema', () => {
      it('should accept valid password reset request', () => {
        const validRequest = {
          email: 'user@example.com',
        };
        const result = IdentityAccessApi.PasswordResetRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should reject request with invalid email', () => {
        const invalidRequest = {
          email: 'not-an-email',
        };
        const result = IdentityAccessApi.PasswordResetRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
    });

    describe('PasswordResetResponse', () => {
      it('should accept valid password reset response', () => {
        const validResponse = {
          message: 'Password reset email sent if account exists',
        };
        const result = IdentityAccessApi.PasswordResetResponse.safeParse(validResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('POST /auth/password-reset/confirm', () => {
    describe('PasswordResetConfirmRequest', () => {
      it('should accept valid confirm request', () => {
        const validRequest = {
          token: 'reset-token-123',
          newPassword: 'newSecurePassword123',
        };
        const result = IdentityAccessApi.PasswordResetConfirmRequest.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should reject request with empty token', () => {
        const invalidRequest = {
          token: '',
          newPassword: 'newSecurePassword123',
        };
        const result = IdentityAccessApi.PasswordResetConfirmRequest.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject request with short password', () => {
        const invalidRequest = {
          token: 'reset-token-123',
          newPassword: 'short',
        };
        const result = IdentityAccessApi.PasswordResetConfirmRequest.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
    });

    describe('PasswordResetConfirmResponse', () => {
      it('should accept valid confirm response', () => {
        const validResponse = {
          message: 'Password has been reset successfully',
        };
        const result = IdentityAccessApi.PasswordResetConfirmResponse.safeParse(validResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Auth Error Responses', () => {
    it('should accept INVALID_CREDENTIALS error', () => {
      const error = {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      };
      const result = IdentityAccessApi.AuthError.safeParse(error);
      expect(result.success).toBe(true);
    });

    it('should accept all valid error codes', () => {
      const codes = ['INVALID_CREDENTIALS', 'ACCOUNT_DISABLED', 'SESSION_EXPIRED', 'UNAUTHORIZED'];
      for (const code of codes) {
        const error = { code, message: 'Test message' };
        const result = IdentityAccessApi.AuthError.safeParse(error);
        expect(result.success).toBe(true);
      }
    });

    it('should reject unknown error code', () => {
      const error = {
        code: 'UNKNOWN_ERROR',
        message: 'Something went wrong',
      };
      const result = IdentityAccessApi.AuthError.safeParse(error);
      expect(result.success).toBe(false);
    });
  });
});

describe('Agent Auth Contract Tests', () => {
  describe('POST /agents', () => {
    describe('CreateAgentRequest', () => {
      it('should accept valid create agent request', () => {
        const validRequest = {
          displayName: 'My Bot',
          description: 'A helpful automation bot',
        };
        const result = IdentityAccessApi.CreateAgentRequest.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should accept request without optional description', () => {
        const validRequest = {
          displayName: 'Simple Bot',
        };
        const result = IdentityAccessApi.CreateAgentRequest.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should reject request with empty displayName', () => {
        const invalidRequest = {
          displayName: '',
        };
        const result = IdentityAccessApi.CreateAgentRequest.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
    });

    describe('CreateAgentResponse', () => {
      it('should accept valid create agent response', () => {
        const validResponse = {
          agent: {
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            type: 'agent',
            displayName: 'My Bot',
            avatarUrl: null,
          },
          apiKey: 'fr_live_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        };
        const result = IdentityAccessApi.CreateAgentResponse.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should reject response without apiKey', () => {
        const invalidResponse = {
          agent: {
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            type: 'agent',
            displayName: 'My Bot',
            avatarUrl: null,
          },
        };
        const result = IdentityAccessApi.CreateAgentResponse.safeParse(invalidResponse);
        expect(result.success).toBe(false);
      });

      it('should reject response with invalid agent type', () => {
        const invalidResponse = {
          agent: {
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            type: 'user',
            displayName: 'My Bot',
            avatarUrl: null,
          },
          apiKey: 'sk_live_123',
        };
        const result = IdentityAccessApi.CreateAgentResponse.safeParse(invalidResponse);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('AgentSummary', () => {
    it('should accept valid agent summary', () => {
      const validSummary = {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        type: 'agent',
        displayName: 'Community Bot',
        avatarUrl: 'https://example.com/bot.png',
      };
      const result = IdentityAccessApi.AgentSummary.safeParse(validSummary);
      expect(result.success).toBe(true);
    });

    it('should reject summary with user type', () => {
      const invalidSummary = {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        type: 'user',
        displayName: 'Not an Agent',
        avatarUrl: null,
      };
      const result = IdentityAccessApi.AgentSummary.safeParse(invalidSummary);
      expect(result.success).toBe(false);
    });
  });
});

describe('User Summary Contract Tests', () => {
  describe('UserSummary', () => {
    it('should accept valid user summary', () => {
      const validSummary = {
        id: '11111111-1111-1111-1111-111111111111',
        type: 'user',
        displayName: 'Alice Johnson',
        avatarUrl: 'https://example.com/alice.png',
        email: 'alice@example.com',
      };
      const result = IdentityAccessApi.UserSummary.safeParse(validSummary);
      expect(result.success).toBe(true);
    });

    it('should reject summary with agent type', () => {
      const invalidSummary = {
        id: '11111111-1111-1111-1111-111111111111',
        type: 'agent',
        displayName: 'Not a User',
        avatarUrl: null,
        email: 'test@example.com',
      };
      const result = IdentityAccessApi.UserSummary.safeParse(invalidSummary);
      expect(result.success).toBe(false);
    });

    it('should reject summary without email', () => {
      const invalidSummary = {
        id: '11111111-1111-1111-1111-111111111111',
        type: 'user',
        displayName: 'No Email User',
        avatarUrl: null,
      };
      const result = IdentityAccessApi.UserSummary.safeParse(invalidSummary);
      expect(result.success).toBe(false);
    });
  });
});

describe('ActorSummary Base Contract Tests', () => {
  describe('ActorSummary', () => {
    it('should accept user actor summary', () => {
      const validSummary = {
        id: '11111111-1111-1111-1111-111111111111',
        type: 'user',
        displayName: 'Alice',
        avatarUrl: null,
      };
      const result = IdentityAccessApi.ActorSummary.safeParse(validSummary);
      expect(result.success).toBe(true);
    });

    it('should accept agent actor summary', () => {
      const validSummary = {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        type: 'agent',
        displayName: 'Bot',
        avatarUrl: 'https://example.com/bot.png',
      };
      const result = IdentityAccessApi.ActorSummary.safeParse(validSummary);
      expect(result.success).toBe(true);
    });

    it('should reject invalid actor type', () => {
      const invalidSummary = {
        id: '11111111-1111-1111-1111-111111111111',
        type: 'robot',
        displayName: 'Invalid Type',
        avatarUrl: null,
      };
      const result = IdentityAccessApi.ActorSummary.safeParse(invalidSummary);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID format', () => {
      const invalidSummary = {
        id: 'not-a-uuid',
        type: 'user',
        displayName: 'Test',
        avatarUrl: null,
      };
      const result = IdentityAccessApi.ActorSummary.safeParse(invalidSummary);
      expect(result.success).toBe(false);
    });

    it('should reject invalid avatar URL format', () => {
      const invalidSummary = {
        id: '11111111-1111-1111-1111-111111111111',
        type: 'user',
        displayName: 'Test',
        avatarUrl: 'not-a-url',
      };
      const result = IdentityAccessApi.ActorSummary.safeParse(invalidSummary);
      expect(result.success).toBe(false);
    });
  });
});
