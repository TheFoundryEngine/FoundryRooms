/**
 * The database handle type this module's repositories work against:
 * a Drizzle instance over node-postgres, typed with this module's schema.
 *
 * One definition, imported everywhere (THE-92 / #63) — the three
 * repositories previously each spelled `NodePgDatabase<typeof schema>`
 * inline, and the composition root aliased it a fourth time.
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from './schema.js';

export type Db = NodePgDatabase<typeof schema>;
