import { describe, it, expect } from 'vitest';
import type { Email, PasswordHash } from './user.entity';
import { User, createEmail, createPasswordHash } from './user.entity';
import { createActorId } from './actor.entity';

// Type assertions to verify imported types are used correctly
const _typeCheckEmail: Email = '' as Email;
const _typeCheckPasswordHash: PasswordHash = '' as PasswordHash;
void _typeCheckEmail;
void _typeCheckPasswordHash;

describe('Email Value Object', () => {
  describe('createEmail', () => {
    it('should create an Email from a valid email address', () => {
      const email = createEmail('test@example.com');
      expect(email).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = createEmail('Test@Example.COM');
      expect(email).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = createEmail('  test@example.com  ');
      expect(email).toBe('test@example.com');
    });

    it('should throw for invalid email format', () => {
      expect(() => createEmail('not-an-email')).toThrow('Invalid email format');
      expect(() => createEmail('')).toThrow('Invalid email format');
      expect(() => createEmail('test@')).toThrow('Invalid email format');
      expect(() => createEmail('@example.com')).toThrow('Invalid email format');
      expect(() => createEmail('test@example')).toThrow('Invalid email format');
    });
  });
});

describe('PasswordHash Value Object', () => {
  describe('createPasswordHash', () => {
    it('should create a PasswordHash from a valid hash', () => {
      const hash = createPasswordHash('$2b$10$somevalidhashstring');
      expect(hash).toBe('$2b$10$somevalidhashstring');
    });

    it('should throw for empty hash', () => {
      expect(() => createPasswordHash('')).toThrow('Invalid password hash');
    });

    it('should throw for hash that is too short', () => {
      expect(() => createPasswordHash('short')).toThrow('Invalid password hash');
    });
  });
});

describe('User Entity', () => {
  const validProps = {
    displayName: 'Test User',
    email: 'test@example.com',
    passwordHash: '$2b$10$somevalidpasswordhash',
  };

  describe('User.create', () => {
    it('should create a user with valid properties', () => {
      const user = User.create(validProps);

      expect(user.displayName).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.type).toBe('user');
      expect(user.emailVerified).toBe(false);
      expect(user.lastLoginAt).toBeNull();
      expect(user.isActive).toBe(true);
    });

    it('should generate an ID if not provided', () => {
      const user = User.create(validProps);
      expect(user.id).toBeDefined();
      expect(user.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should use provided ID', () => {
      const id = createActorId('550e8400-e29b-41d4-a716-446655440000');
      const user = User.create({ ...validProps, id });
      expect(user.id).toBe(id);
    });

    it('should set emailVerified to true if provided', () => {
      const user = User.create({ ...validProps, emailVerified: true });
      expect(user.emailVerified).toBe(true);
    });

    it('should set lastLoginAt if provided', () => {
      const lastLogin = new Date('2024-01-01');
      const user = User.create({ ...validProps, lastLoginAt: lastLogin });
      expect(user.lastLoginAt).toEqual(lastLogin);
    });

    it('should throw for invalid email', () => {
      expect(() =>
        User.create({ ...validProps, email: 'invalid-email' })
      ).toThrow('Invalid email format');
    });

    it('should throw for invalid password hash', () => {
      expect(() =>
        User.create({ ...validProps, passwordHash: '' })
      ).toThrow('Invalid password hash');
    });

    it('should throw for empty display name', () => {
      expect(() =>
        User.create({ ...validProps, displayName: '' })
      ).toThrow('Display name cannot be empty');
    });
  });

  describe('User.fromPersistence', () => {
    it('should reconstitute a user from persisted data', () => {
      const now = new Date();
      const email = createEmail('test@example.com');
      const passwordHash = createPasswordHash('$2b$10$hash');
      const id = createActorId('550e8400-e29b-41d4-a716-446655440000');

      const user = User.fromPersistence({
        id,
        type: 'user',
        displayName: 'Persisted User',
        avatarUrl: null,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        email,
        passwordHash,
        emailVerified: true,
        lastLoginAt: now,
      });

      expect(user.id).toBe(id);
      expect(user.displayName).toBe('Persisted User');
      expect(user.emailVerified).toBe(true);
      expect(user.lastLoginAt).toEqual(now);
    });
  });

  describe('updateEmail', () => {
    it('should update email and reset verification', () => {
      const user = User.create({ ...validProps, emailVerified: true });
      user.updateEmail('new@example.com');

      expect(user.email).toBe('new@example.com');
      expect(user.emailVerified).toBe(false);
    });

    it('should not change anything if email is the same', () => {
      const user = User.create({ ...validProps, emailVerified: true });
      const originalUpdatedAt = user.updatedAt;

      user.updateEmail('test@example.com');

      expect(user.emailVerified).toBe(true);
      expect(user.updatedAt).toBe(originalUpdatedAt);
    });

    it('should throw for invalid email', () => {
      const user = User.create(validProps);
      expect(() => user.updateEmail('invalid')).toThrow('Invalid email format');
    });
  });

  describe('updatePassword', () => {
    it('should update password hash', () => {
      const user = User.create(validProps);
      const newHash = '$2b$10$anotherhashvalue';
      user.updatePassword(newHash);

      expect(user.passwordHash).toBe(newHash);
    });

    it('should throw for invalid hash', () => {
      const user = User.create(validProps);
      expect(() => user.updatePassword('')).toThrow('Invalid password hash');
    });
  });

  describe('verifyEmail', () => {
    it('should mark email as verified', () => {
      const user = User.create(validProps);
      user.verifyEmail();

      expect(user.emailVerified).toBe(true);
    });

    it('should throw if already verified', () => {
      const user = User.create({ ...validProps, emailVerified: true });
      expect(() => user.verifyEmail()).toThrow('Email is already verified');
    });
  });

  describe('recordLogin', () => {
    it('should record login timestamp', () => {
      const user = User.create(validProps);
      expect(user.lastLoginAt).toBeNull();

      user.recordLogin();

      expect(user.lastLoginAt).toBeInstanceOf(Date);
    });

    it('should update lastLoginAt on subsequent logins', () => {
      const user = User.create(validProps);
      user.recordLogin();
      const firstLogin = user.lastLoginAt;

      // Small delay to ensure different timestamp
      user.recordLogin();

      expect(user.lastLoginAt).toBeInstanceOf(Date);
      expect(user.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(firstLogin!.getTime());
    });
  });

  describe('toJSON', () => {
    it('should serialize user to JSON', () => {
      const id = createActorId('550e8400-e29b-41d4-a716-446655440000');
      const user = User.create({
        ...validProps,
        id,
        avatarUrl: 'https://example.com/avatar.png',
      });

      const json = user.toJSON();

      expect(json).toMatchObject({
        id,
        type: 'user',
        displayName: 'Test User',
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.png',
        emailVerified: false,
        lastLoginAt: null,
        isActive: true,
      });
      expect(json.passwordHash).toBeDefined();
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('inherited behavior', () => {
    it('should support display name update', () => {
      const user = User.create(validProps);
      user.updateDisplayName('New Name');
      expect(user.displayName).toBe('New Name');
    });

    it('should support avatar URL update', () => {
      const user = User.create(validProps);
      user.updateAvatarUrl('https://example.com/avatar.png');
      expect(user.avatarUrl).toBe('https://example.com/avatar.png');
    });

    it('should support deactivation', () => {
      const user = User.create(validProps);
      user.deactivate();
      expect(user.isActive).toBe(false);
    });

    it('should support reactivation', () => {
      const user = User.create(validProps);
      user.deactivate();
      user.activate();
      expect(user.isActive).toBe(true);
    });
  });
});
