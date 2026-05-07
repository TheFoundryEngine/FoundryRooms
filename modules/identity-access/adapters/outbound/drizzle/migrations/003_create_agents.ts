/**
 * Migration: Create Agents Table
 *
 * Creates the agents table that stores agent-specific data.
 * References actors table with CASCADE delete.
 */

import { sql, type SQL } from 'drizzle-orm';

interface MigrationDatabase {
  execute(query: SQL): Promise<unknown>;
}

export const up = async (db: MigrationDatabase) => {
  await db.execute(sql`
    CREATE TABLE agents (
      actor_id UUID PRIMARY KEY REFERENCES actors(id) ON DELETE CASCADE,
      api_key_hash VARCHAR(255) NOT NULL,
      api_key_prefix VARCHAR(8) NOT NULL,
      owner_actor_id UUID REFERENCES actors(id),
      description TEXT,
      metadata JSONB DEFAULT '{}'
    );
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX idx_agents_api_key_prefix ON agents(api_key_prefix);
  `);
};

export const down = async (db: MigrationDatabase) => {
  await db.execute(sql`DROP INDEX IF EXISTS idx_agents_api_key_prefix;`);
  await db.execute(sql`DROP TABLE IF EXISTS agents;`);
};

/**
 * Raw SQL for reference:
 *
 * CREATE TABLE agents (
 *   actor_id UUID PRIMARY KEY REFERENCES actors(id) ON DELETE CASCADE,
 *   api_key_hash VARCHAR(255) NOT NULL,
 *   api_key_prefix VARCHAR(8) NOT NULL,
 *   owner_actor_id UUID REFERENCES actors(id),
 *   description TEXT,
 *   metadata JSONB DEFAULT '{}'
 * );
 * CREATE UNIQUE INDEX idx_agents_api_key_prefix ON agents(api_key_prefix);
 */
