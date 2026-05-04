/**
 * User Domain Model
 *
 * A User is an Actor representing a human user of the system.
 */

import {
  Actor,
  ActorId,
  ActorProps,
  generateActorId,
} from './actor.entity';

// ============================================================================
// Value Objects
// ============================================================================

/**
 * Email value object with validation
 */
declare const __emailBrand: unique symbol;
export type Email = string & { readonly [__emailBrand]: never };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createEmail(email: string): Email {
  const normalized = email.toLowerCase().trim();
  if (!EMAIL_REGEX.test(normalized)) {
    throw new Error(`Invalid email format: "${email}"`);
  }
  return normalized as Email;
}

/**
 * Password hash value object (opaque type for type safety)
 */
declare const __passwordHashBrand: unique symbol;
export type PasswordHash = string & { readonly [__passwordHashBrand]: never };

export function createPasswordHash(hash: string): PasswordHash {
  if (!hash || hash.length < 10) {
    throw new Error('Invalid password hash');
  }
  return hash as PasswordHash;
}

// ============================================================================
// User Entity
// ============================================================================

export interface UserProps extends ActorProps {
  type: 'user';
  email: Email;
  passwordHash: PasswordHash;
  emailVerified: boolean;
  lastLoginAt: Date | null;
}

export interface CreateUserProps {
  id?: ActorId;
  displayName: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  lastLoginAt?: Date | null;
}

/**
 * User entity - represents a human user in the system
 */
export class User extends Actor {
  private _email: Email;
  private _passwordHash: PasswordHash;
  private _emailVerified: boolean;
  private _lastLoginAt: Date | null;

  private constructor(props: UserProps) {
    super(props);
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._emailVerified = props.emailVerified;
    this._lastLoginAt = props.lastLoginAt;
  }

  // -------------------------------------------------------------------------
  // Factory Method
  // -------------------------------------------------------------------------

  /**
   * Creates a new User with validation
   */
  static create(props: CreateUserProps): User {
    const now = new Date();
    const email = createEmail(props.email);
    const passwordHash = createPasswordHash(props.passwordHash);

    return new User({
      id: props.id ?? generateActorId(),
      type: 'user',
      displayName: props.displayName,
      avatarUrl: props.avatarUrl ?? null,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      email,
      passwordHash,
      emailVerified: props.emailVerified ?? false,
      lastLoginAt: props.lastLoginAt ?? null,
    });
  }

  /**
   * Reconstitutes a User from stored data (e.g., database)
   */
  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------

  get email(): Email {
    return this._email;
  }

  get passwordHash(): PasswordHash {
    return this._passwordHash;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  // -------------------------------------------------------------------------
  // Behavior Methods
  // -------------------------------------------------------------------------

  /**
   * Updates the user's email address
   */
  updateEmail(email: string): void {
    const newEmail = createEmail(email);
    if (newEmail === this._email) {
      return;
    }
    this._email = newEmail;
    this._emailVerified = false; // Reset verification on email change
    this.touch();
  }

  /**
   * Updates the user's password hash
   */
  updatePassword(passwordHash: string): void {
    this._passwordHash = createPasswordHash(passwordHash);
    this.touch();
  }

  /**
   * Marks the user's email as verified
   */
  verifyEmail(): void {
    if (this._emailVerified) {
      throw new Error('Email is already verified');
    }
    this._emailVerified = true;
    this.touch();
  }

  /**
   * Records a login event
   */
  recordLogin(): void {
    this._lastLoginAt = new Date();
    this.touch();
  }

  // -------------------------------------------------------------------------
  // Serialization
  // -------------------------------------------------------------------------

  override toJSON(): UserProps {
    return {
      ...super.toJSON(),
      type: 'user',
      email: this._email,
      passwordHash: this._passwordHash,
      emailVerified: this._emailVerified,
      lastLoginAt: this._lastLoginAt,
    };
  }
}
