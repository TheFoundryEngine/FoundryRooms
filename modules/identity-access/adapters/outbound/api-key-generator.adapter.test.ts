/**
 * Unit tests for CryptoApiKeyGenerator adapter
 */

import { describe, it, expect } from 'vitest';
import { CryptoApiKeyGenerator } from './api-key-generator.adapter.js';

describe('CryptoApiKeyGenerator', () => {
  describe('constructor', () => {
    it('should create instance with default config', () => {
      const generator = new CryptoApiKeyGenerator();
      const config = generator.getConfig();

      expect(config.basePrefix).toBe('fr');
      expect(config.randomBytes).toBe(32);
    });

    it('should accept custom basePrefix', () => {
      const generator = new CryptoApiKeyGenerator({ basePrefix: 'app' });
      expect(generator.getConfig().basePrefix).toBe('app');
    });

    it('should accept custom randomBytes', () => {
      const generator = new CryptoApiKeyGenerator({ randomBytes: 24 });
      expect(generator.getConfig().randomBytes).toBe(24);
    });

    it('should throw error for invalid basePrefix', () => {
      expect(() => new CryptoApiKeyGenerator({ basePrefix: 'FR' })).toThrow(
        'Base prefix must contain only lowercase letters'
      );
      expect(() => new CryptoApiKeyGenerator({ basePrefix: 'fr_' })).toThrow(
        'Base prefix must contain only lowercase letters'
      );
      expect(() => new CryptoApiKeyGenerator({ basePrefix: 'fr123' })).toThrow(
        'Base prefix must contain only lowercase letters'
      );
    });

    it('should throw error for randomBytes below minimum', () => {
      expect(() => new CryptoApiKeyGenerator({ randomBytes: 15 })).toThrow(
        'Random bytes must be between 16 and 64'
      );
    });

    it('should throw error for randomBytes above maximum', () => {
      expect(() => new CryptoApiKeyGenerator({ randomBytes: 65 })).toThrow(
        'Random bytes must be between 16 and 64'
      );
    });
  });

  describe('generate', () => {
    const generator = new CryptoApiKeyGenerator();

    it('should generate key with default prefix (live)', () => {
      const key = generator.generate();

      expect(key).toMatch(/^fr_live_[a-f0-9]{64}$/);
    });

    it('should generate key with custom prefix', () => {
      const key = generator.generate('test');

      expect(key).toMatch(/^fr_test_[a-f0-9]{64}$/);
    });

    it('should generate unique keys each time', () => {
      const keys = new Set<string>();

      for (let i = 0; i < 100; i++) {
        keys.add(generator.generate());
      }

      expect(keys.size).toBe(100);
    });

    it('should throw error for invalid prefix format', () => {
      expect(() => generator.generate('LIVE')).toThrow(
        'API key prefix must contain only lowercase letters'
      );
      expect(() => generator.generate('live_test')).toThrow(
        'API key prefix must contain only lowercase letters'
      );
      expect(() => generator.generate('live123')).toThrow(
        'API key prefix must contain only lowercase letters'
      );
    });

    it('should generate keys with custom random bytes length', () => {
      const generator24 = new CryptoApiKeyGenerator({ randomBytes: 24 });
      const key = generator24.generate();

      // 24 bytes = 48 hex characters
      expect(key).toMatch(/^fr_live_[a-f0-9]{48}$/);
    });
  });

  describe('hash', () => {
    const generator = new CryptoApiKeyGenerator();

    it('should hash an API key', () => {
      const key = generator.generate();
      const hash = generator.hash(key);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce consistent hashes for same key', () => {
      const key = generator.generate();
      const hash1 = generator.hash(key);
      const hash2 = generator.hash(key);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different keys', () => {
      const key1 = generator.generate();
      const key2 = generator.generate();
      const hash1 = generator.hash(key1);
      const hash2 = generator.hash(key2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('extractPrefix', () => {
    const generator = new CryptoApiKeyGenerator();

    it('should extract prefix from valid API key', () => {
      const key = generator.generate('live');
      const prefix = generator.extractPrefix(key);

      expect(prefix).toBe('fr_live');
    });

    it('should extract different prefixes correctly', () => {
      const liveKey = generator.generate('live');
      const testKey = generator.generate('test');
      const devKey = generator.generate('dev');

      expect(generator.extractPrefix(liveKey)).toBe('fr_live');
      expect(generator.extractPrefix(testKey)).toBe('fr_test');
      expect(generator.extractPrefix(devKey)).toBe('fr_dev');
    });

    it('should throw error for invalid API key format', () => {
      expect(() => generator.extractPrefix('invalid-key')).toThrow(
        'Invalid API key format'
      );
      expect(() => generator.extractPrefix('')).toThrow(
        'Invalid API key format'
      );
      expect(() => generator.extractPrefix('fr_')).toThrow(
        'Invalid API key format'
      );
    });
  });

  describe('isValid', () => {
    const generator = new CryptoApiKeyGenerator();

    it('should return true for valid API key', () => {
      const key = generator.generate();
      expect(generator.isValid(key)).toBe(true);
    });

    it('should return true for valid API key with different prefixes', () => {
      const liveKey = generator.generate('live');
      const testKey = generator.generate('test');

      expect(generator.isValid(liveKey)).toBe(true);
      expect(generator.isValid(testKey)).toBe(true);
    });

    it('should return false for invalid format', () => {
      expect(generator.isValid('invalid')).toBe(false);
      expect(generator.isValid('fr_')).toBe(false);
      expect(generator.isValid('fr_live_')).toBe(false);
      expect(generator.isValid('fr_live_short')).toBe(false);
    });

    it('should return false for empty or null-ish values', () => {
      expect(generator.isValid('')).toBe(false);
      expect(generator.isValid(null as unknown as string)).toBe(false);
      expect(generator.isValid(undefined as unknown as string)).toBe(false);
    });

    it('should return false for uppercase in prefix', () => {
      expect(generator.isValid('FR_live_' + 'a'.repeat(64))).toBe(false);
      expect(generator.isValid('fr_LIVE_' + 'a'.repeat(64))).toBe(false);
    });

    it('should return false for non-hex random part', () => {
      expect(generator.isValid('fr_live_' + 'g'.repeat(64))).toBe(false);
      expect(generator.isValid('fr_live_' + 'G'.repeat(64))).toBe(false);
    });

    it('should return false for wrong length random part', () => {
      expect(generator.isValid('fr_live_' + 'a'.repeat(63))).toBe(false);
      expect(generator.isValid('fr_live_' + 'a'.repeat(65))).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const generator = new CryptoApiKeyGenerator({ randomBytes: 24 });
      const config1 = generator.getConfig();
      const config2 = generator.getConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Should be different objects
    });
  });
});
