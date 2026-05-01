/**
 * Reset Token Repository Port Interface
 *
 * Defines the contract for password reset token persistence operations.
 */

import type { ActorId } from '../../domain';

/**
 * Reset token value object
 * Contains the token data needed for password reset validation
 */
export interface ResetToken {
  /** Unique token identifier (UUID) */
  id: string;
  /** The user this token belongs to */
  userId: ActorId;
  /** SHA-256 hash of the actual token */
  tokenHash: string;
  /** When the token expires */
  expiresAt: Date;
  /** When the token was created */
  createdAt: Date;
  /** Whether the token has been used */
  usedAt: Date | null;
}

/**
 * Input for creating a new reset token
 */
export interface CreateResetTokenInput {
  userId: ActorId;
  tokenHash: string;
  expiresAt: Date;
}

/**
 * Repository interface for password reset tokens
 *
 * Provides persistence operations for password reset token management.
 */
export interface ResetTokenRepository {
  /**
   * Finds a reset token by its hash
   *
   * @param tokenHash - The SHA-256 hash of the token
   * @returns The reset token if found, null otherwise
   */
  findByTokenHash(tokenHash: string): Promise<ResetToken | null>;

  /**
   * Finds active (non-expired, non-used) tokens for a user
   *
   * @param userId - The user's unique identifier
   * @returns Array of active reset tokens for the user
   */
  findActiveByUserId(userId: ActorId): Promise<ResetToken[]>;

  /**
   * Creates a new reset token
   *
   * @param input - The reset token data
   * @returns The created reset token
   */
  create(input: CreateResetTokenInput): Promise<ResetToken>;

  /**
   * Marks a token as used
   *
   * @param tokenHash - The SHA-256 hash of the token to mark as used
   */
  markAsUsed(tokenHash: string): Promise<void>;

  /**
   * Invalidates all active tokens for a user
   *
   * Used when a password reset is completed or when security requires it.
   *
   * @param userId - The user's unique identifier
   */
  invalidateAllForUser(userId: ActorId): Promise<void>;

  /**
   * Deletes expired tokens (cleanup operation)
   *
   * @returns The number of tokens deleted
   */
  deleteExpired(): Promise<number>;
}
