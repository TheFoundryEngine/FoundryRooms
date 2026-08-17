/**
 * SessionRepositoryDrizzle Integration Tests
 *
 * Runs real assertions against a real Postgres instance (see
 * tests/integration/setup.ts). Mocked repository tests cannot catch
 * DB-level behavior — FK constraints, cascade deletes — so this suite
 * exists to cover exactly that (THE-62).
 */

import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, runMigrationsUp, runMigrationsDown, truncateAllTables, closeDb } from '../setup';
import { actors, sessions } from '../../../modules/identity-access/adapters/outbound/drizzle/schema';
import { SessionRepositoryDrizzle } from '../../../modules/identity-access/adapters/outbound/drizzle/session.repository.drizzle';
import {
  Session,
  generateSessionId,
  generateSessionToken,
  generateActorId,
  createExpirationDate,
  SESSION_DURATIONS,
} from '../../../modules/identity-access/domain';
import type { ActorId } from '../../../modules/identity-access/domain';

/** Inserts a bare actor row directly (no ActorRepository exists yet) and returns its id. */
async function insertActor(type: 'user' | 'agent' = 'user'): Promise<ActorId> {
  const [row] = await db
    .insert(actors)
    .values({ type, displayName: `Test ${type}` })
    .returning({ id: actors.id });
  return row.id as ActorId;
}

function expiresSoon(): Date {
  return createExpirationDate(SESSION_DURATIONS.DEFAULT);
}

describe('SessionRepositoryDrizzle (integration)', () => {
  const repository = new SessionRepositoryDrizzle(db);

  beforeAll(async () => {
    await runMigrationsUp();
  });

  afterAll(async () => {
    await runMigrationsDown();
    await closeDb();
  });

  beforeEach(async () => {
    await truncateAllTables();
  });

  it('save() then findById() returns an equivalent domain object', async () => {
    const actorId = await insertActor('user');
    const { session, token } = Session.create({
      actorId,
      actorType: 'user',
      expiresAt: expiresSoon(),
    });

    await repository.save(session);
    const found = await repository.findById(session.id);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(session.id);
    expect(found?.actorId).toBe(actorId);
    expect(found?.actorType).toBe('user');
    expect(found?.tokenHash).toBe(session.tokenHash);
    expect(found?.expiresAt.getTime()).toBe(session.expiresAt.getTime());
    expect(found?.verifyToken(token)).toBe(true);
  });

  it('findByToken() finds a saved session; returns null for an unknown token', async () => {
    const actorId = await insertActor('user');
    const { session, token } = Session.create({
      actorId,
      actorType: 'user',
      expiresAt: expiresSoon(),
    });
    await repository.save(session);

    const found = await repository.findByToken(token);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(session.id);

    const unknownToken = generateSessionToken();
    const notFound = await repository.findByToken(unknownToken);
    expect(notFound).toBeNull();
  });

  it('findByActorId() returns all sessions for an actor and [] for one with none', async () => {
    const actorId = await insertActor('user');
    const otherActorId = await insertActor('user');
    const { session: session1 } = Session.create({
      actorId,
      actorType: 'user',
      expiresAt: expiresSoon(),
    });
    const { session: session2 } = Session.create({
      actorId,
      actorType: 'user',
      expiresAt: expiresSoon(),
    });
    await repository.save(session1);
    await repository.save(session2);

    const found = await repository.findByActorId(actorId);
    expect(found.map((s) => s.id).sort()).toEqual([session1.id, session2.id].sort());

    const none = await repository.findByActorId(otherActorId);
    expect(none).toEqual([]);
  });

  it('deleteByToken() removes only the targeted session', async () => {
    const actorId = await insertActor('user');
    const { session: session1, token: token1 } = Session.create({
      actorId,
      actorType: 'user',
      expiresAt: expiresSoon(),
    });
    const { session: session2 } = Session.create({
      actorId,
      actorType: 'user',
      expiresAt: expiresSoon(),
    });
    await repository.save(session1);
    await repository.save(session2);

    await repository.deleteByToken(token1);

    expect(await repository.findById(session1.id)).toBeNull();
    expect(await repository.findById(session2.id)).not.toBeNull();
  });

  it("deleteByActorId() removes all of that actor's sessions and leaves others intact", async () => {
    const actorId = await insertActor('user');
    const otherActorId = await insertActor('user');
    const { session: session1 } = Session.create({
      actorId,
      actorType: 'user',
      expiresAt: expiresSoon(),
    });
    const { session: session2 } = Session.create({
      actorId,
      actorType: 'user',
      expiresAt: expiresSoon(),
    });
    const { session: otherSession } = Session.create({
      actorId: otherActorId,
      actorType: 'user',
      expiresAt: expiresSoon(),
    });
    await repository.save(session1);
    await repository.save(session2);
    await repository.save(otherSession);

    await repository.deleteByActorId(actorId);

    expect(await repository.findByActorId(actorId)).toEqual([]);
    expect(await repository.findById(otherSession.id)).not.toBeNull();
  });

  it('rejects a session insert whose actor_id does not exist (FK constraint)', async () => {
    await expect(
      db.insert(sessions).values({
        id: generateSessionId(),
        actorId: generateActorId(),
        token: 'x'.repeat(64),
        expiresAt: expiresSoon(),
      })
    ).rejects.toThrow();
  });

  it('cascade-deletes sessions when the owning actor is deleted (ON DELETE CASCADE)', async () => {
    const actorId = await insertActor('user');
    const { session } = Session.create({
      actorId,
      actorType: 'user',
      expiresAt: expiresSoon(),
    });
    await repository.save(session);

    await db.delete(actors).where(eq(actors.id, actorId));

    expect(await repository.findById(session.id)).toBeNull();
  });
});
