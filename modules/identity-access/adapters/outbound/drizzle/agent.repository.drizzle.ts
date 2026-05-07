/**
 * Drizzle Agent Repository Implementation
 *
 * Implements the AgentRepository interface using Drizzle ORM.
 * Maps between domain Agent entities and database rows (actors + agents tables).
 */

import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { ActorId, Agent as DomainAgent, AgentProps } from '../../../domain';
import { createActorId, createApiKeyHash, Agent } from '../../../domain';
import type { AgentRepository } from '../../../application/ports/agent.repository';
import { actors, agents } from './schema.js';
import type * as schema from './schema.js';

/**
 * Database row type for joined actor + agent data
 */
interface AgentRow {
  actor: {
    id: string;
    type: string;
    displayName: string;
    avatarUrl: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
  agent: {
    actorId: string;
    apiKeyHash: string;
    apiKeyPrefix: string;
    ownerActorId: string | null;
    description: string | null;
    metadata: unknown;
  };
}

/**
 * Maps database rows to domain Agent entity
 */
function toDomain(row: AgentRow): DomainAgent {
  const props: AgentProps = {
    id: createActorId(row.actor.id),
    type: 'agent' as const,
    displayName: row.actor.displayName,
    avatarUrl: row.actor.avatarUrl,
    isActive: row.actor.isActive ?? true,
    createdAt: row.actor.createdAt ?? new Date(),
    updatedAt: row.actor.updatedAt ?? new Date(),
    apiKeyHash: createApiKeyHash(row.agent.apiKeyHash),
    ownerActorId: row.agent.ownerActorId
      ? createActorId(row.agent.ownerActorId)
      : null,
    description: row.agent.description,
    metadata: (row.agent.metadata as Record<string, unknown>) ?? {},
  };

  return Agent.fromPersistence(props);
}

/**
 * Extracts the API key prefix from a full API key
 * Format: "fr_<prefix>_<random>"
 */
function extractApiKeyPrefix(apiKey: string): string {
  const parts = apiKey.split('_');
  if (parts.length >= 2) {
    return `${parts[0]}_${parts[1]}`;
  }
  return apiKey;
}

/**
 * Drizzle implementation of AgentRepository
 */
export class AgentRepositoryDrizzle implements AgentRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Finds an agent by their unique identifier
   */
  async findById(id: ActorId): Promise<DomainAgent | null> {
    const result = await this.db
      .select({
        actor: actors,
        agent: agents,
      })
      .from(actors)
      .innerJoin(agents, eq(agents.actorId, actors.id))
      .where(eq(actors.id, id))
      .limit(1);

    const row = result[0];
    if (!row) {
      return null;
    }

    return toDomain(row);
  }

  /**
   * Finds an agent by their API key prefix
   *
   * API keys have a format like "fr_live_<random>".
   * This method searches by the prefix portion to quickly narrow down candidates
   * before performing full hash comparison.
   */
  async findByApiKeyPrefix(prefix: string): Promise<DomainAgent | null> {
    // Extract just the prefix part if a full key was provided
    const normalizedPrefix = extractApiKeyPrefix(prefix);

    const result = await this.db
      .select({
        actor: actors,
        agent: agents,
      })
      .from(actors)
      .innerJoin(agents, eq(agents.actorId, actors.id))
      .where(eq(agents.apiKeyPrefix, normalizedPrefix))
      .limit(1);

    const row = result[0];
    if (!row) {
      return null;
    }

    return toDomain(row);
  }

  /**
   * Creates a new agent
   * Uses a transaction to ensure both actor and agent tables are updated atomically
   */
  async save(agent: DomainAgent): Promise<void> {
    const props = agent.toJSON();

    // Extract API key prefix from the hash (not ideal, but we store it separately)
    // In practice, the prefix should be extracted from the original API key
    // and passed to the repository, but for now we'll use a placeholder
    const apiKeyPrefix = 'fr_live';

    await this.db.transaction(async (tx) => {
      // Insert into actors table
      await tx.insert(actors).values({
        id: props.id,
        type: props.type,
        displayName: props.displayName,
        avatarUrl: props.avatarUrl,
        isActive: props.isActive,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      });

      // Insert into agents table
      await tx.insert(agents).values({
        actorId: props.id,
        apiKeyHash: props.apiKeyHash,
        apiKeyPrefix: apiKeyPrefix,
        ownerActorId: props.ownerActorId,
        description: props.description,
        metadata: props.metadata,
      });
    });
  }

  /**
   * Updates an existing agent
   * Uses a transaction to ensure both actor and agent tables are updated atomically
   */
  async update(agent: DomainAgent): Promise<void> {
    const props = agent.toJSON();

    await this.db.transaction(async (tx) => {
      // Update actors table
      await tx
        .update(actors)
        .set({
          displayName: props.displayName,
          avatarUrl: props.avatarUrl,
          isActive: props.isActive,
          updatedAt: props.updatedAt,
        })
        .where(eq(actors.id, props.id));

      // Update agents table
      await tx
        .update(agents)
        .set({
          apiKeyHash: props.apiKeyHash,
          ownerActorId: props.ownerActorId,
          description: props.description,
          metadata: props.metadata,
        })
        .where(eq(agents.actorId, props.id));
    });
  }
}
