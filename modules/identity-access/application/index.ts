/**
 * Identity-Access Application Layer
 *
 * Exports ports (interfaces) and use cases for the identity-access module.
 */

// Ports (Repository Interfaces)
export type {
  ActorRepository,
  UserRepository,
  AgentRepository,
  SessionRepository,
} from './ports';
