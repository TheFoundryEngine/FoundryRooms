/**
 * Session Repository Port Interface
 *
 * Defines the contract for Session persistence operations.
 */

import type { ActorId, Session, SessionId } from '../../domain';

/**
 * Repository interface for Session entities
 *
 * Provides CRUD operations and query methods for session management.
 */
export interface SessionRepository {
  /**
   * Finds a session by its unique identifier
   *
   * @param id - The session's unique identifier
   * @returns The session if found, null otherwise
   */
  findById(id: SessionId): Promise<Session | null>;

  /**
   * Finds a session by its token hash
   *
   * Note: The implementation should hash the token before comparison.
   *
   * @param token - The session token (plaintext)
   * @returns The session if found, null otherwise
   */
  findByToken(token: string): Promise<Session | null>;

  /**
   * Finds all sessions for a specific actor
   *
   * @param actorId - The actor's unique identifier
   * @returns Array of sessions belonging to the actor
   */
  findByActorId(actorId: ActorId): Promise<Session[]>;

  /**
   * Persists a session (create or update)
   *
   * @param session - The session entity to save
   */
  save(session: Session): Promise<void>;

  /**
   * Deletes a session by its token
   *
   * Used for logout operations.
   *
   * @param token - The session token (plaintext)
   */
  deleteByToken(token: string): Promise<void>;

  /**
   * Deletes all sessions for a specific actor
   *
   * Used for "logout everywhere" or account deactivation.
   *
   * @param actorId - The actor's unique identifier
   */
  deleteByActorId(actorId: ActorId): Promise<void>;
}
