import { describe, it, expect } from 'vitest';
import {
  IdentityAccessApi,
  IdentityAccessFixtures,
} from '@foundry/contracts';

describe('Identity Access Contract Tests', () => {
  describe('User Schema', () => {
    it('should parse testUser1 fixture', () => {
      const result = IdentityAccessApi.User.safeParse(IdentityAccessFixtures.testUser1);
      expect(result.success).toBe(true);
    });

    it('should parse testUser2 fixture', () => {
      const result = IdentityAccessApi.User.safeParse(IdentityAccessFixtures.testUser2);
      expect(result.success).toBe(true);
    });

    it('should parse inactiveUser fixture', () => {
      const result = IdentityAccessApi.User.safeParse(IdentityAccessFixtures.inactiveUser);
      expect(result.success).toBe(true);
    });
  });

  describe('Agent Schema', () => {
    it('should parse testAgent1 fixture', () => {
      const result = IdentityAccessApi.Agent.safeParse(IdentityAccessFixtures.testAgent1);
      expect(result.success).toBe(true);
    });

    it('should parse testAgent2 fixture', () => {
      const result = IdentityAccessApi.Agent.safeParse(IdentityAccessFixtures.testAgent2);
      expect(result.success).toBe(true);
    });

    it('should parse inactiveAgent fixture', () => {
      const result = IdentityAccessApi.Agent.safeParse(IdentityAccessFixtures.inactiveAgent);
      expect(result.success).toBe(true);
    });
  });

  describe('Role Schema', () => {
    it('should parse ownerRole fixture', () => {
      const result = IdentityAccessApi.Role.safeParse(IdentityAccessFixtures.ownerRole);
      expect(result.success).toBe(true);
    });

    it('should parse adminRole fixture', () => {
      const result = IdentityAccessApi.Role.safeParse(IdentityAccessFixtures.adminRole);
      expect(result.success).toBe(true);
    });

    it('should parse moderatorRole fixture', () => {
      const result = IdentityAccessApi.Role.safeParse(IdentityAccessFixtures.moderatorRole);
      expect(result.success).toBe(true);
    });

    it('should parse memberRole fixture', () => {
      const result = IdentityAccessApi.Role.safeParse(IdentityAccessFixtures.memberRole);
      expect(result.success).toBe(true);
    });

    it('should parse systemAdminRole fixture', () => {
      const result = IdentityAccessApi.Role.safeParse(IdentityAccessFixtures.systemAdminRole);
      expect(result.success).toBe(true);
    });

    it('should parse customRole fixture', () => {
      const result = IdentityAccessApi.Role.safeParse(IdentityAccessFixtures.customRole);
      expect(result.success).toBe(true);
    });
  });

  describe('Permission Schema', () => {
    it('should parse all permission fixtures', () => {
      for (const permission of IdentityAccessFixtures.permissions) {
        const result = IdentityAccessApi.Permission.safeParse(permission);
        expect(result.success).toBe(true);
      }
    });
  });
});
