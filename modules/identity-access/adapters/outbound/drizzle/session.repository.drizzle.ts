/**
 * Drizzle Session Repository Implementation
 *
 * Implements the SessionRepository interface using Drizzle ORM.
 * Maps between domain Session entities and database rows (sessions table).
 */

import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type {
  ActorId,
  ActorType,
  Session as DomainSession,
  SessionId,
  SessionProps,
} from '../../../domain';
import { createActorId, createSessionId, hashSessionToken, Session, createSessionToken } from '../../../domain';
import type { SessionRepository } from '../../../application/ports/session.repository';
import { actors, sessions } from './schema.js';
import type * as schema from './schema.js';

/**
 * Database row type for session with actor type lookup
 */
interface SessionRow {
  id: string;
  actorId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date | null;
  lastAccessedAt: Date | null;
  actorType?: string;
}

/**
 * Maps database row to domain Session entity
 */
function toDomain(row: SessionRow, actorType: ActorType): DomainSession {
  const props: SessionProps = {
    id: createSessionId(row.id),
    actorId: createActorId(row.actorId),
    actorType,
    tokenHash: row.token, // token column stores the hash
    expiresAt: row.expiresAt,
    createdAt: row.createdAt ?? new Date(),
    lastAccessedAt: row.lastAccessedAt ?? new Date(),
    userAgent: null, // Not stored in current schema
    ipAddress: null, // Not stored in current schema
  };

  return Session.fromPersistence(props);
}

/**
 * Drizzle implementation of SessionRepository
 */
export class SessionRepositoryDrizzle implements SessionRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Finds a session by its unique identifier
   */
  async findById(id: SessionId): Promise<DomainSession | null> {
    const result = await this.db
      .select({
        session: sessions,
        actorType: actors.type,
      })
      .from(sessions)
      .innerJoin(actors, eq(actors.id, sessions.actorId))
      .where(eq(sessions.id, id))
      .limit(1);

    const row = result[0];
    if (!row) {
      return null;
    }
    return toDomain(
      {
        id: row.session.id,
        actorId: row.session.actorId,
        token: row.session.token,
        expiresAt: row.session.expiresAt,
        createdAt: row.session.createdAt,
        lastAccessedAt: row.session.lastAccessedAt,
      },
      row.actorType as ActorType
    );
  }

  /**
   * Finds a session by its token
   * Hashes the provided token before comparison
   */
  async findByToken(token: string): Promise<DomainSession | null> {
    // Hash the token for comparison
    const sessionToken = createSessionToken(token);
    const tokenHash = hashSessionToken(sessionToken);

    const result = await this.db
      .select({
        session: sessions,
        actorType: actors.type,
      })
      .from(sessions)
      .innerJoin(actors, eq(actors.id, sessions.actorId))
      .where(eq(sessions.token, tokenHash))
      .limit(1);

    const row = result[0];
    if (!row) {
      return null;
    }
    return toDomain(
      {
        id: row.session.id,
        actorId: row.session.actorId,
        token: row.session.token,
        expiresAt: row.session.expiresAt,
        createdAt: row.session.createdAt,
        lastAccessedAt: row.session.lastAccessedAt,
      },
      row.actorType as ActorType
    );
  }

  /**
   * Finds all sessions for a specific actor
   */
  async findByActorId(actorId: ActorId): Promise<DomainSession[]> {
    const result = await this.db
      .select({
        session: sessions,
        actorType: actors.type,
      })
      .from(sessions)
      .innerJoin(actors, eq(actors.id, sessions.actorId))
      .where(eq(sessions.actorId, actorId));

    return result.map((row) =>
      toDomain(
        {
          id: row.session.id,
          actorId: row.session.actorId,
          token: row.session.token,
          expiresAt: row.session.expiresAt,
          createdAt: row.session.createdAt,
          lastAccessedAt: row.session.lastAccessedAt,
        },
        row.actorType as ActorType
      )
    );
  }

  /**
   * Persists a session (create or update)
   */
  async save(session: DomainSession): Promise<void> {
    const props = session.toJSON();

    // Check if session already exists
    const existing = await this.db
      .select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.id, props.id))
      .limit(1);

    if (existing.length > 0) {
      // Update existing session
      await this.db
        .update(sessions)
        .set({
          token: props.tokenHash,
          expiresAt: props.expiresAt,
          lastAccessedAt: props.lastAccessedAt,
        })
        .where(eq(sessions.id, props.id));
    } else {
      // Insert new session
      await this.db.insert(sessions).values({
        id: props.id,
        actorId: props.actorId,
        token: props.tokenHash,
        expiresAt: props.expiresAt,
        createdAt: props.createdAt,
        lastAccessedAt: props.lastAccessedAt,
      });
    }
  }

  /**
   * Deletes a session by its token
   * Used for logout operations
   */
  async deleteByToken(token: string): Promise<void> {
    // Hash the token for comparison
    const sessionToken = createSessionToken(token);
    const tokenHash = hashSessionToken(sessionToken);

    await this.db.delete(sessions).where(eq(sessions.token, tokenHash));
  }

  /**
   * Deletes all sessions for a specific actor
   * Used for "logout everywhere" or account deactivation
   */
  async deleteByActorId(actorId: ActorId): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.actorId, actorId));
  }
}
