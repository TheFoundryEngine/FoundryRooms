/**
 * Crypto API Key Generator Adapter
 *
 * Implements the ApiKeyGeneratorPort interface using Node's crypto module.
 * Generates secure API keys with the format: fr_<prefix>_<random>
 */

import { randomBytes, createHash } from 'crypto';
import type { ApiKey } from '../../domain/index.js';
import type { ApiKeyGeneratorPort } from '../../application/ports/api-key-generator.port.js';

/**
 * Configuration options for the API key generator
 */
export interface ApiKeyGeneratorConfig {
  /**
   * The base prefix for all API keys (e.g., 'fr' for FoundryRooms)
   * Default: 'fr'
   */
  basePrefix: string;

  /**
   * Number of random bytes to generate for the key
   * More bytes = more entropy = more secure
   * Default: 32 (256 bits of entropy)
   */
  randomBytes: number;
}

const DEFAULT_CONFIG: ApiKeyGeneratorConfig = {
  basePrefix: 'fr',
  randomBytes: 32,
};

/**
 * API key format regex: fr_<prefix>_<64 hex characters>
 * The 64 hex characters come from 32 bytes encoded as hex
 */
const API_KEY_REGEX = /^fr_[a-z]+_[a-f0-9]{64}$/;

/**
 * Crypto implementation of ApiKeyGeneratorPort
 *
 * Generates cryptographically secure API keys using Node's crypto module.
 * Keys have the format: fr_<prefix>_<random_hex>
 *
 * Example: fr_live_a1b2c3d4e5f6...
 */
export class CryptoApiKeyGenerator implements ApiKeyGeneratorPort {
  private readonly config: ApiKeyGeneratorConfig;

  constructor(config: Partial<ApiKeyGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Validate base prefix
    if (!/^[a-z]+$/.test(this.config.basePrefix)) {
      throw new Error('Base prefix must contain only lowercase letters');
    }

    // Validate random bytes count
    if (this.config.randomBytes < 16 || this.config.randomBytes > 64) {
      throw new Error('Random bytes must be between 16 and 64');
    }
  }

  /**
   * Generates a new API key with the given prefix
   *
   * @param prefix - The key prefix (e.g., 'live', 'test'). Defaults to 'live'.
   * @returns A newly generated API key
   */
  generate(prefix: string = 'live'): ApiKey {
    // Validate prefix format
    if (!/^[a-z]+$/.test(prefix)) {
      throw new Error('API key prefix must contain only lowercase letters');
    }

    // Generate cryptographically secure random bytes
    const random = randomBytes(this.config.randomBytes).toString('hex');

    // Combine into final key format
    const key = `${this.config.basePrefix}_${prefix}_${random}`;

    return key as ApiKey;
  }

  /**
   * Hashes an API key for secure storage
   *
   * Uses SHA-256 for fast comparison during authentication.
   * The hash is deterministic, allowing lookup by hash.
   *
   * @param key - The API key to hash
   * @returns The SHA-256 hash of the key as hex string
   */
  hash(key: ApiKey): string {
    return createHash('sha256').update(key).digest('hex');
  }

  /**
   * Extracts the prefix from an API key
   *
   * API keys have format: fr_<prefix>_<random>
   * This extracts "fr_<prefix>" for lookup purposes.
   *
   * @param key - The full API key
   * @returns The prefix portion (e.g., "fr_live")
   */
  extractPrefix(key: string): string {
    if (!this.isValid(key)) {
      throw new Error('Invalid API key format');
    }

    // Split and take first two parts
    const parts = key.split('_');
    return `${parts[0]}_${parts[1]}`;
  }

  /**
   * Validates the format of an API key
   *
   * @param key - The key to validate
   * @returns True if the key has valid format
   */
  isValid(key: string): boolean {
    if (!key || typeof key !== 'string') {
      return false;
    }

    return API_KEY_REGEX.test(key);
  }

  /**
   * Returns the current configuration
   */
  getConfig(): ApiKeyGeneratorConfig {
    return { ...this.config };
  }
}
