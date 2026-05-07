/**
 * Password Hasher Port Interface
 *
 * Defines the contract for password hashing operations.
 * Implementation will use bcrypt or similar secure hashing algorithm.
 */

/**
 * Port interface for password hashing operations
 *
 * Abstracts the password hashing implementation from the application layer.
 */
export interface PasswordHasherPort {
  /**
   * Hashes a plaintext password
   *
   * @param password - The plaintext password to hash
   * @returns The hashed password (e.g., bcrypt hash)
   */
  hash(password: string): Promise<string>;

  /**
   * Verifies a plaintext password against a hash
   *
   * @param password - The plaintext password to verify
   * @param hash - The stored hash to compare against
   * @returns True if the password matches the hash
   */
  verify(password: string, hash: string): Promise<boolean>;
}
