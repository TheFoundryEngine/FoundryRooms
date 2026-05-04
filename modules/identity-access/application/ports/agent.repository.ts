/**
 * Agent Repository Port Interface
 *
 * Defines the contract for Agent persistence operations.
 */

import type { ActorId, Agent } from '../../domain';

/**
 * Repository interface for Agent entities
 *
 * Provides CRUD operations specific to Agent entities.
 */
export interface AgentRepository {
  /**
   * Finds an agent by their unique identifier
   *
   * @param id - The agent's unique identifier
   * @returns The agent if found, null otherwise
   */
  findById(id: ActorId): Promise<Agent | null>;

  /**
   * Finds an agent by their API key prefix
   *
   * API keys have a format like "fr_live_<random>".
   * This method searches by the prefix portion to quickly narrow down candidates
   * before performing full hash comparison.
   *
   * @param prefix - The API key prefix to search for (e.g., "fr_live")
   * @returns The agent if found, null otherwise
   */
  findByApiKeyPrefix(prefix: string): Promise<Agent | null>;

  /**
   * Creates a new agent
   *
   * @param agent - The agent entity to save
   */
  save(agent: Agent): Promise<void>;

  /**
   * Updates an existing agent
   *
   * @param agent - The agent entity to update
   */
  update(agent: Agent): Promise<void>;
}
