/**
 * Drizzle Schema Definitions for Identity Access Module
 *
 * Defines database tables for actors, users, agents, and sessions.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// Actors Table
// ============================================================================

/**
 * Base actor table - represents any entity that can perform actions
 * Both users and agents inherit from this table
 */
export const actors = pgTable(
  'actors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: varchar('type', { length: 10 }).notNull(),
    displayName: varchar('display_name', { length: 100 }).notNull(),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_actors_type').on(table.type),
    check('actors_type_check', sql`${table.type} IN ('user', 'agent')`),
  ]
);

// ============================================================================
// Users Table
// ============================================================================

/**
 * Users table - represents human users
 * References actors table with CASCADE delete
 */
export const users = pgTable(
  'users',
  {
    actorId: uuid('actor_id')
      .primaryKey()
      .references(() => actors.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    emailVerified: boolean('email_verified').default(false),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (table) => [index('idx_users_email').on(table.email)]
);

// ============================================================================
// Agents Table
// ============================================================================

/**
 * Agents table - represents automated actors (bots, integrations)
 * References actors table with CASCADE delete
 */
export const agents = pgTable(
  'agents',
  {
    actorId: uuid('actor_id')
      .primaryKey()
      .references(() => actors.id, { onDelete: 'cascade' }),
    apiKeyHash: varchar('api_key_hash', { length: 255 }).notNull(),
    apiKeyPrefix: varchar('api_key_prefix', { length: 8 }).notNull(),
    ownerActorId: uuid('owner_actor_id').references(() => actors.id),
    description: text('description'),
    metadata: jsonb('metadata').default({}),
  },
  (table) => [uniqueIndex('idx_agents_api_key_prefix').on(table.apiKeyPrefix)]
);

// ============================================================================
// Sessions Table
// ============================================================================

/**
 * Sessions table - represents authenticated sessions for any actor
 */
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id')
      .notNull()
      .references(() => actors.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 255 }).unique().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_sessions_actor').on(table.actorId),
    index('idx_sessions_token').on(table.token),
  ]
);

// ============================================================================
// Type Exports
// ============================================================================

export type Actor = typeof actors.$inferSelect;
export type NewActor = typeof actors.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
