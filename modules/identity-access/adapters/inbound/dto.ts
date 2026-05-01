/**
 * Identity-Access HTTP DTOs
 *
 * Data Transfer Objects for HTTP request/response bodies.
 * These classes provide NestJS decorator support while matching our Zod contracts.
 */

import type { ActorId, ActorType, SessionToken, Email } from '../../domain';

// ============================================================================
// Auth DTOs
// ============================================================================

/**
 * Request body for user registration
 */
export class RegisterUserDto {
  email!: string;
  password!: string;
  displayName!: string;
}

/**
 * Response for user registration
 */
export class RegisterUserResponseDto {
  userId!: string;
  email!: string;
  displayName!: string;

  static fromOutput(output: {
    userId: ActorId;
    email: Email;
    displayName: string;
  }): RegisterUserResponseDto {
    const dto = new RegisterUserResponseDto();
    dto.userId = output.userId;
    dto.email = output.email;
    dto.displayName = output.displayName;
    return dto;
  }
}

/**
 * Request body for login
 */
export class LoginDto {
  email!: string;
  password!: string;
  rememberMe?: boolean;
}

/**
 * Response for login
 */
export class LoginResponseDto {
  token!: string;
  actor!: ActorSummaryDto;
  expiresAt!: string;

  static fromOutput(output: {
    sessionToken: SessionToken;
    userId: ActorId;
    displayName: string;
    email: Email;
    expiresAt: Date;
  }): LoginResponseDto {
    const dto = new LoginResponseDto();
    dto.token = output.sessionToken;
    dto.actor = {
      id: output.userId,
      type: 'user',
      displayName: output.displayName,
      avatarUrl: null,
    };
    dto.expiresAt = output.expiresAt.toISOString();
    return dto;
  }
}

/**
 * Request body for logout
 */
export class LogoutDto {
  // Empty - session token comes from cookie/header
}

/**
 * Response for logout
 */
export class LogoutResponseDto {
  success!: boolean;

  static fromOutput(output: { success: boolean }): LogoutResponseDto {
    const dto = new LogoutResponseDto();
    dto.success = output.success;
    return dto;
  }
}

// ============================================================================
// Actor DTOs
// ============================================================================

/**
 * Actor summary for responses
 */
export class ActorSummaryDto {
  id!: string;
  type!: ActorType;
  displayName!: string;
  avatarUrl!: string | null;
}

// ============================================================================
// Agent DTOs
// ============================================================================

/**
 * Request body for creating an agent
 */
export class CreateAgentDto {
  displayName!: string;
  description?: string;
}

/**
 * Response for agent creation
 */
export class CreateAgentResponseDto {
  agent!: AgentSummaryDto;
  apiKey!: string;

  static fromOutput(output: {
    agentId: ActorId;
    displayName: string;
    description: string | null;
    apiKey: string;
    apiKeyPrefix: string;
  }): CreateAgentResponseDto {
    const dto = new CreateAgentResponseDto();
    dto.agent = {
      id: output.agentId,
      type: 'agent',
      displayName: output.displayName,
      avatarUrl: null,
    };
    dto.apiKey = output.apiKey;
    return dto;
  }
}

/**
 * Agent summary for responses
 */
export class AgentSummaryDto {
  id!: string;
  type!: 'agent';
  displayName!: string;
  avatarUrl!: string | null;
}

/**
 * Full agent response
 */
export class AgentResponseDto {
  id!: string;
  type!: 'agent';
  displayName!: string;
  avatarUrl!: string | null;
  description!: string | null;
  ownerActorId!: string | null;
  createdAt!: string;
  updatedAt!: string;
  isActive!: boolean;

  static fromEntity(agent: {
    id: ActorId;
    displayName: string;
    avatarUrl: string | null;
    description: string | null;
    ownerActorId: ActorId | null;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  }): AgentResponseDto {
    const dto = new AgentResponseDto();
    dto.id = agent.id;
    dto.type = 'agent';
    dto.displayName = agent.displayName;
    dto.avatarUrl = agent.avatarUrl;
    dto.description = agent.description;
    dto.ownerActorId = agent.ownerActorId;
    dto.createdAt = agent.createdAt.toISOString();
    dto.updatedAt = agent.updatedAt.toISOString();
    dto.isActive = agent.isActive;
    return dto;
  }
}

/**
 * Response for API key rotation
 */
export class RotateApiKeyResponseDto {
  apiKey!: string;
  apiKeyPrefix!: string;

  static fromOutput(output: {
    apiKey: string;
    apiKeyPrefix: string;
  }): RotateApiKeyResponseDto {
    const dto = new RotateApiKeyResponseDto();
    dto.apiKey = output.apiKey;
    dto.apiKeyPrefix = output.apiKeyPrefix;
    return dto;
  }
}

// ============================================================================
// Error DTOs
// ============================================================================

/**
 * Standard error response
 */
export class ErrorResponseDto {
  code!: string;
  message!: string;

  static create(code: string, message: string): ErrorResponseDto {
    const dto = new ErrorResponseDto();
    dto.code = code;
    dto.message = message;
    return dto;
  }
}

// ============================================================================
// Actor Context (for authenticated requests)
// ============================================================================

/**
 * Context attached to authenticated requests
 */
export interface ActorContext {
  actorId: ActorId;
  actorType: ActorType;
  sessionToken?: SessionToken;
}
