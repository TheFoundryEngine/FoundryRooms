/**
 * Authenticate API Key Use Case
 *
 * Handles agent authentication by API key verification.
 * Extracts prefix for lookup, then verifies full hash.
 */

import type { Agent, ActorId, ApiKey } from '../../domain';
import type { AgentRepository } from '../ports/agent.repository';
import type { ApiKeyGeneratorPort } from '../ports/api-key-generator.port';

// ============================================================================
// Input/Output DTOs
// ============================================================================

export interface AuthenticateApiKeyInput {
  apiKey: string;
}

export interface AgentContext {
  agentId: ActorId;
  displayName: string;
  description: string | null;
  ownerActorId: ActorId | null;
  metadata: Record<string, unknown>;
}

export interface AuthenticateApiKeyOutput {
  agent: AgentContext;
}

// ============================================================================
// Errors
// ============================================================================

export class InvalidApiKeyError extends Error {
  constructor() {
    super('Invalid API key');
    this.name = 'InvalidApiKeyError';
  }
}

export class AgentDeactivatedError extends Error {
  constructor() {
    super('This agent has been deactivated');
    this.name = 'AgentDeactivatedError';
  }
}

export class MalformedApiKeyError extends Error {
  constructor() {
    super('API key format is invalid');
    this.name = 'MalformedApiKeyError';
  }
}

// ============================================================================
// Use Case
// ============================================================================

export interface AuthenticateApiKeyDeps {
  agentRepository: AgentRepository;
  apiKeyGenerator: ApiKeyGeneratorPort;
}

export class AuthenticateApiKeyUseCase {
  private readonly agentRepository: AgentRepository;
  private readonly apiKeyGenerator: ApiKeyGeneratorPort;

  constructor(deps: AuthenticateApiKeyDeps) {
    this.agentRepository = deps.agentRepository;
    this.apiKeyGenerator = deps.apiKeyGenerator;
  }

  async execute(input: AuthenticateApiKeyInput): Promise<AuthenticateApiKeyOutput> {
    const { apiKey } = input;

    // Validate API key format
    if (!this.apiKeyGenerator.isValid(apiKey)) {
      throw new MalformedApiKeyError();
    }

    // Extract prefix for lookup
    const prefix = this.apiKeyGenerator.extractPrefix(apiKey);

    // Find agent by prefix
    const agent = await this.agentRepository.findByApiKeyPrefix(prefix);
    if (!agent) {
      throw new InvalidApiKeyError();
    }

    // Verify full API key hash
    const apiKeyHash = this.apiKeyGenerator.hash(apiKey as ApiKey);
    if (apiKeyHash !== agent.apiKeyHash) {
      throw new InvalidApiKeyError();
    }

    // Check if agent is active
    if (!agent.isActive) {
      throw new AgentDeactivatedError();
    }

    // Return agent context
    return {
      agent: this.toAgentContext(agent),
    };
  }

  private toAgentContext(agent: Agent): AgentContext {
    return {
      agentId: agent.id,
      displayName: agent.displayName,
      description: agent.description,
      ownerActorId: agent.ownerActorId,
      metadata: agent.metadata,
    };
  }
}
