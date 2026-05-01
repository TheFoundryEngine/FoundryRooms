/**
 * Migration: Create Users Table
 *
 * Creates the users table that stores user-specific data.
 * References actors table with CASCADE delete.
 */

import { sql, type SQL } from 'drizzle-orm';

interface MigrationDatabase {
  execute(query: SQL): Promise<unknown>;
}

export const up = async (db: MigrationDatabase) => {
  await db.execute(sql`
    CREATE TABLE users (
      actor_id UUID PRIMARY KEY REFERENCES actors(id) ON DELETE CASCADE,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      email_verified BOOLEAN DEFAULT false,
      last_login_at TIMESTAMPTZ
    );
  `);

  await db.execute(sql`
    CREATE INDEX idx_users_email ON users(email);
  `);
};

export const down = async (db: MigrationDatabase) => {
  await db.execute(sql`DROP INDEX IF EXISTS idx_users_email;`);
  await db.execute(sql`DROP TABLE IF EXISTS users;`);
};

/**
 * Raw SQL for reference:
 *
 * CREATE TABLE users (
 *   actor_id UUID PRIMARY KEY REFERENCES actors(id) ON DELETE CASCADE,
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   password_hash VARCHAR(255) NOT NULL,
 *   email_verified BOOLEAN DEFAULT false,
 *   last_login_at TIMESTAMPTZ
 * );
 * CREATE INDEX idx_users_email ON users(email);
 */
