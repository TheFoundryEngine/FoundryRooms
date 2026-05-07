/**
 * Migration: Create Sessions Table
 *
 * Creates the sessions table that stores authenticated sessions
 * for both users and agents.
 */

import { sql, type SQL } from 'drizzle-orm';

interface MigrationDatabase {
  execute(query: SQL): Promise<unknown>;
}

export const up = async (db: MigrationDatabase) => {
  await db.execute(sql`
    CREATE TABLE sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_accessed_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE INDEX idx_sessions_actor ON sessions(actor_id);
  `);

  await db.execute(sql`
    CREATE INDEX idx_sessions_token ON sessions(token);
  `);
};

export const down = async (db: MigrationDatabase) => {
  await db.execute(sql`DROP INDEX IF EXISTS idx_sessions_token;`);
  await db.execute(sql`DROP INDEX IF EXISTS idx_sessions_actor;`);
  await db.execute(sql`DROP TABLE IF EXISTS sessions;`);
};

/**
 * Raw SQL for reference:
 *
 * CREATE TABLE sessions (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
 *   token VARCHAR(255) UNIQUE NOT NULL,
 *   expires_at TIMESTAMPTZ NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   last_accessed_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * CREATE INDEX idx_sessions_actor ON sessions(actor_id);
 * CREATE INDEX idx_sessions_token ON sessions(token);
 */
