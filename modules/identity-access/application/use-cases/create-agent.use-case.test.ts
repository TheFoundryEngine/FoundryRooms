import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CreateAgentUseCase,
  InvalidAgentNameError,
  InvalidApiKeyPrefixError,
} from './create-agent.use-case';
import type { CreateAgentDeps } from './create-agent.use-case';
import { generateApiKey, hashApiKey } from '../../domain';
import type { ApiKey } from '../../domain';
import type { AgentRepository } from '../ports/agent.repository';
import type { ApiKeyGeneratorPort } from '../ports/api-key-generator.port';
import type { EventEmitterPort, DomainEvent } from '../ports/event-emitter.port';

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
  const generatedKey = generateApiKey('live');
  return {
    generate: vi.fn().mockReturnValue(generatedKey),
    hash: vi.fn().mockImplementation((key: ApiKey) => hashApiKey(key)),
    extractPrefix: vi.fn().mockReturnValue('fr_live'),
    isValid: vi.fn().mockReturnValue(true),
  };
}

function createMockEventEmitter(): EventEmitterPort {
  return {
    emit: vi.fn().mockResolvedValue(undefined),
    emitMany: vi.fn().mockResolvedValue(undefined),
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('CreateAgentUseCase', () => {
  let useCase: CreateAgentUseCase;
  let mockAgentRepo: AgentRepository;
  let mockApiKeyGenerator: ApiKeyGeneratorPort;
  let mockEventEmitter: EventEmitterPort;

  beforeEach(() => {
    mockAgentRepo = createMockAgentRepository();
    mockApiKeyGenerator = createMockApiKeyGenerator();
    mockEventEmitter = createMockEventEmitter();

    const deps: CreateAgentDeps = {
      agentRepository: mockAgentRepo,
      apiKeyGenerator: mockApiKeyGenerator,
      eventEmitter: mockEventEmitter,
    };

    useCase = new CreateAgentUseCase(deps);
  });

  const validInput = {
    displayName: 'Test Agent',
    description: 'A test agent for testing purposes',
  };

  describe('successful agent creation', () => {
    it('should create a new agent successfully', async () => {
      const result = await useCase.execute(validInput);

      expect(result.displayName).toBe('Test Agent');
      expect(result.description).toBe('A test agent for testing purposes');
      expect(result.agentId).toBeDefined();
      expect(result.apiKey).toBeDefined();
      expect(result.apiKeyPrefix).toBe('fr_live');
    });

    it('should generate an API key using the generator', async () => {
      await useCase.execute(validInput);

      expect(mockApiKeyGenerator.generate).toHaveBeenCalledWith('live');
    });

    it('should hash the API key', async () => {
      await useCase.execute(validInput);

      expect(mockApiKeyGenerator.hash).toHaveBeenCalled();
    });

    it('should extract prefix from API key', async () => {
      await useCase.execute(validInput);

      expect(mockApiKeyGenerator.extractPrefix).toHaveBeenCalled();
    });

    it('should save the agent to repository', async () => {
      await useCase.execute(validInput);

      expect(mockAgentRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should emit AgentCreated event', async () => {
      const result = await useCase.execute(validInput);

      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      const calls = (mockEventEmitter.emit as ReturnType<typeof vi.fn>).mock.calls;
      const firstCall = calls[0];
      expect(firstCall).toBeDefined();
      const emittedEvent = firstCall![0] as DomainEvent;

      expect(emittedEvent.type).toBe('identity.agent.created');
      expect(emittedEvent.aggregateType).toBe('agent');
      expect(emittedEvent.aggregateId).toBe(result.agentId);
    });

    it('should return the plaintext API key (only time visible)', async () => {
      const result = await useCase.execute(validInput);

      expect(result.apiKey).toMatch(/^fr_live_[a-f0-9]{64}$/);
    });

    it('should use custom API key prefix when provided', async () => {
      const customKey = generateApiKey('test');
      vi.mocked(mockApiKeyGenerator.generate).mockReturnValue(customKey);
      vi.mocked(mockApiKeyGenerator.extractPrefix).mockReturnValue('fr_test');

      const result = await useCase.execute({
        ...validInput,
        apiKeyPrefix: 'test',
      });

      expect(mockApiKeyGenerator.generate).toHaveBeenCalledWith('test');
      expect(result.apiKeyPrefix).toBe('fr_test');
    });

    it('should set ownerActorId when provided', async () => {
      const ownerId = '550e8400-e29b-41d4-a716-446655440000';
      await useCase.execute({
        ...validInput,
        ownerActorId: ownerId,
      });

      const calls = (mockEventEmitter.emit as ReturnType<typeof vi.fn>).mock.calls;
      const firstCall = calls[0];
      expect(firstCall).toBeDefined();
      const emittedEvent = firstCall![0] as DomainEvent;
      expect(emittedEvent.payload.ownerActorId).toBe(ownerId);
    });

    it('should accept optional metadata', async () => {
      await useCase.execute({
        ...validInput,
        metadata: { key: 'value', count: 42 },
      });

      expect(mockAgentRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should trim display name whitespace', async () => {
      const result = await useCase.execute({
        ...validInput,
        displayName: '  Test Agent  ',
      });

      expect(result.displayName).toBe('Test Agent');
    });
  });

  describe('validation errors', () => {
    it('should throw InvalidAgentNameError for empty display name', async () => {
      await expect(
        useCase.execute({ ...validInput, displayName: '' })
      ).rejects.toThrow(InvalidAgentNameError);
      await expect(
        useCase.execute({ ...validInput, displayName: '' })
      ).rejects.toThrow('Agent display name cannot be empty');
    });

    it('should throw InvalidAgentNameError for whitespace-only display name', async () => {
      await expect(
        useCase.execute({ ...validInput, displayName: '   ' })
      ).rejects.toThrow(InvalidAgentNameError);
    });

    it('should throw InvalidApiKeyPrefixError for invalid prefix', async () => {
      await expect(
        useCase.execute({ ...validInput, apiKeyPrefix: 'Test' })
      ).rejects.toThrow(InvalidApiKeyPrefixError);
      await expect(
        useCase.execute({ ...validInput, apiKeyPrefix: 'test123' })
      ).rejects.toThrow(InvalidApiKeyPrefixError);
      await expect(
        useCase.execute({ ...validInput, apiKeyPrefix: 'test-key' })
      ).rejects.toThrow(InvalidApiKeyPrefixError);
    });

    it('should not save agent if validation fails', async () => {
      try {
        await useCase.execute({ ...validInput, displayName: '' });
      } catch {
        // Expected error
      }

      expect(mockAgentRepo.save).not.toHaveBeenCalled();
    });

    it('should not emit event if validation fails', async () => {
      try {
        await useCase.execute({ ...validInput, displayName: '' });
      } catch {
        // Expected error
      }

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('optional fields', () => {
    it('should handle null description', async () => {
      const result = await useCase.execute({
        displayName: 'Test Agent',
        description: null,
      });

      expect(result.description).toBeNull();
    });

    it('should handle undefined description', async () => {
      const result = await useCase.execute({
        displayName: 'Test Agent',
      });

      expect(result.description).toBeNull();
    });

    it('should handle null ownerActorId', async () => {
      await useCase.execute({
        ...validInput,
        ownerActorId: null,
      });

      const calls = (mockEventEmitter.emit as ReturnType<typeof vi.fn>).mock.calls;
      const firstCall = calls[0];
      expect(firstCall).toBeDefined();
      const emittedEvent = firstCall![0] as DomainEvent;
      expect(emittedEvent.payload.ownerActorId).toBeNull();
    });
  });
});
