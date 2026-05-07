/**
 * Drizzle User Repository Implementation
 *
 * Implements the UserRepository interface using Drizzle ORM.
 * Maps between domain User entities and database rows (actors + users tables).
 */

import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type {
  ActorId,
  ActorType,
  Email,
  User as DomainUser,
  UserProps,
} from '../../../domain';
import {
  createActorId,
  createEmail,
  createPasswordHash,
  User,
} from '../../../domain';
import type { UserRepository } from '../../../application/ports/user.repository';
import { actors, users } from './schema.js';
import type * as schema from './schema.js';

/**
 * Database row type for joined actor + user data
 */
interface UserRow {
  actor: {
    id: string;
    type: string;
    displayName: string;
    avatarUrl: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
  user: {
    actorId: string;
    email: string;
    passwordHash: string;
    emailVerified: boolean | null;
    lastLoginAt: Date | null;
  };
}

/**
 * Maps database rows to domain User entity
 */
function toDomain(row: UserRow): DomainUser {
  const props: UserProps = {
    id: createActorId(row.actor.id),
    type: 'user' as const,
    displayName: row.actor.displayName,
    avatarUrl: row.actor.avatarUrl,
    isActive: row.actor.isActive ?? true,
    createdAt: row.actor.createdAt ?? new Date(),
    updatedAt: row.actor.updatedAt ?? new Date(),
    email: createEmail(row.user.email),
    passwordHash: createPasswordHash(row.user.passwordHash),
    emailVerified: row.user.emailVerified ?? false,
    lastLoginAt: row.user.lastLoginAt,
  };

  return User.fromPersistence(props);
}

/**
 * Drizzle implementation of UserRepository
 */
export class UserRepositoryDrizzle implements UserRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Finds a user by their unique identifier
   */
  async findById(id: ActorId): Promise<DomainUser | null> {
    const result = await this.db
      .select({
        actor: actors,
        user: users,
      })
      .from(actors)
      .innerJoin(users, eq(users.actorId, actors.id))
      .where(eq(actors.id, id))
      .limit(1);

    const row = result[0];
    if (!row) {
      return null;
    }

    return toDomain(row);
  }

  /**
   * Finds a user by their email address
   */
  async findByEmail(email: Email): Promise<DomainUser | null> {
    const result = await this.db
      .select({
        actor: actors,
        user: users,
      })
      .from(actors)
      .innerJoin(users, eq(users.actorId, actors.id))
      .where(eq(users.email, email))
      .limit(1);

    const row = result[0];
    if (!row) {
      return null;
    }

    return toDomain(row);
  }

  /**
   * Finds all actors of a specific type
   * For UserRepository, this only returns users (not agents)
   */
  async findByType(type: ActorType): Promise<DomainUser[]> {
    if (type !== 'user') {
      return [];
    }

    const result = await this.db
      .select({
        actor: actors,
        user: users,
      })
      .from(actors)
      .innerJoin(users, eq(users.actorId, actors.id))
      .where(eq(actors.type, 'user'));

    return result.map(toDomain);
  }

  /**
   * Persists a user (create or update)
   * Uses a transaction to ensure both actor and user tables are updated atomically
   */
  async save(user: DomainUser): Promise<void> {
    const props = user.toJSON();

    await this.db.transaction(async (tx) => {
      // Check if user already exists
      const existing = await tx
        .select({ id: actors.id })
        .from(actors)
        .where(eq(actors.id, props.id))
        .limit(1);

      if (existing.length > 0) {
        // Update existing user
        await tx
          .update(actors)
          .set({
            displayName: props.displayName,
            avatarUrl: props.avatarUrl,
            isActive: props.isActive,
            updatedAt: props.updatedAt,
          })
          .where(eq(actors.id, props.id));

        await tx
          .update(users)
          .set({
            email: props.email,
            passwordHash: props.passwordHash,
            emailVerified: props.emailVerified,
            lastLoginAt: props.lastLoginAt,
          })
          .where(eq(users.actorId, props.id));
      } else {
        // Insert new user
        await tx.insert(actors).values({
          id: props.id,
          type: props.type,
          displayName: props.displayName,
          avatarUrl: props.avatarUrl,
          isActive: props.isActive,
          createdAt: props.createdAt,
          updatedAt: props.updatedAt,
        });

        await tx.insert(users).values({
          actorId: props.id,
          email: props.email,
          passwordHash: props.passwordHash,
          emailVerified: props.emailVerified,
          lastLoginAt: props.lastLoginAt,
        });
      }
    });
  }
}
