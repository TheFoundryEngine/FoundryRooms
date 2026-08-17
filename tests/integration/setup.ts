/**
 * Integration Test Harness
 *
 * Opens a real Postgres connection (via DATABASE_URL), runs the
 * identity-access migrations, and exposes helpers for truncating
 * tables between tests and closing the pool on teardown.
 *
 * DATABASE_URL is required. There is no silent-skip mode: if it is
 * unset, importing this module throws immediately so the suite fails
 * loudly instead of reporting a false pass (THE-62).
 */

import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from '../../modules/identity-access/adapters/outbound/drizzle/schema';
import type { Db } from '../../modules/identity-access/adapters/outbound/drizzle/db';
import {
  migration001,
  migration002,
  migration003,
  migration004,
} from '../../modules/identity-access/adapters/outbound/drizzle/migrations/index';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'tests/integration requires a live Postgres instance: DATABASE_URL is not set. ' +
        'This suite does not skip silently — see tests/README.md for how to start a local ' +
        'Postgres and run it, or rely on the CI-provisioned service in the integration-tests job.'
    );
  }
  return url;
}

const pool = new pg.Pool({ connectionString: getDatabaseUrl() });

export const db: Db = drizzle(pool, { schema });

/** Migrations in forward (up) order. */
const migrations = [migration001, migration002, migration003, migration004];

/** Runs all migrations' up() in order. Call once before the suite. */
export async function runMigrationsUp(): Promise<void> {
  for (const migration of migrations) {
    await migration.up(db);
  }
}

/** Runs all migrations' down() in reverse order. Call once after the suite. */
export async function runMigrationsDown(): Promise<void> {
  for (const migration of [...migrations].reverse()) {
    await migration.down(db);
  }
}

/**
 * Truncates all identity-access tables so each test starts from empty
 * state. CASCADE covers the actors -> users/agents/sessions FKs
 * regardless of the order tables are listed in.
 */
export async function truncateAllTables(): Promise<void> {
  await db.execute(
    sql`TRUNCATE TABLE sessions, agents, users, actors RESTART IDENTITY CASCADE;`
  );
}

/** Closes the pool. Call once after the suite so no handles are left open. */
export async function closeDb(): Promise<void> {
  await pool.end();
}
