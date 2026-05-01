/**
 * Identity-Access Domain Layer
 *
 * Exports all domain entities, value objects, and related types.
 */

// Actor (base)
export { Actor, createActorId, generateActorId } from './actor.entity';
export type {
  ActorId,
  ActorType,
  ActorProps,
  CreateActorProps,
} from './actor.entity';

// User
export { User, createEmail, createPasswordHash } from './user.entity';
export type {
  UserProps,
  CreateUserProps,
  Email,
  PasswordHash,
} from './user.entity';

// Agent
export {
  Agent,
  generateApiKey,
  isValidApiKey,
  parseApiKey,
  hashApiKey,
  createApiKeyHash,
} from './agent.entity';
export type {
  AgentProps,
  CreateAgentProps,
  CreateAgentResult,
  ApiKey,
  ApiKeyHash,
} from './agent.entity';

// Session
export {
  Session,
  createSessionId,
  generateSessionId,
  generateSessionToken,
  createSessionToken,
  hashSessionToken,
  SESSION_DURATIONS,
  createExpirationDate,
} from './session.entity';
export type {
  SessionProps,
  CreateSessionProps,
  CreateSessionResult,
  SessionId,
  SessionToken,
} from './session.entity';
