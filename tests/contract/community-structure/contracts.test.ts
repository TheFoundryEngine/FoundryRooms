import { describe, it, expect } from 'vitest';
import {
  CommunityStructureApi,
  CommunityStructureFixtures,
} from '@foundry/contracts';

describe('Community Structure Contract Tests', () => {
  describe('Community Schema', () => {
    it('should parse testCommunity1 fixture', () => {
      const result = CommunityStructureApi.Community.safeParse(CommunityStructureFixtures.testCommunity1);
      expect(result.success).toBe(true);
    });

    it('should parse testCommunity2 fixture', () => {
      const result = CommunityStructureApi.Community.safeParse(CommunityStructureFixtures.testCommunity2);
      expect(result.success).toBe(true);
    });

    it('should parse minimalCommunity fixture', () => {
      const result = CommunityStructureApi.Community.safeParse(CommunityStructureFixtures.minimalCommunity);
      expect(result.success).toBe(true);
    });
  });

  describe('Space Schema', () => {
    it('should parse testSpace1 fixture', () => {
      const result = CommunityStructureApi.Space.safeParse(CommunityStructureFixtures.testSpace1);
      expect(result.success).toBe(true);
    });

    it('should parse testSpace2 fixture', () => {
      const result = CommunityStructureApi.Space.safeParse(CommunityStructureFixtures.testSpace2);
      expect(result.success).toBe(true);
    });

    it('should parse restrictedSpace fixture', () => {
      const result = CommunityStructureApi.Space.safeParse(CommunityStructureFixtures.restrictedSpace);
      expect(result.success).toBe(true);
    });
  });

  describe('Channel Schema', () => {
    it('should parse testChannel1 fixture', () => {
      const result = CommunityStructureApi.Channel.safeParse(CommunityStructureFixtures.testChannel1);
      expect(result.success).toBe(true);
    });

    it('should parse testChannel2 fixture', () => {
      const result = CommunityStructureApi.Channel.safeParse(CommunityStructureFixtures.testChannel2);
      expect(result.success).toBe(true);
    });

    it('should parse eventsChannel fixture', () => {
      const result = CommunityStructureApi.Channel.safeParse(CommunityStructureFixtures.eventsChannel);
      expect(result.success).toBe(true);
    });

    it('should parse resourcesChannel fixture', () => {
      const result = CommunityStructureApi.Channel.safeParse(CommunityStructureFixtures.resourcesChannel);
      expect(result.success).toBe(true);
    });

    it('should parse restrictedChannel fixture', () => {
      const result = CommunityStructureApi.Channel.safeParse(CommunityStructureFixtures.restrictedChannel);
      expect(result.success).toBe(true);
    });
  });
});
