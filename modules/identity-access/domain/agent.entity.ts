/**
 * Agent Domain Model
 *
 * An Agent is an Actor representing an automated entity (bot, integration, etc.)
 * that can perform actions in the system.
 */

import {
  Actor,
  ActorId,
  ActorProps,
  generateActorId,
  createActorId,
} from './actor.entity';
import { randomBytes, createHash } from 'crypto';

// ============================================================================
// Value Objects
// ============================================================================

/**
 * API Key value object
 *
 * Format: "fr_<prefix>_<random_bytes>"
 * - fr: FoundryRooms prefix
 * - prefix: environment or type indicator (e.g., "live", "test")
 * - random_bytes: 32 cryptographically random bytes in hex
 */
declare const __apiKeyBrand: unique symbol;
export type ApiKey = string & { readonly [__apiKeyBrand]: never };

const API_KEY_PREFIX = 'fr';
const API_KEY_REGEX = /^fr_[a-z]+_[a-f0-9]{64}$/;

export function generateApiKey(prefix: string = 'live'): ApiKey {
  if (!/^[a-z]+$/.test(prefix)) {
    throw new Error('API key prefix must contain only lowercase letters');
  }
  const random = randomBytes(32).toString('hex');
  return `${API_KEY_PREFIX}_${prefix}_${random}` as ApiKey;
}

export function isValidApiKey(key: string): key is ApiKey {
  return API_KEY_REGEX.test(key);
}

export function parseApiKey(key: string): ApiKey {
  if (!isValidApiKey(key)) {
    throw new Error('Invalid API key format');
  }
  return key;
}

/**
 * Hashes an API key for secure storage
 * Uses SHA-256 for fast comparison during authentication
 */
export function hashApiKey(key: ApiKey): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * API Key Hash value object (for stored hashes)
 */
declare const __apiKeyHashBrand: unique symbol;
export type ApiKeyHash = string & { readonly [__apiKeyHashBrand]: never };

export function createApiKeyHash(hash: string): ApiKeyHash {
  if (!hash || hash.length !== 64) {
    throw new Error('Invalid API key hash');
  }
  return hash as ApiKeyHash;
}

// ============================================================================
// Agent Entity
// ============================================================================

export interface AgentProps extends ActorProps {
  type: 'agent';
  apiKeyHash: ApiKeyHash;
  ownerActorId: ActorId | null;
  description: string | null;
  metadata: Record<string, unknown>;
}

export interface CreateAgentProps {
  id?: ActorId;
  displayName: string;
  ownerActorId?: ActorId | string | null;
  description?: string | null;
  avatarUrl?: string | null;
  metadata?: Record<string, unknown>;
  apiKeyPrefix?: string;
}

export interface CreateAgentResult {
  agent: Agent;
  apiKey: ApiKey;
}

/**
 * Agent entity - represents an automated actor in the system
 */
export class Agent extends Actor {
  private _apiKeyHash: ApiKeyHash;
  private _ownerActorId: ActorId | null;
  private _description: string | null;
  private _metadata: Record<string, unknown>;

  private constructor(props: AgentProps) {
    super(props);
    this._apiKeyHash = props.apiKeyHash;
    this._ownerActorId = props.ownerActorId;
    this._description = props.description;
    this._metadata = { ...props.metadata };
  }

  // -------------------------------------------------------------------------
  // Factory Methods
  // -------------------------------------------------------------------------

  /**
   * Creates a new Agent with a fresh API key
   * Returns both the agent and the plaintext API key (which should only be shown once)
   */
  static create(props: CreateAgentProps): CreateAgentResult {
    const now = new Date();
    const apiKey = generateApiKey(props.apiKeyPrefix);
    const apiKeyHash = createApiKeyHash(hashApiKey(apiKey));

    // Parse owner ID if provided as string
    let ownerActorId: ActorId | null = null;
    if (props.ownerActorId) {
      ownerActorId =
        typeof props.ownerActorId === 'string'
          ? createActorId(props.ownerActorId)
          : props.ownerActorId;
    }

    // Validate description length
    if (props.description && props.description.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }

    const agent = new Agent({
      id: props.id ?? generateActorId(),
      type: 'agent',
      displayName: props.displayName,
      avatarUrl: props.avatarUrl ?? null,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      apiKeyHash,
      ownerActorId,
      description: props.description ?? null,
      metadata: props.metadata ?? {},
    });

    return { agent, apiKey };
  }

  /**
   * Reconstitutes an Agent from stored data (e.g., database)
   */
  static fromPersistence(props: AgentProps): Agent {
    return new Agent(props);
  }

  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------

  get apiKeyHash(): ApiKeyHash {
    return this._apiKeyHash;
  }

  get ownerActorId(): ActorId | null {
    return this._ownerActorId;
  }

  get description(): string | null {
    return this._description;
  }

  get metadata(): Record<string, unknown> {
    return { ...this._metadata };
  }

  // -------------------------------------------------------------------------
  // Behavior Methods
  // -------------------------------------------------------------------------

  /**
   * Rotates the API key, returning the new plaintext key
   */
  rotateApiKey(prefix: string = 'live'): ApiKey {
    const apiKey = generateApiKey(prefix);
    this._apiKeyHash = createApiKeyHash(hashApiKey(apiKey));
    this.touch();
    return apiKey;
  }

  /**
   * Verifies if a provided API key matches this agent's key
   */
  verifyApiKey(key: ApiKey): boolean {
    const hash = hashApiKey(key);
    return hash === this._apiKeyHash;
  }

  /**
   * Updates the agent's description
   */
  updateDescription(description: string | null): void {
    if (description && description.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }
    this._description = description;
    this.touch();
  }

  /**
   * Updates the agent's owner
   */
  updateOwner(ownerActorId: ActorId | string | null): void {
    if (ownerActorId === null) {
      this._ownerActorId = null;
    } else {
      this._ownerActorId =
        typeof ownerActorId === 'string'
          ? createActorId(ownerActorId)
          : ownerActorId;
    }
    this.touch();
  }

  /**
   * Sets a metadata value
   */
  setMetadata(key: string, value: unknown): void {
    this._metadata[key] = value;
    this.touch();
  }

  /**
   * Removes a metadata value
   */
  removeMetadata(key: string): void {
    delete this._metadata[key];
    this.touch();
  }

  /**
   * Clears all metadata
   */
  clearMetadata(): void {
    this._metadata = {};
    this.touch();
  }

  // -------------------------------------------------------------------------
  // Serialization
  // -------------------------------------------------------------------------

  override toJSON(): AgentProps {
    return {
      ...super.toJSON(),
      type: 'agent',
      apiKeyHash: this._apiKeyHash,
      ownerActorId: this._ownerActorId,
      description: this._description,
      metadata: { ...this._metadata },
    };
  }
}
