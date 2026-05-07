/**
 * Agent Controller
 *
 * HTTP endpoints for agent management:
 * - POST /agents - Create a new agent
 * - GET /agents/:id - Get agent details
 * - POST /agents/:id/rotate-key - Rotate agent API key
 * - DELETE /agents/:id - Deactivate an agent
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import {
  CreateAgentDto,
  CreateAgentResponseDto,
  AgentResponseDto,
  RotateApiKeyResponseDto,
  type ActorContext,
} from './dto';
import { AuthGuard, Actor } from './auth.middleware';
import type { CreateAgentUseCase } from '../../application/use-cases/create-agent.use-case';
import type { AgentRepository } from '../../application/ports/agent.repository';
import type { ApiKeyGeneratorPort } from '../../application/ports/api-key-generator.port';
import {
  InvalidAgentNameError,
  InvalidApiKeyPrefixError,
} from '../../application/use-cases/create-agent.use-case';
import type { ActorId } from '../../domain';

// Import Zod schemas from contracts for validation
import { CreateAgentRequest } from '../../../../contracts/api/identity-access';

// ============================================================================
// Injection Tokens
// ============================================================================

export const CREATE_AGENT_USE_CASE = Symbol('CREATE_AGENT_USE_CASE');
export const AGENT_REPOSITORY = Symbol('AGENT_REPOSITORY');
export const API_KEY_GENERATOR = Symbol('API_KEY_GENERATOR');

// ============================================================================
// Controller
// ============================================================================

@Controller('agents')
@UseGuards(AuthGuard)
export class AgentController {
  constructor(
    @Inject(CREATE_AGENT_USE_CASE)
    private readonly createAgentUseCase: CreateAgentUseCase,
    @Inject(AGENT_REPOSITORY)
    private readonly agentRepository: AgentRepository,
    @Inject(API_KEY_GENERATOR)
    private readonly apiKeyGenerator: ApiKeyGeneratorPort,
  ) {}

  /**
   * POST /agents
   *
   * Create a new agent.
   * Requires authentication.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAgent(
    @Body() body: CreateAgentDto,
    @Actor() actor: ActorContext,
  ): Promise<CreateAgentResponseDto> {
    // Validate request body with Zod schema
    const validation = CreateAgentRequest.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new BadRequestException(errors.join('; '));
    }

    try {
      const result = await this.createAgentUseCase.execute({
        displayName: validation.data.displayName,
        description: validation.data.description ?? null,
        ownerActorId: actor.actorId,
      });

      return CreateAgentResponseDto.fromOutput(result);
    } catch (error) {
      if (error instanceof InvalidAgentNameError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof InvalidApiKeyPrefixError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * GET /agents/:id
   *
   * Get agent details by ID.
   * Requires authentication.
   * Returns 404 if agent not found or not owned by caller.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getAgent(
    @Param('id') id: string,
    @Actor() actor: ActorContext,
  ): Promise<AgentResponseDto> {
    // Validate UUID format
    const uuidSchema = z.string().uuid();
    const validation = uuidSchema.safeParse(id);
    if (!validation.success) {
      throw new BadRequestException('Invalid agent ID format');
    }

    const agent = await this.agentRepository.findById(id as ActorId);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Check ownership - agent owner or the agent itself can view
    if (agent.ownerActorId !== actor.actorId && agent.id !== actor.actorId) {
      throw new ForbiddenException('You do not have access to this agent');
    }

    return AgentResponseDto.fromEntity(agent);
  }

  /**
   * POST /agents/:id/rotate-key
   *
   * Rotate the API key for an agent.
   * Requires authentication.
   * Only the owner or the agent itself can rotate the key.
   */
  @Post(':id/rotate-key')
  @HttpCode(HttpStatus.OK)
  async rotateApiKey(
    @Param('id') id: string,
    @Actor() actor: ActorContext,
  ): Promise<RotateApiKeyResponseDto> {
    // Validate UUID format
    const uuidSchema = z.string().uuid();
    const validation = uuidSchema.safeParse(id);
    if (!validation.success) {
      throw new BadRequestException('Invalid agent ID format');
    }

    const agent = await this.agentRepository.findById(id as ActorId);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Check ownership - agent owner or the agent itself can rotate
    if (agent.ownerActorId !== actor.actorId && agent.id !== actor.actorId) {
      throw new ForbiddenException('You do not have permission to rotate this key');
    }

    // Rotate the key
    const newApiKey = agent.rotateApiKey();
    const prefix = this.apiKeyGenerator.extractPrefix(newApiKey);

    // Save the updated agent
    await this.agentRepository.update(agent);

    return RotateApiKeyResponseDto.fromOutput({
      apiKey: newApiKey,
      apiKeyPrefix: prefix,
    });
  }

  /**
   * DELETE /agents/:id
   *
   * Deactivate an agent.
   * Requires authentication.
   * Only the owner can deactivate an agent.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateAgent(
    @Param('id') id: string,
    @Actor() actor: ActorContext,
  ): Promise<void> {
    // Validate UUID format
    const uuidSchema = z.string().uuid();
    const validation = uuidSchema.safeParse(id);
    if (!validation.success) {
      throw new BadRequestException('Invalid agent ID format');
    }

    const agent = await this.agentRepository.findById(id as ActorId);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Only owner can deactivate (agent cannot deactivate itself)
    if (agent.ownerActorId !== actor.actorId) {
      throw new ForbiddenException('You do not have permission to deactivate this agent');
    }

    // Deactivate the agent
    agent.deactivate();

    // Save the updated agent
    await this.agentRepository.update(agent);
  }
}
