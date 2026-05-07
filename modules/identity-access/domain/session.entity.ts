/**
 * Session Domain Model
 *
 * A Session represents an authenticated session for any Actor (User or Agent).
 */

import { ActorId, ActorType, createActorId } from './actor.entity';
import { randomBytes, createHash } from 'crypto';

// ============================================================================
// Value Objects
// ============================================================================

/**
 * Session ID value object (branded UUID type)
 */
declare const __sessionIdBrand: unique symbol;
export type SessionId = string & { readonly [__sessionIdBrand]: never };

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createSessionId(id: string): SessionId {
  if (!UUID_REGEX.test(id)) {
    throw new Error(`Invalid SessionId: must be a valid UUID, got "${id}"`);
  }
  return id as SessionId;
}

export function generateSessionId(): SessionId {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return uuid as SessionId;
}

/**
 * Session Token value object
 *
 * A cryptographically secure token used for session authentication.
 * Format: base64url encoded 32 random bytes (43 characters)
 */
declare const __sessionTokenBrand: unique symbol;
export type SessionToken = string & { readonly [__sessionTokenBrand]: never };

/** Expected length of session token: 32 bytes in base64url = 43 chars */
export const SESSION_TOKEN_LENGTH = 43;

export function generateSessionToken(): SessionToken {
  const bytes = randomBytes(32);
  // Convert to base64url (URL-safe base64)
  const token = bytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return token as SessionToken;
}

export function createSessionToken(token: string): SessionToken {
  if (!token || token.length < 32) {
    throw new Error('Invalid session token: must be at least 32 characters');
  }
  return token as SessionToken;
}

/**
 * Hashes a session token for secure storage
 */
export function hashSessionToken(token: SessionToken): string {
  return createHash('sha256').update(token).digest('hex');
}

// ============================================================================
// Session Entity
// ============================================================================

export interface SessionProps {
  id: SessionId;
  actorId: ActorId;
  actorType: ActorType;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface CreateSessionProps {
  id?: SessionId;
  actorId: ActorId | string;
  actorType: ActorType;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface CreateSessionResult {
  session: Session;
  token: SessionToken;
}

/**
 * Session entity - represents an authenticated session
 */
export class Session {
  readonly id: SessionId;
  readonly actorId: ActorId;
  readonly actorType: ActorType;
  private _tokenHash: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  private _lastAccessedAt: Date;
  private _userAgent: string | null;
  private _ipAddress: string | null;

  private constructor(props: SessionProps) {
    this.id = props.id;
    this.actorId = props.actorId;
    this.actorType = props.actorType;
    this._tokenHash = props.tokenHash;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this._lastAccessedAt = props.lastAccessedAt;
    this._userAgent = props.userAgent ?? null;
    this._ipAddress = props.ipAddress ?? null;
  }

  // -------------------------------------------------------------------------
  // Factory Methods
  // -------------------------------------------------------------------------

  /**
   * Creates a new Session with a fresh token
   * Returns both the session and the plaintext token
   */
  static create(props: CreateSessionProps): CreateSessionResult {
    const now = new Date();
    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);

    // Validate expiration
    if (props.expiresAt <= now) {
      throw new Error('Session expiration must be in the future');
    }

    // Parse actor ID if string
    const actorId =
      typeof props.actorId === 'string'
        ? createActorId(props.actorId)
        : props.actorId;

    const session = new Session({
      id: props.id ?? generateSessionId(),
      actorId,
      actorType: props.actorType,
      tokenHash,
      expiresAt: props.expiresAt,
      createdAt: now,
      lastAccessedAt: now,
      userAgent: props.userAgent,
      ipAddress: props.ipAddress,
    });

    return { session, token };
  }

  /**
   * Reconstitutes a Session from stored data (e.g., database)
   */
  static fromPersistence(props: SessionProps): Session {
    return new Session(props);
  }

  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------

  get tokenHash(): string {
    return this._tokenHash;
  }

  get lastAccessedAt(): Date {
    return this._lastAccessedAt;
  }

  get userAgent(): string | null {
    return this._userAgent;
  }

  get ipAddress(): string | null {
    return this._ipAddress;
  }

  // -------------------------------------------------------------------------
  // Query Methods
  // -------------------------------------------------------------------------

  /**
   * Checks if the session has expired
   */
  isExpired(now: Date = new Date()): boolean {
    return now >= this.expiresAt;
  }

  /**
   * Checks if the session is still valid
   */
  isValid(now: Date = new Date()): boolean {
    return !this.isExpired(now);
  }

  /**
   * Verifies if a provided token matches this session's token
   */
  verifyToken(token: SessionToken): boolean {
    const hash = hashSessionToken(token);
    return hash === this._tokenHash;
  }

  /**
   * Gets the remaining time until expiration in milliseconds
   */
  getRemainingTime(now: Date = new Date()): number {
    const remaining = this.expiresAt.getTime() - now.getTime();
    return Math.max(0, remaining);
  }

  // -------------------------------------------------------------------------
  // Behavior Methods
  // -------------------------------------------------------------------------

  /**
   * Updates the last accessed timestamp
   */
  touch(): void {
    this._lastAccessedAt = new Date();
  }

  /**
   * Updates session metadata (user agent, IP)
   */
  updateMetadata(props: { userAgent?: string | null; ipAddress?: string | null }): void {
    if (props.userAgent !== undefined) {
      this._userAgent = props.userAgent;
    }
    if (props.ipAddress !== undefined) {
      this._ipAddress = props.ipAddress;
    }
    this.touch();
  }

  // -------------------------------------------------------------------------
  // Serialization
  // -------------------------------------------------------------------------

  toJSON(): SessionProps {
    return {
      id: this.id,
      actorId: this.actorId,
      actorType: this.actorType,
      tokenHash: this._tokenHash,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      lastAccessedAt: this._lastAccessedAt,
      userAgent: this._userAgent,
      ipAddress: this._ipAddress,
    };
  }
}

// ============================================================================
// Default Session Durations
// ============================================================================

export const SESSION_DURATIONS = {
  /** 1 hour - for sensitive operations */
  SHORT: 60 * 60 * 1000,
  /** 24 hours - default for user sessions */
  DEFAULT: 24 * 60 * 60 * 1000,
  /** 7 days - for "remember me" sessions */
  EXTENDED: 7 * 24 * 60 * 60 * 1000,
  /** 30 days - for agent API sessions */
  LONG: 30 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Creates a Date for session expiration based on duration
 */
export function createExpirationDate(
  durationMs: number,
  from: Date = new Date()
): Date {
  return new Date(from.getTime() + durationMs);
}
