/**
 * Bcrypt Password Hasher Adapter
 *
 * Implements the PasswordHasherPort interface using bcrypt.
 * Provides secure password hashing with configurable cost factor.
 */

import * as bcrypt from 'bcrypt';
import type { PasswordHasherPort } from '../../application/ports/password-hasher.port.js';

/**
 * Configuration options for the password hasher
 */
export interface PasswordHasherConfig {
  /**
   * The number of bcrypt rounds (cost factor)
   * Higher values increase security but also processing time
   * Default: 12 (recommended for production)
   */
  rounds: number;
}

const DEFAULT_CONFIG: PasswordHasherConfig = {
  rounds: 12,
};

/**
 * Bcrypt implementation of PasswordHasherPort
 *
 * Uses bcrypt for secure password hashing with configurable rounds.
 * The default of 12 rounds provides a good balance between security
 * and performance for most production use cases.
 */
export class BcryptPasswordHasher implements PasswordHasherPort {
  private readonly config: PasswordHasherConfig;

  constructor(config: Partial<PasswordHasherConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Validate rounds
    if (this.config.rounds < 4 || this.config.rounds > 31) {
      throw new Error('Bcrypt rounds must be between 4 and 31');
    }
  }

  /**
   * Hashes a plaintext password using bcrypt
   *
   * @param password - The plaintext password to hash
   * @returns The bcrypt hash of the password
   */
  async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password cannot be empty');
    }

    return bcrypt.hash(password, this.config.rounds);
  }

  /**
   * Verifies a plaintext password against a bcrypt hash
   *
   * @param password - The plaintext password to verify
   * @param hash - The stored bcrypt hash to compare against
   * @returns True if the password matches the hash
   */
  async verify(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch {
      // Invalid hash format or other bcrypt error
      return false;
    }
  }

  /**
   * Returns the current configuration
   */
  getConfig(): PasswordHasherConfig {
    return { ...this.config };
  }
}
