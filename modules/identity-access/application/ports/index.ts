/**
 * Application Ports (Repository Interfaces)
 *
 * These are the port interfaces that define what the application layer
 * needs from the infrastructure layer. The actual implementations
 * (adapters) will be provided by Drizzle repositories.
 */

export type { ActorRepository } from './actor.repository';
export type { UserRepository } from './user.repository';
export type { AgentRepository } from './agent.repository';
export type { SessionRepository } from './session.repository';
