/**
 * API Key Generator Port Interface
 *
 * Defines the contract for API key generation and hashing.
 * Separates the key generation logic from the domain model.
 */

import type { ApiKey } from '../../domain';

/**
 * Port interface for API key generation operations
 *
 * Abstracts API key generation from the application layer.
 */
export interface ApiKeyGeneratorPort {
  /**
   * Generates a new API key with the given prefix
   *
   * @param prefix - The key prefix (e.g., 'live', 'test')
   * @returns A newly generated API key
   */
  generate(prefix?: string): ApiKey;

  /**
   * Hashes an API key for secure storage
   *
   * @param key - The API key to hash
   * @returns The SHA-256 hash of the key
   */
  hash(key: ApiKey): string;

  /**
   * Extracts the prefix from an API key
   *
   * API keys have format: fr_<prefix>_<random>
   * This extracts "fr_<prefix>" for lookup purposes.
   *
   * @param key - The full API key
   * @returns The prefix portion (e.g., "fr_live")
   */
  extractPrefix(key: string): string;

  /**
   * Validates the format of an API key
   *
   * @param key - The key to validate
   * @returns True if the key has valid format
   */
  isValid(key: string): boolean;
}
