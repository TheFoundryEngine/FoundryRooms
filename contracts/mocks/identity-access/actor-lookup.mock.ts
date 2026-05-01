import type { User, Agent } from '../../api/identity-access';
import {
  testUser1,
  testUser2,
  inactiveUser,
  testAgent1,
  testAgent2,
  inactiveAgent,
} from '../../fixtures/identity-access';

/**
 * Actor type that can be either User or Agent.
 */
export type Actor = User | Agent;

/**
 * Configuration options for MockActorLookup.
 */
export interface ActorLookupConfig {
  /**
   * Additional users to include beyond the default fixtures.
   */
  additionalUsers?: User[];

  /**
   * Additional agents to include beyond the default fixtures.
   */
  additionalAgents?: Agent[];

  /**
   * If true, excludes the default fixture data.
   * Use this when you want complete control over the mock data.
   */
  excludeDefaults?: boolean;
}

/**
 * Default users from fixtures.
 */
const DEFAULT_USERS: User[] = [testUser1, testUser2, inactiveUser];

/**
 * Default agents from fixtures.
 */
const DEFAULT_AGENTS: Agent[] = [testAgent1, testAgent2, inactiveAgent];

/**
 * MockActorLookup provides a configurable actor lookup mock for testing.
 * Teams B & C can use this to look up users and agents without the real
 * identity-access implementation.
 *
 * @example
 * ```typescript
 * // Use with defaults
 * const lookup = new MockActorLookup();
 * const user = lookup.findById(testUser1.id); // Returns testUser1
 * const alice = lookup.findByEmail('alice@example.com'); // Returns testUser1
 *
 * // Add custom actors
 * const lookup = new MockActorLookup({
 *   additionalUsers: [myCustomUser],
 * });
 * ```
 */
export class MockActorLookup {
  private users: Map<string, User>;
  private agents: Map<string, Agent>;
  private emailIndex: Map<string, User>;

  constructor(config: ActorLookupConfig = {}) {
    this.users = new Map();
    this.agents = new Map();
    this.emailIndex = new Map();

    // Add default fixture data unless excluded
    if (!config.excludeDefaults) {
      for (const user of DEFAULT_USERS) {
        this.addUser(user);
      }
      for (const agent of DEFAULT_AGENTS) {
        this.addAgent(agent);
      }
    }

    // Add any additional users
    if (config.additionalUsers) {
      for (const user of config.additionalUsers) {
        this.addUser(user);
      }
    }

    // Add any additional agents
    if (config.additionalAgents) {
      for (const agent of config.additionalAgents) {
        this.addAgent(agent);
      }
    }
  }

  /**
   * Find an actor (user or agent) by their ID.
   *
   * @param actorId - The ID of the actor to find
   * @returns The actor if found, null otherwise
   */
  findById(actorId: string): Actor | null {
    const user = this.users.get(actorId);
    if (user) {
      return user;
    }

    const agent = this.agents.get(actorId);
    if (agent) {
      return agent;
    }

    return null;
  }

  /**
   * Find a user by their email address.
   *
   * @param email - The email address to search for (case-insensitive)
   * @returns The user if found, null otherwise
   */
  findByEmail(email: string): User | null {
    const normalizedEmail = email.toLowerCase();
    return this.emailIndex.get(normalizedEmail) ?? null;
  }

  /**
   * Find a user by their ID.
   *
   * @param userId - The ID of the user to find
   * @returns The user if found, null otherwise
   */
  findUserById(userId: string): User | null {
    return this.users.get(userId) ?? null;
  }

  /**
   * Find an agent by their ID.
   *
   * @param agentId - The ID of the agent to find
   * @returns The agent if found, null otherwise
   */
  findAgentById(agentId: string): Agent | null {
    return this.agents.get(agentId) ?? null;
  }

  /**
   * Get all users.
   *
   * @returns Array of all users
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Get all agents.
   *
   * @returns Array of all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get all actors (users and agents).
   *
   * @returns Array of all actors
   */
  getAllActors(): Actor[] {
    return [...this.getAllUsers(), ...this.getAllAgents()];
  }

  /**
   * Get only active users.
   *
   * @returns Array of active users
   */
  getActiveUsers(): User[] {
    return this.getAllUsers().filter((user) => user.isActive);
  }

  /**
   * Get only active agents.
   *
   * @returns Array of active agents
   */
  getActiveAgents(): Agent[] {
    return this.getAllAgents().filter((agent) => agent.isActive);
  }

  /**
   * Add a user to the mock data.
   * Useful for setting up test scenarios.
   *
   * @param user - The user to add
   */
  addUser(user: User): void {
    this.users.set(user.id, user);
    this.emailIndex.set(user.email.toLowerCase(), user);
  }

  /**
   * Add an agent to the mock data.
   * Useful for setting up test scenarios.
   *
   * @param agent - The agent to add
   */
  addAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Remove an actor (user or agent) from the mock data.
   *
   * @param actorId - The ID of the actor to remove
   * @returns true if an actor was removed, false otherwise
   */
  removeActor(actorId: string): boolean {
    const user = this.users.get(actorId);
    if (user) {
      this.users.delete(actorId);
      this.emailIndex.delete(user.email.toLowerCase());
      return true;
    }

    if (this.agents.has(actorId)) {
      this.agents.delete(actorId);
      return true;
    }

    return false;
  }

  /**
   * Check if an actor exists.
   *
   * @param actorId - The ID of the actor to check
   * @returns true if the actor exists, false otherwise
   */
  exists(actorId: string): boolean {
    return this.users.has(actorId) || this.agents.has(actorId);
  }

  /**
   * Reset the mock to default state with fixture data.
   */
  reset(): void {
    this.users.clear();
    this.agents.clear();
    this.emailIndex.clear();

    for (const user of DEFAULT_USERS) {
      this.addUser(user);
    }
    for (const agent of DEFAULT_AGENTS) {
      this.addAgent(agent);
    }
  }

  /**
   * Clear all data from the mock.
   */
  clear(): void {
    this.users.clear();
    this.agents.clear();
    this.emailIndex.clear();
  }
}
