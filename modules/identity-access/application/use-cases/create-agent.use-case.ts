/**
 * Create Agent Use Case
 *
 * Handles agent creation with API key generation,
 * secure storage, and domain event emission.
 */

import { Agent, createApiKeyHash } from '../../domain';
import type { ActorId, ApiKey } from '../../domain';
import type { AgentRepository } from '../ports/agent.repository';
import type { ApiKeyGeneratorPort } from '../ports/api-key-generator.port';
import type { EventEmitterPort, DomainEvent } from '../ports/event-emitter.port';
import { randomUUID } from 'crypto';

// ============================================================================
// Input/Output DTOs
// ============================================================================

export interface CreateAgentInput {
  displayName: string;
  description?: string | null;
  ownerActorId?: ActorId | string | null;
  avatarUrl?: string | null;
  metadata?: Record<string, unknown>;
  apiKeyPrefix?: string;
}

export interface CreateAgentOutput {
  agentId: ActorId;
  displayName: string;
  description: string | null;
  apiKey: ApiKey; // Only returned once at creation time
  apiKeyPrefix: string;
}

// ============================================================================
// Errors
// ============================================================================

export class InvalidAgentNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAgentNameError';
  }
}

export class InvalidApiKeyPrefixError extends Error {
  constructor(prefix: string) {
    super(`Invalid API key prefix: "${prefix}". Must contain only lowercase letters.`);
    this.name = 'InvalidApiKeyPrefixError';
  }
}

// ============================================================================
// Use Case
// ============================================================================

export interface CreateAgentDeps {
  agentRepository: AgentRepository;
  apiKeyGenerator: ApiKeyGeneratorPort;
  eventEmitter: EventEmitterPort;
}

export class CreateAgentUseCase {
  private readonly agentRepository: AgentRepository;
  private readonly apiKeyGenerator: ApiKeyGeneratorPort;
  private readonly eventEmitter: EventEmitterPort;

  constructor(deps: CreateAgentDeps) {
    this.agentRepository = deps.agentRepository;
    this.apiKeyGenerator = deps.apiKeyGenerator;
    this.eventEmitter = deps.eventEmitter;
  }

  async execute(input: CreateAgentInput): Promise<CreateAgentOutput> {
    // Validate display name
    if (!input.displayName || input.displayName.trim().length === 0) {
      throw new InvalidAgentNameError('Agent display name cannot be empty');
    }

    // Validate API key prefix if provided
    const prefix = input.apiKeyPrefix || 'live';
    if (!/^[a-z]+$/.test(prefix)) {
      throw new InvalidApiKeyPrefixError(prefix);
    }

    // Generate API key
    const apiKey = this.apiKeyGenerator.generate(prefix);
    const apiKeyHash = this.apiKeyGenerator.hash(apiKey);
    const apiKeyPrefix = this.apiKeyGenerator.extractPrefix(apiKey);

    // Create agent entity with pre-hashed API key
    const now = new Date();
    const agent = Agent.fromPersistence({
      id: this.generateActorId(),
      type: 'agent',
      displayName: input.displayName.trim(),
      avatarUrl: input.avatarUrl ?? null,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      apiKeyHash: createApiKeyHash(apiKeyHash),
      ownerActorId: input.ownerActorId ? this.normalizeActorId(input.ownerActorId) : null,
      description: input.description ?? null,
      metadata: input.metadata ?? {},
    });

    // Save agent
    await this.agentRepository.save(agent);

    // Emit domain event
    const event = this.createAgentCreatedEvent(agent);
    await this.eventEmitter.emit(event);

    return {
      agentId: agent.id,
      displayName: agent.displayName,
      description: agent.description,
      apiKey, // Only time the plaintext key is returned
      apiKeyPrefix,
    };
  }

  private generateActorId(): ActorId {
    return randomUUID() as ActorId;
  }

  private normalizeActorId(id: ActorId | string): ActorId {
    return id as ActorId;
  }

  private createAgentCreatedEvent(agent: Agent): DomainEvent {
    return {
      id: randomUUID(),
      type: 'identity.agent.created',
      occurredAt: new Date().toISOString(),
      aggregateId: agent.id,
      aggregateType: 'agent',
      actorId: agent.ownerActorId,
      payload: {
        agentId: agent.id,
        displayName: agent.displayName,
        description: agent.description,
        ownerActorId: agent.ownerActorId,
      },
    };
  }
}
