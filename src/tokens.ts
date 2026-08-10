/**
 * Composition-root DI tokens.
 *
 * DRIZZLE_DB (THE-92 / #63): the token for the Drizzle database handle.
 * Its factory in app.module creates a pg.Pool internally, but what the
 * token PROVIDES is `drizzle(pool, { schema })` — a NodePgDatabase, not a
 * pg.Pool (the old name, PG_POOL, taught exactly that wrong contract).
 * If the raw pool is ever needed (lifecycle shutdown, connection stats),
 * register it under its own token; do not inject this one expecting pool
 * semantics.
 *
 * Lives in its own file so controllers can import the token without
 * importing app.module (which imports the controllers — a cycle that
 * would evaluate decorator arguments against a half-initialized module).
 */
export const DRIZZLE_DB = 'DRIZZLE_DB';
