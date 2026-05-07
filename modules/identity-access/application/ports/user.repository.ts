/**
 * User Repository Port Interface
 *
 * Defines the contract for User persistence operations.
 * Extends ActorRepository with user-specific operations.
 */

import type { ActorId, Email, User } from '../../domain';
import type { ActorRepository } from './actor.repository';

/**
 * Repository interface for User entities
 *
 * Extends ActorRepository with user-specific query methods.
 */
export interface UserRepository extends ActorRepository {
  /**
   * Finds a user by their unique identifier
   *
   * @param id - The user's unique identifier
   * @returns The user if found, null otherwise
   */
  findById(id: ActorId): Promise<User | null>;

  /**
   * Finds a user by their email address
   *
   * @param email - The email address to search for
   * @returns The user if found, null otherwise
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Persists a user (create or update)
   *
   * @param user - The user entity to save
   */
  save(user: User): Promise<void>;
}
