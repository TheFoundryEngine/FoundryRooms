/**
 * Agent Controller Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AgentController } from './agent.controller';
import type { CreateAgentUseCase, CreateAgentOutput } from '../../application/use-cases/create-agent.use-case';
import type { AgentRepository } from '../../application/ports/agent.repository';
import type { ApiKeyGeneratorPort } from '../../application/ports/api-key-generator.port';
import { InvalidAgentNameError } from '../../application/use-cases/create-agent.use-case';
import { Agent, createApiKeyHash } from '../../domain';
import type { ActorId, ApiKey } from '../../domain';

// ============================================================================
// Mocks
// ============================================================================

function createMockCreateAgentUseCase(): CreateAgentUseCase {
  return {
    execute: vi.fn(),
  } as unknown as CreateAgentUseCase;
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
    extractPrefix: vi.fn().mockReturnValue('fr_live'),
    isValid: vi.fn().mockReturnValue(true),
  };
}

function createMockAgent(props: Partial<{
  id: string;
  displayName: string;
  ownerActorId: string | null;
  description: string | null;
  isActive: boolean;
}> = {}): Agent {
  const now = new Date();
  return Agent.fromPersistence({
    id: (props.id ?? 'agent-id-123') as ActorId,
    type: 'agent',
    displayName: props.displayName ?? 'Test Agent',
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
    isActive: props.isActive ?? true,
    apiKeyHash: createApiKeyHash('a'.repeat(64)),
    ownerActorId: props.ownerActorId as ActorId | null ?? null,
    description: props.description ?? null,
    metadata: {},
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('AgentController', () => {
  let controller: AgentController;
  let createAgentUseCase: CreateAgentUseCase;
  let agentRepository: AgentRepository;
  let apiKeyGenerator: ApiKeyGeneratorPort;

  beforeEach(() => {
    createAgentUseCase = createMockCreateAgentUseCase();
    agentRepository = createMockAgentRepository();
    apiKeyGenerator = createMockApiKeyGenerator();
    controller = new AgentController(createAgentUseCase, agentRepository, apiKeyGenerator);
  });

  describe('createAgent', () => {
    it('should create an agent successfully', async () => {
      const input = {
        displayName: 'My Bot',
        description: 'A helpful bot',
      };

      const actor = {
        actorId: 'owner-id-123' as ActorId,
        actorType: 'user' as const,
      };

      const output: CreateAgentOutput = {
        agentId: 'agent-id-456' as ActorId,
        displayName: 'My Bot',
        description: 'A helpful bot',
        apiKey: 'fr_live_abc123' as ApiKey,
        apiKeyPrefix: 'fr_live',
      };

      vi.mocked(createAgentUseCase.execute).mockResolvedValue(output);

      const result = await controller.createAgent(input, actor);

      expect(result.agent.id).toBe('agent-id-456');
      expect(result.agent.displayName).toBe('My Bot');
      expect(result.apiKey).toBe('fr_live_abc123');
      expect(createAgentUseCase.execute).toHaveBeenCalledWith({
        displayName: 'My Bot',
        description: 'A helpful bot',
        ownerActorId: 'owner-id-123',
      });
    });

    it('should throw BadRequestException for empty display name', async () => {
      const input = {
        displayName: '',
      };

      const actor = {
        actorId: 'owner-id-123' as ActorId,
        actorType: 'user' as const,
      };

      await expect(controller.createAgent(input, actor)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for too long display name', async () => {
      const input = {
        displayName: 'a'.repeat(101),
      };

      const actor = {
        actorId: 'owner-id-123' as ActorId,
        actorType: 'user' as const,
      };

      await expect(controller.createAgent(input, actor)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid agent name from use case', async () => {
      const input = {
        displayName: 'Valid Name',
      };

      const actor = {
        actorId: 'owner-id-123' as ActorId,
        actorType: 'user' as const,
      };

      vi.mocked(createAgentUseCase.execute).mockRejectedValue(
        new InvalidAgentNameError('Invalid name')
      );

      await expect(controller.createAgent(input, actor)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAgent', () => {
    it('should return agent when owner requests', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000';
      const ownerId = 'owner-id-123' as ActorId;

      const agent = createMockAgent({
        id: agentId,
        displayName: 'Test Agent',
        ownerActorId: ownerId,
        description: 'A test agent',
      });

      vi.mocked(agentRepository.findById).mockResolvedValue(agent);

      const actor = {
        actorId: ownerId,
        actorType: 'user' as const,
      };

      const result = await controller.getAgent(agentId, actor);

      expect(result.id).toBe(agentId);
      expect(result.displayName).toBe('Test Agent');
      expect(result.description).toBe('A test agent');
    });

    it('should return agent when agent requests itself', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000' as ActorId;

      const agent = createMockAgent({
        id: agentId,
        displayName: 'Self Agent',
        ownerActorId: 'some-other-owner' as ActorId,
      });

      vi.mocked(agentRepository.findById).mockResolvedValue(agent);

      const actor = {
        actorId: agentId,
        actorType: 'agent' as const,
      };

      const result = await controller.getAgent(agentId, actor);

      expect(result.id).toBe(agentId);
    });

    it('should throw BadRequestException for invalid UUID', async () => {
      const actor = {
        actorId: 'owner-id-123' as ActorId,
        actorType: 'user' as const,
      };

      await expect(controller.getAgent('invalid-id', actor)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when agent does not exist', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000';

      vi.mocked(agentRepository.findById).mockResolvedValue(null);

      const actor = {
        actorId: 'owner-id-123' as ActorId,
        actorType: 'user' as const,
      };

      await expect(controller.getAgent(agentId, actor)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not owner', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000';

      const agent = createMockAgent({
        id: agentId,
        ownerActorId: 'other-owner' as ActorId,
      });

      vi.mocked(agentRepository.findById).mockResolvedValue(agent);

      const actor = {
        actorId: 'not-the-owner' as ActorId,
        actorType: 'user' as const,
      };

      await expect(controller.getAgent(agentId, actor)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('rotateApiKey', () => {
    it('should rotate API key when owner requests', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000';
      const ownerId = 'owner-id-123' as ActorId;

      const agent = createMockAgent({
        id: agentId,
        ownerActorId: ownerId,
      });

      vi.mocked(agentRepository.findById).mockResolvedValue(agent);

      const actor = {
        actorId: ownerId,
        actorType: 'user' as const,
      };

      const result = await controller.rotateApiKey(agentId, actor);

      expect(result.apiKey).toBeDefined();
      expect(result.apiKeyPrefix).toBe('fr_live');
      expect(agentRepository.update).toHaveBeenCalledWith(agent);
    });

    it('should rotate API key when agent requests for itself', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000' as ActorId;

      const agent = createMockAgent({
        id: agentId,
        ownerActorId: 'some-owner' as ActorId,
      });

      vi.mocked(agentRepository.findById).mockResolvedValue(agent);

      const actor = {
        actorId: agentId,
        actorType: 'agent' as const,
      };

      const result = await controller.rotateApiKey(agentId, actor);

      expect(result.apiKey).toBeDefined();
      expect(agentRepository.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when not owner', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000';

      const agent = createMockAgent({
        id: agentId,
        ownerActorId: 'other-owner' as ActorId,
      });

      vi.mocked(agentRepository.findById).mockResolvedValue(agent);

      const actor = {
        actorId: 'not-the-owner' as ActorId,
        actorType: 'user' as const,
      };

      await expect(controller.rotateApiKey(agentId, actor)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when agent does not exist', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000';

      vi.mocked(agentRepository.findById).mockResolvedValue(null);

      const actor = {
        actorId: 'owner-id-123' as ActorId,
        actorType: 'user' as const,
      };

      await expect(controller.rotateApiKey(agentId, actor)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivateAgent', () => {
    it('should deactivate agent when owner requests', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000';
      const ownerId = 'owner-id-123' as ActorId;

      const agent = createMockAgent({
        id: agentId,
        ownerActorId: ownerId,
        isActive: true,
      });

      vi.mocked(agentRepository.findById).mockResolvedValue(agent);

      const actor = {
        actorId: ownerId,
        actorType: 'user' as const,
      };

      await controller.deactivateAgent(agentId, actor);

      expect(agent.isActive).toBe(false);
      expect(agentRepository.update).toHaveBeenCalledWith(agent);
    });

    it('should throw ForbiddenException when agent tries to deactivate itself', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000' as ActorId;

      const agent = createMockAgent({
        id: agentId,
        ownerActorId: 'some-owner' as ActorId,
      });

      vi.mocked(agentRepository.findById).mockResolvedValue(agent);

      const actor = {
        actorId: agentId,
        actorType: 'agent' as const,
      };

      await expect(controller.deactivateAgent(agentId, actor)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when not owner', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000';

      const agent = createMockAgent({
        id: agentId,
        ownerActorId: 'other-owner' as ActorId,
      });

      vi.mocked(agentRepository.findById).mockResolvedValue(agent);

      const actor = {
        actorId: 'not-the-owner' as ActorId,
        actorType: 'user' as const,
      };

      await expect(controller.deactivateAgent(agentId, actor)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when agent does not exist', async () => {
      const agentId = '550e8400-e29b-41d4-a716-446655440000';

      vi.mocked(agentRepository.findById).mockResolvedValue(null);

      const actor = {
        actorId: 'owner-id-123' as ActorId,
        actorType: 'user' as const,
      };

      await expect(controller.deactivateAgent(agentId, actor)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid UUID', async () => {
      const actor = {
        actorId: 'owner-id-123' as ActorId,
        actorType: 'user' as const,
      };

      await expect(controller.deactivateAgent('invalid-id', actor)).rejects.toThrow(BadRequestException);
    });
  });
});
