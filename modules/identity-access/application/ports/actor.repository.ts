/**
 * Actor Repository Port Interface
 *
 * Defines the contract for Actor persistence operations.
 * This is a port in hexagonal architecture - the actual implementation
 * (adapter) will be provided by the infrastructure layer.
 */

import type { Actor, ActorId, ActorType } from '../../domain';

/**
 * Repository interface for Actor entities
 *
 * Provides base CRUD operations for actors (both Users and Agents).
 */
export interface ActorRepository {
  /**
   * Finds an actor by their unique identifier
   *
   * @param id - The actor's unique identifier
   * @returns The actor if found, null otherwise
   */
  findById(id: ActorId): Promise<Actor | null>;

  /**
   * Finds all actors of a specific type
   *
   * @param type - The actor type to filter by ('user' or 'agent')
   * @returns Array of actors matching the type
   */
  findByType(type: ActorType): Promise<Actor[]>;

  /**
   * Persists an actor (create or update)
   *
   * @param actor - The actor entity to save
   */
  save(actor: Actor): Promise<void>;
}
