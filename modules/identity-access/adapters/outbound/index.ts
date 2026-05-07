/**
 * Outbound Adapters for Identity Access Module
 *
 * Re-exports all outbound adapter implementations including:
 * - Database repositories (Drizzle ORM)
 * - Security adapters (password hashing, API key generation)
 */

// Drizzle ORM implementations
export * from './drizzle/index.js';

// Security adapters
export { BcryptPasswordHasher } from './password-hasher.adapter.js';
export type { PasswordHasherConfig } from './password-hasher.adapter.js';

export { CryptoApiKeyGenerator } from './api-key-generator.adapter.js';
export type { ApiKeyGeneratorConfig } from './api-key-generator.adapter.js';
