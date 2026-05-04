import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AuthenticateApiKeyUseCase,
  InvalidApiKeyError,
  AgentDeactivatedError,
  MalformedApiKeyError,
} from './authenticate-api-key.use-case';
import type { AuthenticateApiKeyDeps } from './authenticate-api-key.use-case';
import { Agent, generateApiKey, hashApiKey, createApiKeyHash } from '../../domain';
import type { ApiKey } from '../../domain';
import type { AgentRepository } from '../ports/agent.repository';
import type { ApiKeyGeneratorPort } from '../ports/api-key-generator.port';

// ============================================================================
// Mock Implementations
// ============================================================================

function createMockAgentRepository(): AgentRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByApiKeyPrefix: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockApiKeyGenerator(): ApiKeyGeneratorPort {
  return {
    generate: vi.fn().mockImplementation((prefix = 'live') => generateApiKey(prefix)),
    hash: vi.fn().mockImplementation((key: ApiKey) => hashApiKey(key)),
    extractPrefix: vi.fn().mockImplementation((key: string) => {
      const parts = key.split('_');
      return parts.length >= 2 ? `${parts[0]}_${parts[1]}` : '';
    }),
    isValid: vi.fn().mockReturnValue(true),
  };
}

function createTestAgent(apiKey: ApiKey, overrides?: Partial<{
  isActive: boolean;
  displayName: string;
  description: string | null;
}>): Agent {
  const now = new Date();
  const apiKeyHash = createApiKeyHash(hashApiKey(apiKey));

  return Agent.fromPersistence({
    id: '550e8400-e29b-41d4-a716-446655440000' as any,
    type: 'agent',
    displayName: overrides?.displayName ?? 'Test Agent',
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
    isActive: overrides?.isActive ?? true,
    apiKeyHash,
    ownerActorId: null,
    description: overrides && 'description' in overrides ? overrides.description : 'A test agent',
    metadata: { env: 'test' },
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('AuthenticateApiKeyUseCase', () => {
  let useCase: AuthenticateApiKeyUseCase;
  let mockAgentRepo: AgentRepository;
  let mockApiKeyGenerator: ApiKeyGeneratorPort;

  beforeEach(() => {
    mockAgentRepo = createMockAgentRepository();
    mockApiKeyGenerator = createMockApiKeyGenerator();

    const deps: AuthenticateApiKeyDeps = {
      agentRepository: mockAgentRepo,
      apiKeyGenerator: mockApiKeyGenerator,
    };

    useCase = new AuthenticateApiKeyUseCase(deps);
  });

  describe('successful authentication', () => {
    it('should authenticate a valid API key', async () => {
      const apiKey = generateApiKey('live');
      const agent = createTestAgent(apiKey);
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(agent);

      const result = await useCase.execute({ apiKey });

      expect(result.agent.agentId).toBe(agent.id);
      expect(result.agent.displayName).toBe('Test Agent');
      expect(result.agent.description).toBe('A test agent');
    });

    it('should validate API key format', async () => {
      const apiKey = generateApiKey('live');
      const agent = createTestAgent(apiKey);
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(agent);

      await useCase.execute({ apiKey });

      expect(mockApiKeyGenerator.isValid).toHaveBeenCalledWith(apiKey);
    });

    it('should extract prefix from API key', async () => {
      const apiKey = generateApiKey('live');
      const agent = createTestAgent(apiKey);
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(agent);

      await useCase.execute({ apiKey });

      expect(mockApiKeyGenerator.extractPrefix).toHaveBeenCalledWith(apiKey);
    });

    it('should find agent by API key prefix', async () => {
      const apiKey = generateApiKey('live');
      const agent = createTestAgent(apiKey);
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(agent);

      await useCase.execute({ apiKey });

      expect(mockAgentRepo.findByApiKeyPrefix).toHaveBeenCalledWith('fr_live');
    });

    it('should verify full API key hash', async () => {
      const apiKey = generateApiKey('live');
      const agent = createTestAgent(apiKey);
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(agent);

      await useCase.execute({ apiKey });

      expect(mockApiKeyGenerator.hash).toHaveBeenCalledWith(apiKey);
    });

    it('should return complete agent context', async () => {
      const apiKey = generateApiKey('live');
      const agent = createTestAgent(apiKey, {
        displayName: 'Bot Agent',
        description: 'Bot description',
      });
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(agent);

      const result = await useCase.execute({ apiKey });

      expect(result.agent).toEqual({
        agentId: agent.id,
        displayName: 'Bot Agent',
        description: 'Bot description',
        ownerActorId: null,
        metadata: { env: 'test' },
      });
    });

    it('should work with different API key prefixes', async () => {
      const apiKey = generateApiKey('test');
      const agent = createTestAgent(apiKey);
      vi.mocked(mockApiKeyGenerator.extractPrefix).mockReturnValue('fr_test');
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(agent);

      await useCase.execute({ apiKey });

      expect(mockAgentRepo.findByApiKeyPrefix).toHaveBeenCalledWith('fr_test');
    });
  });

  describe('authentication failures', () => {
    it('should throw MalformedApiKeyError for invalid format', async () => {
      vi.mocked(mockApiKeyGenerator.isValid).mockReturnValue(false);

      await expect(
        useCase.execute({ apiKey: 'invalid-key' })
      ).rejects.toThrow(MalformedApiKeyError);
      await expect(
        useCase.execute({ apiKey: 'invalid-key' })
      ).rejects.toThrow('API key format is invalid');
    });

    it('should throw InvalidApiKeyError when agent not found by prefix', async () => {
      const apiKey = generateApiKey('live');
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(null);

      await expect(useCase.execute({ apiKey })).rejects.toThrow(
        InvalidApiKeyError
      );
      await expect(useCase.execute({ apiKey })).rejects.toThrow(
        'Invalid API key'
      );
    });

    it('should throw InvalidApiKeyError when hash does not match', async () => {
      const apiKey = generateApiKey('live');
      const differentApiKey = generateApiKey('live');
      const agent = createTestAgent(differentApiKey); // Agent has different key
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(agent);

      await expect(useCase.execute({ apiKey })).rejects.toThrow(
        InvalidApiKeyError
      );
    });

    it('should not check hash if agent not found', async () => {
      const apiKey = generateApiKey('live');
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(null);

      try {
        await useCase.execute({ apiKey });
      } catch {
        // Expected error
      }

      // hash should not be called after agent not found
      expect(mockApiKeyGenerator.hash).not.toHaveBeenCalled();
    });
  });

  describe('agent status', () => {
    it('should throw AgentDeactivatedError when agent is deactivated', async () => {
      const apiKey = generateApiKey('live');
      const agent = createTestAgent(apiKey, { isActive: false });
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(agent);

      await expect(useCase.execute({ apiKey })).rejects.toThrow(
        AgentDeactivatedError
      );
      await expect(useCase.execute({ apiKey })).rejects.toThrow(
        'This agent has been deactivated'
      );
    });

    it('should verify hash before checking active status', async () => {
      const apiKey = generateApiKey('live');
      const agent = createTestAgent(apiKey, { isActive: false });
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(agent);

      try {
        await useCase.execute({ apiKey });
      } catch {
        // Expected error
      }

      // Hash should be verified even for deactivated agents
      expect(mockApiKeyGenerator.hash).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle agent with null description', async () => {
      const apiKey = generateApiKey('live');
      const agent = createTestAgent(apiKey, { description: null });
      vi.mocked(mockAgentRepo.findByApiKeyPrefix).mockResolvedValue(agent);

      const result = await useCase.execute({ apiKey });

      expect(result.agent.description).toBeNull();
    });
  });
});
