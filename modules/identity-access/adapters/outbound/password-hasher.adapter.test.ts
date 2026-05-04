/**
 * Unit tests for BcryptPasswordHasher adapter
 */

import { describe, it, expect } from 'vitest';
import { BcryptPasswordHasher } from './password-hasher.adapter.js';

describe('BcryptPasswordHasher', () => {
  describe('constructor', () => {
    it('should create instance with default config', () => {
      const hasher = new BcryptPasswordHasher();
      expect(hasher.getConfig().rounds).toBe(12);
    });

    it('should accept custom rounds configuration', () => {
      const hasher = new BcryptPasswordHasher({ rounds: 10 });
      expect(hasher.getConfig().rounds).toBe(10);
    });

    it('should throw error for rounds below minimum', () => {
      expect(() => new BcryptPasswordHasher({ rounds: 3 })).toThrow(
        'Bcrypt rounds must be between 4 and 31'
      );
    });

    it('should throw error for rounds above maximum', () => {
      expect(() => new BcryptPasswordHasher({ rounds: 32 })).toThrow(
        'Bcrypt rounds must be between 4 and 31'
      );
    });

    it('should accept minimum valid rounds (4)', () => {
      const hasher = new BcryptPasswordHasher({ rounds: 4 });
      expect(hasher.getConfig().rounds).toBe(4);
    });

    it('should accept maximum valid rounds (31)', () => {
      const hasher = new BcryptPasswordHasher({ rounds: 31 });
      expect(hasher.getConfig().rounds).toBe(31);
    });
  });

  describe('hash', () => {
    // Use low rounds for faster tests
    const hasher = new BcryptPasswordHasher({ rounds: 4 });

    it('should hash a password', async () => {
      const password = 'my-secure-password';
      const hash = await hasher.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt hash prefix
    });

    it('should generate different hashes for same password', async () => {
      const password = 'my-secure-password';
      const hash1 = await hasher.hash(password);
      const hash2 = await hasher.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should throw error for empty password', async () => {
      await expect(hasher.hash('')).rejects.toThrow('Password cannot be empty');
    });
  });

  describe('verify', () => {
    // Use low rounds for faster tests
    const hasher = new BcryptPasswordHasher({ rounds: 4 });

    it('should return true for correct password', async () => {
      const password = 'my-secure-password';
      const hash = await hasher.hash(password);

      const result = await hasher.verify(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'my-secure-password';
      const hash = await hasher.hash(password);

      const result = await hasher.verify('wrong-password', hash);
      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hash = await hasher.hash('some-password');
      const result = await hasher.verify('', hash);
      expect(result).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const result = await hasher.verify('some-password', '');
      expect(result).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const result = await hasher.verify('some-password', 'not-a-valid-hash');
      expect(result).toBe(false);
    });

    it('should handle case-sensitive passwords', async () => {
      const hash = await hasher.hash('Password123');

      expect(await hasher.verify('Password123', hash)).toBe(true);
      expect(await hasher.verify('password123', hash)).toBe(false);
      expect(await hasher.verify('PASSWORD123', hash)).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const hasher = new BcryptPasswordHasher({ rounds: 10 });
      const config1 = hasher.getConfig();
      const config2 = hasher.getConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Should be different objects
    });
  });
});
