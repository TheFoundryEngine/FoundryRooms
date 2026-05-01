/**
 * Actor Base Domain Model
 *
 * An Actor is any entity that can perform actions in the system.
 * Both Users and Agents are Actors.
 */

// ============================================================================
// Value Objects
// ============================================================================

/**
 * Branded type for Actor IDs (UUID)
 */
declare const __actorIdBrand: unique symbol;
export type ActorId = string & { readonly [__actorIdBrand]: never };

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createActorId(id: string): ActorId {
  if (!UUID_REGEX.test(id)) {
    throw new Error(`Invalid ActorId: must be a valid UUID, got "${id}"`);
  }
  return id as ActorId;
}

export function generateActorId(): ActorId {
  // Simple UUID v4 generator
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return uuid as ActorId;
}

/**
 * Actor type discriminator
 */
export type ActorType = 'user' | 'agent';

// ============================================================================
// Actor Base Class
// ============================================================================

export interface ActorProps {
  id: ActorId;
  type: ActorType;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CreateActorProps {
  id?: ActorId;
  type: ActorType;
  displayName: string;
  avatarUrl?: string | null;
  isActive?: boolean;
}

/**
 * Actor base class - the foundation for Users and Agents
 */
export abstract class Actor {
  readonly id: ActorId;
  readonly type: ActorType;
  private _displayName: string;
  private _avatarUrl: string | null;
  readonly createdAt: Date;
  private _updatedAt: Date;
  private _isActive: boolean;

  protected constructor(props: ActorProps) {
    this.validateDisplayName(props.displayName);

    this.id = props.id;
    this.type = props.type;
    this._displayName = props.displayName;
    this._avatarUrl = props.avatarUrl;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._isActive = props.isActive;
  }

  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------

  get displayName(): string {
    return this._displayName;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  // -------------------------------------------------------------------------
  // Behavior Methods
  // -------------------------------------------------------------------------

  /**
   * Updates the display name
   */
  updateDisplayName(name: string): void {
    this.validateDisplayName(name);
    this._displayName = name;
    this.touch();
  }

  /**
   * Updates the avatar URL
   */
  updateAvatarUrl(url: string | null): void {
    if (url !== null && !this.isValidUrl(url)) {
      throw new Error('Invalid avatar URL');
    }
    this._avatarUrl = url;
    this.touch();
  }

  /**
   * Deactivates the actor
   */
  deactivate(): void {
    if (!this._isActive) {
      throw new Error('Actor is already inactive');
    }
    this._isActive = false;
    this.touch();
  }

  /**
   * Reactivates the actor
   */
  activate(): void {
    if (this._isActive) {
      throw new Error('Actor is already active');
    }
    this._isActive = true;
    this.touch();
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------

  /**
   * Updates the updatedAt timestamp
   */
  protected touch(): void {
    this._updatedAt = new Date();
  }

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  private validateDisplayName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Display name cannot be empty');
    }
    if (name.length > 100) {
      throw new Error('Display name cannot exceed 100 characters');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // Serialization
  // -------------------------------------------------------------------------

  toJSON(): ActorProps {
    return {
      id: this.id,
      type: this.type,
      displayName: this._displayName,
      avatarUrl: this._avatarUrl,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
      isActive: this._isActive,
    };
  }
}
