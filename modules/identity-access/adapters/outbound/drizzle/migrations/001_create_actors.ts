/**
 * Migration: Create Actors Table
 *
 * Creates the base actors table that serves as the foundation for
 * both users and agents (actor pattern).
 */

import { sql, type SQL } from 'drizzle-orm';

interface MigrationDatabase {
  execute(query: SQL): Promise<unknown>;
}

export const up = async (db: MigrationDatabase) => {
  await db.execute(sql`
    CREATE TABLE actors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type VARCHAR(10) NOT NULL CHECK (type IN ('user', 'agent')),
      display_name VARCHAR(100) NOT NULL,
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE INDEX idx_actors_type ON actors(type);
  `);
};

export const down = async (db: MigrationDatabase) => {
  await db.execute(sql`DROP INDEX IF EXISTS idx_actors_type;`);
  await db.execute(sql`DROP TABLE IF EXISTS actors;`);
};

/**
 * Raw SQL for reference:
 *
 * CREATE TABLE actors (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   type VARCHAR(10) NOT NULL CHECK (type IN ('user', 'agent')),
 *   display_name VARCHAR(100) NOT NULL,
 *   avatar_url TEXT,
 *   is_active BOOLEAN DEFAULT true,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * CREATE INDEX idx_actors_type ON actors(type);
 */
